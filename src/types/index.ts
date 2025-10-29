/**
 * Type definitions for the ALBERT | AI Chat Widget
 * 
 * This module contains all TypeScript interfaces and types used throughout
 * the chat widget application. These types define the structure of messages,
 * configuration options, service responses, and internal state.
 */

/**
 * Represents the role of a chat participant
 */
export type ChatRole = "user" | "agent";

/**
 * Configuration for a footer link in the chat widget
 */
export interface ChatFooterLink {
  /** The visible text of the link */
  label: string;
  /** The URL the link points to */
  href: string;
  /** Target attribute for the link (e.g., "_blank" for new window) */
  target?: string;
  /** Rel attribute for the link (e.g., "noopener noreferrer") */
  rel?: string;
}

/**
 * Theme configuration for the chat widget's visual appearance
 */
export interface ChatWidgetTheme {
  /** Primary font family for the widget */
  fontFamily: string;
  /** Default text color for generic body content */
  bodyTextColor: string;
  /** Background color for the chat window surface */
  chatBackgroundColor: string;
  /** Border color for the chat window surface */
  chatBorderColor: string;
  /** Shadow color used for the chat window */
  chatShadowColor: string;
  /** Background color for the header section */
  headerBackgroundColor: string;
  /** Border color separating the header from the body */
  headerBorderColor: string;
  /** Text color for the header title */
  headerTitleColor: string;
  /** Text color for the header subtitle */
  headerSubtitleColor: string;
  /** Color for the header icon */
  headerIconColor: string;
  /** Color for header action icons (close/reload) */
  headerActionIconColor: string;
  /** Background color on hover for header action buttons */
  headerActionHoverBackgroundColor: string;
  /** Outline color for header action buttons on focus */
  headerActionFocusOutlineColor: string;
  /** Background color for the chat body content */
  bodyBackgroundColor: string;
  /** Text color for the empty state message */
  emptyStateTextColor: string;
  /** Text color for tool placeholders */
  toolPlaceholderTextColor: string;
  /** Text color for message timestamps */
  timestampColor: string;
  /** Background color for inline code and preformatted blocks */
  messageCodeBackgroundColor: string;
  /** Text color for inline code and preformatted blocks */
  messageCodeTextColor: string;
  /** Divider color used inside message content */
  messageDividerColor: string;
  /** Link color inside message bubbles */
  messageLinkColor: string;
  /** Background color for failed message bubbles */
  failedMessageBackgroundColor: string;
  /** Border color for failed message bubbles */
  failedMessageBorderColor: string;
  /** Timestamp color for failed message bubbles */
  failedMessageTimestampColor: string;
  /** Background color for user message bubbles */
  userMessageBackgroundColor: string;
  /** Text color for user message bubbles */
  userMessageTextColor: string;
  /** Background color for agent message bubbles */
  agentMessageBackgroundColor: string;
  /** Text color for agent message bubbles */
  agentMessageTextColor: string;
  /** Scrollbar thumb color */
  scrollbarThumbColor: string;
  /** Scrollbar thumb hover color */
  scrollbarThumbHoverColor: string;
  /** Background color for the input area */
  inputBackgroundColor: string;
  /** Text color inside the input field */
  inputTextColor: string;
  /** Placeholder text color inside the input field */
  inputPlaceholderColor: string;
  /** Border color for the input field */
  inputBorderColor: string;
  /** Border color for the input field when focused */
  inputFocusBorderColor: string;
  /** Shadow color for the input field when focused */
  inputFocusShadowColor: string;
  /** Divider color between transcript and input */
  inputDividerColor: string;
  /** Background color for the send button */
  sendButtonBackgroundColor: string;
  /** Text/icon color for the send button */
  sendButtonTextColor: string;
  /** Shadow color for the send button hover state */
  sendButtonHoverShadowColor: string;
  /** Outline color for the send button focus state */
  sendButtonFocusOutlineColor: string;
  /** Background color for the launcher button */
  launcherBackgroundColor: string;
  /** Text/icon color for the launcher button */
  launcherTextColor: string;
  /** Shadow color for the launcher button default state */
  launcherShadowColor: string;
  /** Shadow color for the launcher button hover state */
  launcherHoverShadowColor: string;
  /** Outline color for the launcher button focus state */
  launcherFocusOutlineColor: string;
  /** Background color for the teaser bubble */
  teaserBackgroundColor: string;
  /** Text color for the teaser bubble */
  teaserTextColor: string;
  /** Border color for the teaser bubble */
  teaserBorderColor: string;
  /** Shadow color for the teaser bubble */
  teaserShadowColor: string;
  /** Background color for the footer container */
  footerBackgroundColor: string;
  /** Text color for footer links */
  footerLinkColor: string;
  /** Hover color for footer links */
  footerLinkHoverColor: string;
  /** Background color for the consent accept button */
  consentAcceptBackgroundColor: string;
  /** Text color for the consent accept button */
  consentAcceptTextColor: string;
  /** Shadow color for the consent accept hover state */
  consentAcceptHoverShadowColor: string;
  /** Outline color for the consent accept focus state */
  consentAcceptFocusOutlineColor: string;
  /** Text color for the consent decline button */
  consentDeclineTextColor: string;
  /** Border color for the consent decline button */
  consentDeclineBorderColor: string;
  /** Background color for the consent decline hover state */
  consentDeclineHoverBackgroundColor: string;
  /** Outline color for the consent decline focus state */
  consentDeclineFocusOutlineColor: string;
  /** Text color for disclaimers */
  disclaimerTextColor: string;
  /** Whether the chat window outer border is visible */
  showChatBorder: boolean;
  /** Whether the header bottom divider is visible */
  showHeaderBorder: boolean;
  /** Whether the input textarea border is visible */
  showInputBorder: boolean;
  /** Whether the footer top divider is visible */
  showFooterBorder: boolean;
  /** Whether borders around the teaser bubble are visible */
  showTeaserBorder: boolean;
  /** Whether the divider between transcript and input area is shown */
  showInputDivider: boolean;
  /** Whether the message list scrollbar is visible */
  showScrollbar: boolean;
}

