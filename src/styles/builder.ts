/**
 * CSS Style Builder for the Chat Widget
 * 
 * This module generates the complete CSS stylesheet for the chat widget,
 * using CSS custom properties for theming and maintaining all styles
 * in a single, maintainable location.
 */
import type { ChatWidgetTheme } from "../types";

/**
 * Builds the complete CSS stylesheet for the chat widget.
 * Uses CSS custom properties (variables) for dynamic theming.
 * 
 * @returns The complete CSS stylesheet as a string
 */
export function buildStyles(): string {
  return `
    :host {
      all: initial;
      font-family: var(--acw-font-family);
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    
    /* Container and Layout */
    .acw-container {
      position: fixed;
      top: auto;
      left: auto;
      right: var(--acw-position-right, var(--acw-spacing-lg));
      bottom: var(--acw-position-bottom, var(--acw-spacing-lg));
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--acw-spacing-sm);
      z-index: var(--acw-z-index);
      font-family: var(--acw-font-family);
      color: var(--acw-body-text-color);
    }
    
    /* Launcher Button */
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
      box-shadow: 0 10px 30px var(--acw-launcher-shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease,
        color 0.2s ease;
      font-size: 0.95rem;
    }
    .acw-launcher:focus-visible {
      outline: 2px solid var(--acw-launcher-focus-outline);
      outline-offset: 4px;
    }
    .acw-launcher:hover {
      transform: translateY(-1px);
      background: var(--acw-launcher-hover-background);
      color: var(--acw-launcher-hover-text-color);
      box-shadow: 0 12px 32px var(--acw-launcher-hover-shadow);
    }
    .acw-launcher-icon {
      font-size: 1.1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Chat Window */
    .acw-chat {
      position: relative;
      display: flex;
      flex-direction: column;
      width: var(--acw-chat-width);
      height: var(--acw-chat-height);
      max-height: calc(100vh - 120px);
      background: var(--acw-chat-background);
      border-radius: var(--acw-radius-lg);
      box-shadow: 0 20px 45px var(--acw-chat-shadow-color);
      opacity: 0;
      transform: translateY(12px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.25s ease, transform 0.25s ease;
      border: var(--acw-chat-border-width) solid var(--acw-chat-border-color);
      overflow: hidden;
    }
    .acw-chat.acw-open {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: auto;
    }
    
    /* Header */
    .acw-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--acw-spacing-md);
      background: var(--acw-header-background);
      border-bottom: var(--acw-header-border-width) solid var(--acw-header-border-color);
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
      color: var(--acw-header-icon-color);
    }
    .acw-header-texts {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .acw-header-title {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--acw-header-title-color);
    }
    .acw-header-subtitle {
      font-size: 0.85rem;
      color: var(--acw-header-subtitle-color);
    }
    .acw-header-actions {
      display: inline-flex;
      gap: var(--acw-spacing-xs);
      align-items: center;
    }
    
    /* Icon Buttons */
    .acw-icon-button {
      appearance: none;
      border: none;
      background: transparent;
      border-radius: var(--acw-radius-sm);
      padding: var(--acw-spacing-xs);
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--acw-header-action-icon-color);
      transition: background 0.2s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
    .acw-icon-button:hover {
      background: var(--acw-header-action-hover-background);
    }
    .acw-icon-button:focus-visible {
      outline: 2px solid var(--acw-header-action-focus-outline);
      outline-offset: 2px;
    }
    
    /* Body and Messages */
    .acw-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 0 var(--acw-spacing-md);
      background: var(--acw-body-background);
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
      scrollbar-color: var(--acw-scrollbar-thumb-color) transparent;
      scrollbar-gutter: stable both-edges;
    }
    
    /* Empty State */
    .acw-empty-state {
      margin: auto;
      color: var(--acw-empty-state-color);
      font-size: 0.9rem;
      text-align: center;
      padding: var(--acw-spacing-md);
    }
    
    /* Messages */
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
    
    /* Message Bubbles */
    .acw-bubble {
      border-radius: var(--acw-radius-md);
      padding: var(--acw-spacing-sm) var(--acw-spacing-md);
      line-height: 1.45;
      word-break: break-word;
      white-space: normal;
    }
    .acw-message-user .acw-bubble {
      background: var(--acw-user-message-background);
      color: var(--acw-user-message-text-color);
      border-bottom-right-radius: 4px;
    }
    .acw-message-agent .acw-bubble {
      background: var(--acw-agent-message-background);
      color: var(--acw-agent-message-text-color);
      border-bottom-left-radius: 4px;
    }
    .acw-bubble.acw-agent-fixed {
      padding: var(--acw-spacing-sm) var(--acw-spacing-md);
      white-space: normal;
    }
    .acw-tool-indicator .acw-bubble,
    .acw-tool-placeholder .acw-bubble {
      font-style: italic;
      color: var(--acw-tool-placeholder-color);
    }
    .acw-message-pending .acw-bubble {
      opacity: 0.85;
    }
    .acw-message-failed .acw-bubble {
      background: var(--acw-failed-message-background);
      color: var(--acw-body-text-color);
      border: 1px solid var(--acw-failed-message-border);
    }
    .acw-message-failed .acw-timestamp {
      color: var(--acw-failed-message-timestamp);
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
      color: var(--acw-timestamp-color);
    }
    
    /* Message Content Styling */
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
      background: var(--acw-message-code-background);
      padding: 0.1em 0.35em;
      border-radius: 4px;
      font-size: 0.9em;
      color: var(--acw-message-code-text-color);
    }
    .acw-bubble pre {
      background: var(--acw-message-code-background);
      padding: 0.75em;
      border-radius: 8px;
      overflow-x: auto;
      font-size: 0.85em;
      margin: 0 0 0.75em 0;
      color: var(--acw-message-code-text-color);
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
      color: var(--acw-message-link-color);
      text-decoration: underline;
    }
    .acw-bubble hr {
      border: none;
      border-top: 1px solid var(--acw-message-divider-color);
      margin: 0.75em 0;
    }
    
    /* Disclaimer */
    .acw-disclaimer {
      font-size: 0.75rem;
      color: var(--acw-disclaimer-text-color);
      margin: var(--acw-spacing-xs) auto 0 0;
      padding: 0;
      align-self: flex-start;
      max-width: 85%;
      line-height: 1.3;
    }
    
    /* Input Area */
    .acw-input-area {
      border-top: var(--acw-input-divider-width) solid var(--acw-input-divider-color);
      padding: var(--acw-spacing-md);
      display: flex;
      flex-direction: column;
      gap: var(--acw-spacing-sm);
      background: var(--acw-input-background);
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
      border: var(--acw-input-border-width) solid var(--acw-input-border-color);
      font: inherit;
      color: var(--acw-input-text-color);
      background: var(--acw-input-background);
      line-height: 1.45;
      min-height: 44px;
      max-height: calc(1.45em * 5 + var(--acw-spacing-sm) * 2);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .acw-textarea::placeholder {
      color: var(--acw-input-placeholder-color);
    }
    .acw-textarea:focus-visible {
      outline: none;
      border-color: var(--acw-input-focus-border-color);
      box-shadow: 0 0 0 4px var(--acw-input-focus-shadow-color);
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
      box-shadow: 0 10px 24px var(--acw-send-button-shadow);
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease,
        color 0.2s ease;
    }
    .acw-send-button:hover:not(:disabled) {
      transform: translateY(-1px);
      background: var(--acw-send-button-hover-background);
      color: var(--acw-send-button-hover-text-color);
      box-shadow: 0 10px 24px var(--acw-send-button-hover-shadow);
    }
    .acw-send-button:focus-visible {
      outline: 2px solid var(--acw-send-button-focus-outline);
      outline-offset: 2px;
    }
    .acw-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .acw-send-icon {
      font-size: 1.15rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    /* Icon Images */
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
      width: 2.2rem;
      height: 2.2rem;
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
    
    /* Footer Links */
    .acw-footer-links {
      padding: var(--acw-spacing-sm) var(--acw-spacing-md);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: var(--acw-spacing-sm);
      border-top: var(--acw-footer-border-width) solid var(--acw-header-border-color);
      background: var(--acw-footer-background);
    }
    .acw-footer-link {
      color: var(--acw-footer-link-color);
      text-decoration: none;
      font-size: 0.8rem;
    }
    .acw-footer-link:hover {
      color: var(--acw-footer-link-hover-color);
      text-decoration: underline;
    }
    
    /* Scrollbar Styling */
    .acw-messages::-webkit-scrollbar {
      width: 8px;
    }
    .acw-messages::-webkit-scrollbar-track {
      background: transparent;
    }
    .acw-messages::-webkit-scrollbar-thumb {
      background-color: var(--acw-scrollbar-thumb-color);
      border-radius: 999px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .acw-messages::-webkit-scrollbar-thumb:hover {
      background-color: var(--acw-scrollbar-thumb-hover-color);
    }
    :host([data-acw-hide-scrollbar]) .acw-messages {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    :host([data-acw-hide-scrollbar]) .acw-messages::-webkit-scrollbar {
      display: none;
    }
    
    /* Teaser Bubble */
    .acw-teaser {
      position: relative;
      display: none;
      align-items: center;
      gap: var(--acw-spacing-xs);
      padding: var(--acw-spacing-sm) var(--acw-spacing-md);
      border-radius: var(--acw-radius-lg);
      background: var(--acw-teaser-background);
      border: var(--acw-teaser-border-width) solid var(--acw-teaser-border-color);
      box-shadow: 0 12px 30px var(--acw-teaser-shadow-color);
      color: var(--acw-teaser-text-color);
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
      background: var(--acw-teaser-background);
      border-left: var(--acw-teaser-border-width) solid var(--acw-teaser-border-color);
      border-bottom: var(--acw-teaser-border-width) solid var(--acw-teaser-border-color);
      transform: rotate(45deg);
      z-index: -1;
    }
    .acw-teaser.acw-visible {
      display: inline-flex;
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    
    /* Typing Indicator */
    .acw-typing {
      align-self: flex-start;
    }
    .acw-bubble-typing {
      display: block;
      position: relative;
      background: var(--acw-agent-message-background);
      color: var(--acw-agent-message-text-color);
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
      background: var(--acw-agent-message-text-color);
      animation: acw-typing-pulse 1s ease-in-out infinite;
      opacity: 0.75;
      vertical-align: middle;
      transform: translateY(-2px);
    }
    .acw-typing-placeholder {
      display: inline-block;
      min-width: 4px;
      height: 1em;
    }
    /* Consent UI */
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
      transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease,
        border-color 0.2s ease, color 0.2s ease;
    }
    .acw-consent-button:focus-visible {
      outline: 2px solid transparent;
      outline-offset: 2px;
    }
    .acw-consent-accept {
      background: var(--acw-consent-accept-background);
      color: var(--acw-consent-accept-text-color);
      box-shadow: 0 10px 24px var(--acw-consent-accept-shadow);
    }
    .acw-consent-accept:hover {
      transform: translateY(-1px);
      background: var(--acw-consent-accept-hover-background);
      color: var(--acw-consent-accept-hover-text-color);
      box-shadow: 0 10px 24px var(--acw-consent-accept-hover-shadow);
    }
    .acw-consent-accept:focus-visible {
      outline: 2px solid var(--acw-consent-accept-focus-outline);
    }
    .acw-consent-decline {
      background: var(--acw-consent-decline-background);
      color: var(--acw-consent-decline-text-color);
      border-color: var(--acw-consent-decline-border-color);
      box-shadow: 0 10px 24px var(--acw-consent-decline-shadow);
    }
    .acw-consent-decline:hover {
      background: var(--acw-consent-decline-hover-background);
      color: var(--acw-consent-decline-hover-text-color);
      transform: translateY(-1px);
      box-shadow: 0 10px 24px var(--acw-consent-decline-hover-shadow);
    }
    .acw-consent-decline:focus-visible {
      outline: 2px solid var(--acw-consent-decline-focus-outline);
    }
    
    /* Animations */
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
    
    /* Mobile Responsive */
    @media (max-width: 768px) {
      .acw-container {
        top: auto;
        right: var(--acw-position-right, var(--acw-spacing-md));
        bottom: var(--acw-position-bottom, var(--acw-spacing-md));
        left: var(--acw-position-right, var(--acw-spacing-md));
        width: calc(100vw - (var(--acw-position-right, var(--acw-spacing-md)) * 2));
        align-items: flex-end;
      }
      .acw-chat {
        width: 100%;
        border-radius: var(--acw-radius-md);
      }
      .acw-container.acw-container-open {
        inset: 0;
        width: 100vw;
        height: 100vh;
        gap: 0;
        align-items: stretch;
        justify-content: flex-start;
        background: var(--acw-chat-background);
        padding-bottom: env(safe-area-inset-bottom, 0px);
        overflow: hidden;
      }
      .acw-container.acw-container-open .acw-chat {
        width: 100%;
        height: calc(100% - env(safe-area-inset-bottom, 0px));
        max-height: none;
        border-radius: 0;
        border: none;
        box-shadow: none;
      }
      .acw-container.acw-container-open .acw-launcher,
      .acw-container.acw-container-open .acw-teaser {
        display: none;
      }
    }
  `;
}

