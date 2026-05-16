/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  type: 'incoming' | 'outgoing' | 'assistant' | 'operation' | 'incident';
  category?: 'business' | 'personal' | 'medical' | 'other' | 'security';
  metadata?: any;
}

export interface Conversation {
  id: string;
  contactName: string;
  phoneNumber: string;
  lastMessage: string;
  timestamp: string;
  createdAt?: unknown;
  updatedAt?: unknown;
  ownerId?: string;
  category: 'business' | 'personal' | 'medical' | 'other';
  unreadCount?: number;
}
