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
  placeholder: string;
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
  footerLinks: ChatFooterLink[];
  dimensions: ChatWidgetDimensions;
  teaserDelayMs: number;
  mockResponses: string[];
  mockResponseDelayMs: [number, number];
  zIndex: number;
  locale: string;
  requirePrivacyConsent: boolean;
}

export interface ChatMessage {
  role: ChatRole;
  content: string;
  timestamp: Date;
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
    placeholder: "Ihre Nachricht...",
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
    widthPercent: 30,
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
};

let widgetInstanceCounter = 0;

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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

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
  private inputField!: HTMLTextAreaElement;
  private sendButton!: HTMLButtonElement;
  private closeButton!: HTMLButtonElement;
  private reloadButton!: HTMLButtonElement;
  private footerLinksContainer!: HTMLDivElement;
  private typingIndicator?: HTMLDivElement;
  private isOpen = false;
  private hasEverOpened = false;
  private messages: ChatMessage[] = [];
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
  private defaultPlaceholder: string;
  private shouldAutoScroll = true;

  constructor(options: DeepPartial<ChatWidgetOptions> = {}) {
    this.options = deepMerge(defaultOptions, options);
    this.instanceId = ++widgetInstanceCounter;
    this.defaultPlaceholder = this.options.texts.placeholder;
    this.isConsentGranted = !this.options.requirePrivacyConsent;
  }

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

    this.registerEventListeners();
    this.startTeaserCountdown();
    this.resetConversation();
    this.updateDimensions();
  }

  destroy(): void {
    this.stopTeaserCountdown();
    this.clearStreamingTimers();
    this.hideTypingIndicator();
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

  close(): void {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.chatWindow.classList.remove("acw-open");
    this.launcherButton.setAttribute("aria-expanded", "false");
    this.chatWindow.setAttribute("aria-hidden", "true");
  }

  toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  resetConversation(): void {
    this.clearStreamingTimers();
    this.hideTypingIndicator();
    this.shouldAutoScroll = true;
    this.isAwaitingAgent = false;
    this.isTerminated = false;
    this.isConsentGranted = !this.options.requirePrivacyConsent;
    this.messages = [];
    this.mockResponseIndex = 0;
    if (this.messageList) {
      this.messageList.innerHTML = "";
    }
    this.renderInitialState();
  }

  private renderInitialState(): void {
    if (!this.messageList) {
      return;
    }
    this.removeConsentPrompt();
    if (this.options.requirePrivacyConsent && !this.isConsentGranted) {
      this.renderConsentPrompt();
      this.setInputDisabled(true, this.options.texts.consentPendingPlaceholder);
    } else if (!this.isTerminated) {
      this.setInputDisabled(false, this.defaultPlaceholder);
      if (!this.messages.length) {
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
    this.updateSendAvailability();
  }

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

  private removeConsentPrompt(): void {
    if (this.consentPromptElement) {
      this.consentPromptElement.remove();
      this.consentPromptElement = undefined;
    }
  }

  private handleConsentAccept = (): void => {
    if (this.isTerminated) {
      return;
    }
    this.isConsentGranted = true;
    this.removeConsentPrompt();
    this.setInputDisabled(false, this.defaultPlaceholder);
    if (!this.messages.length) {
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
    this.updateSendAvailability();
    this.focusInput();
  };

  private handleConsentDecline = (): void => {
    if (this.isTerminated) {
      return;
    }
    this.isConsentGranted = false;
    this.isTerminated = true;
    this.removeConsentPrompt();
    this.setInputDisabled(true, this.options.texts.consentDeclinedPlaceholder);
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

  private setInputDisabled(disabled: boolean, placeholder?: string): void {
    if (!this.inputField) {
      return;
    }
    this.inputField.disabled = disabled;
    this.inputField.setAttribute("aria-disabled", disabled ? "true" : "false");
    if (placeholder !== undefined) {
      this.inputField.placeholder = placeholder;
    } else if (!disabled) {
      this.inputField.placeholder = this.defaultPlaceholder;
    }
    if (disabled) {
      this.inputField.value = "";
      this.inputField.style.height = "";
      this.lastTextareaHeight = 0;
    } else {
      this.adjustTextareaHeight();
    }
  }

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

  addMessage(
    message: ChatMessage,
    options: { forceScroll?: boolean; smooth?: boolean; autoScroll?: boolean } = {}
  ): void {
    this.messages.push(message);
    this.appendMessageElement(message, options);
  }

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

    this.teaserBubble = this.createTeaserBubble();
    container.appendChild(this.teaserBubble);

    this.launcherButton = this.createLauncherButton();
    container.appendChild(this.launcherButton);

    return container;
  }

  private createStyleElement(): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = this.buildStyles();
    return style;
  }

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
        white-space: pre-wrap;
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
      .acw-timestamp {
        font-size: 0.75rem;
        color: rgba(15, 23, 42, 0.55);
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
      .acw-footer-links {
        padding: 0 var(--acw-spacing-md) var(--acw-spacing-md);
        display: flex;
        flex-wrap: wrap;
        gap: var(--acw-spacing-xs);
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
      .acw-typing .acw-bubble {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: var(--acw-agent-message-color);
        color: var(--acw-agent-text-color);
      }
      .acw-typing-dots {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .acw-typing-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--acw-agent-text-color);
        opacity: 0.5;
        animation: acw-typing-bounce 1.2s infinite;
      }
      .acw-typing-dot:nth-child(2) {
        animation-delay: 0.2s;
      }
      .acw-typing-dot:nth-child(3) {
        animation-delay: 0.4s;
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
      @keyframes acw-typing-bounce {
        0%, 80%, 100% {
          transform: translateY(0);
          opacity: 0.4;
        }
        40% {
          transform: translateY(-4px);
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
    body.appendChild(inputArea);

    chat.appendChild(body);

    this.footerLinksContainer = this.createFooterLinks();
    chat.appendChild(this.footerLinksContainer);

    return chat;
  }

  private createHeader(): HTMLElement {
    const header = document.createElement("header");
    header.className = "acw-header";

    const details = document.createElement("div");
    details.className = "acw-header-details";

    const icon = document.createElement("span");
    icon.className = "acw-header-icon";
    icon.textContent = this.options.icons.headerIcon;
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
    this.reloadButton.textContent = this.options.icons.reloadIcon;
    actions.appendChild(this.reloadButton);

    this.closeButton = document.createElement("button");
    this.closeButton.type = "button";
    this.closeButton.className = "acw-icon-button";
    this.closeButton.setAttribute("aria-label", this.options.texts.closeLabel);
    this.closeButton.title = this.options.texts.closeLabel;
    this.closeButton.textContent = this.options.icons.closeIcon;
    actions.appendChild(this.closeButton);

    header.appendChild(actions);

    return header;
  }

  private createInputArea(): HTMLElement {
    const wrapper = document.createElement("div");
    wrapper.className = "acw-input-area";

    const row = document.createElement("div");
    row.className = "acw-input-row";

    this.inputField = document.createElement("textarea");
    this.inputField.className = "acw-textarea";
    this.inputField.placeholder = this.options.texts.placeholder;
    this.inputField.rows = 1;
    this.inputField.setAttribute("maxlength", "1000");
    this.inputField.setAttribute("aria-label", this.options.texts.placeholder);

    row.appendChild(this.inputField);

    this.sendButton = document.createElement("button");
    this.sendButton.type = "button";
    this.sendButton.className = "acw-send-button";
    this.sendButton.innerHTML = `<span class="acw-send-icon">${this.options.icons.sendIcon}</span>`;
    this.sendButton.setAttribute("aria-label", this.options.texts.sendButtonLabel);
    this.sendButton.title = this.options.texts.sendButtonLabel;

    row.appendChild(this.sendButton);

    wrapper.appendChild(row);

    return wrapper;
  }

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

  private createLauncherButton(): HTMLButtonElement {
    const launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "acw-launcher";
    launcher.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-controls", `acw-chat-${this.instanceId}`);
    launcher.setAttribute("aria-label", this.options.texts.launcherAriaLabel);

    const iconWrapper = document.createElement("span");
    iconWrapper.className = "acw-launcher-icon";
    iconWrapper.textContent = this.options.icons.launcherIcon;
    launcher.appendChild(iconWrapper);

    const label = document.createElement("span");
    label.className = "acw-launcher-label";
    label.textContent = this.options.texts.launcherLabel;
    launcher.appendChild(label);

    return launcher;
  }

  private createTeaserBubble(): HTMLButtonElement {
    const teaser = document.createElement("button");
    teaser.type = "button";
    teaser.className = "acw-teaser";
    teaser.setAttribute("aria-label", this.options.texts.teaserText);
    teaser.textContent = this.options.texts.teaserText;
    teaser.style.display = "none";
    return teaser;
  }

  private registerEventListeners(): void {
    this.launcherButton.addEventListener("click", () => this.toggle());
    this.teaserBubble.addEventListener("click", () => this.open());
    this.closeButton.addEventListener("click", () => this.close());
    this.reloadButton.addEventListener("click", () => this.resetConversation());
    this.sendButton.addEventListener("click", () => this.handleSend());
    this.inputField.addEventListener("keydown", (event) => this.handleInputKeyDown(event));
    this.inputField.addEventListener("input", () => this.adjustTextareaHeight());
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

  private handleInputKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      if (!this.canSendMessage()) {
        return;
      }
      event.preventDefault();
      this.handleSend();
    }
  }

  private handleSend(): void {
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
    this.simulateAgentReply();
  }

  private enqueueUserMessage(content: string): void {
    const message: ChatMessage = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    this.addMessage(message, { forceScroll: true, smooth: true, autoScroll: true });
  }

  private enqueueAgentMessage(content: string, isInitial = false): void {
    const message: ChatMessage = {
      role: "agent",
      content,
      timestamp: new Date(),
    };
    if (isInitial) {
      // Remove empty state if present for the welcome message.
      if (this.messageList) {
        this.messageList.innerHTML = "";
      }
      this.shouldAutoScroll = true;
    }
    const forceScroll = isInitial || this.shouldAutoScroll;
    this.addMessage(message, { forceScroll, smooth: true, autoScroll: true });
  }

  private buildMessageElement(message: ChatMessage): {
    wrapper: HTMLDivElement;
    bubble: HTMLDivElement;
    timestamp: HTMLSpanElement;
  } {
    const wrapper = document.createElement("div");
    wrapper.className = `acw-message acw-message-${message.role}`;

    const bubble = document.createElement("div");
    bubble.className = "acw-bubble";
    bubble.textContent = message.content;

    const metadata = document.createElement("span");
    metadata.className = "acw-timestamp";
    metadata.textContent = formatTime(message.timestamp, this.options.locale);

    wrapper.appendChild(bubble);
    wrapper.appendChild(metadata);

    return { wrapper, bubble, timestamp: metadata };
  }

  private appendMessageElement(
    message: ChatMessage,
    options: { autoScroll?: boolean; forceScroll?: boolean; smooth?: boolean } = {}
  ): { wrapper: HTMLDivElement; bubble: HTMLDivElement; timestamp: HTMLSpanElement } | null {
    const { autoScroll = true, forceScroll = false, smooth = true } = options;
    if (!this.messageList) {
      return null;
    }
    if (this.messageList.querySelector(".acw-empty-state")) {
      this.messageList.innerHTML = "";
    }

    const elements = this.buildMessageElement(message);
    this.messageList.appendChild(elements.wrapper);
    if (autoScroll) {
      this.scrollToBottom({ smooth, force: forceScroll });
    }
    return elements;
  }

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

  private showTypingIndicator(): void {
    if (!this.messageList || this.typingIndicator) {
      return;
    }
    const indicator = document.createElement("div");
    indicator.className = "acw-message acw-message-agent acw-typing";
    indicator.setAttribute("aria-live", "polite");

    const bubble = document.createElement("div");
    bubble.className = "acw-bubble";
    bubble.innerHTML =
      '<span class="acw-typing-dots"><span class="acw-typing-dot"></span><span class="acw-typing-dot"></span><span class="acw-typing-dot"></span></span>';

    indicator.appendChild(bubble);
    this.messageList.appendChild(indicator);
    this.typingIndicator = indicator;
    this.scrollToBottom({ smooth: true });
  }

  private hideTypingIndicator(): void {
    if (!this.typingIndicator) {
      return;
    }
    this.typingIndicator.remove();
    this.typingIndicator = undefined;
  }

  private clearStreamingTimers({ finalize = false }: { finalize?: boolean } = {}): void {
    if (this.activeStreamTimeout !== null) {
      window.clearTimeout(this.activeStreamTimeout);
      this.activeStreamTimeout = null;
    }
    if (this.activeStreamInterval !== null) {
      window.clearInterval(this.activeStreamInterval);
      this.activeStreamInterval = null;
    }
    if (
      finalize &&
      this.currentStreamingMessage &&
      this.streamingMessageBubble &&
      this.streamingMessageTimestamp
    ) {
      this.streamingMessageBubble.textContent = this.currentStreamingMessage.content;
      this.streamingMessageTimestamp.textContent = formatTime(
        this.currentStreamingMessage.timestamp,
        this.options.locale
      );
      if (this.streamingMessageWrapper) {
        this.streamingMessageWrapper.classList.remove("acw-message-streaming");
      }
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
  }

  private streamAgentMessage(content: string): void {
    if (!this.messageList) {
      return;
    }

    const timestamp = new Date();
    const message: ChatMessage = {
      role: "agent",
      content,
      timestamp,
    };
    this.messages.push(message);

    const elements = this.appendMessageElement({ ...message, content: "" }, { autoScroll: false });
    if (!elements) {
      return;
    }

    const { bubble, timestamp: metadata, wrapper } = elements;
    wrapper.classList.add("acw-message-streaming");
    this.streamingMessageBubble = bubble;
    this.streamingMessageTimestamp = metadata;
    this.streamingMessageWrapper = wrapper;
    this.currentStreamingMessage = message;
    metadata.textContent = "";
    this.scrollToBottom({ smooth: true });

    const characters = Array.from(content);
    let index = 0;
    const chunkSize = characters.length > 120 ? 3 : characters.length > 60 ? 2 : 1;
    const intervalMs = characters.length > 80 ? 20 : 35;

    const flush = (): void => {
      if (!this.streamingMessageBubble) {
        return;
      }
      index = Math.min(characters.length, index + chunkSize);
      this.streamingMessageBubble.textContent = characters.slice(0, index).join("");
      this.scrollToBottom({ smooth: true });
      if (index >= characters.length) {
        this.clearStreamingTimers({ finalize: true });
      }
    };

    this.activeStreamInterval = window.setInterval(flush, intervalMs);
    flush();
  }

  private simulateAgentReply(): void {
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
      this.hideTypingIndicator();
      this.streamAgentMessage(response);
    }, delay);
  }

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
    if (!this.teaserBubble) {
      return;
    }
    this.teaserBubble.style.display = "inline-flex";
    this.teaserBubble.classList.add("acw-visible");
  }

  private hideTeaser(): void {
    this.stopTeaserCountdown();
    if (!this.teaserBubble) {
      return;
    }
    this.teaserBubble.classList.remove("acw-visible");
    this.teaserBubble.style.display = "none";
  }
}

export function init(options: DeepPartial<ChatWidgetOptions> = {}): ChatWidget {
  const widget = new ChatWidget(options);
  widget.mount();
  return widget;
}

export default {
  ChatWidget,
  init,
};
