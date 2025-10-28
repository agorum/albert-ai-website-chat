/**
 * Default configuration for the ALBERT | AI Chat Widget
 *
 * This module defines all default values for the chat widget configuration.
 * These defaults provide a complete working configuration that can be
 * partially overridden by user-provided options.
 */

import { ChatWidgetOptions } from '../types';

/**
 * Complete default configuration for the chat widget
 */
export const defaultOptions: ChatWidgetOptions = {
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
    launcherLabel: "Chat with ALBERT | AI",
    launcherAriaLabel: "Open ALBERT | AI chat",
    teaserText: "Need assistance? ALBERT | AI is here to help.",
    headerTitle: "ALBERT | AI Assistant",
    headerSubtitle: "We are ready to support you",
    sendButtonLabel: "Send",
    closeLabel: "Close",
    reloadLabel: "Restart",
    initialMessage: "Hello! I am ALBERT | AI. How can I support you today?",
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

/**
 * Default placeholder text for the input field
 */
export const DEFAULT_INPUT_PLACEHOLDER = "Your message …";
