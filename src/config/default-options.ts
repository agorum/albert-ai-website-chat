/**
 * Default configuration for the ALBERT | AI Chat Widget
 *
 * This module defines all default values for the chat widget configuration.
 * These defaults provide a complete working configuration that can be
 * partially overridden by user-provided options.
 */

import { ChatWidgetOptions } from '../types';

/**
 * Default placeholder text for the input field
 */
export const DEFAULT_INPUT_PLACEHOLDER = "Your message ...";

/**
 * Complete default configuration for the chat widget
 */
export const defaultOptions: ChatWidgetOptions = {
  theme: {
    fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    bodyTextColor: "#0f172a",
    chatBackgroundColor: "#ffffff",
    chatBorderColor: "#e2e8f0",
    chatShadowColor: "rgba(15, 23, 42, 0.2)",
    headerBackgroundColor: "#f8fafc",
    headerBorderColor: "#e2e8f0",
    headerTitleColor: "#0f172a",
    headerSubtitleColor: "rgba(15, 23, 42, 0.7)",
    headerIconColor: "#0f172a",
    headerActionIconColor: "#0f172a",
    headerActionHoverBackgroundColor: "rgba(148, 163, 184, 0.15)",
    headerActionFocusOutlineColor: "#2563eb",
    bodyBackgroundColor: "#ffffff",
    emptyStateTextColor: "rgba(15, 23, 42, 0.6)",
    toolPlaceholderTextColor: "rgba(15, 23, 42, 0.55)",
    timestampColor: "rgba(15, 23, 42, 0.55)",
    messageCodeBackgroundColor: "rgba(15, 23, 42, 0.08)",
    messageCodeTextColor: "#0f172a",
    messageDividerColor: "rgba(148, 163, 184, 0.35)",
    messageLinkColor: "#2563eb",
    failedMessageBackgroundColor: "rgba(239, 68, 68, 0.12)",
    failedMessageBorderColor: "rgba(239, 68, 68, 0.35)",
    failedMessageTimestampColor: "rgba(239, 68, 68, 0.7)",
    userMessageBackgroundColor: "#2563eb",
    userMessageTextColor: "#ffffff",
    agentMessageBackgroundColor: "#f1f5f9",
    agentMessageTextColor: "#0f172a",
    scrollbarThumbColor: "rgba(148, 163, 184, 0.55)",
    scrollbarThumbHoverColor: "rgba(100, 116, 139, 0.75)",
    inputBackgroundColor: "#ffffff",
    inputTextColor: "#0f172a",
    inputPlaceholderColor: "rgba(15, 23, 42, 0.55)",
    inputBorderColor: "#e2e8f0",
    inputFocusBorderColor: "#2563eb",
    inputFocusShadowColor: "rgba(37, 99, 235, 0.15)",
    inputDividerColor: "#e2e8f0",
    sendButtonBackgroundColor: "#2563eb",
    sendButtonTextColor: "#ffffff",
    sendButtonShadowColor: "rgba(37, 99, 235, 0.18)",
    sendButtonHoverBackgroundColor: "#1d4ed8",
    sendButtonHoverTextColor: "#ffffff",
    sendButtonHoverShadowColor: "rgba(37, 99, 235, 0.25)",
    sendButtonFocusOutlineColor: "#2563eb",
    launcherBackgroundColor: "#2563eb",
    launcherTextColor: "#ffffff",
    launcherShadowColor: "rgba(37, 99, 235, 0.25)",
    launcherHoverShadowColor: "rgba(37, 99, 235, 0.35)",
    launcherHoverBackgroundColor: "#1d4ed8",
    launcherHoverTextColor: "#ffffff",
    launcherFocusOutlineColor: "#2563eb",
    teaserBackgroundColor: "#ffffff",
    teaserTextColor: "#0f172a",
    teaserBorderColor: "#e2e8f0",
    teaserShadowColor: "rgba(15, 23, 42, 0.15)",
    footerBackgroundColor: "#f8fafc",
    footerLinkColor: "#2563eb",
    footerLinkHoverColor: "#1d4ed8",
    consentAcceptBackgroundColor: "#2563eb",
    consentAcceptTextColor: "#ffffff",
    consentAcceptShadowColor: "rgba(37, 99, 235, 0.18)",
    consentAcceptHoverBackgroundColor: "#1d4ed8",
    consentAcceptHoverTextColor: "#ffffff",
    consentAcceptHoverShadowColor: "rgba(37, 99, 235, 0.2)",
    consentAcceptFocusOutlineColor: "#2563eb",
    consentDeclineTextColor: "#2563eb",
    consentDeclineBackgroundColor: "transparent",
    consentDeclineBorderColor: "rgba(37, 99, 235, 0.4)",
    consentDeclineShadowColor: "rgba(37, 99, 235, 0.08)",
    consentDeclineHoverBackgroundColor: "rgba(37, 99, 235, 0.08)",
    consentDeclineHoverTextColor: "#2563eb",
    consentDeclineHoverShadowColor: "rgba(37, 99, 235, 0.08)",
    consentDeclineFocusOutlineColor: "#2563eb",
    disclaimerTextColor: "rgba(15, 23, 42, 0.55)",
    showChatBorder: true,
    showHeaderBorder: true,
    showInputBorder: true,
    showFooterBorder: true,
    showTeaserBorder: true,
    showInputDivider: true,
    showScrollbar: true,
  },
  texts: {
    launcherLabel: "Chat with ALBERT | AI",
    launcherOpenLabel: "Close chat",
    launcherAriaLabel: "Open ALBERT | AI chat",
    launcherOpenAriaLabel: "Close ALBERT | AI chat",
    teaserText: "Need assistance? ALBERT | AI is here to help.",
    headerTitle: "ALBERT | AI Assistant",
    headerSubtitle: "We are ready to support you",
    sendButtonLabel: "Send",
    closeLabel: "Close",
    reloadLabel: "Restart",
    initialMessage: "Hello! I am ALBERT | AI. How can I support you today?",
    inputPlaceholder: DEFAULT_INPUT_PLACEHOLDER,
    consentPrompt:
      "Please review our privacy notice and accept to start the conversation.",
    consentAcceptLabel: "Accept",
    consentDeclineLabel: "Decline",
    consentDeclinedMessage:
      "The chat cannot continue without consent. Restart if you change your mind.",
    sendWhileStreamingTooltip: "Please wait until the current response is finished.",
    sendWhileConsentPendingTooltip:
      "You can send messages after accepting the privacy notice.",
    sendWhileTerminatedTooltip: "The chat is inactive. Restart to begin a new session.",
    toolCallPlaceholder: "Let me look that up…",
  },
  icons: {
    headerIcon: "🤖",
    closeIcon: "✕",
    reloadIcon: "⟳",
    launcherIcon: "💬",
    sendIcon: "➤",
  },
  footerLinks: [
    { label: "Privacy Policy", href: "#privacy", target: "_blank" },
    { label: "Imprint", href: "#imprint", target: "_blank" },
  ],
  dimensions: {
    widthPercent: 33,
    minWidthPx: 500,
    heightPercent: 70,
    minHeightPx: 420,
  },
  position: {
    bottomOffsetPx: 24,
    rightOffsetPx: 24,
  },
  teaserDelayMs: 10000,
  mockResponses: [
    "Thanks for your message! I will review it right away.",
    "Could you share a few more details?",
    "Understood. I will summarize the key points for you.",
    "Great! Is there anything else ALBERT | AI can help you with?",
  ],
  mockResponseDelayMs: [1200, 2500],
  zIndex: 9999,
  locale: typeof navigator !== "undefined" ? navigator.language : "en-US",
  requirePrivacyConsent: true,
  serviceConfig: undefined,
  disclaimer: {
    enabled: true,
    text: "Note: ALBERT | AI may be incorrect. Please verify important information.",
    className: "",
    styles: {
      color: "rgba(15, 23, 42, 0.55)",
      fontSize: "0.75rem",
      marginTop: "8px",
    },
  },
  welcomeMessage: {
    enabled: true,
    text: "Hello! ALBERT | AI here—how can I support you today?",
    className: "",
    styles: {},
  },
};

/**
 * Default values for service configuration
 */
export const DEFAULT_SERVICE_POLL_INTERVAL = 250;
export const DEFAULT_STORAGE_KEY = "albert-chat-session-id";
export const MAX_POLL_FAILURES_BEFORE_RESET = 3;