/**
 * Generates CSS custom properties (variables) for theming.
 * These variables are applied to the host element and can be
 * dynamically updated to change the widget's appearance.
 * 
 * @param theme - The theme configuration object
 * @param zIndex - The z-index value for the widget
 * @returns Object with CSS variable names and values
 */
export function generateThemeVariables(theme: ChatWidgetTheme, zIndex: number): Record<string, string | number> {
  return {
    "--acw-font-family": theme.fontFamily,
    "--acw-body-text-color": theme.bodyTextColor,
    "--acw-chat-background": theme.chatBackgroundColor,
    "--acw-chat-border-color": theme.chatBorderColor,
    "--acw-chat-shadow-color": theme.chatShadowColor,
    "--acw-header-background": theme.headerBackgroundColor,
    "--acw-header-border-color": theme.headerBorderColor,
    "--acw-header-title-color": theme.headerTitleColor,
    "--acw-header-subtitle-color": theme.headerSubtitleColor,
    "--acw-header-icon-color": theme.headerIconColor,
    "--acw-header-action-icon-color": theme.headerActionIconColor,
    "--acw-header-action-hover-background": theme.headerActionHoverBackgroundColor,
    "--acw-header-action-focus-outline": theme.headerActionFocusOutlineColor,
    "--acw-body-background": theme.bodyBackgroundColor,
    "--acw-empty-state-color": theme.emptyStateTextColor,
    "--acw-tool-placeholder-color": theme.toolPlaceholderTextColor,
    "--acw-timestamp-color": theme.timestampColor,
    "--acw-message-code-background": theme.messageCodeBackgroundColor,
    "--acw-message-code-text-color": theme.messageCodeTextColor,
    "--acw-message-divider-color": theme.messageDividerColor,
    "--acw-message-link-color": theme.messageLinkColor,
    "--acw-failed-message-background": theme.failedMessageBackgroundColor,
    "--acw-failed-message-border": theme.failedMessageBorderColor,
    "--acw-failed-message-timestamp": theme.failedMessageTimestampColor,
    "--acw-user-message-background": theme.userMessageBackgroundColor,
    "--acw-user-message-text-color": theme.userMessageTextColor,
    "--acw-agent-message-background": theme.agentMessageBackgroundColor,
    "--acw-agent-message-text-color": theme.agentMessageTextColor,
    "--acw-scrollbar-thumb-color": theme.scrollbarThumbColor,
    "--acw-scrollbar-thumb-hover-color": theme.scrollbarThumbHoverColor,
    "--acw-input-background": theme.inputBackgroundColor,
    "--acw-input-text-color": theme.inputTextColor,
    "--acw-input-placeholder-color": theme.inputPlaceholderColor,
    "--acw-input-border-color": theme.inputBorderColor,
    "--acw-input-focus-border-color": theme.inputFocusBorderColor,
    "--acw-input-focus-shadow-color": theme.inputFocusShadowColor,
    "--acw-input-divider-color": theme.inputDividerColor,
    "--acw-send-button-background": theme.sendButtonBackgroundColor,
    "--acw-send-button-text-color": theme.sendButtonTextColor,
    "--acw-send-button-shadow": theme.sendButtonShadowColor,
    "--acw-send-button-hover-background": theme.sendButtonHoverBackgroundColor,
    "--acw-send-button-hover-text-color": theme.sendButtonHoverTextColor,
    "--acw-send-button-hover-shadow": theme.sendButtonHoverShadowColor,
    "--acw-send-button-focus-outline": theme.sendButtonFocusOutlineColor,
    "--acw-launcher-background": theme.launcherBackgroundColor,
    "--acw-launcher-text-color": theme.launcherTextColor,
    "--acw-launcher-shadow": theme.launcherShadowColor,
    "--acw-launcher-hover-shadow": theme.launcherHoverShadowColor,
    "--acw-launcher-hover-background": theme.launcherHoverBackgroundColor,
    "--acw-launcher-hover-text-color": theme.launcherHoverTextColor,
    "--acw-launcher-focus-outline": theme.launcherFocusOutlineColor,
    "--acw-teaser-background": theme.teaserBackgroundColor,
    "--acw-teaser-text-color": theme.teaserTextColor,
    "--acw-teaser-border-color": theme.teaserBorderColor,
    "--acw-teaser-shadow-color": theme.teaserShadowColor,
    "--acw-footer-background": theme.footerBackgroundColor,
    "--acw-footer-link-color": theme.footerLinkColor,
    "--acw-footer-link-hover-color": theme.footerLinkHoverColor,
    "--acw-consent-accept-background": theme.consentAcceptBackgroundColor,
    "--acw-consent-accept-text-color": theme.consentAcceptTextColor,
    "--acw-consent-accept-shadow": theme.consentAcceptShadowColor,
    "--acw-consent-accept-hover-background": theme.consentAcceptHoverBackgroundColor,
    "--acw-consent-accept-hover-text-color": theme.consentAcceptHoverTextColor,
    "--acw-consent-accept-hover-shadow": theme.consentAcceptHoverShadowColor,
    "--acw-consent-accept-focus-outline": theme.consentAcceptFocusOutlineColor,
    "--acw-consent-decline-text-color": theme.consentDeclineTextColor,
    "--acw-consent-decline-background": theme.consentDeclineBackgroundColor,
    "--acw-consent-decline-border-color": theme.consentDeclineBorderColor,
    "--acw-consent-decline-shadow": theme.consentDeclineShadowColor,
    "--acw-consent-decline-hover-background": theme.consentDeclineHoverBackgroundColor,
    "--acw-consent-decline-hover-text-color": theme.consentDeclineHoverTextColor,
    "--acw-consent-decline-hover-shadow": theme.consentDeclineHoverShadowColor,
    "--acw-consent-decline-focus-outline": theme.consentDeclineFocusOutlineColor,
    "--acw-disclaimer-text-color": theme.disclaimerTextColor,
    "--acw-chat-border-width": theme.showChatBorder ? "1px" : "0",
    "--acw-header-border-width": theme.showHeaderBorder ? "1px" : "0",
    "--acw-input-border-width": theme.showInputBorder ? "1px" : "0",
    "--acw-footer-border-width": theme.showFooterBorder ? "1px" : "0",
    "--acw-teaser-border-width": theme.showTeaserBorder ? "1px" : "0",
    "--acw-input-divider-width": theme.showInputDivider ? "1px" : "0",
    "--acw-spacing-xs": "6px",
    "--acw-spacing-sm": "10px",
    "--acw-spacing-md": "16px",
    "--acw-spacing-lg": "24px",
    "--acw-radius-sm": "6px",
    "--acw-radius-md": "14px",
    "--acw-radius-lg": "20px",
    "--acw-radius-pill": "999px",
    "--acw-z-index": String(zIndex),
    "--acw-chat-width": "360px",
    "--acw-chat-height": "520px",
  };
}
