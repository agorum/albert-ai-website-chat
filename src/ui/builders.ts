/**
 * UI Element Builders
 * 
 * This module provides functions to create various UI elements
 * for the chat widget, including headers, footers, input areas, etc.
 */

import { ChatWidgetOptions, ChatFooterLink, ChatMessage } from '../types';
import { createIconElement } from '../utils/dom-utils';
import { formatTime } from '../utils';
import { renderMarkdown } from '../renderer/markdown';
import { renderPlainText } from '../utils';
import { DEFAULT_INPUT_PLACEHOLDER } from '../config/default-options';

/**
 * Creates the chat header element
 */
export function createHeader(options: ChatWidgetOptions): {
  element: HTMLElement;
  closeButton: HTMLButtonElement;
  reloadButton: HTMLButtonElement;
} {
  const header = document.createElement("header");
  header.className = "acw-header";

  const details = document.createElement("div");
  details.className = "acw-header-details";

  const icon = createIconElement(options.icons.headerIcon, "acw-header-icon");
  details.appendChild(icon);

  const texts = document.createElement("div");
  texts.className = "acw-header-texts";

  const title = document.createElement("span");
  title.className = "acw-header-title";
  title.textContent = options.texts.headerTitle;
  texts.appendChild(title);

  const subtitle = document.createElement("span");
  subtitle.className = "acw-header-subtitle";
  subtitle.textContent = options.texts.headerSubtitle;
  texts.appendChild(subtitle);

  details.appendChild(texts);
  header.appendChild(details);

  const actions = document.createElement("div");
  actions.className = "acw-header-actions";

  const reloadButton = document.createElement("button");
  reloadButton.type = "button";
  reloadButton.className = "acw-icon-button";
  reloadButton.setAttribute("aria-label", options.texts.reloadLabel);
  reloadButton.title = options.texts.reloadLabel;
  reloadButton.appendChild(
    createIconElement(options.icons.reloadIcon, "acw-icon-button-icon")
  );
  actions.appendChild(reloadButton);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "acw-icon-button";
  closeButton.setAttribute("aria-label", options.texts.closeLabel);
  closeButton.title = options.texts.closeLabel;
  closeButton.appendChild(
    createIconElement(options.icons.closeIcon, "acw-icon-button-icon")
  );
  actions.appendChild(closeButton);

  header.appendChild(actions);

  return { element: header, closeButton, reloadButton };
}

/**
 * Creates the input area element
 */
export function createInputArea(options: ChatWidgetOptions): {
  element: HTMLDivElement;
  inputField: HTMLTextAreaElement;
  sendButton: HTMLButtonElement;
} {
  const wrapper = document.createElement("div");
  wrapper.className = "acw-input-area";

  const row = document.createElement("div");
  row.className = "acw-input-row";

  const inputField = document.createElement("textarea");
  inputField.className = "acw-textarea";
  inputField.rows = 1;
  inputField.setAttribute("maxlength", "1000");
  inputField.setAttribute("aria-label", options.texts.sendButtonLabel);
  inputField.placeholder = options.texts.inputPlaceholder || DEFAULT_INPUT_PLACEHOLDER;

  row.appendChild(inputField);

  const sendButton = document.createElement("button");
  sendButton.type = "button";
  sendButton.className = "acw-send-button";
  sendButton.setAttribute("aria-label", options.texts.sendButtonLabel);
  sendButton.title = options.texts.sendButtonLabel;
  sendButton.appendChild(
    createIconElement(options.icons.sendIcon, "acw-send-icon")
  );

  row.appendChild(sendButton);
  wrapper.appendChild(row);

  return { element: wrapper, inputField, sendButton };
}

/**
 * Creates the footer links element
 */
