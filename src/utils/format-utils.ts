/**
 * Formatting utilities for dates, times, and numbers
 * 
 * This module provides functions for formatting timestamps and other
 * display values according to locale settings.
 */

/**
 * Formats a timestamp for display inside message bubbles using the configured locale.
 * Falls back to a simple format if Intl.DateTimeFormat is not available.
 * 
 * @param date - The date to format
 * @param locale - The locale string (e.g., "de-DE", "en-US")
 * @returns Formatted time string (e.g., "14:35")
 */
export function formatTime(date: Date, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    // Fallback for environments without Intl support
    console.warn("ALBERT | AI Chat: Intl.DateTimeFormat failed, falling back to default", error);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }
}

/**
 * Parses a timestamp string and falls back to the current time on invalid values.
 * 
 * @param value - The timestamp string to parse (ISO format expected)
 * @returns A valid Date object
 */
export function parseTimestamp(value?: string): Date {
  if (!value) {
    return new Date();
  }
  
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  
  return date;
}