/**
 * Localized text strings for the chat widget UI
 */
export interface ChatWidgetTexts {
  /** Text shown on the launcher button */
  launcherLabel: string;
  /** ARIA label for the launcher button (accessibility) */
  launcherAriaLabel: string;
  /** Text shown in the teaser bubble before opening chat */
  teaserText: string;
  /** Title shown in the chat header */
  headerTitle: string;
  /** Subtitle shown in the chat header */
  headerSubtitle: string;
  /** Label for the send button */
  sendButtonLabel: string;
  /** Label for the close button */
  closeLabel: string;
  /** Label for the reload/restart button */
  reloadLabel: string;
  /** Initial message from the agent when chat starts */
  initialMessage: string;
  /** Privacy consent prompt text */
  consentPrompt: string;
  /** Label for accepting privacy consent */
  consentAcceptLabel: string;
  /** Label for declining privacy consent */
  consentDeclineLabel: string;
  /** Message shown after declining consent */
  consentDeclinedMessage: string;
  /** Tooltip shown when trying to send while agent is responding */
  sendWhileStreamingTooltip: string;
  /** Tooltip shown when trying to send before giving consent */
  sendWhileConsentPendingTooltip: string;
  /** Tooltip shown when trying to send after chat was terminated */
  sendWhileTerminatedTooltip: string;
  /** Placeholder text shown during tool calls */
  toolCallPlaceholder: string;
}

/**
 * Icon configuration for the chat widget
 */
export interface ChatWidgetIcons {
  /** Icon shown in the chat header */
  headerIcon: string;
  /** Icon for the close button */
  closeIcon: string;
  /** Icon for the reload button */
  reloadIcon: string;
  /** Icon for the launcher button */
  launcherIcon: string;
  /** Icon for the send button */
  sendIcon: string;
}

/**
 * Dimension configuration for the chat widget
 */
export interface ChatWidgetDimensions {
  /** Width as percentage of viewport */
  widthPercent: number;
  /** Minimum width in pixels */
  minWidthPx: number;
  /** Height as percentage of viewport */
  heightPercent: number;
  /** Minimum height in pixels */
  minHeightPx: number;
}

/**
 * Configuration for backend chat service integration
 */
export interface ChatServiceConfig {
  /** Base URL of the chat service API */
  endpoint: string;
  /** Optional preset configuration name */
  preset?: string;
  /** Polling interval in milliseconds for updates */
  pollIntervalMs?: number;
  /** LocalStorage key for persisting session ID */
  storageKey?: string;
}

