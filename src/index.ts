/**
 * Albert AI Chat Widget - Main Entry Point
 * 
 * A modern, customizable chat widget for web applications.
 * This widget can be embedded on arbitrary web pages by loading the bundled script
 * and calling `AlbertChat.init({...})`. Styling and text content are fully configurable.
 * 
 * @module albert-ai-website-chat
 * @version 2.0.0
 * 
 * @example
 * ```typescript
 * import { init } from 'albert-ai-website-chat';
 * 
 * const widget = init({
 *   theme: { primaryColor: '#2563eb' },
 *   texts: { headerTitle: 'Customer Support' },
 *   serviceConfig: {
 *     endpoint: 'https://api.example.com/chat'
 *   }
 * });
 * ```
 */

// Export all types for external usage
export * from './types';

// Import required modules
import {
  ChatWidgetOptions,
  ChatMessage,
  DeepPartial,
  MessageElementRefs,
  ChatServiceHistoryEntry,
  ChatServiceInfoResponse,
  ChatServiceOffsets
} from './types';

import {
  deepMerge,
  clamp,
  formatTime,
  parseTimestamp,
  decodeHtmlEntities,
  renderPlainText,
  scrollToBottom,
  adjustTextareaHeight,
  attachTypingCursor
} from './utils';

import { defaultOptions, DEFAULT_INPUT_PLACEHOLDER, MAX_POLL_FAILURES_BEFORE_RESET } from './config/default-options';
import { renderMarkdown } from './renderer/markdown';
import { buildStyles, generateThemeVariables } from './styles/builder';
import { ChatService } from './services/chat-service';
import { MessageManager } from './managers/message-manager';
import {
  createHeader,
  createInputArea,
  createFooterLinks,
  createLauncherButton,
  createTeaserBubble,
  createMessageElement,
  createConsentPrompt,
  createToolActivityIndicator,
  createDisclaimer
} from './ui/builders';

// Re-export utilities for external usage
export { renderMarkdown } from './renderer/markdown';
export { deepMerge, formatTime } from './utils';

// Widget instance counter for unique IDs
let widgetInstanceCounter = 0;

interface HistoryRecord {
  role: ChatMessage["role"];
  content: string;
  isToolCall: boolean;
  timestamp: Date | null;
  messageIndex: number | null;
}

/**
 * Main ChatWidget class
 * 
 * This class orchestrates all the modules to provide a complete chat widget experience.
 * It manages the UI state, message flow, and communication with the backend service.
 */
export class ChatWidget {
  private options: ChatWidgetOptions;
  private readonly instanceId: number;
  
  // DOM elements
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
  
  // State management
  private isOpen = false;
  private hasEverOpened = false;
  private isAwaitingAgent = false;
  private isConsentGranted: boolean;
  private isTerminated = false;
  private shouldAutoScroll = true;
  private hasLoadedInitialHistory = false;
  
  // Service and managers
  private service: ChatService;
  private messageManager: MessageManager;
  
  // Timers and animations
  private teaserTimerId: number | null = null;
  private mockResponseIndex = 0;
  private resizeObserver?: ResizeObserver;
  
  // Additional UI elements
  private consentPromptElement?: HTMLDivElement;
  private disclaimerElement?: HTMLDivElement;
  private welcomeMessageElement?: HTMLDivElement;
  private toolActivityIndicator?: HTMLDivElement;
  private historyRecords: HistoryRecord[] = [];
  private typingCursor?: HTMLSpanElement;
  private typingTarget: { wrapper: HTMLDivElement; bubble: HTMLDivElement } | null = null;
  private pendingAgentPlaceholderIndex: number | null = null;

  /**
   * Creates a new ChatWidget instance
   * @param options - Partial configuration to override defaults
   */
  constructor(options: DeepPartial<ChatWidgetOptions> = {}) {
    this.options = deepMerge(defaultOptions, options);
    this.instanceId = ++widgetInstanceCounter;
    this.isConsentGranted = !this.options.requirePrivacyConsent;
    
    // Initialize service and managers
    this.service = new ChatService(this.options.serviceConfig);
    this.messageManager = new MessageManager();
  }

