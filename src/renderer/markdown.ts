/**
 * Markdown rendering module
 * 
 * This module provides safe markdown-to-HTML conversion with XSS protection.
 * It uses the marked library with a custom renderer that escapes unsafe content
 * and sanitizes URLs in links and images.
 */

import { marked } from 'marked';
import { escapeHtml, escapeHtmlAttribute, sanitizeUrl, decodeHtmlEntities } from '../utils';

/**
 * Custom markdown renderer with security features
 */
class SafeMarkdownRenderer extends marked.Renderer {
  paragraph(text: string): string {
    return `<p>${text}</p>`;
  }

  text(text: string): string {
    return escapeHtml(text);
  }

  strong(text: string): string {
    return `<strong>${text}</strong>`;
  }

  em(text: string): string {
    return `<em>${text}</em>`;
  }

  codespan(text: string): string {
    return `<code>${escapeHtml(text)}</code>`;
  }

  code(code: string): string {
    return `<pre><code>${escapeHtml(code)}</code></pre>`;
  }

  heading(text: string, level: number): string {
    return `<h${level}>${text}</h${level}>`;
  }

  list(body: string, ordered: boolean): string {
    return `<${ordered ? "ol" : "ul"}>${body}</${ordered ? "ol" : "ul"}>`;
  }

  listitem(text: string): string {
    return `<li>${text}</li>`;
  }

  blockquote(text: string): string {
    return `<blockquote>${text}</blockquote>`;
  }

  link(href: string | null, title: string | null, text: string): string {
    const safeHref = sanitizeUrl(href);
    const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
    return `<a href="${safeHref}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`;
  }

  image(href: string | null, title: string | null, text: string): string {
    const safeHref = sanitizeUrl(href);
    const titleAttr = title ? ` title="${escapeHtmlAttribute(title)}"` : "";
    const alt = escapeHtmlAttribute(text || "");
    return `<img src="${safeHref}" alt="${alt}"${titleAttr} />`;
  }

  html(html: string): string {
    // Escape HTML to prevent XSS
    return escapeHtml(html);
  }

  br(): string {
    return "<br />";
  }

  hr(): string {
    return "<hr />";
  }

  table(header: string, body: string): string {
    return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
  }

  tablerow(content: string): string {
    return `<tr>${content}</tr>`;
  }

  tablecell(
    content: string,
    flags: { header: boolean; align: "center" | "left" | "right" | null }
  ): string {
    const tag = flags.header ? "th" : "td";
    const align = flags.align ? ` style="text-align:${flags.align}"` : "";
    return `<${tag}${align}>${content}</${tag}>`;
  }
}

// Create and configure the renderer instance
const markdownRenderer = new SafeMarkdownRenderer();

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  renderer: markdownRenderer,
});

/**
 * Renders markdown into sanitized HTML using a constrained renderer.
 * Automatically decodes HTML entities in the input to handle double-encoding.
 * 
 * @param content - The markdown content to render
 * @returns Sanitized HTML string
 */
export function renderMarkdown(content: string): string {
  if (!content.trim()) {
    return "";
  }
  
  // Decode HTML entities first to handle double-encoded content
  const normalized = decodeHtmlEntities(content);
  
  // Parse markdown to HTML
  const rendered = marked.parse(normalized, { renderer: markdownRenderer });
  
  return typeof rendered === "string" ? rendered : "";
}