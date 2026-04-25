/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing' | 'assistant';
  category?: 'business' | 'personal' | 'medical' | 'other';
}

export interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: string;
  category: 'business' | 'personal' | 'medical' | 'other';
  unreadCount?: number;
}
