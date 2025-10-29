/**
 * Chat Service Module
 * 
 * This module handles all communication with the backend chat service,
 * including session management, message sending, and polling for updates.
 */

import {
  ChatServiceConfig,
  ResolvedChatServiceConfig,
  ChatServiceOffsets,
  ChatServiceHistoryEntry,
  ChatServiceInfoResponse,
  ChatServiceInitResponse
} from '../types';
import { normalizeEndpoint } from '../utils';
import { DEFAULT_SERVICE_POLL_INTERVAL, DEFAULT_STORAGE_KEY } from '../config/default-options';

/**
 * Chat service class that manages backend communication
 */
export class ChatService {
  private config: ResolvedChatServiceConfig | null = null;
  private chatId: string | null = null;
  private chatOffsets: ChatServiceOffsets | null = null;
  private storage: Storage | null = null;
  private pollTimerId: number | null = null;
  private pollFailureCount = 0;
  private infoFetchPromise: Promise<ChatServiceInfoResponse | null> | null = null;
  private isInitializingSession = false;
  private initializingPromise: Promise<boolean> | null = null;
  private lastRequestedOffsets: ChatServiceOffsets | null = null;

  constructor(config?: ChatServiceConfig) {
    if (config?.endpoint) {
      const { endpoint, pollIntervalMs, storageKey, ...rest } = config;
      this.config = {
        ...rest,
        endpoint: normalizeEndpoint(endpoint),
        pollIntervalMs: pollIntervalMs ?? DEFAULT_SERVICE_POLL_INTERVAL,
        storageKey: storageKey ?? DEFAULT_STORAGE_KEY,
      };
    }
    this.storage = this.resolveStorage();
  }

  /**
   * Checks if the service is configured
   */
  isConfigured(): boolean {
    return this.config !== null;
  }

  /**
   * Gets the current chat session ID
   */
  getChatId(): string | null {
    return this.chatId;
  }

  /**
   * Gets the current polling offsets
   */
  getOffsets(): ChatServiceOffsets | null {
    return this.chatOffsets;
  }

  /**
   * Sets the polling offsets
   */
  setOffsets(offsets: ChatServiceOffsets): void {
    this.chatOffsets = offsets;
  }

  /**
   * Loads a persisted chat session ID from storage
   */
  loadPersistedChatId(): string | null {
    if (!this.storage || !this.config) {
      return null;
    }
    try {
      const id = this.storage.getItem(this.config.storageKey);
      if (id) {
        this.chatId = id;
      }
      return id;
    } catch (error) {
      console.warn("ALBERT | AI Chat: Failed to read chat ID from storage.", error);
      return null;
    }
  }

  /**
   * Persists or removes the chat session ID
   */
  private persistChatId(id: string | null): void {
    if (!this.storage || !this.config) {
      return;
    }
    try {
      if (id) {
        this.storage.setItem(this.config.storageKey, id);
      } else {
        this.storage.removeItem(this.config.storageKey);
      }
    } catch (error) {
      console.warn("ALBERT | AI Chat: Failed to persist chat ID.", error);
    }
  }

  /**
   * Clears the current chat session
   */
  clearSession(): void {
    this.chatId = null;
    this.chatOffsets = null;
    this.pollFailureCount = 0;
    this.lastRequestedOffsets = null;
    this.persistChatId(null);
    this.stopPolling();
  }

  /**
   * Initializes a new chat session
   */
  async initSession(): Promise<boolean> {
    if (!this.config) {
      return false;
    }
    if (this.initializingPromise) {
      return this.initializingPromise;
    }

    const promise = (async (): Promise<boolean> => {
      this.isInitializingSession = true;
      try {
        const body: Record<string, unknown> = {};
        if (this.config!.preset) {
          body.preset = this.config!.preset;
        }
        if (this.config!.title) {
          body.title = this.config!.title;
        }
        const response = await this.requestJson<ChatServiceInitResponse>("/init", {
          method: "POST",
          body: JSON.stringify(body),
        });
        if (!response || !response.id) {
          throw new Error("Missing chat id in init response");
        }
        this.chatId = response.id;
        this.chatOffsets = { history: 0, text: 0 };
        this.persistChatId(response.id);
        return true;
      } catch (error) {
        console.error("ALBERT | AI Chat: Failed to initialize chat session.", error);
        this.clearSession();
        return false;
      } finally {
        this.isInitializingSession = false;
      }
    })();

    this.initializingPromise = promise;
    const result = await promise;
    this.initializingPromise = null;
    return result;
  }

