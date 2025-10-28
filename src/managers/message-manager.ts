/**
 * Message Manager Module
 *
 * A lightweight state container for chat messages. It keeps track of
 * rendered messages and their associated DOM references so that the
 * widget can update bubbles efficiently during streaming updates.
 */

import { ChatMessage, MessageElementRefs } from '../types';

/**
 * Central message state holder used by the chat widget UI.
 */
export class MessageManager {
  private messages: ChatMessage[] = [];
  private elements: Array<MessageElementRefs | null> = [];

  /**
   * Returns all tracked messages.
   */
  getMessages(): ChatMessage[] {
    return this.messages;
  }

  /**
   * Returns the message at the given index.
   */
  getMessage(index: number): ChatMessage | undefined {
    return this.messages[index];
  }

  /**
   * Number of tracked messages.
   */
  getMessageCount(): number {
    return this.messages.length;
  }

  /**
   * Removes all messages and DOM references.
   */
  clearMessages(): void {
    this.messages = [];
    this.elements = [];
  }

  /**
   * Adds a new message and returns its index.
   */
  addMessage(message: ChatMessage): number {
    this.messages.push(message);
    this.elements.push(null);
    return this.messages.length - 1;
  }

  /**
   * Updates a message with partial data.
   */
  updateMessage(index: number, updates: Partial<ChatMessage>): void {
    const message = this.messages[index];
    if (!message) {
      return;
    }
    this.messages[index] = { ...message, ...updates };
  }

  /**
   * Removes a message and its DOM references.
   */
  removeMessage(index: number): void {
    if (index < 0 || index >= this.messages.length) {
      return;
    }
    this.messages.splice(index, 1);
    this.elements.splice(index, 1);
  }

  /**
   * Stores DOM references for a rendered message.
   */
  setMessageElements(index: number, elements: MessageElementRefs | null): void {
    this.elements[index] = elements;
  }

  /**
   * Retrieves stored DOM references for a message.
   */
  getMessageElements(index: number): MessageElementRefs | null {
    return this.elements[index] ?? null;
  }

  /**
   * Looks up a local-only user message that matches the provided content.
   * Used to reconcile pending user messages with history entries.
   */
  findLocalUserMessage(content: string): number | null {
    const normalized = content.trim();
    for (let index = 0; index < this.messages.length; index += 1) {
      const message = this.messages[index];
      if (!message) {
        continue;
      }
      if (
        message.role === "user" &&
        message.localOnly === true &&
        message.content.trim() === normalized
      ) {
        return index;
      }
    }
    return null;
  }
}
