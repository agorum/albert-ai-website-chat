import { marked } from "marked";

/*
 * Albert AI Chat Widget
 *
 * This widget can be embedded on arbitrary web pages by loading the bundled script
 * and calling `AlbertChat.init({...})`. Styling and text content are configurable via
 * the options passed to the initializer.
 */

export type ChatRole = "user" | "agent";

export interface ChatFooterLink {
  label: string;
  href: string;
  target?: string;
  rel?: string;
}

export interface ChatWidgetTheme {
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
  surfaceAccentColor: string;
  textColor: string;
  userMessageColor: string;
  userTextColor: string;
  agentMessageColor: string;
  agentTextColor: string;
  launcherBackground: string;
  launcherTextColor: string;
  sendButtonBackground: string;
  sendButtonTextColor: string;
  borderColor: string;
  shadowColor: string;
}

export interface ChatWidgetTexts {
  launcherLabel: string;
  launcherAriaLabel: string;
  teaserText: string;
  headerTitle: string;
  headerSubtitle: string;
  sendButtonLabel: string;
  closeLabel: string;
  reloadLabel: string;
  emptyState: string;
  initialMessage: string;
  consentPrompt: string;
  consentAcceptLabel: string;
  consentDeclineLabel: string;
  consentDeclinedMessage: string;
  consentPendingPlaceholder: string;
  consentDeclinedPlaceholder: string;
  sendWhileStreamingTooltip: string;
  sendWhileConsentPendingTooltip: string;
  sendWhileTerminatedTooltip: string;
  toolCallPlaceholder: string;
}

export interface ChatWidgetIcons {
  headerIcon: string;
  closeIcon: string;
  reloadIcon: string;
  launcherIcon: string;
  sendIcon: string;
}

export interface ChatWidgetDimensions {
  widthPercent: number;
  minWidthPx: number;
  heightPercent: number;
  minHeightPx: number;
}

export interface ChatWidgetOptions {
  target?: HTMLElement | string;
  theme: ChatWidgetTheme;
  texts: ChatWidgetTexts;
  icons: ChatWidgetIcons;
  serviceConfig?: ChatServiceConfig;
  welcomeMessage?: ChatWelcomeMessageOptions;
  footerLinks: ChatFooterLink[];
  dimensions: ChatWidgetDimensions;
  teaserDelayMs: number;
  mockResponses: string[];
  mockResponseDelayMs: [number, number];
  zIndex: number;
  locale: string;
  requirePrivacyConsent: boolean;
  disclaimer: ChatDisclaimerOptions;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
  status?: "pending" | "sent" | "failed";
  localOnly?: boolean;
  isToolPlaceholder?: boolean;
}

export interface ChatServiceConfig {
  endpoint: string;
  preset?: string;
  pollIntervalMs?: number;
  storageKey?: string;
}

export interface ChatDisclaimerOptions {
  enabled: boolean;
  text: string;
  className?: string;
  styles?: Record<string, string>;
}

export interface ChatWelcomeMessageOptions {
  enabled: boolean;
  text?: string;
  className?: string;
  styles?: Record<string, string>;
}

interface ChatServiceOffsets {
  history: number;
  text: number;
}

interface ChatServiceHistoryEntry {
  role: string;
  text?: string;
  dateTime?: string;
  isToolCall?: boolean;
}

interface ChatServiceInfoResponse {
  id?: string;
  history?: ChatServiceHistoryEntry[];
  offsets?: ChatServiceOffsets;
  running?: boolean;
}

interface ChatServiceInitResponse {
  id: string;
}

interface ResolvedChatServiceConfig extends ChatServiceConfig {
  pollIntervalMs: number;
  storageKey: string;
}

interface MessageElementRefs {
  wrapper: HTMLDivElement;
  bubble: HTMLDivElement;
  timestamp: HTMLSpanElement;
}

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};

const defaultOptions: ChatWidgetOptions = {
  theme: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    primaryColor: "#2563eb",
    secondaryColor: "#1d4ed8",
    surfaceColor: "#ffffff",
    surfaceAccentColor: "#f8fafc",
    textColor: "#0f172a",
    userMessageColor: "#2563eb",
    userTextColor: "#ffffff",
    agentMessageColor: "#f1f5f9",
    agentTextColor: "#0f172a",
    launcherBackground: "#2563eb",
    launcherTextColor: "#ffffff",
    sendButtonBackground: "#2563eb",
    sendButtonTextColor: "#ffffff",
    borderColor: "#e2e8f0",
    shadowColor: "rgba(15, 23, 42, 0.2)",
  },
  texts: {
    launcherLabel: "Chat",
    launcherAriaLabel: "Albert AI Chat öffnen",
    teaserText: "Hallo! Wie kann ich helfen?",
    headerTitle: "Albert AI Assistant",
    headerSubtitle: "Wir sind gleich für Sie da",
    sendButtonLabel: "Senden",
    closeLabel: "Schließen",
    reloadLabel: "Neu starten",
    emptyState: "Noch keine Nachrichten.",
    initialMessage: "Hallo! Ich bin Albert. Wie kann ich Ihnen heute weiterhelfen?",
    consentPrompt:
      "Bitte stimmen Sie unserer Datenschutzerklärung zu, damit wir den Chat starten können.",
    consentAcceptLabel: "Zustimmen",
    consentDeclineLabel: "Ablehnen",
    consentDeclinedMessage:
      "Ohne Zustimmung zu unserer Datenschutzerklärung kann der Chat leider nicht genutzt werden.",
    consentPendingPlaceholder: "Bitte stimmen Sie zunächst der Datenschutzerklärung zu.",
    consentDeclinedPlaceholder: "Chat deaktiviert. Starten Sie neu, um es erneut zu versuchen.",
    sendWhileStreamingTooltip: "Bitte warten Sie, bis die Antwort abgeschlossen ist.",
    sendWhileConsentPendingTooltip:
      "Senden ist erst möglich, nachdem Sie der Datenschutzerklärung zugestimmt haben.",
    sendWhileTerminatedTooltip: "Der Chat ist deaktiviert. Starten Sie ihn neu, um es erneut zu versuchen.",
    toolCallPlaceholder: "Recherchiere...",
  },
  icons: {
    headerIcon: "💡",
    closeIcon: "✕",
    reloadIcon: "⟳",
    launcherIcon: "💬",
    sendIcon: "➤",
  },
  footerLinks: [
    { label: "Datenschutzerklärung", href: "#datenschutz", target: "_blank" },
    { label: "Impressum", href: "#impressum", target: "_blank" },
  ],
  dimensions: {
    widthPercent: 33,
    minWidthPx: 320,
    heightPercent: 70,
    minHeightPx: 420,
  },
  teaserDelayMs: 10000,
  mockResponses: [
    "Danke für Ihre Nachricht! Ich schaue mir das gleich an.",
    "Können Sie mir noch ein paar Details geben?",
    "Verstanden. Ich fasse die wichtigsten Punkte für Sie zusammen.",
    "Super! Gibt es sonst noch etwas, wobei ich helfen kann?",
  ],
  mockResponseDelayMs: [1200, 2500],
  zIndex: 9999,
  locale: typeof navigator !== "undefined" ? navigator.language : "de-DE",
  requirePrivacyConsent: true,
  serviceConfig: undefined,
  disclaimer: {
    enabled: true,
    text: "Hinweis: Albert kann sich irren. Bitte prüfen Sie wichtige Informationen nach.",
    className: "",
    styles: {
      color: "rgba(15, 23, 42, 0.55)",
      fontSize: "0.75rem",
      marginTop: "8px",
    },
  },
  welcomeMessage: {
    enabled: true,
    text: "Hallo! Ich bin Albert. Wie kann ich Ihnen heute weiterhelfen?",
    className: "",
    styles: {},
  },
};

let widgetInstanceCounter = 0;

const DEFAULT_SERVICE_POLL_INTERVAL = 250;
const DEFAULT_STORAGE_KEY = "albert-chat-session-id";
const MAX_POLL_FAILURES_BEFORE_RESET = 3;

/**
 * Escapes critical HTML characters so user content can be safely injected into the DOM.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&(?!#?\w+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escapes characters for safe usage inside HTML attribute values.
 */
function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/**
 * Validates a link target and restricts it to safe protocols or same-origin references.
 */
function sanitizeUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) {
    return "#";
  }
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "#";
  }
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  if (/^(\/|#)/.test(trimmed)) {
    return trimmed;
  }
  return "#";
}

/**
 * Decodes HTML entities in a string, handling nested encodings iteratively.
 */
function decodeHtmlEntities(value: string): string {
  if (!value || !value.includes("&")) {
    return value;
  }

  const decodeOnce = (input: string): string =>
    input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
      const lower = entity.toLowerCase();
      if (lower === "amp") {
        return "&";
      }
      if (lower === "lt") {
        return "<";
      }
      if (lower === "gt") {
        return ">";
      }
      if (lower === "quot") {
        return '"';
      }
      if (lower === "apos") {
        return "'";
      }
      if (lower === "nbsp") {
        return "\u00a0";
      }
      if (lower.startsWith("#x")) {
        const charCode = Number.parseInt(lower.slice(2), 16);
        return Number.isFinite(charCode) ? String.fromCharCode(charCode) : match;
      }
      if (lower.startsWith("#")) {
        const charCode = Number.parseInt(lower.slice(1), 10);
        return Number.isFinite(charCode) ? String.fromCharCode(charCode) : match;
      }
      return match;
    });

  let previous = value;
  let current = decodeOnce(value);

  while (current !== previous) {
    previous = current;
    current = decodeOnce(current);
  }

  return current;
}

const markdownRenderer = new marked.Renderer();

markdownRenderer.paragraph = (text: string): string => `<p>${text}</p>`;
markdownRenderer.text = (text: string): string => escapeHtml(text);
markdownRenderer.strong = (text: string): string => `<strong>${text}</strong>`;
markdownRenderer.em = (text: string): string => `<em>${text}</em>`;
markdownRenderer.codespan = (text: string): string => `<code>${escapeHtml(text)}</code>`;
markdownRenderer.code = (code: string): string => `<pre><code>${escapeHtml(code)}</code></pre>`;
markdownRenderer.heading = (text: string, level: number): string =>
  `<h${level}>${text}</h${level}>`;
markdownRenderer.list = (body: string, ordered: boolean): string =>
  `<${ordered ? "ol" : "ul"}>${body}</${ordered ? "ol" : "ul"}>`;