  /**
   * Mounts the widget into the DOM
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

    // Load persisted session if available
    if (this.service.isConfigured()) {
      const chatId = this.service.loadPersistedChatId();
      if (chatId && this.options.requirePrivacyConsent) {
        this.isConsentGranted = true;
      }
    }

    this.registerEventListeners();
    this.startTeaserCountdown();
    this.renderInitialState();
    this.updateDimensions();
  }

  /**
   * Destroys the widget and cleans up resources
   */
  destroy(): void {
    this.stopTeaserCountdown();
    this.service.stopPolling();
    
    window.removeEventListener("resize", this.handleWindowResize);
    
    if (this.messageList) {
      this.messageList.removeEventListener("scroll", this.handleMessagesScroll);
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    
    if (this.host && this.host.parentElement) {
      this.host.parentElement.removeChild(this.host);
    }
  }

  /**
   * Opens the chat window
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
   * Closes the chat window
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
   * Toggles the chat window open/closed
   */
  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Resets the conversation
   */
  resetConversation(): void {
    this.service.stopPolling();
    this.shouldAutoScroll = true;
    this.isAwaitingAgent = false;
    this.isTerminated = false;
    this.isConsentGranted = !this.options.requirePrivacyConsent;
    this.hasLoadedInitialHistory = false;
    this.mockResponseIndex = 0;
    this.historyRecords = [];
    this.clearTypingIndicator();
    this.deactivateToolPlaceholder();
    this.pendingAgentPlaceholderIndex = null;
    
    this.messageManager.clearMessages();
    this.clearMessageList();
    
    if (this.service.isConfigured()) {
      this.service.clearSession();
      if (this.options.requirePrivacyConsent) {
        this.isConsentGranted = false;
      }
    }
    
    this.renderInitialState();
  }

  // Private helper methods

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

  private createContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "acw-container";

    this.chatWindow = this.createChatWindow();
    container.appendChild(this.chatWindow);

    this.teaserBubble = createTeaserBubble(this.options);
    container.appendChild(this.teaserBubble);

    this.launcherButton = createLauncherButton(this.options, this.instanceId);
    container.appendChild(this.launcherButton);

    return container;
  }

  private createChatWindow(): HTMLDivElement {
    const chat = document.createElement("div");
    chat.className = "acw-chat";
    chat.setAttribute("role", "dialog");
    chat.setAttribute("aria-modal", "false");
    chat.setAttribute("aria-hidden", "true");
    chat.id = `acw-chat-${this.instanceId}`;

    const headerResult = createHeader(this.options);
    chat.appendChild(headerResult.element);
    this.closeButton = headerResult.closeButton;
    this.reloadButton = headerResult.reloadButton;

    const body = document.createElement("div");
    body.className = "acw-body";

    this.messageList = document.createElement("div");
    this.messageList.className = "acw-messages";
    this.messageList.setAttribute("role", "log");
    this.messageList.setAttribute("aria-live", "polite");
    this.messageList.setAttribute("aria-relevant", "additions");
    body.appendChild(this.messageList);

    const inputResult = createInputArea(this.options);
    this.inputArea = inputResult.element;
    this.inputField = inputResult.inputField;
    this.sendButton = inputResult.sendButton;
    body.appendChild(this.inputArea);

    chat.appendChild(body);

    this.footerLinksContainer = createFooterLinks(this.options.footerLinks);
    chat.appendChild(this.footerLinksContainer);

    return chat;
  }

