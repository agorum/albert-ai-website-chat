/**
 * Message Manager Module
 * 
 * This module manages the chat message state, including adding, updating,
 * and removing messages, as well as tracking message metadata.
 */

import { ChatMessage, ChatRole, MessageElementRefs, ChatServiceHistoryEntry } from '../types';
import { decodeHtmlEntities, parseTimestamp } from '../utils';

/**
 * Message manager class that handles message state and operations
 */
export class MessageManager {
  private messages: ChatMessage[] = [];
  private messageElements: Array<MessageElementRefs | null> = [];
  private historyContents: string[] = [];
  private toolCallTextCache: Map<number, string> = new Map();
  private pendingToolCall: { anchorIndex: number | null } | null = null;

  /**
   * Gets all messages
   */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  /**
   * Gets a specific message by index
   */
  getMessage(index: number): ChatMessage | undefined {
    return this.messages[index];
  }

  /**
   * Gets the number of messages
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Gets message element references by index
   */
  getMessageElements(index: number): MessageElementRefs | null {
    return this.messageElements[index] ?? null;
  }

  /**
   * Sets message element references
   */
  setMessageElements(index: number, elements: MessageElementRefs | null): void {
    this.messageElements[index] = elements;
  }

  /**
   * Gets the history content at a specific index
   */
  getHistoryContent(index: number): string | undefined {
    return this.historyContents[index];
  }

  /**
   * Adds a new message
   */
  addMessage(message: ChatMessage): number {
    this.messages.push(message);
    this.messageElements.push(null);
    return this.messages.length - 1;
  }

  /**
   * Updates a message at a specific index
   */
  updateMessage(index: number, updates: Partial<ChatMessage>): void {
    const message = this.messages[index];
    if (message) {
      Object.assign(message, updates);
    }
  }

  /**
   * Removes a message at a specific index
   */
  removeMessage(index: number): void {
    this.messages.splice(index, 1);
    this.messageElements.splice(index, 1);
    this.historyContents.splice(index, 1);
    
    // Update pending tool call anchor if needed
    if (this.pendingToolCall && this.pendingToolCall.anchorIndex !== null) {
      if (this.pendingToolCall.anchorIndex === index) {
        this.pendingToolCall = null;
      } else if (this.pendingToolCall.anchorIndex > index) {
        this.pendingToolCall.anchorIndex -= 1;
      }
    }
  }

  /**
   * Finds the index of the last user message
   */
  getLastUserMessageIndex(): number {
    for (let index = this.messages.length - 1; index >= 0; index -= 1) {
      if (this.messages[index]?.role === "user") {
        return index;
      }
    }
    return -1;
  }

  /**
   * Checks if there are any local-only messages
   */
  hasLocalOnlyMessages(): boolean {
    return this.messages.some(msg => msg.localOnly);
  }

  /**
   * Removes failed user messages
   */
  removeFailedUserMessages(): void {
    for (let index = this.messages.length - 1; index >= 0; index -= 1) {
      const message = this.messages[index];
      if (message?.role === "user" && message.status === "failed") {
        this.removeMessage(index);
      }
    }
  }

  /**
   * Removes local agent messages
   */
  removeLocalAgentMessages(): void {
    for (let index = this.messages.length - 1; index >= 0; index -= 1) {
      const message = this.messages[index];
      if (message?.role === "agent" && message.localOnly) {
        this.removeMessage(index);
      }
    }
  }

  /**
   * Clears all messages
   */
  clearMessages(): void {
    this.messages = [];
    this.messageElements = [];
    this.historyContents = [];
    this.toolCallTextCache.clear();
    this.pendingToolCall = null;
  }

  /**
   * Hydrates messages from service history
   */
  hydrateFromHistory(history: ChatServiceHistoryEntry[]): void {
    this.clearMessages();
    this.processHistoryEntries(history);
  }

  /**
   * Updates messages incrementally from service history
   * This method compares the new history with existing messages and only updates what changed
   */
  updateFromHistory(history: ChatServiceHistoryEntry[]): void {
    // If we have no messages yet, do a full hydration
    if (this.messages.length === 0) {
      this.processHistoryEntries(history);
      return;
    }

    // Find where our current messages end in the history
    let historyIndex = 0;
    let messageIndex = 0;

    // Skip past messages that already exist
    while (historyIndex < history.length && messageIndex < this.messages.length) {
      const historyEntry = history[historyIndex];
      const existingMessage = this.messages[messageIndex];
      
      // Skip tool placeholders when comparing
      if (existingMessage.isToolPlaceholder) {
        messageIndex++;
        continue;
      }

      const historyRole = this.mapServiceRole(historyEntry.role);
      const historyContentRaw = decodeHtmlEntities(historyEntry.text ?? "");
      const historyContent = historyContentRaw.trim();
      const existingContent = (existingMessage.content ?? "").trim();

      // Check if this is the same message
      if (historyRole === existingMessage.role) {
        // For streaming: new content should start with or extend existing content
        if (historyContent.startsWith(existingContent) || existingContent === "" || 
            (historyRole === "agent" && existingContent.startsWith(historyContent))) {
          // Update existing message with new content (for streaming)
          // Use the raw (non-trimmed) content to preserve formatting
          if (historyContentRaw !== existingMessage.content && historyContent.length > 0) {
            existingMessage.content = historyContentRaw;
            this.historyContents[messageIndex] = historyContentRaw;
          }
          historyIndex++;
          messageIndex++;
        } else {
          // Content mismatch - break and add remaining as new
          break;
        }
      } else {
        // Role mismatch - break and add remaining as new  
        break;
      }
    }

    // Add any new messages from history
    const newEntries = history.slice(historyIndex);
    if (newEntries.length > 0) {
      this.processHistoryEntries(newEntries, false);
    }
    
    // Update pending tool call state
    this.updatePendingToolCallState();
  }