export function createFooterLinks(links: ChatFooterLink[]): HTMLDivElement {
  const footer = document.createElement("div");
  footer.className = "acw-footer-links";

  if (!links.length) {
    footer.style.display = "none";
    return footer;
  }

  for (const linkConfig of links) {
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
 * Creates the launcher button element
 */
export function createLauncherButton(options: ChatWidgetOptions, instanceId: number): HTMLButtonElement {
  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.className = "acw-launcher";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", `acw-chat-${instanceId}`);
  launcher.setAttribute("aria-label", options.texts.launcherAriaLabel);

  const iconWrapper = createIconElement(
    options.icons.launcherIcon,
    "acw-launcher-icon"
  );
  launcher.appendChild(iconWrapper);

  const label = document.createElement("span");
  label.className = "acw-launcher-label";
  label.textContent = options.texts.launcherLabel;
  launcher.appendChild(label);

  return launcher;
}

/**
 * Creates the teaser bubble element
 */
export function createTeaserBubble(options: ChatWidgetOptions): HTMLButtonElement {
  const teaser = document.createElement("button");
  teaser.type = "button";
  teaser.className = "acw-teaser";
  teaser.setAttribute("aria-label", options.texts.teaserText);
  teaser.textContent = options.texts.teaserText;
  teaser.style.display = "none";
  return teaser;
}

/**
 * Creates a message element
 */
export function createMessageElement(
  message: ChatMessage,
  locale: string
): {
  wrapper: HTMLDivElement;
  bubble: HTMLDivElement;
  timestamp: HTMLSpanElement;
} {
  const wrapper = document.createElement("div");
  wrapper.className = `acw-message acw-message-${message.role}`;

  const bubble = document.createElement("div");
  bubble.className = "acw-bubble";
  
  // Render content based on role
  if (message.role === "agent") {
    bubble.innerHTML = renderMarkdown(message.content);
  } else {
    bubble.innerHTML = renderPlainText(message.content);
  }

  const timestamp = document.createElement("span");
  timestamp.className = "acw-timestamp";
  timestamp.textContent = formatTime(message.timestamp, locale);

  wrapper.appendChild(bubble);
  wrapper.appendChild(timestamp);

  return { wrapper, bubble, timestamp };
}

/**
 * Creates a consent prompt element
 */
export function createConsentPrompt(
  options: ChatWidgetOptions,
  onAccept: () => void,
  onDecline: () => void
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "acw-message acw-message-agent acw-consent";

  const bubble = document.createElement("div");
  bubble.className = "acw-bubble acw-consent-bubble";

  const text = document.createElement("div");
  text.className = "acw-consent-text";
  text.innerHTML = renderMarkdown(options.texts.consentPrompt);
  bubble.appendChild(text);

  const actions = document.createElement("div");
  actions.className = "acw-consent-actions";

  const acceptButton = document.createElement("button");
  acceptButton.type = "button";
  acceptButton.className = "acw-consent-button acw-consent-accept";
  acceptButton.textContent = options.texts.consentAcceptLabel;
  acceptButton.addEventListener("click", onAccept);

  const declineButton = document.createElement("button");
  declineButton.type = "button";
  declineButton.className = "acw-consent-button acw-consent-decline";
  declineButton.textContent = options.texts.consentDeclineLabel;
  declineButton.addEventListener("click", onDecline);

  actions.appendChild(acceptButton);
  actions.appendChild(declineButton);
  bubble.appendChild(actions);
  wrapper.appendChild(bubble);

  return wrapper;
}

/**
 * Creates a tool activity indicator element
 */
export function createToolActivityIndicator(placeholderText: string): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "acw-message acw-message-agent acw-tool-indicator";
  wrapper.setAttribute("aria-live", "polite");
  
  const bubble = document.createElement("div");
  bubble.className = "acw-bubble";
  bubble.textContent = placeholderText;
  
  wrapper.appendChild(bubble);
  return wrapper;
}

/**
 * Creates a disclaimer element
 */
export function createDisclaimer(text: string, className?: string, styles?: Record<string, string>): HTMLDivElement {
  const disclaimer = document.createElement("div");
  
  const classes = ["acw-disclaimer"];
  if (className) {
    classes.push(className);
  }
  disclaimer.className = classes.join(" ").trim();
  disclaimer.textContent = text;

  if (styles) {
    Object.entries(styles).forEach(([key, value]) => {
      if (value !== undefined) {
        disclaimer.style.setProperty(key, value);
      }
    });
  }

  return disclaimer;
}