  /**
   * Sends a message to the chat service
   */
  async sendMessage(content: string): Promise<void> {
    if (!this.config || !this.chatId) {
      throw new Error("Chat not initialized");
    }

    const body: Record<string, unknown> = {
      id: this.chatId,
      input: {
        text: content,
      },
      stream: true,
    };
    if (this.config.preset) {
      body.preset = this.config.preset;
    }

    await this.requestJson<unknown>("/chat", {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Fetches chat information/updates
   */
  async fetchInfo(fullRefresh = false): Promise<ChatServiceInfoResponse | null> {
    if (!this.config || !this.chatId) {
      return null;
    }
    if (this.infoFetchPromise) {
      return this.infoFetchPromise;
    }

    this.lastRequestedOffsets = fullRefresh
      ? null
      : this.chatOffsets
      ? { ...this.chatOffsets }
      : { history: 0, text: 0 };

    const path = this.buildInfoPath(fullRefresh);

    this.infoFetchPromise = (async (): Promise<ChatServiceInfoResponse | null> => {
      try {
        const response = await this.requestJson<ChatServiceInfoResponse>(path, { method: "GET" });
        this.pollFailureCount = 0;
        return response ?? null;
      } catch (error) {
        console.error("ALBERT | AI Chat: Failed to fetch chat information.", error);
        this.pollFailureCount++;
        const status = (error as { status?: number }).status;
        if (status === 404) {
          this.clearSession();
        }
        return null;
      } finally {
        this.infoFetchPromise = null;
      }
    })();

    return this.infoFetchPromise;
  }

  /**
   * Schedules the next polling request
   */
  scheduleNextPoll(delay?: number, callback?: () => void): void {
    if (!this.config) {
      return;
    }
    this.stopPolling();
    const interval = delay ?? this.config.pollIntervalMs;
    this.pollTimerId = window.setTimeout(() => {
      this.pollTimerId = null;
      if (callback) {
        callback();
      }
    }, Math.max(0, interval));
  }

  /**
   * Stops polling
   */
  stopPolling(): void {
    if (this.pollTimerId !== null) {
      window.clearTimeout(this.pollTimerId);
      this.pollTimerId = null;
    }
  }

  /**
   * Gets the offsets that were used for the most recent info request
   */
  getLastRequestedOffsets(): ChatServiceOffsets | null {
    return this.lastRequestedOffsets ? { ...this.lastRequestedOffsets } : null;
  }

  /**
   * Gets the poll failure count
   */
  getPollFailureCount(): number {
    return this.pollFailureCount;
  }

  /**
   * Resets the poll failure count
   */
  resetPollFailureCount(): void {
    this.pollFailureCount = 0;
  }

  /**
   * Builds the info endpoint path
   */
  private buildInfoPath(fullRefresh: boolean): string {
    if (!this.chatId) {
      throw new Error("Chat ID is missing");
    }
    const base = `/info/${encodeURIComponent(this.chatId)}`;
    if (fullRefresh || !this.chatOffsets) {
      return base;
    }
    const params = new URLSearchParams();
    params.set("offsetHistory", String(this.chatOffsets.history));
    params.set("offsetText", String(this.chatOffsets.text));
    const query = params.toString();
    return query ? `${base}?${query}` : base;
  }

  /**
   * Builds an absolute URL for the service
   */
  private buildServiceUrl(path: string): string {
    if (!this.config) {
      throw new Error("Service configuration is missing");
    }
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${this.config.endpoint}${suffix}`;
  }

  /**
   * Performs a JSON fetch against the service endpoint
   */
  private async requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = this.buildServiceUrl(path);
    const headers = new Headers(init.headers ?? {});
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    if (init.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(url, { ...init, headers });
    const contentType = response.headers.get("content-type") || "";

    let payload: unknown;
    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        payload = undefined;
      }
    } else {
      try {
        payload = await response.text();
      } catch {
        payload = undefined;
      }
    }

    if (!response.ok) {
      const error = new Error(`Chat service request failed with status ${response.status}`);
      (error as { status?: number }).status = response.status;
      (error as { payload?: unknown }).payload = payload;
      throw error;
    }

    return (payload as T) ?? ({} as T);
  }

  /**
   * Resolves storage capability
   */
  private resolveStorage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const storage = window.localStorage;
      const testKey = `acw-storage-test`;
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return storage;
    } catch (error) {
      console.warn("ALBERT | AI Chat: localStorage is not accessible.", error);
      return null;
    }
  }
}