  /**
   * Internal method to process history entries
   */
  private processHistoryEntries(history: ChatServiceHistoryEntry[], clearFirst = false): void {
    if (clearFirst) {
      this.clearMessages();
    }
    
    let pendingToolCall: { anchorIndex: number | null } | null = null;
    
    history.forEach((entry, index) => {
      const role = this.mapServiceRole(entry.role);
      const rawText = entry.text ?? "";
      const decodedText = decodeHtmlEntities(rawText);
      const trimmedText = decodedText.trim();
      const isToolCall = Boolean(entry.isToolCall);
      const isActualToolResponse = entry.role === "tool";
      
      // Handle tool response caching
      let effectiveText = decodedText;
      if (isActualToolResponse) {
        if (trimmedText.length > 0) {
          this.toolCallTextCache.set(index, decodedText);
        } else if (this.toolCallTextCache.has(index)) {
          effectiveText = this.toolCallTextCache.get(index)!;
        }
      }
      
      const hasRenderableText = effectiveText.trim().length > 0;
      
      // Determine if this is a placeholder
      let isToolPlaceholder = false;
      if (isToolCall && !hasRenderableText) {
        const nextIndex = index + 1;
        if (nextIndex < history.length) {
          const nextEntry = history[nextIndex];
          const nextText = (nextEntry.text ?? "").trim();
          if (nextText.length === 0) {
            isToolPlaceholder = true;
          }
        } else {
          isToolPlaceholder = true;
        }
      }
      
      const message: ChatMessage = {
        role,
        content: hasRenderableText ? effectiveText : "",
        timestamp: parseTimestamp(entry.dateTime),
        status: role === "user" ? "sent" : undefined,
        localOnly: false,
        isToolPlaceholder,
      };
      
      // Store isToolCall as additional property
      (message as any).isToolCall = isToolCall;
      
      this.historyContents.push(effectiveText);
      this.addMessage(message);
      
      // Update pending tool call state
      if (isToolCall && !hasRenderableText) {
        const nextIndex = index + 1;
        if (nextIndex < history.length) {
          const nextEntry = history[nextIndex];
          const nextText = (nextEntry.text ?? "").trim();
          if (nextText.length === 0) {
            pendingToolCall = { anchorIndex: this.messages.length - 1 };
          } else {
            pendingToolCall = null;
          }
        } else {
          pendingToolCall = { anchorIndex: this.messages.length - 1 };
        }
      }
    });
    
    this.pendingToolCall = pendingToolCall;
  }

  /**
   * Updates the pending tool call state
   */
  updatePendingToolCallState(): void {
    this.pendingToolCall = null;
    
    for (let i = this.messages.length - 1; i >= 0; i--) {
      const message = this.messages[i];
      if (!message) continue;
      
      const isToolCall = Boolean((message as any).isToolCall);
      const hasText = (message.content || '').trim().length > 0;
      
      if (isToolCall) {
        const nextMessage = this.messages[i + 1];
        const nextIsToolCall = nextMessage ? Boolean((nextMessage as any).isToolCall) : false;
        
        if (!nextMessage || nextIsToolCall) {
          this.pendingToolCall = { anchorIndex: i };
          break;
        }
      }
    }
  }

  /**
   * Gets the pending tool call state
   */
  getPendingToolCall(): { anchorIndex: number | null } | null {
    return this.pendingToolCall;
  }

  /**
   * Gets the tool call text cache
   */
  getToolCallCache(index: number): string | undefined {
    return this.toolCallTextCache.get(index);
  }

  /**
   * Sets tool call text in cache
   */
  setToolCallCache(index: number, text: string): void {
    this.toolCallTextCache.set(index, text);
  }

  /**
   * Maps service role strings to internal roles
   */
  private mapServiceRole(role: string): ChatRole {
    const normalized = role ? role.toLowerCase() : "";
    if (normalized === "user" || normalized === "human") {
      return "user";
    }
    return "agent";
  }
}