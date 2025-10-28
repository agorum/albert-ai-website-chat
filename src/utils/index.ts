/**
 * Utility functions module
 * 
 * This module exports all utility functions used throughout the chat widget.
 * Utilities are grouped by their primary purpose:
 * - HTML utilities for escaping and sanitization
 * - Formatting utilities for dates and display values
 * - General utilities for common operations
 * - DOM utilities for element manipulation
 */

// HTML utilities
export {
  escapeHtml,
  escapeHtmlAttribute,
  sanitizeUrl,
  decodeHtmlEntities,
  renderPlainText
} from './html-utils';

// Formatting utilities
export {
  formatTime,
  parseTimestamp
} from './format-utils';

// General utilities
export {
  deepMerge,
  clamp,
  normalizeEndpoint,
  isSvgIcon
} from './general-utils';

// DOM utilities
export {
  createIconElement,
  findLastContentNode,
  attachTypingCursor,
  scrollToBottom,
  adjustTextareaHeight
} from './dom-utils';