  private createStyleElement(): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = buildStyles();
    return style;
  }

  private applyThemeVariables(): void {
    const root = this.host;
    const vars = generateThemeVariables(this.options.theme, this.options.zIndex);
    
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, String(value));
    }
  }

  private registerEventListeners(): void {
    this.launcherButton.addEventListener("click", () => this.toggle());
    this.teaserBubble.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());
    this.reloadButton.addEventListener("click", () => this.resetConversation());
    this.sendButton.addEventListener("click", () => {
      void this.handleSend();
    });
    this.inputField.addEventListener("keydown", (event) => this.handleInputKeyDown(event));
    this.inputField.addEventListener("input", () => {
      adjustTextareaHeight(this.inputField);
    });
    this.messageList.addEventListener("scroll", this.handleMessagesScroll);

    window.addEventListener("resize", this.handleWindowResize);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => this.updateDimensions());
      this.resizeObserver.observe(document.body);
    }
  }

  private handleWindowResize = (): void => {
    this.updateDimensions();
  };

  private handleMessagesScroll = (): void => {
    if (!this.messageList) {
      return;
    }
    const distance =
      this.messageList.scrollHeight - this.messageList.scrollTop - this.messageList.clientHeight;
    this.shouldAutoScroll = distance < 36;
  };

  private handleInputKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      if (!this.canSendMessage()) {
        return;
      }
      event.preventDefault();
      void this.handleSend();
    }
  }

  private async handleSend(): Promise<void> {
    if (!this.canSendMessage()) {
      return;
    }
    const content = this.inputField.value.trim();
    if (!content) {
      return;
    }
    
    this.inputField.value = "";
    adjustTextareaHeight(this.inputField);
    this.shouldAutoScroll = true;
    
    // Add user message
    const message: ChatMessage = {
      role: "user",
      content: decodeHtmlEntities(content),
      timestamp: new Date(),
      status: "pending",
      localOnly: true,
    };
    
    const messageIndex = this.messageManager.addMessage(message);
    this.appendMessageToDOM(message, messageIndex);
    
    // Send to service or simulate response
    if (this.service.isConfigured()) {
      await this.sendMessageToService(content, messageIndex);
    } else {
      this.simulateAgentReply();
    }
  }

  private canSendMessage(): boolean {
    return !this.inputField.disabled && 
           this.isConsentGranted && 
           !this.isTerminated && 
           !this.isAwaitingAgent;
  }

  private async sendMessageToService(content: string, messageIndex: number): Promise<void> {
    try {
      // Ensure session exists
      if (!this.service.getChatId()) {
        const initialized = await this.service.initSession();
        if (!initialized) {
          throw new Error("Failed to initialize chat session");
        }
      }
      
      // Send message
      await this.service.sendMessage(content);
      this.messageManager.updateMessage(messageIndex, { status: "sent" });
      
      // Start polling for response
      this.isAwaitingAgent = true;
      this.updateSendAvailability();
      this.ensureAgentStreamingPlaceholder();
      this.pollForUpdates();
      
    } catch (error) {
      console.error("AlbertChat: Failed to send message", error);
      this.messageManager.updateMessage(messageIndex, { status: "failed" });
      this.showError("Die Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut.");
    }
  }

  private async pollForUpdates(): Promise<void> {
    if (!this.service.isConfigured()) {
      return;
    }
    
    const response = await this.service.fetchInfo();
    const requestedOffsets = this.service.getLastRequestedOffsets();
    if (!response) {
      if (this.service.getPollFailureCount() >= MAX_POLL_FAILURES_BEFORE_RESET) {
        this.service.stopPolling();
        this.isAwaitingAgent = false;
        this.updateSendAvailability();
        this.showError("Die Verbindung zum Chat konnte nicht wiederhergestellt werden.");
        return;
      }
    } else {
      this.processServiceResponse(response, requestedOffsets ?? null);
    }
    
    // Continue polling if still awaiting response
    if (this.isAwaitingAgent) {
      this.service.scheduleNextPoll(undefined, () => {
        void this.pollForUpdates();
      });
    }
  }

  private processServiceResponse(
    response: ChatServiceInfoResponse,
    requestedOffsets: ChatServiceOffsets | null,
    fullRefresh = false
  ): void {
    const historyEntries = response.history ?? [];
    const running = Boolean(response.running);

    if (fullRefresh) {
      this.historyRecords = [];
      this.messageManager.clearMessages();
      this.clearMessageList();
    }

    const startHistoryIndex = requestedOffsets?.history ?? 0;
    const firstTextOffset = requestedOffsets?.text ?? 0;

    historyEntries.forEach((entry, index) => {
      const absoluteIndex = startHistoryIndex + index;
      const textOffset = index === 0 ? firstTextOffset : 0;
      const isLastEntry = index === historyEntries.length - 1;
      this.applyHistoryEntry(
        absoluteIndex,
        entry,
        textOffset,
        running && isLastEntry
      );
    });

    if (response.offsets) {
      this.service.setOffsets(response.offsets);
    }

    this.isAwaitingAgent = running;
    this.updateSendAvailability();

    if (!running) {
      this.service.stopPolling();
      this.deactivateToolPlaceholder();
      this.clearTypingIndicator();
      this.cleanupAgentPlaceholder();
      this.clearStreamingFlags();
    } else if (this.toolActivityIndicator) {
      this.setTypingIndicatorToPlaceholder();
    } else if (this.pendingAgentPlaceholderIndex !== null) {
      this.setTypingIndicatorToMessage(this.pendingAgentPlaceholderIndex);
    } else {
      this.setTypingIndicatorToLatestMessage();
    }

    if (this.messageManager.getMessageCount() === 0) {
      this.ensureWelcomeMessage();
    }

    this.ensureDisclaimer();

    if (this.shouldAutoScroll) {
      this.scrollToBottom({ smooth: true });
    }
  }

  private applyHistoryEntry(
    index: number,
    entry: ChatServiceHistoryEntry,
    textOffset: number,
    isStreamingCandidate: boolean
  ): void {
    const role = this.normalizeServiceRole(entry.role);
    const rawText = entry.text ?? "";
    const decodedText = decodeHtmlEntities(rawText);
    const trimmedText = decodedText.trim();
    const isToolCall = Boolean(entry.isToolCall);
    const timestamp = entry.dateTime ? parseTimestamp(entry.dateTime) : null;

    let record = this.historyRecords[index];
    if (!record) {
      record = {
        role,
        content: "",
        isToolCall,
        timestamp,
        messageIndex: null,
      };
      this.historyRecords[index] = record;
    } else {
      record.role = role;
      record.isToolCall = isToolCall;
      if (timestamp) {
        record.timestamp = timestamp;
      }
    }

    if (decodedText.length > 0) {
      record.content = this.mergeRecordContent(record.content, decodedText, textOffset);
      record.timestamp = record.timestamp ?? new Date();
      const shouldStream = isStreamingCandidate && role === "agent" && !isToolCall;
      this.ensureHistoryMessage(record, shouldStream);
      if (trimmedText.length > 0) {
        this.deactivateToolPlaceholder();
      }
      if (shouldStream && !this.toolActivityIndicator) {
        this.setTypingIndicatorToMessage(record.messageIndex ?? null);
      }
      return;
    }

    if (isToolCall && trimmedText.length === 0) {
      if (this.pendingAgentPlaceholderIndex !== null) {
        this.cleanupAgentPlaceholder();
      }
      this.activateToolPlaceholder();
    }
  }

  private mergeRecordContent(existing: string, chunk: string, offset: number): string {
    if (offset <= 0) {
      return chunk;
    }
    if (offset >= existing.length) {
      return existing + chunk;
    }
    return existing.slice(0, offset) + chunk;
  }

  private ensureHistoryMessage(record: HistoryRecord, isStreaming: boolean): void {
    const timestamp = record.timestamp ?? new Date();
    let messageIndex = record.messageIndex;

    if (messageIndex === null && record.role === "user") {
      const matched = this.messageManager.findLocalUserMessage(record.content);
      if (matched !== null) {
        messageIndex = matched;
      }
    }

    if (messageIndex === null && record.role === "agent" && this.pendingAgentPlaceholderIndex !== null) {
      messageIndex = this.pendingAgentPlaceholderIndex;
      this.pendingAgentPlaceholderIndex = null;
    }

    if (messageIndex === null) {
      const message: ChatMessage = {
        role: record.role,
        content: record.content,
        timestamp,
        status: record.role === "user" ? "sent" : undefined,
        localOnly: false,
      };
      messageIndex = this.messageManager.addMessage(message);
      this.appendMessageToDOM(message, messageIndex);
    }

    record.messageIndex = messageIndex;
    this.messageManager.updateMessage(messageIndex, {
      content: record.content,
      timestamp,
      status: record.role === "user" ? "sent" : undefined,
      localOnly: false,
      isStreamingPlaceholder: isStreaming,
    });
    this.updateMessageElement(messageIndex);
  }

  private clearStreamingFlags(): void {
    const messages = this.messageManager.getMessages();
    messages.forEach((message, index) => {
      if (message?.isStreamingPlaceholder) {
        this.messageManager.updateMessage(index, { isStreamingPlaceholder: false });
        this.updateMessageElement(index);
      }
    });
  }

  private updateMessageElement(index: number): void {
    const message = this.messageManager.getMessage(index);
    if (!message) {
      return;
    }

    let elements = this.messageManager.getMessageElements(index);
    if (!elements) {
      if (!message.content.trim()) {
        return;
      }
      this.appendMessageToDOM(message, index);
      elements = this.messageManager.getMessageElements(index);
      if (!elements) {
        return;
      }
    }

    if (message.role === "agent") {
      elements.bubble.classList.add("acw-agent-fixed");
      elements.bubble.innerHTML = renderMarkdown(message.content);
    } else {
      elements.bubble.innerHTML = renderPlainText(message.content);
    }
    
    const isStreaming = Boolean(message.isStreamingPlaceholder);
    elements.wrapper.classList.toggle("acw-message-streaming", isStreaming);
    const hasContent = (message.content ?? "").trim().length > 0;
    if (!isStreaming || hasContent) {
      elements.wrapper.classList.remove("acw-typing");
      elements.bubble.classList.remove("acw-bubble-typing", "acw-typing-content");
      this.removeTypingPlaceholder(elements.bubble);
    } else {
      elements.wrapper.classList.add("acw-typing");
      elements.bubble.classList.add("acw-bubble-typing", "acw-typing-content");
      this.ensureTypingPlaceholder(elements.bubble);
    }
    elements.timestamp.textContent = formatTime(message.timestamp, this.options.locale);

    if (this.typingTarget && this.typingCursor && this.typingTarget.wrapper === elements.wrapper) {
      attachTypingCursor(elements.bubble, this.typingCursor);
    }
  }

  private setTypingIndicatorToMessage(messageIndex: number | null): void {
    if (this.toolActivityIndicator || messageIndex === null) {
      return;
    }
    const elements = this.messageManager.getMessageElements(messageIndex);
    if (!elements) {
      return;
    }
    this.applyTypingIndicator(elements);
  }

  private setTypingIndicatorToPlaceholder(): void {
    if (!this.toolActivityIndicator) {
      return;
    }
    const bubble = this.toolActivityIndicator.querySelector<HTMLDivElement>(".acw-bubble");
    if (!bubble) {
      return;
    }
    this.applyTypingIndicator({ wrapper: this.toolActivityIndicator, bubble });
  }

  private setTypingIndicatorToLatestMessage(): void {
    const latestMessageIndex = this.findLastAgentMessageIndex();
    if (latestMessageIndex === null) {
      this.clearTypingIndicator();
      return;
    }
    this.setTypingIndicatorToMessage(latestMessageIndex);
  }

  private ensureAgentStreamingPlaceholder(): void {
    if (!this.isAwaitingAgent || this.pendingAgentPlaceholderIndex !== null) {
      return;
    }
    const message: ChatMessage = {
      role: "agent",
      content: "",
      timestamp: new Date(),
      localOnly: true,
      isStreamingPlaceholder: true,
    };
    const index = this.messageManager.addMessage(message);
    this.appendMessageToDOM(message, index);
    this.pendingAgentPlaceholderIndex = index;
    const elements = this.messageManager.getMessageElements(index);
    if (elements?.bubble) {
      this.ensureTypingPlaceholder(elements.bubble);
    }
    this.setTypingIndicatorToMessage(index);
  }

  private cleanupAgentPlaceholder(): void {
    if (this.pendingAgentPlaceholderIndex === null) {
      return;
    }
    const index = this.pendingAgentPlaceholderIndex;
    const elements = this.messageManager.getMessageElements(index);
    if (this.typingTarget && elements && this.typingTarget.wrapper === elements.wrapper) {
      this.clearTypingIndicator();
    }
    if (elements?.wrapper?.parentElement) {
      elements.wrapper.parentElement.removeChild(elements.wrapper);
    }
    this.messageManager.removeMessage(index);
    this.pendingAgentPlaceholderIndex = null;

    this.historyRecords.forEach(record => {
      if (record && record.messageIndex !== null && record.messageIndex > index) {
        record.messageIndex -= 1;
      }
    });
  }

  private applyTypingIndicator(target: { wrapper: HTMLDivElement; bubble: HTMLDivElement }): void {
    if (!this.typingCursor) {
      this.typingCursor = document.createElement("span");
      this.typingCursor.className = "acw-typing-cursor";
    }

    if (this.typingTarget && this.typingTarget.wrapper === target.wrapper) {
      target.wrapper.classList.add("acw-typing");
      target.bubble.classList.add("acw-bubble-typing", "acw-typing-content");
      this.ensureTypingPlaceholder(target.bubble);
      if (this.typingCursor.parentElement !== target.bubble) {
        target.bubble.appendChild(this.typingCursor);
      }
      attachTypingCursor(target.bubble, this.typingCursor);
      return;
    }

    this.clearTypingIndicator();
    target.wrapper.classList.add("acw-typing");
    target.bubble.classList.add("acw-bubble-typing", "acw-typing-content");
    this.ensureTypingPlaceholder(target.bubble);
    target.bubble.appendChild(this.typingCursor);
    attachTypingCursor(target.bubble, this.typingCursor);
    this.typingTarget = target;
  }

  private clearTypingIndicator(): void {
    if (!this.typingTarget) {
      return;
    }
    const { wrapper, bubble } = this.typingTarget;
    wrapper.classList.remove("acw-typing");
    bubble.classList.remove("acw-bubble-typing", "acw-typing-content");
    if (this.typingCursor && this.typingCursor.parentElement === bubble) {
      bubble.removeChild(this.typingCursor);
    }
    this.typingTarget = null;
  }

  private ensureTypingPlaceholder(bubble: HTMLDivElement): void {
    const text = bubble.textContent ?? "";
    const existing = bubble.querySelector<HTMLSpanElement>(".acw-typing-placeholder");
    if (text.trim().length > 0) {
      if (existing) {
        existing.remove();
      }
      return;
    }
    if (!existing) {
      const span = document.createElement("span");
      span.className = "acw-typing-placeholder";
      span.innerHTML = "&nbsp;";
      bubble.insertBefore(span, bubble.firstChild);
    }
  }

  private removeTypingPlaceholder(bubble: HTMLDivElement): void {
    const existing = bubble.querySelector<HTMLSpanElement>(".acw-typing-placeholder");
    if (existing) {
      existing.remove();
    }
  }

  private activateToolPlaceholder(): void {
    if (!this.messageList) {
      return;
    }
    if (this.toolActivityIndicator) {
      this.setTypingIndicatorToPlaceholder();
      return;
    }
    const placeholder = createToolActivityIndicator(this.options.texts.toolCallPlaceholder);
    this.toolActivityIndicator = placeholder;

    if (this.disclaimerElement && this.disclaimerElement.parentElement === this.messageList) {
      this.messageList.insertBefore(placeholder, this.disclaimerElement);
    } else {
      this.messageList.appendChild(placeholder);
    }

    this.scrollToBottom({ smooth: true });
    this.setTypingIndicatorToPlaceholder();
  }

  private deactivateToolPlaceholder(): void {
    if (!this.toolActivityIndicator) {
      return;
    }
    if (this.toolActivityIndicator.parentElement) {
      this.toolActivityIndicator.parentElement.removeChild(this.toolActivityIndicator);
    }
    if (this.typingTarget && this.typingTarget.wrapper === this.toolActivityIndicator) {
      this.clearTypingIndicator();
    }
    this.toolActivityIndicator = undefined;
  }

  private findLastAgentMessageIndex(): number | null {
    for (let i = this.historyRecords.length - 1; i >= 0; i -= 1) {
      const record = this.historyRecords[i];
      if (record && record.role === "agent" && record.messageIndex !== null) {
        return record.messageIndex;
      }
    }

    const messages = this.messageManager.getMessages();
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "agent") {
        return i;
      }
    }

    return null;
  }

  private normalizeServiceRole(role: string): ChatMessage["role"] {
    const normalized = (role || "").toLowerCase();
    if (normalized === "user" || normalized === "human") {
      return "user";
    }
    return "agent";
  }

  private simulateAgentReply(): void {
    if (!this.options.mockResponses.length) {
      return;
    }
    
    this.isAwaitingAgent = true;
    this.updateSendAvailability();
    
    const [minDelay, maxDelay] = this.options.mockResponseDelayMs;
    const delay = clamp(
      minDelay + Math.random() * (maxDelay - minDelay),
      minDelay,
      maxDelay
    );
    
    window.setTimeout(() => {
      const response = this.options.mockResponses[this.mockResponseIndex];
      this.mockResponseIndex = (this.mockResponseIndex + 1) % this.options.mockResponses.length;
      
      const message: ChatMessage = {
        role: "agent",
        content: response,
        timestamp: new Date()
      };
      
      const messageIndex = this.messageManager.addMessage(message);
      this.appendMessageToDOM(message, messageIndex);
      
      this.isAwaitingAgent = false;
      this.updateSendAvailability();
    }, delay);
  }

  private appendMessageToDOM(message: ChatMessage, index: number): void {
    if (!this.messageList) {
      return;
    }
    
    const elements = createMessageElement(message, this.options.locale);
    this.messageManager.setMessageElements(index, elements);
    
    if (message.isStreamingPlaceholder) {
      elements.wrapper.classList.add("acw-message-streaming");
    }
    
    if (this.disclaimerElement && this.disclaimerElement.parentElement === this.messageList) {
      this.messageList.insertBefore(elements.wrapper, this.disclaimerElement);
    } else {
      this.messageList.appendChild(elements.wrapper);
    }
    this.ensureDisclaimer();
    this.scrollToBottom({ smooth: true });
  }

  private clearMessageList(): void {
    if (this.messageList) {
      this.messageList.innerHTML = "";
    }
    this.disclaimerElement = undefined;
    this.welcomeMessageElement = undefined;
    this.consentPromptElement = undefined;
    this.toolActivityIndicator = undefined;
    this.typingTarget = null;
    this.typingCursor = undefined;
    this.pendingAgentPlaceholderIndex = null;
  }

  private renderInitialState(): void {
    if (!this.messageList) {
      return;
    }
    
    this.clearMessageList();
    
    if (this.options.requirePrivacyConsent && !this.isConsentGranted) {
      this.renderConsentPrompt();
      this.hideInputArea();
    } else if (!this.isTerminated) {
      this.showInputArea();
      this.ensureWelcomeMessage();
      
      if (this.service.isConfigured() && !this.hasLoadedInitialHistory) {
        void this.loadInitialHistory();
      }
    }
    
    this.ensureDisclaimer();
    this.updateSendAvailability();
  }

  private async loadInitialHistory(): Promise<void> {
    if (!this.service.getChatId()) {
      await this.service.initSession();
    }
    
    const response = await this.service.fetchInfo(true);
    if (response) {
      this.hasLoadedInitialHistory = true;
      const requestedOffsets = this.service.getLastRequestedOffsets();
      this.processServiceResponse(response, requestedOffsets ?? null, true);
    }
  }

  private renderConsentPrompt(): void {
    if (!this.messageList) {
      return;
    }
    
    this.consentPromptElement = createConsentPrompt(
      this.options,
      () => this.handleConsentAccept(),
      () => this.handleConsentDecline()
    );
    
    this.messageList.appendChild(this.consentPromptElement);
    this.scrollToBottom({ force: true });
  }

  private handleConsentAccept(): void {
    this.isConsentGranted = true;
    if (this.consentPromptElement) {
      this.consentPromptElement.remove();
      this.consentPromptElement = undefined;
    }
    this.showInputArea();
    this.renderInitialState();
    this.focusInput();
  }

  private handleConsentDecline(): void {
    this.isConsentGranted = false;
    this.isTerminated = true;
    if (this.consentPromptElement) {
      this.consentPromptElement.remove();
      this.consentPromptElement = undefined;
    }
    this.hideInputArea();
    this.showError(this.options.texts.consentDeclinedMessage);
  }

  private ensureWelcomeMessage(): void {
    if (!this.options.welcomeMessage?.enabled || this.welcomeMessageElement) {
      return;
    }
    
    const text = this.options.welcomeMessage.text || this.options.texts.initialMessage;
    const message: ChatMessage = {
      role: "agent",
      content: text,
      timestamp: new Date()
    };
    
    const elements = createMessageElement(message, this.options.locale);
    elements.wrapper.classList.add("acw-message-welcome");
    
    if (this.options.welcomeMessage.className) {
      elements.wrapper.classList.add(this.options.welcomeMessage.className);
    }
    
    if (this.options.welcomeMessage.styles) {
      Object.entries(this.options.welcomeMessage.styles).forEach(([key, value]) => {
        if (value !== undefined) {
          elements.wrapper.style.setProperty(key, value);
        }
      });
    }
    
    this.welcomeMessageElement = elements.wrapper;
    
    if (this.messageList.firstChild) {
      this.messageList.insertBefore(this.welcomeMessageElement, this.messageList.firstChild);
    } else {
      this.messageList.appendChild(this.welcomeMessageElement);
    }
  }

  private ensureDisclaimer(): void {
    if (!this.options.disclaimer?.enabled || this.disclaimerElement) {
      return;
    }
    
    if (this.messageManager.getMessageCount() === 0 && !this.welcomeMessageElement) {
      return;
    }
    
    this.disclaimerElement = createDisclaimer(
      this.options.disclaimer.text,
      this.options.disclaimer.className,
      this.options.disclaimer.styles
    );
    
    if (this.messageList) {
      this.messageList.appendChild(this.disclaimerElement);
    }
  }

  private showError(message: string): void {
    const errorMessage: ChatMessage = {
      role: "agent",
      content: message,
      timestamp: new Date(),
      localOnly: true
    };
    
    const index = this.messageManager.addMessage(errorMessage);
    this.appendMessageToDOM(errorMessage, index);
  }

  private showInputArea(): void {
    if (this.inputArea) {
      this.inputArea.classList.remove("acw-hidden");
    }
    if (this.inputField) {
      this.inputField.disabled = false;
      this.inputField.placeholder = DEFAULT_INPUT_PLACEHOLDER;
    }
  }

  private hideInputArea(): void {
    if (this.inputArea) {
      this.inputArea.classList.add("acw-hidden");
    }
    if (this.inputField) {
      this.inputField.disabled = true;
      this.inputField.value = "";
    }
  }

  private focusInput(): void {
    if (this.inputField && !this.inputField.disabled) {
      window.setTimeout(() => {
        this.inputField.focus({ preventScroll: false });
        adjustTextareaHeight(this.inputField);
      }, 0);
    }
  }

  private updateSendAvailability(): void {
    if (!this.sendButton) {
      return;
    }
    
    const canSend = this.canSendMessage();
    this.sendButton.disabled = !canSend;
    this.sendButton.setAttribute("aria-disabled", canSend ? "false" : "true");
    
    let tooltip = this.options.texts.sendButtonLabel;
    if (!canSend) {
      if (!this.isConsentGranted) {
        tooltip = this.options.texts.sendWhileConsentPendingTooltip;
      } else if (this.isTerminated) {
        tooltip = this.options.texts.sendWhileTerminatedTooltip;
      } else if (this.isAwaitingAgent) {
        tooltip = this.options.texts.sendWhileStreamingTooltip;
      }
    }
    
    this.sendButton.title = tooltip;
  }

  private scrollToBottom(options: { smooth?: boolean; force?: boolean } = {}): void {
    const { smooth = false, force = false } = options;
    
    if (!this.messageList || (!force && !this.shouldAutoScroll)) {
      return;
    }
    
    if (force) {
      this.shouldAutoScroll = true;
    }
    
    scrollToBottom(this.messageList, { smooth });
    
    if (smooth) {
      window.requestAnimationFrame(() => {
        if (this.messageList) {
          scrollToBottom(this.messageList, { smooth: false });
        }
      });
    }
  }

  private updateDimensions(): void {
    if (!this.chatWindow) {
      return;
    }
    
    const { widthPercent, minWidthPx, heightPercent, minHeightPx } = this.options.dimensions;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const horizontalPadding = 32;
    
    const desiredWidth = Math.max((viewportWidth * widthPercent) / 100, minWidthPx);
    const maxWidth = viewportWidth - horizontalPadding;
    const width = clamp(desiredWidth, minWidthPx, maxWidth);
    
    const buttonHeight = this.launcherButton ? this.launcherButton.offsetHeight : 56;
    const spacing = 36;
    const availableHeight = viewportHeight - (buttonHeight + spacing);
    const desiredHeight = Math.max((viewportHeight * heightPercent) / 100, minHeightPx);
    const height = clamp(desiredHeight, minHeightPx, Math.max(minHeightPx, availableHeight));

    this.host.style.setProperty("--acw-chat-width", `${Math.round(width)}px`);
    this.host.style.setProperty("--acw-chat-height", `${Math.round(height)}px`);
  }

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

  private stopTeaserCountdown(): void {
    if (this.teaserTimerId !== null) {
      window.clearTimeout(this.teaserTimerId);
      this.teaserTimerId = null;
    }
  }

  private showTeaser(): void {
    if (this.teaserBubble) {
      this.teaserBubble.style.display = "inline-flex";
      this.teaserBubble.classList.add("acw-visible");
    }
  }

  private hideTeaser(): void {
    this.stopTeaserCountdown();
    if (this.teaserBubble) {
      this.teaserBubble.classList.remove("acw-visible");
      this.teaserBubble.style.display = "none";
    }
  }
}

/**
 * Convenience function to create and mount a widget in one call
 * 
 * @param options - Partial configuration options
 * @returns The created ChatWidget instance
 */
export function init(options: DeepPartial<ChatWidgetOptions> = {}): ChatWidget {
  const widget = new ChatWidget(options);
  widget.mount();
  return widget;
}

// Default export for backwards compatibility
export default {
  ChatWidget,
  init,
};
