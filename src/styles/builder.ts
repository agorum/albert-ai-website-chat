/**
 * CSS Style Builder for the Chat Widget
 * 
 * This module generates the complete CSS stylesheet for the chat widget,
 * using CSS custom properties for theming and maintaining all styles
 * in a single, maintainable location.
 */

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
      inset: auto var(--acw-spacing-lg) var(--acw-spacing-lg) auto;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: var(--acw-spacing-sm);
      z-index: var(--acw-z-index);
      font-family: var(--acw-font-family);
      color: var(--acw-text-color);
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
    
    /* Chat Window */
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
    
    /* Header */
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
    
    /* Icon Buttons */
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
    
    /* Body and Messages */
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
    
    /* Empty State */
    .acw-empty-state {
      margin: auto;
      color: rgba(15, 23, 42, 0.6);
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
      background: var(--acw-user-message-color);
      color: var(--acw-user-text-color);
      border-bottom-right-radius: 4px;
    }
    .acw-message-agent .acw-bubble {
      background: var(--acw-agent-message-color);
      color: var(--acw-agent-text-color);
      border-bottom-left-radius: 4px;
    }
    .acw-tool-indicator .acw-bubble,
    .acw-tool-placeholder .acw-bubble {
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
    
    /* Disclaimer */
    .acw-disclaimer {
      font-size: 0.75rem;
      color: rgba(15, 23, 42, 0.55);
      margin: var(--acw-spacing-xs) auto 0 0;
      padding: 0;
      align-self: flex-start;
      max-width: 85%;
      line-height: 1.3;
    }
    
    /* Input Area */
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
    .acw-send-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(37, 99, 235, 0.25);
    }
    .acw-send-button:focus-visible {
      outline: 2px solid var(--acw-primary-color);
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
    
    /* Footer Links */
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
    
    /* Scrollbar Styling */
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
    
    /* Teaser Bubble */
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
    
    /* Typing Indicator */
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
      min-height: 32px;
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
 * Generates CSS custom properties (variables) for theming.
 * These variables are applied to the host element and can be
 * dynamically updated to change the widget's appearance.
 * 
 * @param theme - The theme configuration object
 * @param zIndex - The z-index value for the widget
 * @returns Object with CSS variable names and values
 */
export function generateThemeVariables(theme: any, zIndex: number): Record<string, string | number> {
  return {
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
    "--acw-z-index": String(zIndex),
    "--acw-chat-width": "360px",
    "--acw-chat-height": "520px",
  };
}
