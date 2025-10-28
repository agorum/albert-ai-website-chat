/**
 * HTML utility functions for safe rendering and sanitization
 * 
 * This module provides functions to escape HTML entities, sanitize URLs,
 * and safely handle user-generated content to prevent XSS attacks.
 */

/**
 * Escapes critical HTML characters so user content can be safely injected into the DOM.
 * Prevents XSS attacks by converting special characters to HTML entities.
 * 
 * @param value - The string to escape
 * @returns The escaped HTML string
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&(?!#?\w+;)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Escapes characters for safe usage inside HTML attribute values.
 * In addition to standard HTML escaping, also escapes quotes.
 * 
 * @param value - The string to escape for attribute usage
 * @returns The escaped attribute string
 */
export function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value)
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates a link target and restricts it to safe protocols or same-origin references.
 * Prevents javascript: and data: protocol attacks.
 * 
 * @param rawUrl - The URL to sanitize (may be null or undefined)
 * @returns A safe URL string, or "#" if invalid
 */
export function sanitizeUrl(rawUrl: string | undefined | null): string {
  if (!rawUrl) {
    return "#";
  }
  
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "#";
  }
  
  // Allow only safe protocols
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  
  // Allow relative URLs and hash links
  if (/^(\/|#)/.test(trimmed)) {
    return trimmed;
  }
  
  // Block everything else (including javascript:, data:, etc.)
  return "#";
}

/**
 * Decodes HTML entities in a string, handling nested encodings iteratively.
 * Useful for processing content that may have been double-encoded.
 * 
 * @param value - The string containing HTML entities
 * @returns The decoded string
 */
export function decodeHtmlEntities(value: string): string {
  if (!value || !value.includes("&")) {
    return value;
  }

  const decodeOnce = (input: string): string =>
    input.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
      const lower = entity.toLowerCase();
      
      // Handle named entities
      if (lower === "amp") return "&";
      if (lower === "lt") return "<";
      if (lower === "gt") return ">";
      if (lower === "quot") return '"';
      if (lower === "apos") return "'";
      if (lower === "nbsp") return "\u00a0";
      
      // Handle numeric entities (hex)
      if (lower.startsWith("#x")) {
        const charCode = Number.parseInt(lower.slice(2), 16);
        return Number.isFinite(charCode) ? String.fromCharCode(charCode) : match;
      }
      
      // Handle numeric entities (decimal)
      if (lower.startsWith("#")) {
        const charCode = Number.parseInt(lower.slice(1), 10);
        return Number.isFinite(charCode) ? String.fromCharCode(charCode) : match;
      }
      
      return match;
    });

  // Decode iteratively until no more changes occur
  let previous = value;
  let current = decodeOnce(value);

  while (current !== previous) {
    previous = current;
    current = decodeOnce(current);
  }

  return current;
}

/**
 * Converts plain text into HTML paragraphs while escaping unsafe characters.
 * Line breaks are converted to <br /> tags.
 * 
 * @param content - The plain text content
 * @returns HTML string with escaped content and line breaks
 */
export function renderPlainText(content: string): string {
  if (!content) {
    return "";
  }
  
  const normalized = decodeHtmlEntities(content);
  return escapeHtml(normalized).replace(/\r?\n/g, "<br />");
}