/**
 * Options for displaying a disclaimer in the chat
 */
export interface ChatDisclaimerOptions {
  /** Whether to show the disclaimer */
  enabled: boolean;
  /** Disclaimer text content */
  text: string;
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional inline styles */
  styles?: Record<string, string>;
}

/**
 * Options for the welcome message display
 */
export interface ChatWelcomeMessageOptions {
  /** Whether to show the welcome message */
  enabled: boolean;
  /** Welcome message text (uses initialMessage if not specified) */
  text?: string;
  /** Optional CSS class name for styling */
  className?: string;
  /** Optional inline styles */
  styles?: Record<string, string>;
}

/**
 * Complete configuration options for the chat widget
 */
export interface ChatWidgetOptions {
  /** Target element or selector where the widget should be mounted */
  target?: HTMLElement | string;
  /** Visual theme configuration */
  theme: ChatWidgetTheme;
  /** Localized UI text strings */
  texts: ChatWidgetTexts;
  /** Icon configuration */
  icons: ChatWidgetIcons;
  /** Backend service configuration (optional for mock mode) */
  serviceConfig?: ChatServiceConfig;
  /** Welcome message configuration */
  welcomeMessage?: ChatWelcomeMessageOptions;
  /** Footer links configuration */
  footerLinks: ChatFooterLink[];
  /** Widget dimension settings */
  dimensions: ChatWidgetDimensions;
  /** Delay in milliseconds before showing teaser */
  teaserDelayMs: number;
  /** Array of mock responses for demo mode */
  mockResponses: string[];
  /** Min and max delay for mock responses [min, max] */
  mockResponseDelayMs: [number, number];
  /** Z-index for the widget container */
  zIndex: number;
  /** Locale string for date/time formatting */
  locale: string;
  /** Whether to require privacy consent before chat */
  requirePrivacyConsent: boolean;
  /** Disclaimer configuration */
  disclaimer: ChatDisclaimerOptions;
}

/**
 * Represents a single message in the chat conversation
 */
export interface ChatMessage {
  /** Role of the message sender */
  role: ChatRole;
  /** Message content (may contain markdown) */
  content: string;
  /** Timestamp when the message was created */
  timestamp: Date;
  /** Status of the message (for user messages) */
  status?: "pending" | "sent" | "failed";
  /** Whether this message exists only locally (not sent to server) */
  localOnly?: boolean;
  /** Whether this is a placeholder for a tool call */
  isToolPlaceholder?: boolean;
  /** Whether this message represents a tool call */
  isToolCall?: boolean;
  /** Whether this is a temporary streaming placeholder bubble */
  isStreamingPlaceholder?: boolean;
}

/**
 * Internal service configuration with resolved defaults
 */
export interface ResolvedChatServiceConfig extends ChatServiceConfig {
  pollIntervalMs: number;
  storageKey: string;
}

/**
 * Offsets for incremental polling from the service
 */
export interface ChatServiceOffsets {
  /** Offset in the history array */
  history: number;
  /** Offset in the current text stream */
  text: number;
}

/**
 * Entry in the chat history from the service
 */
export interface ChatServiceHistoryEntry {
  /** Role of the participant */
  role: string;
  /** Message text content */
  text?: string;
  /** ISO timestamp string */
  dateTime?: string;
  /** Whether this is a tool call */
  isToolCall?: boolean;
}

/**
 * Response from the chat service info endpoint
 */
export interface ChatServiceInfoResponse {
  /** Chat session ID */
  id?: string;
  /** Array of chat history entries */
  history?: ChatServiceHistoryEntry[];
  /** Current polling offsets */
  offsets?: ChatServiceOffsets;
  /** Whether the agent is currently running */
  running?: boolean;
}

/**
 * Response from the chat service initialization
 */
export interface ChatServiceInitResponse {
  /** New chat session ID */
  id: string;
}

/**
 * References to DOM elements for a rendered message
 */
export interface MessageElementRefs {
  /** The wrapper div containing the entire message */
  wrapper: HTMLDivElement;
  /** The bubble div containing the message content */
  bubble: HTMLDivElement;
  /** The span element showing the timestamp */
  timestamp: HTMLSpanElement;
}

/**
 * Utility type for deep partial objects (all properties optional recursively)
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<U>
    : T[K] extends object
    ? DeepPartial<T[K]>
    : T[K];
};
