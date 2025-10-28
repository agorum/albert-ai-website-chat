/**
 * DOM Utility Functions
 * 
 * This module provides helper functions for DOM manipulation,
 * element creation, and UI interactions.
 */

import { isSvgIcon } from './general-utils';

/**
 * Creates an icon element, supporting both inline text icons and external SVG sources.
 * 
 * @param icon - The icon content (emoji, text, or SVG URL)
 * @param baseClass - The CSS class to apply to the icon element
 * @param altText - Alternative text for SVG images
 * @returns The created icon element
 */
export function createIconElement(icon: string, baseClass: string, altText = ""): HTMLElement {
  const trimmed = icon.trim();
  
  if (isSvgIcon(trimmed)) {
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
 * Finds the last meaningful descendant node inside a bubble to position the typing cursor.
 * 
 * @param root - The root node to search from
 * @returns The last content node, or null if none found
 */
export function findLastContentNode(root: Node | null): Node | null {
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
    const candidate = findLastContentNode(child);
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
 * Attaches a typing cursor element to the end of content.
 * 
 * @param container - The container element with content
 * @param cursor - The cursor element to position
 */
export function attachTypingCursor(container: HTMLElement, cursor: HTMLSpanElement): void {
  if (!container || !cursor) {
    return;
  }
  
  if (cursor.parentElement) {
    cursor.parentElement.removeChild(cursor);
  }
  
  const target = findLastContentNode(container);
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
 * Scrolls an element to the bottom.
 * 
 * @param element - The element to scroll
 * @param options - Scroll options
 */
export function scrollToBottom(
  element: HTMLElement,
  options: { smooth?: boolean } = {}
): void {
  const { smooth = false } = options;
  const behavior: ScrollBehavior = smooth ? "smooth" : "auto";
  
  if (typeof element.scrollTo === "function") {
    element.scrollTo({ top: element.scrollHeight, behavior });
  } else {
    element.scrollTop = element.scrollHeight;
  }
}

/**
 * Adjusts a textarea's height based on its content.
 * 
 * @param textarea - The textarea element to adjust
 * @returns The new height in pixels
 */
export function adjustTextareaHeight(textarea: HTMLTextAreaElement): number {
  textarea.style.height = "auto";
  
  const computed = window.getComputedStyle(textarea);
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

  const scrollHeight = textarea.scrollHeight + border;
  const clampedHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
  
  textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  textarea.style.height = `${clampedHeight}px`;
  
  return clampedHeight;
}