markdownRenderer.listitem = (text: string): string => `<li>${text}</li>`;
markdownRenderer.blockquote = (text: string): string => `<blockquote>${text}</blockquote>`;
markdownRenderer.link = (href: string | null, title: string | null, text: string): string => {
  const safeHref = sanitizeUrl(href);
  const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
  return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
};
markdownRenderer.image = (href: string | null, title: string | null, text: string): string => {
  const safeHref = sanitizeUrl(href);
  const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
  const alt = escapeHtmlAttribute(text || "");
  return `<img src="${safeHref}" alt="${alt}"${titleAttr} />`;
};
markdownRenderer.html = (html: string): string => escapeHtml(html);
markdownRenderer.br = (): string => "<br />";
markdownRenderer.hr = (): string => "<hr />";
markdownRenderer.table = (header: string, body: string): string =>
  `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
markdownRenderer.tablerow = (content: string): string => `<tr>${content}</tr>`;
markdownRenderer.tablecell = (
  content: string,
  flags: { header: boolean; align: "center" | "left" | "right" | null }
): string => {
  const tag = flags.header ? "th" : "td";
  const align = flags.align ? ` style="text-align:${flags.align}"` : "";
  return `<${tag}${align}>${content}</${tag}>`;
};

marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: markdownRenderer,
});

/**
 * Renders markdown into sanitized HTML using a constrained renderer.
 */
function renderMarkdown(content: string): string {
  if (!content.trim()) {
    return "";
  }
  const normalized = decodeHtmlEntities(content);
  const rendered = marked.parse(normalized, { renderer: markdownRenderer });
  return typeof rendered === "string" ? rendered : "";
}

/**
 * Converts plain text into HTML paragraphs while escaping unsafe characters.
 */
function renderPlainText(content: string): string {
  if (!content) {
    return "";
  }
  const normalized = decodeHtmlEntities(content);
  return escapeHtml(normalized).replace(/\r?\n/g, "<br />");
}

/**
 * Performs a deep merge tailored for configuration objects.
 */
function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (!source) {
    return target;
  }
  const output: any = Array.isArray(target) ? [...(target as any)] : { ...target };
  Object.keys(source).forEach((key) => {
    const typedKey = key as keyof T;
    const sourceValue = source[typedKey];
    if (sourceValue === undefined) {
      return;
    }
    const targetValue = (target as any)[typedKey];
    if (Array.isArray(sourceValue)) {
      output[typedKey] = [...sourceValue];
    } else if (
      sourceValue !== null &&
      typeof sourceValue === "object" &&
      targetValue !== null &&
      typeof targetValue === "object"
    ) {
      output[typedKey] = deepMerge(targetValue, sourceValue as any);
    } else {
      output[typedKey] = sourceValue;
    }
  });
  return output;
}

/**
 * Restricts a numeric value to the provided min/max range.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Formats a timestamp for display inside bubbles using the configured locale.
 */
function formatTime(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.warn("AlbertChat: Intl.DateTimeFormat failed, falling back to default", error);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
}

export class ChatWidget {
  private options: ChatWidgetOptions;
  private host!: HTMLDivElement;
  private shadow!: ShadowRoot;
  private container!: HTMLDivElement;
  private chatWindow!: HTMLDivElement;
  private launcherButton!: HTMLButtonElement;
  private teaserBubble!: HTMLButtonElement;
  private messageList!: HTMLDivElement;
  private inputArea!: HTMLDivElement;
  private inputField!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private closeButton!: HTMLButtonElement;
  private reloadButton!: HTMLButtonElement;
  private footerLinksContainer!: HTMLDivElement;
  private typingIndicator?: HTMLDivElement;
  private typingIndicatorContent?: HTMLElement;
  private typingIndicatorCursor?: HTMLSpanElement;
  private typingIndicatorTimestamp?: HTMLSpanElement;
  private typingIndicatorIsStandalone = false;
  private toolActivityIndicator?: HTMLDivElement;
  private pendingToolCall: { anchorIndex: number | null } | null = null;
  private isOpen = false;
  private hasEverOpened = false;
  private messages: ChatMessage[] = [];
  private messageElements: Array<MessageElementRefs | null> = [];
  private historyContents: string[] = [];
  private disclaimerElement?: HTMLDivElement;
  private welcomeMessageElement?: HTMLDivElement;
  private welcomeMessageAnimated = false;
  private welcomeMessageTypingTimer: number | null = null;
  private hasShownWelcomeMessage = false;
  private isWelcomeTyping = false;
  private welcomeAnimationHasRun = false;
  private pendingWelcomeAnimationCallbacks: Array<() => void> = [];
  private welcomeAnimationPlayedOnce = false;
  private teaserTimerId: number | null = null;
  private mockResponseIndex = 0;
  private readonly instanceId: number;
  private lastTextareaHeight = 0;
  private resizeObserver?: ResizeObserver;
  private activeStreamTimeout: number | null = null;
  private activeStreamInterval: number | null = null;
  private streamingMessageBubble?: HTMLDivElement;
  private streamingMessageTimestamp?: HTMLSpanElement;
  private streamingMessageWrapper?: HTMLDivElement;
  private currentStreamingMessage?: ChatMessage;
  private isAwaitingAgent = false;
  private isConsentGranted: boolean;
  private isTerminated = false;
  private consentPromptElement?: HTMLDivElement;
  private shouldAutoScroll = true;
  private readonly inputPlaceholder = "Ihre Nachricht …";
  private serviceConfig?: ResolvedChatServiceConfig;
  private chatId: string | null = null;
  private chatOffsets: ChatServiceOffsets | null = null;
  private pollTimerId: number | null = null;
  private infoPollInFlight = false;
  private infoFetchPromise: Promise<boolean> | null = null;
  private pollFailureCount = 0;
  private storage: Storage | null = null;
  private isInitializingSession = false;
  private initializingPromise: Promise<boolean> | null = null;
  private hasLoadedInitialHistory = false;

  /**
   * Normalizes a backend endpoint URL by stripping trailing slashes so path concatenation remains predictable.
   */
  private normalizeEndpoint(endpoint: string): string {
    return endpoint.trim().replace(/\/+$/, "");
  }

  /**
   * Builds a widget instance with merged default options and resolves initial feature flags.
   */
  constructor(options: DeepPartial<ChatWidgetOptions> = {}) {
    this.options = deepMerge(defaultOptions, options);
    this.instanceId = ++widgetInstanceCounter;
    this.isConsentGranted = !this.options.requirePrivacyConsent;
    if (this.options.serviceConfig?.endpoint) {
      const { endpoint, pollIntervalMs, storageKey, ...rest } = this.options.serviceConfig;
      this.serviceConfig = {
        ...rest,
        endpoint: this.normalizeEndpoint(endpoint),
        pollIntervalMs: pollIntervalMs ?? DEFAULT_SERVICE_POLL_INTERVAL,
        storageKey: storageKey ?? DEFAULT_STORAGE_KEY,
      };
    }
  }

  /**
   * Mounts the widget into the target DOM node and prepares storage, styles and initial state.
   */
  mount(): void {
    if (typeof window === "undefined" || typeof document === "undefined") {
      throw new Error("AlbertChat: mount() benötigt eine Browser-Umgebung.");
    }

    if (this.host) {
      return;
    }

    const target = this.resolveTarget();
    this.host = document.createElement("div");
    this.host.className = "acw-host";
    this.shadow = this.host.attachShadow({ mode: "open" });

    this.applyThemeVariables();
    this.shadow.appendChild(this.createStyleElement());
    this.container = this.createContainer();
    this.shadow.appendChild(this.container);

    target.appendChild(this.host);

    this.storage = this.resolveStorage();
    if (this.serviceConfig) {
      this.chatId = this.loadPersistedChatId();
      if (this.chatId && this.options.requirePrivacyConsent) {
        this.isConsentGranted = true;
      }
    }

    this.registerEventListeners();
    this.startTeaserCountdown();
    this.resetConversation({ preserveSession: true });
    this.updateDimensions();
  }

  /**
   * Tears down DOM bindings, timers and observers so the widget can be safely discarded.
   */
  destroy(): void {
    this.stopTeaserCountdown();
    this.clearStreamingTimers();
    this.stopPolling();
    this.hideTypingIndicator();
    this.hideToolActivityIndicator();
    this.toolActivityIndicator = undefined;
    this.pendingToolCall = null;
    window.removeEventListener("resize", this.handleWindowResize);
    if (this.messageList) {
      this.messageList.removeEventListener("scroll", this.handleMessagesScroll);
    }
    this.removeConsentPrompt();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    if (this.host && this.host.parentElement) {
      this.host.parentElement.removeChild(this.host);
    }
  }

  /**
   * Opens the chat window, focuses the input and triggers auto-scroll behaviour.
   */
  open(): void {
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.hasEverOpened = true;
    this.chatWindow.classList.add("acw-open");
    this.launcherButton.setAttribute("aria-expanded", "true");
    this.chatWindow.setAttribute("aria-hidden", "false");
    this.focusInput();
    this.hideTeaser();
    this.shouldAutoScroll = true;
    this.scrollToBottom({ force: true });
    this.updateDimensions();
  }

  /**
   * Closes the chat window and updates accessibility attributes accordingly.
   */
  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.chatWindow.classList.remove("acw-open");
    this.launcherButton.setAttribute("aria-expanded", "false");
    this.chatWindow.setAttribute("aria-hidden", "true");
  }

  /**
   * Toggles the chat window visibility based on the current open state.
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Clears all messages and state while optionally keeping the current service session alive.
   */
  resetConversation(options: { preserveSession?: boolean } = {}): void {
    const { preserveSession = false } = options;
    this.clearStreamingTimers();
    this.stopPolling();
    this.hideTypingIndicator();
    this.shouldAutoScroll = true;
    this.isAwaitingAgent = false;
    this.isTerminated = false;
    this.isConsentGranted = !this.options.requirePrivacyConsent;
    this.messages = [];
    this.messageElements = [];
    this.historyContents = [];
    this.pendingToolCall = null;
    this.hasLoadedInitialHistory = false;
    this.mockResponseIndex = 0;
    this.cancelWelcomeAnimationCallbacks();
    if (!preserveSession) {
      this.welcomeAnimationPlayedOnce = false;
    }
    this.clearMessageList();
    this.hasShownWelcomeMessage = false;
    this.welcomeAnimationHasRun = false;
    if (this.options.requirePrivacyConsent && this.chatId && (preserveSession || !!this.serviceConfig)) {
      this.isConsentGranted = true;
    }
    if (this.serviceConfig && !preserveSession) {
      this.clearChatSession();
      if (this.options.requirePrivacyConsent) {
        this.isConsentGranted = false;
      }
    }
    this.hideToolActivityIndicator();
    this.renderInitialState();
  }

  /**
   * Detects whether localStorage can be used for persisting the chat session id.
   */
  private resolveStorage(): Storage | null {
    if (typeof window === "undefined") {
      return null;
    }
    try {
      const storage = window.localStorage;
      const testKey = `acw-storage-test-${this.instanceId}`;
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return storage;
    } catch (error) {
      console.warn("AlbertChat: Zugriff auf localStorage nicht möglich.", error);
      return null;
    }
  }

  /**
   * Reads a previously stored chat session id so we can resume an existing conversation.
   */
  private loadPersistedChatId(): string | null {
    if (!this.storage || !this.serviceConfig) {
      return null;
    }
    try {
      return this.storage.getItem(this.serviceConfig.storageKey);
    } catch (error) {
      console.warn("AlbertChat: Chat-ID konnte nicht gelesen werden.", error);
      return null;
    }
  }

  /**
   * Persists or removes the active chat id in localStorage depending on the given value.
   */
  private persistChatId(id: string | null): void {
    if (!this.storage || !this.serviceConfig) {
      return;
    }
    try {
      if (id) {
        this.storage.setItem(this.serviceConfig.storageKey, id);
      } else {
        this.storage.removeItem(this.serviceConfig.storageKey);
      }
    } catch (error) {
      console.warn("AlbertChat: Chat-ID konnte nicht gespeichert werden.", error);
    }
  }

  /**
   * Resets all session-related bookkeeping and removes any persisted chat id.
   */
  private clearChatSession(): void {
    this.chatId = null;
    this.chatOffsets = null;
    this.pollFailureCount = 0;
    this.hasLoadedInitialHistory = false;
    this.persistChatId(null);
    this.hasShownWelcomeMessage = false;
    this.welcomeAnimationHasRun = false;
    this.cancelWelcomeAnimationCallbacks();
    this.welcomeAnimationPlayedOnce = false;
    this.pendingToolCall = null;
    this.hideToolActivityIndicator();
    this.toolActivityIndicator = undefined;
    this.resetTypingIndicatorState();
  }

  /**
   * Sets up the UI for a clean conversation start, considering consent and welcome message rules.
   */
  private renderInitialState(): void {
    if (!this.messageList) {
      return;
    }
    this.removeConsentPrompt();
    if (this.options.requirePrivacyConsent && !this.isConsentGranted) {
      this.renderConsentPrompt();
      this.hideInputArea(this.options.texts.consentPendingPlaceholder);
    } else if (!this.isTerminated) {
      this.showInputArea();
      this.ensureWelcomeMessage();
      if (this.serviceConfig) {
        if (!this.hasLoadedInitialHistory) {
          if (!this.options.welcomeMessage?.enabled) {
            this.renderEmptyState();
          } else {
            this.clearMessageList();
            this.ensureWelcomeMessage();
          }
          this.requestServiceInitialization();
        }
      } else if (!this.messages.length && !this.options.welcomeMessage?.enabled) {
        this.addMessage(
          {
            role: "agent",
            content: this.options.texts.initialMessage,
            timestamp: new Date(),
          },
          { forceScroll: true, smooth: true, autoScroll: true }
        );
      }
    }
    this.ensureDisclaimer();
    this.updateSendAvailability();
  }

  /**
   * Kicks off initialization with the backend service; optionally forces a fresh session.
   */
  private requestServiceInitialization(forceReinit = false): void {
    if (!this.serviceConfig) {
      return;
    }
    void this.ensureChatSessionInitialized(forceReinit).catch((error) => {
      console.error("AlbertChat: Serviceinitialisierung fehlgeschlagen.", error);
      this.showServiceError(
        "Der Chat konnte nicht gestartet werden. Bitte versuchen Sie es erneut."
      );
    });
  }

  /**
   * Clears the rendered message list while keeping state consistent with running animations.
   */
  private clearMessageList(): void {
    if (!this.messageList) {
      return;
    }
    this.messageList.innerHTML = "";
    this.disclaimerElement = undefined;
    this.welcomeMessageElement = undefined;
    this.pendingToolCall = null;
    this.hideToolActivityIndicator();
    this.toolActivityIndicator = undefined;
    this.resetTypingIndicatorState();
    const wasTyping = this.isWelcomeTyping;
    if (this.welcomeMessageTypingTimer !== null) {
      window.clearInterval(this.welcomeMessageTypingTimer);
      this.welcomeMessageTypingTimer = null;
    }
    this.isWelcomeTyping = false;
    if (wasTyping) {
      this.cancelWelcomeAnimationCallbacks();
      this.hasShownWelcomeMessage = false;
      this.welcomeAnimationHasRun = false;
      this.welcomeMessageAnimated = false;
    } else {
      this.welcomeMessageAnimated = this.hasShownWelcomeMessage;
      this.welcomeAnimationHasRun = this.hasShownWelcomeMessage;
    }
  }

  /**
   * Renders the placeholder empty-state bubble that tells the user no messages exist yet.
   */
  private renderEmptyState(): void {
    if (!this.messageList) {
      return;
    }
    if (this.options.welcomeMessage?.enabled) {
      this.clearMessageList();
      this.ensureWelcomeMessage();
      return;
    }
    this.clearMessageList();
    const empty = document.createElement("div");
    empty.className = "acw-empty-state";
    empty.textContent = this.options.texts.emptyState;
    this.messageList.appendChild(empty);
  }

  /**
   * Removes the welcome message bubble and cancels any running typing animation for it.
   */
  private removeWelcomeMessage(): void {
    if (this.welcomeMessageElement) {
      this.welcomeMessageElement.remove();
      this.welcomeMessageElement = undefined;
    }
    if (this.welcomeMessageTypingTimer !== null) {
      window.clearInterval(this.welcomeMessageTypingTimer);
      this.welcomeMessageTypingTimer = null;
    }
    this.welcomeMessageAnimated = false;
    this.hasShownWelcomeMessage = false;
    this.isWelcomeTyping = false;
    this.welcomeAnimationHasRun = false;
    this.cancelWelcomeAnimationCallbacks();
  }

  /**
   * Ensures the welcome message bubble exists and handles the optional typing animation lifecycle.
   */
  private ensureWelcomeMessage(): void {
    if (!this.messageList) {
      return;
    }
    const config = this.options.welcomeMessage;
    if (!config?.enabled) {
      this.removeWelcomeMessage();
      return;
    }
    if (this.isWelcomeTyping && this.welcomeMessageElement) {
      return;
    }
    const text = config.text ?? this.options.texts.initialMessage;
    if (!text) {
      this.removeWelcomeMessage();
      return;
    }

    const emptyState = this.messageList.querySelector(".acw-empty-state");
    if (emptyState) {
      emptyState.remove();
    }

    let bubble: HTMLDivElement | null = null;
    if (!this.welcomeMessageElement) {
      const message: ChatMessage = {
        role: "agent",
        content: decodeHtmlEntities(text),
        timestamp: new Date(),
      };
      const elements = this.buildMessageElement(message);
      this.welcomeMessageElement = elements.wrapper;
      elements.timestamp.textContent = "";
      bubble = elements.bubble;
    } else {
      const existingBubble = this.welcomeMessageElement.querySelector(".acw-bubble");
      bubble = existingBubble instanceof HTMLDivElement ? existingBubble : null;
    }

    if (bubble) {
      if (
        !this.hasShownWelcomeMessage &&
        !this.welcomeAnimationHasRun &&
        !this.welcomeAnimationPlayedOnce
      ) {
        this.startWelcomeMessageAnimation(bubble, text);
      } else {
        bubble.innerHTML = renderMarkdown(text);
        this.hasShownWelcomeMessage = true;
        this.welcomeMessageAnimated = true;
      }
    }

    const classes = ["acw-message", "acw-message-agent", "acw-message-welcome"];
    if (config.className) {
      classes.push(config.className);
    }
    this.welcomeMessageElement.className = classes.join(" ");
    this.welcomeMessageElement.removeAttribute("style");
    if (config.styles) {
      Object.entries(config.styles).forEach(([key, value]) => {
        if (value !== undefined) {
          this.welcomeMessageElement!.style.setProperty(key, value);
        }
      });
    }

    if (this.messageList.firstElementChild !== this.welcomeMessageElement) {
      this.messageList.insertBefore(this.welcomeMessageElement, this.messageList.firstChild);
    }
    this.ensureDisclaimer();
  }

  /**
   * Plays the character-by-character welcome typing effect the first time the widget opens.
   */
  private startWelcomeMessageAnimation(bubble: HTMLDivElement, text: string): void {
    if (
      this.hasShownWelcomeMessage ||
      this.isWelcomeTyping ||
      this.welcomeAnimationHasRun ||
      this.welcomeAnimationPlayedOnce
    ) {
      bubble.innerHTML = renderMarkdown(text);
      this.hasShownWelcomeMessage = true;
      this.welcomeMessageAnimated = true;
      this.flushWelcomeAnimationCallbacks();
      return;
    }
    if (this.welcomeMessageTypingTimer !== null) {
      return;
    }

    const renderedHtml = renderMarkdown(text);
    let plain = decodeHtmlEntities(text);
    this.welcomeAnimationPlayedOnce = true;
    if (typeof document !== "undefined") {
      const temp = document.createElement("div");
      temp.innerHTML = renderedHtml;
      plain = temp.textContent ?? plain;
    }

    const characters = Array.from(plain);
    if (!characters.length) {
      bubble.innerHTML = renderedHtml;
      this.hasShownWelcomeMessage = true;
      this.welcomeMessageAnimated = true;
      this.isWelcomeTyping = false;
      this.welcomeAnimationHasRun = true;
      this.flushWelcomeAnimationCallbacks();
      return;
    }
    let index = 0;
    bubble.innerHTML = "";
    const span = document.createElement("span");
    span.className = "acw-welcome-typing";
    bubble.appendChild(span);
    this.welcomeMessageAnimated = false;
    this.isWelcomeTyping = true;

    const flush = (): void => {
      if (index >= characters.length) {
        if (this.welcomeMessageTypingTimer !== null) {
          window.clearInterval(this.welcomeMessageTypingTimer);
          this.welcomeMessageTypingTimer = null;
        }
        this.welcomeMessageAnimated = true;
        this.hasShownWelcomeMessage = true;
        this.isWelcomeTyping = false;
        this.welcomeAnimationHasRun = true;
        bubble.innerHTML = renderedHtml;
        this.ensureDisclaimer();
        this.flushWelcomeAnimationCallbacks();
        return;
      }
      index += 1;
      span.textContent = characters.slice(0, index).join("");
    };

    flush();
    const interval = characters.length > 250 ? 24 : characters.length > 150 ? 28 : characters.length > 80 ? 32 : 36;
    this.welcomeMessageTypingTimer = window.setInterval(flush, interval);
  }

  /**
   * Queues a callback to run once the welcome animation finished; executes immediately if idle.
   */
  private runAfterWelcomeAnimation(callback: () => void): void {
    if (!this.isWelcomeTyping) {
      callback();
      return;
    }
    this.pendingWelcomeAnimationCallbacks.push(callback);
  }

  /**
   * Executes and clears all callbacks that were waiting for the welcome animation.
   */
  private flushWelcomeAnimationCallbacks(): void {
    if (!this.pendingWelcomeAnimationCallbacks.length) {
      return;
    }
    const callbacks = this.pendingWelcomeAnimationCallbacks.slice();
    this.pendingWelcomeAnimationCallbacks = [];
    callbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error("AlbertChat: Fehler beim Ausführen eines Welcome-Callbacks.", error);
      }
    });
  }

  /**
   * Clears any callbacks waiting for the welcome animation so they will not fire later.
   */
  private cancelWelcomeAnimationCallbacks(): void {
    this.pendingWelcomeAnimationCallbacks = [];
  }

  /**
   * Ensures the optional disclaimer footer is appended after the message list when required.
   */
  private ensureDisclaimer(): void {
    if (!this.messageList) {
      return;
    }
    const config = this.options.disclaimer;
    const hasContent = this.messages.length > 0 || !!this.welcomeMessageElement;
    if (!config?.enabled || !hasContent) {
      if (this.disclaimerElement) {
        this.disclaimerElement.remove();
        this.disclaimerElement = undefined;
      }
      return;
    }

    if (!this.disclaimerElement) {
      this.disclaimerElement = document.createElement("div");
    }

    const classes = ["acw-disclaimer"];
    if (config.className) {
      classes.push(config.className);
    }
    this.disclaimerElement.className = classes.join(" ").trim();
    this.disclaimerElement.textContent = config.text;

    this.disclaimerElement.removeAttribute("style");
    if (config.styles) {
      Object.entries(config.styles).forEach(([key, value]) => {
        if (value !== undefined) {
          this.disclaimerElement!.style.setProperty(key, value);
        }
      });
    }

    if (this.disclaimerElement.parentElement !== this.messageList) {
      this.messageList.appendChild(this.disclaimerElement);
    } else if (this.messageList.lastElementChild !== this.disclaimerElement) {
      this.messageList.appendChild(this.disclaimerElement);
    }
  }

  /**
   * Renders the consent prompt bubble with accept/decline buttons and wiring.
   */
  private renderConsentPrompt(): void {
    if (!this.messageList) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "acw-message acw-message-agent acw-consent";

    const bubble = document.createElement("div");
    bubble.className = "acw-bubble acw-consent-bubble";

    const text = document.createElement("p");
    text.className = "acw-consent-text";
    text.textContent = this.options.texts.consentPrompt;
    bubble.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "acw-consent-actions";

    const acceptButton = document.createElement("button");
    acceptButton.type = "button";
    acceptButton.className = "acw-consent-button acw-consent-accept";
    acceptButton.textContent = this.options.texts.consentAcceptLabel;
    acceptButton.addEventListener("click", this.handleConsentAccept);

    const declineButton = document.createElement("button");
    declineButton.type = "button";
    declineButton.className = "acw-consent-button acw-consent-decline";
    declineButton.textContent = this.options.texts.consentDeclineLabel;
    declineButton.addEventListener("click", this.handleConsentDecline);

    actions.appendChild(acceptButton);
    actions.appendChild(declineButton);
    bubble.appendChild(actions);
    wrapper.appendChild(bubble);

    this.messageList.appendChild(wrapper);
    this.consentPromptElement = wrapper;
    this.scrollToBottom({ force: true });
  }

  /**
   * Removes the consent prompt bubble from the DOM if it is currently displayed.
   */
  private removeConsentPrompt(): void {
    if (this.consentPromptElement) {
      this.consentPromptElement.remove();
      this.consentPromptElement = undefined;
    }
  }

  /**
   * Handles a consent acceptance by enabling input and initializing the service when necessary.
   */
  private handleConsentAccept = (): void => {
    if (this.isTerminated) {
      return;
    }
    this.isConsentGranted = true;
    this.removeConsentPrompt();
    this.showInputArea();
    if (this.serviceConfig) {
      this.shouldAutoScroll = true;
      if (this.options.welcomeMessage?.enabled) {
        this.clearMessageList();
        this.ensureWelcomeMessage();
      } else {
        this.renderEmptyState();
      }
      this.requestServiceInitialization();
    } else if (!this.messages.length && !this.options.welcomeMessage?.enabled) {
      this.shouldAutoScroll = true;
      this.addMessage(
        {
          role: "agent",
          content: this.options.texts.initialMessage,
          timestamp: new Date(),
        },
        { forceScroll: true, smooth: true, autoScroll: true }
      );
    }
    this.ensureWelcomeMessage();
    this.updateSendAvailability();
    this.focusInput();
  };

  /**
   * Handles a consent decline by terminating the session and showing the decline message.
   */
  private handleConsentDecline = (): void => {
    if (this.isTerminated) {
      return;
    }
    this.isConsentGranted = false;
    this.isTerminated = true;
    this.removeConsentPrompt();
    this.hideInputArea(this.options.texts.consentDeclinedPlaceholder);
    this.shouldAutoScroll = true;
    this.addMessage(
      {
        role: "agent",
        content: this.options.texts.consentDeclinedMessage,
        timestamp: new Date(),
      },
      { forceScroll: true, smooth: true, autoScroll: true }
    );
    this.updateSendAvailability();
  };

  /**
   * Enables or disables the input area while updating the placeholder text accordingly.
   */
  private setInputDisabled(disabled: boolean, placeholder?: string): void {
    if (!this.inputField) {
      return;
    }
    this.inputField.disabled = disabled;
    this.inputField.setAttribute("aria-disabled", disabled ? "true" : "false");
    if (placeholder !== undefined) {
      this.inputField.placeholder = placeholder;
    } else if (!disabled) {
      this.inputField.placeholder = this.inputPlaceholder;
    }
    if (disabled) {
      this.inputField.value = "";
      this.inputField.style.height = "";
      this.lastTextareaHeight = 0;
      if (placeholder) {
        this.inputField.value = placeholder;
        this.adjustTextareaHeight();
        this.inputField.value = "";
      }
    } else {
      this.adjustTextareaHeight();
    }
  }

  /**
   * Reveals the input wrapper and re-enables typing capabilities.
   */
  private showInputArea(): void {
    if (this.inputArea) {
      this.inputArea.classList.remove("acw-hidden");
    }
    this.setInputDisabled(false);
  }

  /**
   * Hides the input wrapper and optionally shows a placeholder message describing why.
   */
  private hideInputArea(placeholder?: string): void {
    if (this.inputArea) {
      this.inputArea.classList.add("acw-hidden");
    }
    this.setInputDisabled(true, placeholder);
  }

  /**
   * Checks whether the provided icon reference points to an SVG asset.
   */
  private isSvgIcon(icon: string): boolean {
    const value = icon.trim();
    if (!value) {
      return false;
    }
    if (/^data:image\/svg\+xml/i.test(value)) {
      return true;
    }
    if (/\.svg(\?.*)?$/i.test(value)) {
      return true;
    }
    if (/^(https?:)?\/.+/i.test(value)) {
      return /\.svg(\?.*)?$/i.test(value);
    }
    if (value.startsWith("./") || value.startsWith("../")) {
      return /\.svg(\?.*)?$/i.test(value);
    }
    return false;
  }

  /**
   * Creates an icon element, supporting both inline text icons and external SVG sources.
   */
  private createIconElement(icon: string, baseClass: string, altText = ""): HTMLElement {
    const trimmed = icon.trim();
    if (this.isSvgIcon(trimmed)) {
      const img = document.createElement("img");
      img.src = trimmed;
      img.alt = altText;
      img.draggable = false;
      img.className = `${baseClass} acw-icon-img`.trim();
      img.setAttribute("aria-hidden", "true");
      return img;
    }
    const span = document.createElement("span");
    span.className = baseClass;
    span.textContent = trimmed;
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  /**
   * Evaluates whether the user is currently allowed to send a message.
   */
  private canSendMessage(): boolean {
    if (!this.inputField || this.inputField.disabled) {
      return false;
    }
    if (!this.isConsentGranted || this.isTerminated) {
      return false;
    }
    if (this.isAwaitingAgent) {
      return false;
    }
    return true;
  }

  /**
   * Synchronizes the send button state with the latest permission and streaming rules.
   */
  private updateSendAvailability(): void {
    if (!this.sendButton) {
      return;
    }
    const canSend = this.canSendMessage() && !!this.inputField && !this.inputField.disabled;
    const reason = this.isTerminated
      ? "terminated"
      : !this.isConsentGranted
      ? "consent"
      : this.isAwaitingAgent
      ? "streaming"
      : "";

    let tooltip = this.options.texts.sendButtonLabel;
    if (!canSend) {
      if (reason === "consent") {
        tooltip = this.options.texts.sendWhileConsentPendingTooltip;
      } else if (reason === "terminated") {
        tooltip = this.options.texts.sendWhileTerminatedTooltip;
      } else if (reason === "streaming") {
        tooltip = this.options.texts.sendWhileStreamingTooltip;
      } else {
        tooltip = this.options.texts.sendWhileStreamingTooltip;
      }
    }

    this.sendButton.disabled = !canSend;
    this.sendButton.setAttribute("aria-disabled", canSend ? "false" : "true");
    this.sendButton.title = tooltip;
  }

  /**
   * Adds a new message to internal state and renders it unless it is a placeholder.
   */
  addMessage(
    message: ChatMessage,
    options: { forceScroll?: boolean; smooth?: boolean; autoScroll?: boolean } = {}
  ): void {
    this.messages.push(message);
    // Placeholder entries reserve history positions but should not render a bubble until text exists.
    // Also don't render normal messages without text (wait until text arrives)
    let elements: MessageElementRefs | null = null;
    const hasText = message.content.trim().length > 0;
    if (!message.isToolPlaceholder && hasText) {
      elements = this.appendMessageElement(message, options);
      if (elements) {
        this.applyMessageStatus(elements.wrapper, message);
      }
    }
    this.messageElements.push(elements);
    this.ensureDisclaimer();
  }

  /**
   * Applies CSS state classes to a user message to represent sending or failure states.
   */
  private applyMessageStatus(wrapper: HTMLDivElement, message: ChatMessage): void {
    wrapper.classList.remove("acw-message-failed", "acw-message-pending");
    if (message.role !== "user") {
      return;
    }
    if (message.status === "failed") {
      wrapper.classList.add("acw-message-failed");
    } else if (message.status === "pending") {
      wrapper.classList.add("acw-message-pending");
    }
  }

  /**
   * Finds the index of the most recent user-authored message in the history array.
   */
  private getLastUserMessageIndex(): number {
    for (let index = this.messages.length - 1; index >= 0; index -= 1) {
      const candidate = this.messages[index];
      if (candidate && candidate.role === "user") {
        return index;
      }
    }
    return -1;
  }

  /**
   * Updates a specific user message status and refreshes its DOM classes if present.
   */
  private setUserMessageStatus(index: number, status: "pending" | "sent" | "failed"): void {
    const message = this.messages[index];
    if (!message || message.role !== "user") {
      return;
    }
    message.status = status;
    message.localOnly = status !== "sent";
    const refs = this.messageElements[index];
    if (refs) {
      this.applyMessageStatus(refs.wrapper, message);
    }
  }

  /**
   * Convenience helper to update the status of the latest user message.
   */
  private markLastUserMessageStatus(status: "pending" | "sent" | "failed"): void {
    const index = this.getLastUserMessageIndex();
    if (index === -1) {
      return;
    }
    this.setUserMessageStatus(index, status);
  }

  /**
   * Returns true when there are unsynced local-only messages that require a refresh.
   */
  private hasLocalOnlyMessages(): boolean {
    return this.messages.some((message) => message.localOnly);
  }

  /**
   * Removes a message and its DOM node while keeping placeholder tracking in sync.
   */
  private removeMessageAt(index: number): void {
    const refs = this.messageElements[index];
    if (refs?.wrapper?.parentElement) {
      refs.wrapper.parentElement.removeChild(refs.wrapper);
    }
    this.messages.splice(index, 1);
    this.messageElements.splice(index, 1);
    if (this.pendingToolCall) {
      const anchorIndex = this.pendingToolCall.anchorIndex;
      if (anchorIndex !== null) {
        if (anchorIndex === index) {
          this.pendingToolCall = null;
          this.hideToolActivityIndicator();
        } else if (anchorIndex > index) {
          this.pendingToolCall = { anchorIndex: anchorIndex - 1 };
        }
      }
    }
    this.ensureDisclaimer();
    this.ensureWelcomeMessage();
    this.updateToolActivityIndicator();
  }

  /**
   * Drops any failed user messages from the history; used after successful refreshes.
   */
  private removeFailedUserMessages(): void {
    let removed = false;
    for (let index = this.messages.length - 1; index >= 0; index -= 1) {
      const message = this.messages[index];
      if (message?.role === "user" && message.status === "failed") {
        this.removeMessageAt(index);
        removed = true;
      }
    }
    if (removed) {
      this.ensureDisclaimer();
    }
  }

  /**
   * Removes locally generated agent messages (e.g. error banners) once the server responds.
   */
  private removeLocalAgentMessages(): void {
    let removed = false;
    for (let index = this.messages.length - 1; index >= 0; index -= 1) {
      const message = this.messages[index];
      if (message?.role === "agent" && message.localOnly) {
        this.removeMessageAt(index);
        removed = true;
      }
    }
    if (removed) {
      this.ensureDisclaimer();
    }
  }

  /**
   * Rebuilds the local message arrays from a server-provided history snapshot.
   */
  private hydrateMessagesFromHistory(history: ChatServiceHistoryEntry[]): void {
    this.messages = [];
    this.messageElements = [];
    this.historyContents = [];
    if (this.messageList) {
      this.clearMessageList();
    }

    let pendingToolCall: { anchorIndex: number | null } | null = null;
    history.forEach((entry, index) => {
      const role = this.mapServiceRole(entry.role);
      const rawText = entry.text ?? "";
      const decodedText = decodeHtmlEntities(rawText);
      const trimmedText = decodedText.trim();
      const isToolCall = Boolean(entry.isToolCall);
      const hasRenderableText = trimmedText.length > 0;
      const message: ChatMessage = {
        role,
        content: hasRenderableText ? decodedText : "",
        timestamp: this.parseTimestamp(entry.dateTime),
        status: role === "user" ? "sent" : undefined,
        localOnly: false,
        isToolPlaceholder: isToolCall && !hasRenderableText,
      };
      this.historyContents.push(decodedText);
      this.addMessage(message, { autoScroll: false });
      
      // Determine if this tool call should show a placeholder
      if (isToolCall && !hasRenderableText) {
        // Check if there's a following message and if it has text
        const nextIndex = index + 1;
        if (nextIndex < history.length) {
          const nextEntry = history[nextIndex];
          const nextText = (nextEntry.text ?? "").trim();
          if (nextText.length === 0) {
            // Following message has no text yet → show placeholder
            pendingToolCall = { anchorIndex: this.messages.length - 1 };
          } else {
            // Following message has text → don't show placeholder for this tool call
            pendingToolCall = null;
          }
        } else {
          // No following message → show placeholder
          pendingToolCall = { anchorIndex: this.messages.length - 1 };
        }
      }
      // Note: We don't reset pendingToolCall when hasRenderableText is true
      // because a previous tool call might still be waiting for its following message
    });
    this.pendingToolCall = pendingToolCall;

    if (this.messageList) {
      this.scrollToBottom({ smooth: false, force: true });
    }

    this.ensureWelcomeMessage();
    this.ensureDisclaimer();
    this.updateToolActivityIndicator();
  }

  /**
   * Resolves the DOM element the widget should attach to, defaulting to <body>.
   */
  private resolveTarget(): HTMLElement {
    if (this.options.target instanceof HTMLElement) {
      return this.options.target;
    }
    if (typeof this.options.target === "string") {
      const target = document.querySelector<HTMLElement>(this.options.target);
      if (target) {
        return target;
      }
      console.warn(
        `AlbertChat: Ziel-Selektor '${this.options.target}' wurde nicht gefunden. Widget wird an <body> angehängt.`
      );
    }
    return document.body;
  }

  /**
   * Creates the main container that hosts the chat window, teaser bubble and launcher button.
   */
  private createContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "acw-container";

    this.chatWindow = this.createChatWindow();
    container.appendChild(this.chatWindow);

    this.teaserBubble = this.createTeaserBubble();
    container.appendChild(this.teaserBubble);

    this.launcherButton = this.createLauncherButton();
    container.appendChild(this.launcherButton);

    return container;
  }

  /**
   * Generates the <style> element containing all widget CSS.
   */
  private createStyleElement(): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = this.buildStyles();
    return style;
  }

  /**
   * Returns the CSS template for the widget. Values are substituted via CSS custom properties.
   */
  private buildStyles(): string {
    return `
      :host {
        all: initial;
        font-family: var(--acw-font-family);
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      .acw-container {
        position: fixed;
        inset: auto var(--acw-spacing-lg) var(--acw-spacing-lg) auto;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: var(--acw-spacing-sm);
        z-index: var(--acw-z-index);
        font-family: var(--acw-font-family);
        color: var(--acw-text-color);
      }
      .acw-launcher {
        position: relative;
        display: inline-flex;
        align-items: center;
        gap: var(--acw-spacing-xs);
        background: var(--acw-launcher-background);
        color: var(--acw-launcher-text-color);
        border: none;
        border-radius: var(--acw-radius-pill);
        padding: var(--acw-spacing-sm) var(--acw-spacing-md);
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 10px 30px rgba(37, 99, 235, 0.25);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-size: 0.95rem;
      }
      .acw-launcher:focus-visible {
        outline: 2px solid var(--acw-primary-color);
        outline-offset: 4px;
      }
      .acw-launcher:hover {
        transform: translateY(-1px);
        box-shadow: 0 12px 32px rgba(37, 99, 235, 0.35);
      }
      .acw-launcher-icon {
        font-size: 1.1rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .acw-chat {
        position: relative;
        display: flex;
        flex-direction: column;
        width: var(--acw-chat-width);
        height: var(--acw-chat-height);
        max-height: calc(100vh - 120px);
        background: var(--acw-surface-color);
        border-radius: var(--acw-radius-lg);
        box-shadow: 0 20px 45px var(--acw-shadow-color);
        opacity: 0;
        transform: translateY(12px) scale(0.96);
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
        border: 1px solid var(--acw-border-color);
        overflow: hidden;
      }
      .acw-chat.acw-open {
        opacity: 1;
        transform: translateY(0) scale(1);
        pointer-events: auto;
      }
      .acw-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--acw-spacing-md);
        background: var(--acw-surface-accent);
        border-bottom: 1px solid var(--acw-border-color);
      }
      .acw-header-details {
        display: flex;
        gap: var(--acw-spacing-sm);
        align-items: center;
      }
      .acw-header-icon {
        font-size: 1.3rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .acw-header-texts {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .acw-header-title {
        font-size: 1.05rem;
        font-weight: 600;
      }
      .acw-header-subtitle {
        font-size: 0.85rem;
        color: rgba(15, 23, 42, 0.7);
      }
      .acw-header-actions {
        display: inline-flex;
        gap: var(--acw-spacing-xs);
        align-items: center;
      }
      .acw-icon-button {
        appearance: none;
        border: none;
        background: transparent;
        border-radius: var(--acw-radius-sm);
        padding: var(--acw-spacing-xs);
        font-size: 1rem;
        cursor: pointer;
        color: var(--acw-text-color);
        transition: background 0.2s ease;
      }
      .acw-icon-button:hover {
        background: rgba(148, 163, 184, 0.15);
      }
      .acw-icon-button:focus-visible {
        outline: 2px solid var(--acw-primary-color);
        outline-offset: 2px;
      }
      .acw-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 0 var(--acw-spacing-md);
        background: var(--acw-surface-color);
        overflow: hidden;
        min-height: 0;
      }
      .acw-messages {
        flex: 1;
        overflow-y: auto;
        padding: var(--acw-spacing-md) calc(var(--acw-spacing-sm) + 6px) var(--acw-spacing-md) var(--acw-spacing-sm);
        display: flex;
        flex-direction: column;
        gap: var(--acw-spacing-sm);
        min-height: 0;
        scroll-behavior: smooth;
        scrollbar-width: thin;
        scrollbar-color: rgba(148, 163, 184, 0.55) transparent;
        scrollbar-gutter: stable both-edges;
      }
      .acw-empty-state {
        margin: auto;
        color: rgba(15, 23, 42, 0.6);
        font-size: 0.9rem;
        text-align: center;
        padding: var(--acw-spacing-md);
      }
      .acw-message {
        display: flex;
        flex-direction: column;
        max-width: 85%;
        font-size: 0.95rem;
        gap: 6px;
      }
      .acw-message-user {
        align-self: flex-end;
        text-align: right;
      }
      .acw-message-agent {
        align-self: flex-start;
        text-align: left;
      }
      .acw-bubble {
        border-radius: var(--acw-radius-md);
        padding: var(--acw-spacing-sm) var(--acw-spacing-md);
        line-height: 1.45;
        word-break: break-word;
        white-space: normal;
      }
      .acw-message-user .acw-bubble {
        background: var(--acw-user-message-color);
        color: var(--acw-user-text-color);
        border-bottom-right-radius: 4px;
      }
      .acw-message-agent .acw-bubble {
        background: var(--acw-agent-message-color);
        color: var(--acw-agent-text-color);
        border-bottom-left-radius: 4px;
      }
      .acw-tool-indicator .acw-bubble {
        font-style: italic;
        color: rgba(15, 23, 42, 0.55);
      }
      .acw-message-pending .acw-bubble {
        opacity: 0.85;
      }
      .acw-message-failed .acw-bubble {
        background: rgba(239, 68, 68, 0.12);
        color: var(--acw-text-color);
        border: 1px solid rgba(239, 68, 68, 0.35);
      }
      .acw-message-failed .acw-timestamp {
        color: rgba(239, 68, 68, 0.7);
      }
      .acw-message-welcome {
        opacity: 0.95;
      }
      .acw-message-welcome .acw-timestamp {
        display: none;
      }
      .acw-welcome-typing {
        white-space: pre-wrap;
      }
      .acw-timestamp {
        font-size: 0.75rem;
        color: rgba(15, 23, 42, 0.55);
      }
      .acw-bubble p {
        margin: 0 0 0.6em 0;
      }
      .acw-bubble p:last-child {
        margin-bottom: 0;
      }
      .acw-bubble ul,
      .acw-bubble ol {
        margin: 0 0 0.6em 1.25em;
        padding: 0;
      }
      .acw-bubble ul:last-child,
      .acw-bubble ol:last-child {
        margin-bottom: 0;
      }
      .acw-bubble li + li {
        margin-top: 0.25em;
      }
      .acw-bubble code {
        background: rgba(15, 23, 42, 0.08);
        padding: 0.1em 0.35em;
        border-radius: 4px;
        font-size: 0.9em;
      }
      .acw-bubble pre {
        background: rgba(15, 23, 42, 0.08);
        padding: 0.75em;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 0.85em;
        margin: 0 0 0.75em 0;
      }
      .acw-bubble pre code {
        background: transparent;
        padding: 0;
        border-radius: 0;
        font-size: inherit;
      }
      .acw-bubble pre:last-child {
        margin-bottom: 0;
      }
      .acw-bubble a {
        color: var(--acw-primary-color);
        text-decoration: underline;
      }
      .acw-bubble hr {
        border: none;
        border-top: 1px solid rgba(148, 163, 184, 0.35);
        margin: 0.75em 0;
      }
      .acw-disclaimer {
        font-size: 0.75rem;
        color: rgba(15, 23, 42, 0.55);
        margin: var(--acw-spacing-xs) auto 0 0;
        padding: 0;
        align-self: flex-start;
        max-width: 85%;
        line-height: 1.3;
      }
      .acw-input-area {
        border-top: 1px solid var(--acw-border-color);
        padding: var(--acw-spacing-md);
        display: flex;
        flex-direction: column;
        gap: var(--acw-spacing-sm);
        background: var(--acw-surface-color);
        flex-shrink: 0;
      }
      .acw-input-row {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: var(--acw-spacing-sm);
        align-items: flex-end;
      }
      .acw-textarea {
        resize: none;
        overflow-y: hidden;
        padding: var(--acw-spacing-sm) var(--acw-spacing-md);
        border-radius: var(--acw-radius-md);
        border: 1px solid var(--acw-border-color);
        font: inherit;
        line-height: 1.45;
        min-height: 44px;
        max-height: calc(1.45em * 5 + var(--acw-spacing-sm) * 2);
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .acw-textarea:focus-visible {
        outline: none;
        border-color: var(--acw-primary-color);
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
      }
      .acw-send-button {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: var(--acw-radius-md);
        border: none;
        background: var(--acw-send-button-background);
        color: var(--acw-send-button-text-color);
        padding: 0;
        width: 46px;
        height: 46px;
        cursor: pointer;
        min-height: 46px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }
      .acw-send-button:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
      }
      .acw-send-button:focus-visible {
        outline: 2px solid var(--acw-primary-color);
        outline-offset: 2px;
      }
      .acw-send-icon {
        font-size: 1.15rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .acw-icon-button-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .acw-icon-img {
        width: 1em;
        height: 1em;
        display: inline-block;
        object-fit: contain;
      }
      .acw-header-icon.acw-icon-img {
        width: 1.3rem;
        height: 1.3rem;
      }
      .acw-launcher-icon.acw-icon-img {
        width: 1.2rem;
        height: 1.2rem;
      }
      .acw-send-icon.acw-icon-img {
        width: 1.1rem;
        height: 1.1rem;
      }
      .acw-icon-button-icon.acw-icon-img {
        width: 1.05rem;
        height: 1.05rem;
      }
      .acw-input-area.acw-hidden {
        display: none !important;
      }
      .acw-footer-links {
        padding: var(--acw-spacing-sm) var(--acw-spacing-md);
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
        gap: var(--acw-spacing-sm);
        border-top: 1px solid var(--acw-border-color);
        background: var(--acw-surface-accent);
      }
      .acw-footer-link {
        color: var(--acw-primary-color);
        text-decoration: none;
        font-size: 0.8rem;
      }
      .acw-footer-link:hover {
        text-decoration: underline;
      }
      .acw-messages::-webkit-scrollbar {
        width: 8px;
      }
      .acw-messages::-webkit-scrollbar-track {
        background: transparent;
      }
      .acw-messages::-webkit-scrollbar-thumb {
        background-color: rgba(148, 163, 184, 0.55);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
      }
      .acw-messages::-webkit-scrollbar-thumb:hover {
        background-color: rgba(100, 116, 139, 0.75);
      }
      .acw-teaser {
        position: relative;
        display: none;
        align-items: center;
        gap: var(--acw-spacing-xs);
        padding: var(--acw-spacing-sm) var(--acw-spacing-md);
        border-radius: var(--acw-radius-lg);
        background: var(--acw-surface-color);
        border: 1px solid var(--acw-border-color);
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.15);
        color: var(--acw-text-color);
        font-size: 0.9rem;
        cursor: pointer;
        opacity: 0;
        transform: translateY(8px);
        pointer-events: none;
        transition: opacity 0.25s ease, transform 0.25s ease;
      }
      .acw-teaser::after {
        content: "";
        position: absolute;
        bottom: -8px;
        right: 24px;
        width: 14px;
        height: 14px;
        background: var(--acw-surface-color);
        border-left: 1px solid var(--acw-border-color);
        border-bottom: 1px solid var(--acw-border-color);
        transform: rotate(45deg);
        z-index: -1;
      }
      .acw-teaser.acw-visible {
        display: inline-flex;
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }
      .acw-message-streaming .acw-timestamp {
        opacity: 0;
      }
      .acw-typing {
        align-self: flex-start;
      }
      .acw-bubble-typing {
        display: block;
        position: relative;
        background: var(--acw-agent-message-color);
        color: var(--acw-agent-text-color);
      }
      .acw-typing .acw-typing-content {
        display: block;
        white-space: pre-wrap;
        word-break: break-word;
      }
      .acw-typing .acw-typing-cursor {
        display: inline-block;
        width: 8px;
        height: 8px;
        margin-left: 4px;
        border-radius: 50%;
        background: var(--acw-agent-text-color);
        animation: acw-typing-pulse 1s ease-in-out infinite;
        opacity: 0.75;
        vertical-align: baseline;
      }
      .acw-consent {
        align-self: stretch;
      }
      .acw-consent-bubble {
        display: flex;
        flex-direction: column;
        gap: var(--acw-spacing-sm);
      }
      .acw-consent-text {
        margin: 0;
        line-height: 1.55;
      }
      .acw-consent-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--acw-spacing-sm);
      }
      .acw-consent-button {
        appearance: none;
        border-radius: var(--acw-radius-md);
        padding: 8px 16px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
        transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease;
      }
      .acw-consent-button:focus-visible {
        outline: 2px solid var(--acw-primary-color);
        outline-offset: 2px;
      }
      .acw-consent-accept {
        background: var(--acw-primary-color);
        color: var(--acw-user-text-color);
      }
      .acw-consent-accept:hover {
        transform: translateY(-1px);
        box-shadow: 0 10px 24px rgba(37, 99, 235, 0.2);
      }
      .acw-consent-decline {
        background: transparent;
        color: var(--acw-primary-color);
        border-color: rgba(37, 99, 235, 0.4);
      }
      .acw-consent-decline:hover {
        background: rgba(37, 99, 235, 0.08);
      }
      @keyframes acw-typing-pulse {
        0%, 100% {
          transform: scale(0.6);
          opacity: 0.4;
        }
        50% {
          transform: scale(1);
          opacity: 1;
        }
      }
      @media (max-width: 768px) {
        .acw-container {
          inset: auto var(--acw-spacing-md) var(--acw-spacing-md) var(--acw-spacing-md);
          width: calc(100vw - var(--acw-spacing-md) * 2);
          align-items: stretch;
        }
        .acw-chat,
        .acw-launcher {
          width: 100%;
        }
        .acw-chat {
          border-radius: var(--acw-radius-md);
        }
      }
    `;
  }

  /**
   * Composes the chat window, including header, message list, input area, and footer links.
   */
  private createChatWindow(): HTMLDivElement {
    const chat = document.createElement("div");
    chat.className = "acw-chat";
    chat.setAttribute("role", "dialog");
    chat.setAttribute("aria-modal", "false");
    chat.setAttribute("aria-hidden", "true");
    chat.id = `acw-chat-${this.instanceId}`;

    const header = this.createHeader();
    chat.appendChild(header);

    const body = document.createElement("div");
    body.className = "acw-body";

    this.messageList = document.createElement("div");
    this.messageList.className = "acw-messages";
    this.messageList.setAttribute("role", "log");
    this.messageList.setAttribute("aria-live", "polite");
    this.messageList.setAttribute("aria-relevant", "additions");
    body.appendChild(this.messageList);

    const inputArea = this.createInputArea();
    this.inputArea = inputArea;
    body.appendChild(inputArea);

    chat.appendChild(body);

    this.footerLinksContainer = this.createFooterLinks();
    chat.appendChild(this.footerLinksContainer);

    return chat;
  }

  /**
   * Builds the chat header containing branding information and the close/reload controls.
   */
  private createHeader(): HTMLElement {
    const header = document.createElement("header");
    header.className = "acw-header";

    const details = document.createElement("div");
    details.className = "acw-header-details";

    const icon = this.createIconElement(this.options.icons.headerIcon, "acw-header-icon");
    details.appendChild(icon);

    const texts = document.createElement("div");
    texts.className = "acw-header-texts";

    const title = document.createElement("span");
    title.className = "acw-header-title";
    title.textContent = this.options.texts.headerTitle;
    texts.appendChild(title);

    const subtitle = document.createElement("span");
    subtitle.className = "acw-header-subtitle";
    subtitle.textContent = this.options.texts.headerSubtitle;
    texts.appendChild(subtitle);

    details.appendChild(texts);
    header.appendChild(details);

    const actions = document.createElement("div");
    actions.className = "acw-header-actions";

    this.reloadButton = document.createElement("button");
    this.reloadButton.type = "button";
    this.reloadButton.className = "acw-icon-button";
    this.reloadButton.setAttribute("aria-label", this.options.texts.reloadLabel);
    this.reloadButton.title = this.options.texts.reloadLabel;
    this.reloadButton.appendChild(
      this.createIconElement(this.options.icons.reloadIcon, "acw-icon-button-icon")
    );
    actions.appendChild(this.reloadButton);

    this.closeButton = document.createElement("button");
    this.closeButton.type = "button";
    this.closeButton.className = "acw-icon-button";
    this.closeButton.setAttribute("aria-label", this.options.texts.closeLabel);
    this.closeButton.title = this.options.texts.closeLabel;
    this.closeButton.appendChild(
      this.createIconElement(this.options.icons.closeIcon, "acw-icon-button-icon")
    );
    actions.appendChild(this.closeButton);

    header.appendChild(actions);

    return header;
  }

  /**
   * Constructs the chat input area including textarea, send button, and accessory controls.
   */
  private createInputArea(): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "acw-input-area";

    const row = document.createElement("div");
    row.className = "acw-input-row";

    this.inputField = document.createElement("textarea");
    this.inputField.className = "acw-textarea";
    this.inputField.rows = 1;
    this.inputField.setAttribute("maxlength", "1000");
    this.inputField.setAttribute("aria-label", this.options.texts.sendButtonLabel);

    row.appendChild(this.inputField);

    this.sendButton = document.createElement("button");
    this.sendButton.type = "button";
    this.sendButton.className = "acw-send-button";
    this.sendButton.setAttribute("aria-label", this.options.texts.sendButtonLabel);
    this.sendButton.title = this.options.texts.sendButtonLabel;
    this.sendButton.appendChild(
      this.createIconElement(this.options.icons.sendIcon, "acw-send-icon")
    );

    row.appendChild(this.sendButton);

    wrapper.appendChild(row);
    wrapper.style.display = "flex";

    return wrapper;
  }

  /**
   * Generates the optional footer links section shown below the chat window.
   */
  private createFooterLinks(): HTMLDivElement {
    const footer = document.createElement("div");
    footer.className = "acw-footer-links";

    if (!this.options.footerLinks.length) {
      footer.style.display = "none";
      return footer;
    }

    for (const linkConfig of this.options.footerLinks) {
      const link = document.createElement("a");
      link.className = "acw-footer-link";
      link.textContent = linkConfig.label;
      link.href = linkConfig.href;
      if (linkConfig.target) {
        link.target = linkConfig.target;
      }
      const rel = linkConfig.rel || (link.target === "_blank" ? "noopener noreferrer" : undefined);
      if (rel) {
        link.rel = rel;
      }
      footer.appendChild(link);
    }

    return footer;
  }

  /**
   * Builds the launcher button that toggles the chat window open and closed.
   */
  private createLauncherButton(): HTMLButtonElement {
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "acw-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", `acw-chat-${this.instanceId}`);
    launcher.setAttribute("aria-label", this.options.texts.launcherAriaLabel);

    const iconWrapper = this.createIconElement(
      this.options.icons.launcherIcon,
      "acw-launcher-icon"
    );
    launcher.appendChild(iconWrapper);

    const label = document.createElement("span");
    label.className = "acw-launcher-label";
    label.textContent = this.options.texts.launcherLabel;
    launcher.appendChild(label);

    return launcher;
  }

  /**
   * Creates the teaser bubble that can appear before the user opens the chat.
   */
  private createTeaserBubble(): HTMLButtonElement {
    const teaser = document.createElement("button");
    teaser.type = "button";
    teaser.className = "acw-teaser";
    teaser.setAttribute("aria-label", this.options.texts.teaserText);
    teaser.textContent = this.options.texts.teaserText;
    teaser.style.display = "none";
    return teaser;
  }

  /**
   * Registers global event listeners for resize, scrolling, and primary UI controls.
   */
  private registerEventListeners(): void {
    this.launcherButton.addEventListener("click", () => this.toggle());
    this.teaserBubble.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());
    this.reloadButton.addEventListener("click", () => this.resetConversation());
    this.sendButton.addEventListener("click", () => {
      void this.handleSend();
    });
    this.inputField.addEventListener("keydown", (event) => this.handleInputKeyDown(event));
    this.inputField.addEventListener("input", () => this.adjustTextareaHeight());
    this.messageList.addEventListener("scroll", this.handleMessagesScroll);

    window.addEventListener("resize", this.handleWindowResize);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(document.body);
    }
  }

  /**
   * Handles window resize events to keep the widget dimensions responsive.
   */
  private handleWindowResize = (): void => {
    this.updateDimensions();
  };

  /**
   * Updates the auto-scroll flag when the user manually scrolls within the message list.
   */
  private handleMessagesScroll = (): void => {
    if (!this.messageList) {
      return;
    }
    const distance =
      this.messageList.scrollHeight - this.messageList.scrollTop - this.messageList.clientHeight;
    this.shouldAutoScroll = distance < 36;
  };

  /**
   * Moves focus to the textarea so the user can start typing immediately.
   */
  private focusInput(): void {
    if (!this.inputField) {
      return;
    }
    if (this.inputField.disabled) {
      return;
    }
    window.setTimeout(() => {
      this.inputField.focus({ preventScroll: false });
      this.adjustTextareaHeight();
    }, 0);
  }

  /**
   * Autosizes the textarea based on content while enforcing minimum and maximum heights.
   */
  private adjustTextareaHeight(): void {
    if (!this.inputField) {
      return;
    }
    this.inputField.style.height = "auto";
    const computed = window.getComputedStyle(this.inputField);
    const padding =
      parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
    const border =
      parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
    const lineHeight = parseFloat(computed.lineHeight) || 20;
    const minHeightValue = parseFloat(computed.getPropertyValue("min-height"));
    const minHeight = Number.isNaN(minHeightValue) || minHeightValue <= 0
      ? lineHeight + padding + border
      : minHeightValue;
    const maxHeightValue = parseFloat(computed.getPropertyValue("max-height"));
    const maxHeight =
      Number.isNaN(maxHeightValue) || maxHeightValue <= 0 ? Infinity : maxHeightValue;

    const scrollHeight = this.inputField.scrollHeight + border;
    const clampedHeight = clamp(scrollHeight, minHeight, maxHeight);
    this.inputField.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";

    this.inputField.style.height = `${clampedHeight}px`;
    this.lastTextareaHeight = clampedHeight;
  }

  /**
   * Intercepts key presses to support submit-on-enter and shift+enter line breaks.
   */
  private handleInputKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      if (!this.canSendMessage()) {
        return;
      }
      event.preventDefault();
      void this.handleSend();
    }
  }

  /**
   * Validates and dispatches the current user input to the conversation stream.
   */
  private async handleSend(): Promise<void> {
    if (!this.canSendMessage()) {
      return;
    }
    const content = this.inputField.value.trim();
    if (!content) {
      return;
    }
    this.inputField.value = "";
    this.adjustTextareaHeight();
    this.shouldAutoScroll = true;
    this.enqueueUserMessage(content);
    if (this.serviceConfig) {
      await this.sendMessageToService(content);
    } else {
      this.simulateAgentReply();
    }
  }

  /**
   * Adds a pending user message locally so it appears instantly while awaiting backend confirmation.
   */
  private enqueueUserMessage(content: string): void {
    const message: ChatMessage = {
      role: "user",
      content: decodeHtmlEntities(content),
      timestamp: new Date(),
      status: "pending",
      localOnly: true,
    };
    this.addMessage(message, { forceScroll: true, smooth: true, autoScroll: true });
    this.ensureDisclaimer();
  }

  /**
   * Inserts a synthetic agent message, e.g. for local errors or welcome prompts.
   */
  private enqueueAgentMessage(
    content: string,
    isInitial = false,
    options: { localOnly?: boolean; status?: "pending" | "sent" | "failed" } = {}
  ): void {
    const normalizedContent = decodeHtmlEntities(content);
    const message: ChatMessage = {
      role: "agent",
      content: normalizedContent,
      timestamp: new Date(),
      status: options.status,
      localOnly: options.localOnly ?? false,
    };
    if (isInitial) {
      // Remove empty state if present for the welcome message.
      this.clearMessageList();
      this.shouldAutoScroll = true;
    }
    const forceScroll = isInitial || this.shouldAutoScroll;
    this.addMessage(message, { forceScroll, smooth: true, autoScroll: true });
  }
  
  /**
   * Transforms markdown content into HTML and wraps it with accessibility markup.
   */
  private renderMessageHtml(message: ChatMessage): string {
    if (message.role === "agent") {
      return renderMarkdown(message.content);
    }
    return renderPlainText(message.content);
  }

  /**
   * Creates the DOM scaffolding for a message bubble, including timestamp and metadata hooks.
   */
  private buildMessageElement(message: ChatMessage): {
    wrapper: HTMLDivElement;
    bubble: HTMLDivElement;
    timestamp: HTMLSpanElement;
  } {
    const wrapper = document.createElement("div");
    wrapper.className = `acw-message acw-message-${message.role}`;

    const bubble = document.createElement("div");
    bubble.className = "acw-bubble";
    bubble.innerHTML = this.renderMessageHtml(message);

    const metadata = document.createElement("span");
    metadata.className = "acw-timestamp";
    metadata.textContent = formatTime(message.timestamp, this.options.locale);

    wrapper.appendChild(bubble);
    wrapper.appendChild(metadata);

    return { wrapper, bubble, timestamp: metadata };
  }

  /**
   * Appends or reuses a message bubble in the DOM, respecting typing indicators and auto-scroll settings.
   */
  private appendMessageElement(
    message: ChatMessage,
    options: { autoScroll?: boolean; forceScroll?: boolean; smooth?: boolean } = {}
  ): { wrapper: HTMLDivElement; bubble: HTMLDivElement; timestamp: HTMLSpanElement } | null {
    const { autoScroll = true, forceScroll = false, smooth = true } = options;
    if (!this.messageList) {
      return null;
    }
    if (this.messageList.querySelector(".acw-empty-state")) {
      this.clearMessageList();
    }

    let elements:
      | { wrapper: HTMLDivElement; bubble: HTMLDivElement; timestamp: HTMLSpanElement }
      | null = null;
    let reusedTypingIndicator = false;

    if (
      message.role === "agent" &&
      this.typingIndicator &&
      this.typingIndicatorContent &&
      this.typingIndicatorCursor &&
      this.typingIndicatorTimestamp
    ) {
      const wrapper = this.typingIndicator;
      const bubble = this.typingIndicatorContent.parentElement as HTMLDivElement;
      const timestamp = this.typingIndicatorTimestamp;
      this.typingIndicatorIsStandalone = false;
      this.typingIndicator.classList.add("acw-typing");
      bubble.classList.add("acw-bubble-typing");
      const renderedHtml = this.renderMessageHtml(message);
      this.typingIndicatorContent.innerHTML = renderedHtml;
      if (this.typingIndicatorCursor && !this.typingIndicatorCursor.parentElement) {
        bubble.appendChild(this.typingIndicatorCursor);
      }
      if (this.typingIndicatorCursor) {
        this.attachTypingCursor(this.typingIndicatorContent, this.typingIndicatorCursor);
      }
      timestamp.textContent = formatTime(message.timestamp, this.options.locale);
      elements = { wrapper, bubble, timestamp };
      reusedTypingIndicator = true;
    } else {
      const built = this.buildMessageElement(message);
      const referenceNode =
        (this.typingIndicator && this.typingIndicator.parentElement === this.messageList
          ? this.typingIndicator
          : null) ??
        (this.disclaimerElement && this.disclaimerElement.parentElement === this.messageList
          ? this.disclaimerElement
          : null);

      if (referenceNode) {
        this.messageList.insertBefore(built.wrapper, referenceNode);
      } else {
        this.messageList.appendChild(built.wrapper);
      }
      elements = built;
    }

    if (!elements) {
      return null;
    }
    if (autoScroll) {
      this.scrollToBottom({ smooth, force: forceScroll });
    }
    if (reusedTypingIndicator) {
      // Keep the typing indicator references linked to the active message until it completes.
      this.typingIndicator = elements.wrapper;
      const contentEl = elements.bubble.querySelector<HTMLElement>(".acw-typing-content");
      if (contentEl) {
        this.typingIndicatorContent = contentEl;
      }
      const cursorEl = elements.bubble.querySelector<HTMLSpanElement>(".acw-typing-cursor");
      if (cursorEl) {
        this.typingIndicatorCursor = cursorEl;
      }
      this.typingIndicatorTimestamp = elements.timestamp;
    }
    return elements;
  }

  /**
   * Finds the next rendered message node after the given index to maintain chronological insertion order.
   */
  private findNextMessageNode(index: number): ChildNode | null {
    if (!this.messageList) {
      return null;
    }
    for (let candidate = index + 1; candidate < this.messageElements.length; candidate += 1) {
      const refs = this.messageElements[candidate];
      if (refs?.wrapper && refs.wrapper.parentElement === this.messageList) {
        return refs.wrapper;
      }
    }
    if (this.typingIndicator && this.typingIndicator.parentElement === this.messageList) {
      return this.typingIndicator;
    }
    if (this.toolActivityIndicator && this.toolActivityIndicator.parentElement === this.messageList) {
      return this.toolActivityIndicator;
    }
    if (this.disclaimerElement && this.disclaimerElement.parentElement === this.messageList) {
      return this.disclaimerElement;
    }
    return null;
  }

  /**
   * Lazily ensures a message at the given index has a rendered DOM representation.
   */
  private ensureMessageElement(index: number): MessageElementRefs | null {
    if (!this.messageList) {
      return null;
    }
    const message = this.messages[index];
    // Ignore placeholder messages: they intentionally have no rendered bubble yet.
    // Also ignore messages without text content.
    if (!message || message.isToolPlaceholder || message.content.trim().length === 0) {
      return null;
    }
    const existing = this.messageElements[index];
    if (existing?.wrapper && existing.wrapper.parentElement === this.messageList) {
      return existing;
    }

    // Build the DOM node on demand so chronological order stays intact even after lazy creation.
    const elements = this.buildMessageElement(message);
    const referenceNode = this.findNextMessageNode(index);
    if (referenceNode) {
      this.messageList.insertBefore(elements.wrapper, referenceNode);
    } else {
      this.messageList.appendChild(elements.wrapper);
    }
    this.messageElements[index] = elements;
    this.applyMessageStatus(elements.wrapper, message);
    this.ensureDisclaimer();
    return elements;
  }

  /**
   * Updates the HTML content and timestamp for a specific message bubble.
   */
  private updateMessageContentAt(index: number, content: string, timestamp?: Date): void {
    const message = this.messages[index];
    if (!message) {
      return;
    }
    message.content = content;
    if (timestamp) {
      message.timestamp = timestamp;
    }
    const refs = this.ensureMessageElement(index);
    if (refs) {
      const typingContent = refs.bubble.querySelector<HTMLElement>(".acw-typing-content");
      const typingCursor = refs.bubble.querySelector<HTMLSpanElement>(".acw-typing-cursor");
      if (typingContent && typingCursor) {
        typingContent.innerHTML = this.renderMessageHtml(message);
        this.attachTypingCursor(typingContent, typingCursor);
      } else {
        refs.bubble.innerHTML = this.renderMessageHtml(message);
      }
      if (timestamp) {
        refs.timestamp.textContent = formatTime(timestamp, this.options.locale);
      }
      this.applyMessageStatus(refs.wrapper, message);
    }
    this.ensureDisclaimer();
  }

  /**
   * Scrolls the message list to the bottom when auto-scroll is allowed or explicitly forced.
   */
  private scrollToBottom({
    smooth = false,
    force = false,
  }: {
    smooth?: boolean;
    force?: boolean;
  } = {}): void {
    if (!this.messageList) {
      return;
    }
    if (!force && !this.shouldAutoScroll) {
      return;
    }
    if (force) {
      this.shouldAutoScroll = true;
    }
    const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
    const performScroll = (): void => {
      if (!this.messageList) {
        return;
      }
      if (typeof this.messageList.scrollTo === "function") {
        this.messageList.scrollTo({ top: this.messageList.scrollHeight, behavior });
      } else {
        this.messageList.scrollTop = this.messageList.scrollHeight;
      }
    };

    performScroll();

    if (smooth) {
      window.requestAnimationFrame(performScroll);
    }
  }

  /**
   * Clears all references related to the typing indicator so it can be recreated safely.
   */
  private resetTypingIndicatorState(): void {
    this.typingIndicator = undefined;
    this.typingIndicatorContent = undefined;
    this.typingIndicatorCursor = undefined;
    this.typingIndicatorTimestamp = undefined;
    this.typingIndicatorIsStandalone = false;
  }

  /**
   * Finds the last meaningful descendant node inside a bubble to position the typing cursor.
   */
  private findLastContentNode(root: Node | null): Node | null {
    if (!root) {
      return null;
    }
    if (root.nodeType === Node.TEXT_NODE) {
      const text = root.textContent ?? "";
      return text.trim().length > 0 ? root : null;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }
    for (let index = root.childNodes.length - 1; index >= 0; index -= 1) {
      const child = root.childNodes[index];
      const candidate = this.findLastContentNode(child);
      if (candidate) {
        return candidate;
      }
    }
    const element = root as HTMLElement;
    if (element.tagName === "BR") {
      return element;
    }
    if (!element.childNodes.length) {
      return element;
    }
    return null;
  }

  /**
   * Moves the animated typing cursor element to the end of the latest rendered text node.
   */
  private attachTypingCursor(container: HTMLElement, cursor: HTMLSpanElement): void {
    if (!container || !cursor) {
      return;
    }
    if (cursor.parentElement) {
      cursor.parentElement.removeChild(cursor);
    }
    const target = this.findLastContentNode(container);
    if (!target) {
      container.appendChild(cursor);
      return;
    }
    if (target.nodeType === Node.TEXT_NODE) {
      const textNode = target as Text;
      const parent = textNode.parentNode ?? container;
      const current = textNode.textContent ?? "";
      const parentElement = parent instanceof HTMLElement ? parent : null;
      const preserveWhitespace =
        parentElement && (parentElement.tagName === "PRE" || parentElement.tagName === "CODE");
      const trimmed = preserveWhitespace ? current : current.replace(/\s+$/u, "");
      if (!preserveWhitespace && trimmed !== current) {
        textNode.textContent = trimmed;
      }
      parent.insertBefore(cursor, textNode.nextSibling);
      return;
    }
    const element = target as HTMLElement;
    const parent = element.parentNode ?? container;
    if (element.tagName === "BR") {
      parent.insertBefore(cursor, element.nextSibling);
      return;
    }
    if (!element.childNodes.length) {
      parent.insertBefore(cursor, element.nextSibling);
      return;
    }
    element.appendChild(cursor);
  }

  /**
   * Creates the "tool in progress" bubble that mirrors the backend tool invocation state.
   */
  private createToolActivityIndicator(): HTMLDivElement {
    const wrapper = document.createElement("div");
    wrapper.className = "acw-message acw-message-agent acw-tool-indicator";
    wrapper.setAttribute("aria-live", "polite");
    const bubble = document.createElement("div");
    bubble.className = "acw-bubble";
    bubble.textContent = this.options.texts.toolCallPlaceholder;
    wrapper.appendChild(bubble);
    return wrapper;
  }

  /**
   * Inserts the tool activity indicator near the tracked placeholder message.
   */
  private showToolActivityIndicator(anchorIndex: number | null): void {
    if (!this.messageList) {
      return;
    }
    if (!this.toolActivityIndicator) {
      this.toolActivityIndicator = this.createToolActivityIndicator();
    }
    const bubble = this.toolActivityIndicator.querySelector<HTMLDivElement>(".acw-bubble");
    if (bubble) {
      bubble.textContent = this.options.texts.toolCallPlaceholder;
    }
    const indicator = this.toolActivityIndicator;
    if (indicator.parentElement && indicator.parentElement !== this.messageList) {
      indicator.parentElement.removeChild(indicator);
    }

    let referenceNode: Node | null = null;
    if (typeof anchorIndex === "number" && anchorIndex >= 0) {
      const anchorRefs = this.messageElements[anchorIndex];
      if (anchorRefs?.wrapper?.parentElement === this.messageList) {
        referenceNode = anchorRefs.wrapper.nextSibling;
      }
    }
    if (!referenceNode && this.typingIndicator && this.typingIndicator.parentElement === this.messageList) {
      referenceNode = this.typingIndicator;
    }
    if (!referenceNode && this.disclaimerElement && this.disclaimerElement.parentElement === this.messageList) {
      referenceNode = this.disclaimerElement;
    }
    if (referenceNode) {
      this.messageList.insertBefore(indicator, referenceNode);
    } else if (indicator.parentElement !== this.messageList) {
      this.messageList.appendChild(indicator);
    }
  }

  /**
   * Removes the tool activity indicator from the DOM if present.
   */
  private hideToolActivityIndicator(): void {
    if (this.toolActivityIndicator?.parentElement) {
      this.toolActivityIndicator.parentElement.removeChild(this.toolActivityIndicator);
    }
  }

  /**
   * Synchronizes the tool activity indicator visibility with the current placeholder state.
   */
  private updateToolActivityIndicator(): void {
    if (!this.messageList) {
      this.hideToolActivityIndicator();
      return;
    }
    
    const shouldShowToolIndicator = this.isAwaitingAgent && !!this.pendingToolCall;
    
    if (!shouldShowToolIndicator) {
      const wasShowingToolIndicator = this.toolActivityIndicator?.parentElement === this.messageList;
      this.hideToolActivityIndicator();
      
      // If tool indicator was hidden and we're still awaiting agent, show typing indicator instead
      if (wasShowingToolIndicator && this.isAwaitingAgent && !this.typingIndicator) {
        this.showTypingIndicator();
      }
      return;
    }
    
    if (this.pendingToolCall) {
      this.showToolActivityIndicator(this.pendingToolCall.anchorIndex);
    }
  }

  /**
   * Determines whether a tool call placeholder should be shown.
   * Placeholder is only shown if:
   * - It's a tool call without text
   * - AND there is no following message, OR the following message has no text yet
   */
  private shouldShowToolCallPlaceholder(index: number, isToolCall: boolean, hasText: boolean): boolean {
    if (!isToolCall || hasText) {
      return false;
    }
    
    // Check if there is a following message
    const nextMessage = this.messages[index + 1];
    if (!nextMessage) {
      // No following message → show placeholder
      return true;
    }
    
    // Check if following message has text
    const nextContent = (this.historyContents[index + 1] || nextMessage.content || '').trim();
    // Only show placeholder if following message has no text
    return nextContent.length === 0;
  }

  /**
   * Displays the animated typing indicator message bubble while streaming agent content.
   */
  private showTypingIndicator(): void {
    if (!this.messageList || this.typingIndicator) {
      return;
    }
    
    // Don't show typing indicator if tool activity indicator is already visible
    if (this.pendingToolCall && this.toolActivityIndicator?.parentElement) {
      return;
    }
    
    const indicator = document.createElement("div");
    indicator.className = "acw-message acw-message-agent acw-typing";
    indicator.setAttribute("aria-live", "polite");

    const bubble = document.createElement("div");
    bubble.className = "acw-bubble acw-bubble-typing";

    const content = document.createElement("div");
    content.className = "acw-typing-content";
    bubble.appendChild(content);

    const cursor = document.createElement("span");
    cursor.className = "acw-typing-cursor";
    bubble.appendChild(cursor);
    this.attachTypingCursor(content, cursor);

    const metadata = document.createElement("span");
    metadata.className = "acw-timestamp";
    metadata.textContent = "";

    indicator.appendChild(bubble);
    indicator.appendChild(metadata);

    if (this.disclaimerElement && this.disclaimerElement.parentElement === this.messageList) {
      this.messageList.insertBefore(indicator, this.disclaimerElement);
    } else {
      this.messageList.appendChild(indicator);
    }

    this.typingIndicator = indicator;
    this.typingIndicatorContent = content;
    this.typingIndicatorCursor = cursor;
    this.typingIndicatorTimestamp = metadata;
    this.typingIndicatorIsStandalone = true;
    this.scrollToBottom({ smooth: true });
  }

  /**
   * Removes the typing indicator bubble and resets its state trackers.
   */
  private hideTypingIndicator(): void {
    if (!this.typingIndicator) {
      return;
    }
    const wrapper = this.typingIndicator;
    const bubble = this.typingIndicatorContent
      ? (this.typingIndicatorContent.parentElement as HTMLDivElement | null)
      : wrapper.querySelector<HTMLDivElement>(".acw-bubble");

    if (this.typingIndicatorCursor?.parentElement) {
      this.typingIndicatorCursor.parentElement.removeChild(this.typingIndicatorCursor);
    }

    if (!this.typingIndicatorIsStandalone && bubble && this.typingIndicatorContent) {
      bubble.innerHTML = this.typingIndicatorContent.innerHTML;
    }

    if (this.typingIndicatorIsStandalone) {
      wrapper.remove();
    } else {
      wrapper.classList.remove("acw-typing");
      bubble?.classList.remove("acw-bubble-typing");
      wrapper.removeAttribute("aria-live");
    }

    this.resetTypingIndicatorState();
  }

  /**
   * Clears active streaming timeouts/intervals and optionally finalizes the partial message.
   */
  private clearStreamingTimers({ finalize = false }: { finalize?: boolean } = {}): void {
    if (this.activeStreamTimeout !== null) {
      window.clearTimeout(this.activeStreamTimeout);
      this.activeStreamTimeout = null;
    }
    if (this.activeStreamInterval !== null) {
      window.clearInterval(this.activeStreamInterval);
      this.activeStreamInterval = null;
    }
    const finalizedMessage =
      finalize &&
      this.currentStreamingMessage &&
      this.streamingMessageBubble &&
      this.streamingMessageTimestamp;
    if (finalizedMessage) {
      const bubble = this.streamingMessageBubble!;
      const contentHtml = this.renderMessageHtml(this.currentStreamingMessage!);
      const typingContent = bubble.querySelector<HTMLElement>(".acw-typing-content");
      if (typingContent) {
        typingContent.innerHTML = contentHtml;
      } else {
        bubble.innerHTML = contentHtml;
      }
      this.streamingMessageTimestamp!.textContent = formatTime(
        this.currentStreamingMessage!.timestamp,
        this.options.locale
      );
      if (this.streamingMessageWrapper) {
        this.streamingMessageWrapper.classList.remove("acw-message-streaming");
      }
      this.hideTypingIndicator();
      this.scrollToBottom({ smooth: true });
    } else if (this.streamingMessageWrapper) {
      this.streamingMessageWrapper.classList.remove("acw-message-streaming");
    }
    this.currentStreamingMessage = undefined;
    this.streamingMessageBubble = undefined;
    this.streamingMessageTimestamp = undefined;
    this.streamingMessageWrapper = undefined;
    if (this.isAwaitingAgent) {
      this.isAwaitingAgent = false;
      this.updateSendAvailability();
    }
    this.ensureDisclaimer();
  }

  /**
   * Ensures a backend chat session exists and initial history is loaded before continuing.
   */
  private async ensureChatSessionInitialized(forceReinit = false): Promise<void> {
    if (!this.serviceConfig) {
      return;
    }
    if (this.isTerminated) {
      return;
    }
    if (this.options.requirePrivacyConsent && !this.isConsentGranted) {
      return;
    }
    if (forceReinit) {
      this.clearChatSession();
    }
    if (!this.chatId) {
      const initialized = await this.initChatSession();
      if (!initialized) {
        throw new Error("Chat initialisation failed");
      }
    }
    if (!this.hasLoadedInitialHistory) {
      const loaded = await this.fetchInfo({ fullRefresh: true, immediate: true });
      if (!loaded) {
        throw new Error("Failed to load chat history");
      }
    }
  }

  /**
   * Creates or reuses a chat session by calling the service initialization endpoint.
   */
  private async initChatSession(): Promise<boolean> {
    const config = this.serviceConfig;
    if (!config) {
      return false;
    }
    if (this.initializingPromise) {
      return this.initializingPromise;
    }

    const promise = (async (): Promise<boolean> => {
      this.isInitializingSession = true;
      try {
        const body: Record<string, unknown> = {};
        if (config.preset) {
          body.preset = config.preset;
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
        this.hasLoadedInitialHistory = false;
        this.historyContents = [];
        return true;
      } catch (error) {
        console.error("AlbertChat: Initialisierung des Chats fehlgeschlagen.", error);
        this.showServiceError(
          "Der Chat konnte nicht gestartet werden. Bitte versuchen Sie es erneut."
        );
        this.clearChatSession();
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
   * Sends a user message to the backend chat service and manages optimistic UI updates.
   */
  private async sendMessageToService(content: string): Promise<void> {
    if (!this.serviceConfig) {
      return;
    }
    try {
      await this.ensureChatSessionInitialized();
    } catch (error) {
      console.error("AlbertChat: Chat konnte nicht vorbereitet werden.", error);
      this.markLastUserMessageStatus("failed");
      this.showServiceError(
        "Der Chat konnte nicht vorbereitet werden. Bitte versuchen Sie es erneut."
      );
      return;
    }
    if (!this.chatId) {
      this.markLastUserMessageStatus("failed");
      this.showServiceError("Keine gültige Chat-ID verfügbar. Bitte starten Sie den Chat neu.");
      return;
    }

    this.hideTypingIndicator();
    this.clearStreamingTimers({ finalize: true });

    this.isAwaitingAgent = true;
    this.updateSendAvailability();

    const body: Record<string, unknown> = {
      id: this.chatId,
      input: {
        text: content,
      },
      stream: true,
    };
    if (this.serviceConfig.preset) {
      body.preset = this.serviceConfig.preset;
    }

    try {
      await this.requestJson<unknown>("/chat", {
        method: "POST",
        body: JSON.stringify(body),
      });
      this.markLastUserMessageStatus("sent");
      this.removeFailedUserMessages();
      this.removeLocalAgentMessages();
    } catch (error) {
      console.error("AlbertChat: Nachricht konnte nicht gesendet werden.", error);
      this.isAwaitingAgent = false;
      this.updateSendAvailability();
      this.markLastUserMessageStatus("failed");
      this.showServiceError(
        "Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut."
      );
      const status = (error as { status?: number }).status;
      if (status === 404) {
        await this.handleSessionExpired(true);
      }
      return;
    }

    this.showTypingIndicator();
    await this.fetchInfo({ immediate: true });
  }

  /**
   * Polls the backend for incremental updates and handles retry logic on failure.
   */
  private async fetchInfo(
    options: { fullRefresh?: boolean; immediate?: boolean } = {}
  ): Promise<boolean> {
    if (!this.serviceConfig || !this.chatId) {
      return false;
    }
    if (this.infoFetchPromise) {
      return this.infoFetchPromise;
    }

    const { fullRefresh = false } = options;
    const forceFullRefresh = fullRefresh || this.hasLocalOnlyMessages();
    const promise = (async (): Promise<boolean> => {
      try {
        const path = this.buildInfoPath(forceFullRefresh);
        const response = await this.requestJson<ChatServiceInfoResponse>(path, { method: "GET" });
        this.pollFailureCount = 0;
        this.processInfoResponse(response, { fullRefresh: forceFullRefresh });
        return true;
      } catch (error) {
        console.error("AlbertChat: Abrufen der Chat-Informationen fehlgeschlagen.", error);
        const status = (error as { status?: number }).status;
        if (status === 404) {
          await this.handleSessionExpired(true);
          return false;
        }
        this.pollFailureCount += 1;
        if (this.pollFailureCount >= MAX_POLL_FAILURES_BEFORE_RESET) {
          this.stopPolling();
          this.isAwaitingAgent = false;
          this.updateSendAvailability();
          this.showServiceError(
            "Die Verbindung zum Chat konnte nicht wiederhergestellt werden. Bitte starten Sie neu."
          );
        } else {
          this.scheduleNextPoll();
        }
        return false;
      }
    })();

    this.infoFetchPromise = promise;
    const result = await promise;
    this.infoFetchPromise = null;
    return result;
  }

  /**
   * Processes a service response by updating local history arrays and UI state.
   */
  private processInfoResponse(
    response: ChatServiceInfoResponse,
    options: { fullRefresh?: boolean } = {}
  ): void {
    if (!response) {
      return;
    }
    if (this.isWelcomeTyping) {
      const queuedOptions = { ...options };
      this.runAfterWelcomeAnimation(() => this.processInfoResponse(response, queuedOptions));
      return;
    }

    const { fullRefresh = false } = options;
    const history = response.history ?? [];
    const shouldRebuild = fullRefresh || this.hasLocalOnlyMessages();

    if (shouldRebuild) {
      this.hydrateMessagesFromHistory(history);
      this.removeLocalAgentMessages();
    } else if (history.length) {
      const baseIndex = this.chatOffsets ? this.chatOffsets.history : 0;
      const continuingSameEntry = !!this.chatOffsets && this.chatOffsets.text > 0;

      history.forEach((entry, index) => {
        const targetIndex = baseIndex + index;
        const appendExisting = continuingSameEntry && index === 0;
        this.applyHistoryEntry(targetIndex, entry, { append: appendExisting });
      });
    }

    if (response.offsets) {
      this.chatOffsets = response.offsets;
    } else if (shouldRebuild) {
      this.chatOffsets = {
        history: history.length,
        text: 0,
      };
    } else if (!this.chatOffsets) {
      this.chatOffsets = {
        history: this.historyContents.length,
        text: 0,
      };
    }

    this.hasLoadedInitialHistory ||= shouldRebuild || Boolean(history.length);

    if (!shouldRebuild && !this.messages.length && this.messageList && !this.typingIndicator) {
      this.renderEmptyState();
    }

    const running = Boolean(response.running);
    this.isAwaitingAgent = running;
    if (!running) {
      this.pendingToolCall = null;
    }

    if (running) {
      this.scheduleNextPoll();
    } else {
      this.hideTypingIndicator();
      this.stopPolling();
    }

    if (shouldRebuild) {
      this.removeFailedUserMessages();
    }
    this.ensureWelcomeMessage();
    this.ensureDisclaimer();
    this.updateSendAvailability();
    this.updateToolActivityIndicator();
  }

  /**
   * Applies a single history entry, optionally appending streaming chunks to existing bubbles.
   */
  private applyHistoryEntry(
    index: number,
    entry: ChatServiceHistoryEntry,
    options: { append?: boolean } = {}
  ): void {
    const { append = false } = options;
    const rawText = entry.text ?? "";
    const decodedText = decodeHtmlEntities(rawText);
    const timestamp = this.parseTimestamp(entry.dateTime);
    const role = this.mapServiceRole(entry.role);
    const isToolCall = Boolean(entry.isToolCall);
    const existingContent = this.historyContents[index] ?? "";
    const baseContent = decodedText || existingContent;
    const hasRenderableText = baseContent.trim().length > 0;

    if (append && this.historyContents[index] !== undefined) {
      if (!decodedText) {
        return;
      }
      // Streaming chunk: extend the existing text buffer and update the rendered message.
      const updatedContent = (this.historyContents[index] ?? "") + decodedText;
      const trimmedUpdatedContent = updatedContent.trim();
      this.historyContents[index] = updatedContent;
      
      // Check if this message now has text when it previously didn't
      const previouslyHadText = (existingContent || "").trim().length > 0;
      const nowHasText = trimmedUpdatedContent.length > 0;
      
      if (this.messages[index]) {
        const existing = this.messages[index];
        const wasPlaceholder = existing.isToolPlaceholder;
        const updatedMessage: ChatMessage = {
          ...existing,
          role,
          content: updatedContent,
          timestamp,
          status: role === "user" ? "sent" : existing?.status,
          localOnly: false,
          isToolPlaceholder: false,
        };
        this.messages[index] = updatedMessage;
        
        // Only update if there's actual text to show
        if (nowHasText) {
          this.updateMessageContentAt(index, updatedContent, timestamp);
        }
      } else {
        const message: ChatMessage = {
          role,
          content: updatedContent,
          timestamp,
          status: role === "user" ? "sent" : undefined,
          localOnly: false,
          isToolPlaceholder: false,
        };
        this.addMessage(message, { forceScroll: true, smooth: true, autoScroll: true });
      }
      
      // Update placeholder logic: use the helper method
      if (this.shouldShowToolCallPlaceholder(index, isToolCall, nowHasText)) {
        this.pendingToolCall = { anchorIndex: index };
      } else if (nowHasText) {
        // Text arrived → check if this is a follow-up to a previous tool call placeholder
        if (index > 0) {
          const prevMessage = this.messages[index - 1];
          if (prevMessage?.isToolPlaceholder) {
            // Previous message was a tool call placeholder → hide it now
            this.pendingToolCall = null;
          }
        } else {
          this.pendingToolCall = null;
        }
      }
      
      this.scrollToBottom({ smooth: true });
      this.ensureWelcomeMessage();
      this.ensureDisclaimer();
      this.updateToolActivityIndicator();
      return;
    }

    // Fresh or replaced entry: store the full text snapshot before deciding on placeholder handling.
    this.historyContents[index] = baseContent;
    const shouldShowPlaceholder = this.shouldShowToolCallPlaceholder(index, isToolCall, hasRenderableText);
    let targetIndex = index;
    
    if (this.messages[index]) {
      const updatedMessage: ChatMessage = {
        ...this.messages[index],
        role,
        content: hasRenderableText ? baseContent : "",
        timestamp,
        status: role === "user" ? "sent" : this.messages[index]?.status,
        localOnly: false,
        isToolPlaceholder: shouldShowPlaceholder,
      };
      this.messages[index] = updatedMessage;
      
      // Only update the DOM if there's text to display
      if (hasRenderableText) {
        this.updateMessageContentAt(index, updatedMessage.content, timestamp);
      } else if (!shouldShowPlaceholder) {
        // No text and no placeholder → remove any existing element
        const existingRefs = this.messageElements[index];
        if (existingRefs?.wrapper && existingRefs.wrapper.parentElement) {
          existingRefs.wrapper.parentElement.removeChild(existingRefs.wrapper);
        }
        this.messageElements[index] = null;
      }
    } else {
      const message: ChatMessage = {
        role,
        content: hasRenderableText ? baseContent : "",
        timestamp,
        status: role === "user" ? "sent" : undefined,
        localOnly: false,
        isToolPlaceholder: shouldShowPlaceholder,
      };
      this.addMessage(message, { forceScroll: true, smooth: true, autoScroll: true });
      targetIndex = this.messages.length - 1;
    }

    // Remove any stale bubble so the placeholder state is represented only by the tracker.
    if (shouldShowPlaceholder) {
      const existingRefs = this.messageElements[targetIndex];
      if (existingRefs?.wrapper && existingRefs.wrapper.parentElement) {
        existingRefs.wrapper.parentElement.removeChild(existingRefs.wrapper);
      }
      this.messageElements[targetIndex] = null;
    }

    // Update pending tool call state
    if (shouldShowPlaceholder) {
      this.pendingToolCall = { anchorIndex: targetIndex };
    } else if (hasRenderableText && index > 0) {
      // Check if previous message was a tool call placeholder
      const prevMessage = this.messages[index - 1];
      if (prevMessage?.isToolPlaceholder) {
        // This message has text and follows a placeholder → hide the placeholder
        this.pendingToolCall = null;
      }
    }

    this.scrollToBottom({ smooth: true });
    this.ensureWelcomeMessage();
    this.ensureDisclaimer();
    this.updateToolActivityIndicator();
  }

  /**
   * Schedules the next poll request based on the configured interval or an override delay.
   */
  /**
   * Schedules the next polling request to keep the conversation in sync.
   */
  private scheduleNextPoll(delay?: number): void {
    if (!this.serviceConfig || this.isTerminated) {
      return;
    }
    if (this.pollTimerId !== null) {
      window.clearTimeout(this.pollTimerId);
      this.pollTimerId = null;
    }
    const interval = delay ?? this.serviceConfig.pollIntervalMs;
    this.pollTimerId = window.setTimeout(() => {
      this.pollTimerId = null;
      void this.fetchInfo();
    }, Math.max(0, interval));
  }

  /**
   * Cancels any scheduled polling timer.
   */
  private stopPolling(): void {
    if (this.pollTimerId !== null) {
      window.clearTimeout(this.pollTimerId);
      this.pollTimerId = null;
    }
  }

  /**
   * Constructs the info endpoint path, adding offsets when incremental polling is possible.
   */
  private buildInfoPath(fullRefresh: boolean): string {
    if (!this.chatId) {
      throw new Error("Chat-ID fehlt");
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
   * Builds an absolute URL for the chat service based on the configured endpoint.
   */
  private buildServiceUrl(path: string): string {
    if (!this.serviceConfig) {
      throw new Error("Servicekonfiguration fehlt");
    }
    const suffix = path.startsWith("/") ? path : `/${path}`;
    return `${this.serviceConfig.endpoint}${suffix}`;
  }

  /**
   * Performs a JSON fetch against the chat service endpoint with sensible defaults.
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
   * Parses a timestamp string and falls back to the current time on invalid values.
   */
  private parseTimestamp(value?: string): Date {
    if (!value) {
      return new Date();
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return new Date();
    }
    return date;
  }

  /**
   * Normalizes service role strings into internal role identifiers.
   */
  private mapServiceRole(role: string): ChatRole {
    const normalized = role ? role.toLowerCase() : "";
    if (normalized === "user" || normalized === "human") {
      return "user";
    }
    return "agent";
  }

  /**
   * Enqueues an agent error message, avoiding duplicates, to inform the user.
   */
  private showServiceError(message: string): void {
    if (this.isTerminated) {
      return;
    }
    const lastMessage = this.messages[this.messages.length - 1];
    if (lastMessage && lastMessage.role === "agent" && lastMessage.content === message) {
      return;
    }
    this.enqueueAgentMessage(message, false, { localOnly: true });
    this.ensureDisclaimer();
  }

  /**
   * Handles expired sessions by clearing state and optionally showing a user-facing message.
   */
  private async handleSessionExpired(showMessage = false): Promise<void> {
    this.stopPolling();
    this.clearChatSession();
    if (this.options.requirePrivacyConsent) {
      this.isConsentGranted = true;
    }
    if (showMessage) {
      this.showServiceError(
        "Die Unterhaltung ist nicht mehr verfügbar. Ein neuer Chat wird gestartet."
      );
    } else {
      this.messages = [];
      this.messageElements = [];
      this.historyContents = [];
      this.clearMessageList();
      this.renderEmptyState();
    }
    this.ensureDisclaimer();
    if (!this.isTerminated) {
      await this.ensureChatSessionInitialized();
    }
  }

  /**
   * Simulates streaming agent output character by character for local/demo scenarios.
   */
  private streamAgentMessage(content: string): void {
    if (!this.messageList) {
      return;
    }

    const timestamp = new Date();
    const normalizedContent = decodeHtmlEntities(content);
    const message: ChatMessage = {
      role: "agent",
      content: normalizedContent,
      timestamp,
    };
    this.messages.push(message);

    const elements = this.appendMessageElement({ ...message, content: "" }, { autoScroll: false });
    if (!elements) {
      return;
    }
    this.messageElements.push(elements);
    this.ensureDisclaimer();

    const { bubble, timestamp: metadata, wrapper } = elements;
    wrapper.classList.add("acw-message-streaming");
    this.streamingMessageBubble = bubble;
    this.streamingMessageTimestamp = metadata;
    this.streamingMessageWrapper = wrapper;
    this.currentStreamingMessage = message;
    const contentContainer = bubble.querySelector<HTMLElement>(".acw-typing-content");
    const cursor = bubble.querySelector<HTMLSpanElement>(".acw-typing-cursor");
    metadata.textContent = "";
    this.scrollToBottom({ smooth: true });

    const characters = Array.from(normalizedContent);
    let index = 0;
    const chunkSize = characters.length > 120 ? 3 : characters.length > 60 ? 2 : 1;
    const intervalMs = characters.length > 80 ? 20 : 35;

    const flush = (): void => {
      if (!this.streamingMessageBubble) {
        return;
      }
      index = Math.min(characters.length, index + chunkSize);
      const nextContent = characters.slice(0, index).join("");
      if (contentContainer && cursor) {
        contentContainer.textContent = nextContent;
        this.attachTypingCursor(contentContainer, cursor);
      } else {
        this.streamingMessageBubble.textContent = nextContent;
      }
      this.scrollToBottom({ smooth: true });
      if (index >= characters.length) {
        this.clearStreamingTimers({ finalize: true });
      }
    };

    this.activeStreamInterval = window.setInterval(flush, intervalMs);
    flush();
  }

  /**
   * Provides mock agent responses when no backend service is configured.
   */
  private simulateAgentReply(): void {
    if (this.serviceConfig) {
      return;
    }
    this.markLastUserMessageStatus("sent");
    this.removeFailedUserMessages();
    this.removeLocalAgentMessages();
    if (!this.options.mockResponses.length) {
      this.isAwaitingAgent = false;
      this.updateSendAvailability();
      return;
    }
    this.hideTypingIndicator();
    this.clearStreamingTimers({ finalize: true });
    this.isAwaitingAgent = true;
    this.updateSendAvailability();

    this.showTypingIndicator();
    const [minDelay, maxDelay] = this.options.mockResponseDelayMs;
    const delay = clamp(
      minDelay + Math.random() * (maxDelay - minDelay),
      minDelay,
      maxDelay
    );
    this.activeStreamTimeout = window.setTimeout(() => {
      this.activeStreamTimeout = null;
      const response = this.options.mockResponses[this.mockResponseIndex];
      this.mockResponseIndex = (this.mockResponseIndex + 1) % this.options.mockResponses.length;
      this.streamAgentMessage(response);
    }, delay);
  }

  /**
   * Writes the configured theme values into CSS custom properties on the host element.
   */
  private applyThemeVariables(): void {
    const root = this.host;
    const theme = this.options.theme;
    const vars: Record<string, string | number> = {
      "--acw-font-family": theme.fontFamily,
      "--acw-primary-color": theme.primaryColor,
      "--acw-secondary-color": theme.secondaryColor,
      "--acw-surface-color": theme.surfaceColor,
      "--acw-surface-accent": theme.surfaceAccentColor,
      "--acw-text-color": theme.textColor,
      "--acw-user-message-color": theme.userMessageColor,
      "--acw-user-text-color": theme.userTextColor,
      "--acw-agent-message-color": theme.agentMessageColor,
      "--acw-agent-text-color": theme.agentTextColor,
      "--acw-launcher-background": theme.launcherBackground,
      "--acw-launcher-text-color": theme.launcherTextColor,
      "--acw-send-button-background": theme.sendButtonBackground,
      "--acw-send-button-text-color": theme.sendButtonTextColor,
      "--acw-border-color": theme.borderColor,
      "--acw-shadow-color": theme.shadowColor,
      "--acw-spacing-xs": "6px",
      "--acw-spacing-sm": "10px",
      "--acw-spacing-md": "16px",
      "--acw-spacing-lg": "24px",
      "--acw-radius-sm": "6px",
      "--acw-radius-md": "14px",
      "--acw-radius-lg": "20px",
      "--acw-radius-pill": "999px",
      "--acw-z-index": String(this.options.zIndex),
      "--acw-chat-width": "360px",
      "--acw-chat-height": "520px",
    };

    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, String(value));
    }
  }

  /**
   * Recalculates chat window dimensions based on viewport size and configuration.
   */
  private updateDimensions(): void {
    if (!this.chatWindow) {
      return;
    }
    const { widthPercent, minWidthPx, heightPercent, minHeightPx } = this.options.dimensions;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const horizontalPadding = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const desiredWidth = Math.max((viewportWidth * widthPercent) / 100, minWidthPx);
    const maxWidth = viewportWidth - horizontalPadding * 2;
    const width = clamp(desiredWidth, minWidthPx, maxWidth);
    const buttonHeight = this.launcherButton ? this.launcherButton.offsetHeight : 56;
    const spacing = 24 + 12; // bottom spacing + gap to chat window
    const availableHeight = viewportHeight - (buttonHeight + spacing);
    const desiredHeight = Math.max((viewportHeight * heightPercent) / 100, minHeightPx);
    const height = clamp(desiredHeight, minHeightPx, Math.max(minHeightPx, availableHeight));

    this.host.style.setProperty("--acw-chat-width", `${Math.round(width)}px`);
    this.host.style.setProperty("--acw-chat-height", `${Math.round(height)}px`);
  }

  /**
   * Starts the delayed timer that shows the teaser bubble to draw attention.
   */
  private startTeaserCountdown(): void {
    if (this.teaserTimerId !== null || this.hasEverOpened) {
      return;
    }
    this.teaserTimerId = window.setTimeout(() => {
      if (!this.isOpen && !this.hasEverOpened) {
        this.showTeaser();
      }
    }, this.options.teaserDelayMs);
  }

  /**
   * Cancels any pending teaser timer.
   */
  private stopTeaserCountdown(): void {
    if (this.teaserTimerId !== null) {
      window.clearTimeout(this.teaserTimerId);
      this.teaserTimerId = null;
    }
  }

  /**
   * Makes the teaser bubble visible with transition styles.
   */
  private showTeaser(): void {
    if (!this.teaserBubble) {
      return;
    }
    this.teaserBubble.style.display = "inline-flex";
    this.teaserBubble.classList.add("acw-visible");
  }

  /**
   * Hides the teaser bubble and resets its animation state.
   */
  private hideTeaser(): void {
    this.stopTeaserCountdown();
    if (!this.teaserBubble) {
      return;
    }
    this.teaserBubble.classList.remove("acw-visible");
    this.teaserBubble.style.display = "none";
  }
}

/**
 * Convenience initializer that constructs and mounts a widget in a single call.
 */
export function init(options: DeepPartial<ChatWidgetOptions> = {}): ChatWidget {
  const widget = new ChatWidget(options);
  widget.mount();
  return widget;
}

export default {
  ChatWidget,
  init,
};
