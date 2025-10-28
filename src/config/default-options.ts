/**
 * Default configuration for the Albert AI Chat Widget
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

/**
 * Default values for service configuration
 */
export const DEFAULT_SERVICE_POLL_INTERVAL = 250;
export const DEFAULT_STORAGE_KEY = "albert-chat-session-id";
export const MAX_POLL_FAILURES_BEFORE_RESET = 3;

/**
 * Default placeholder text for the input field
 */
export const DEFAULT_INPUT_PLACEHOLDER = "Ihre Nachricht …";