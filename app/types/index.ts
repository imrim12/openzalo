import type { MessageAttachment, MessageReaction } from '~~/shared/types/message'

export interface ContactItem {
  id: string
  user_id: string
  name: string
  avatar?: string | null
  phone?: string | null
  email?: string | null
  channel_type?: 'zalo' | 'facebook' | 'telegram' | 'webchat' | null
  channel_contact_id?: string | null
  channel_connection_id?: string | null
  tags?: string[] | null
  notes?: string | null
  custom_data?: Record<string, unknown> | null
  last_contacted_at?: Date | null
  created_at: Date
  updated_at?: Date | null
}

export interface ConversationWithContact {
  id: string
  user_id: string
  channel_connection_id: string
  contact_id?: string | null
  channel_thread_id?: string | null
  thread_type: string
  title?: string | null
  status: 'open' | 'closed' | 'archived' | 'snoozed'
  is_starred?: boolean | null
  is_pinned?: boolean | null
  unread_count?: number | null
  last_message_at?: Date | null
  last_message_preview?: string | null
  metadata?: Record<string, unknown> | null
  created_at: Date
  updated_at?: Date | null
  contact?: ContactItem | null
}

export interface MessageWithMeta {
  id: string
  conversation_id: string
  channel_message_id?: string | null
  sender_type: 'contact' | 'agent' | 'system'
  sender_name?: string | null
  sender_avatar?: string | null
  message_type: 'text' | 'image' | 'file' | 'video' | 'sticker' | 'system'
  content?: string | null
  reply_to_id?: string | null
  attachments?: MessageAttachment[] | null
  reactions?: MessageReaction[] | null
  metadata?: Record<string, unknown> | null
  is_edited?: boolean | null
  is_deleted?: boolean | null
  sent_at: Date
  created_at: Date
}

export interface ChannelConnectionItem {
  id: string
  user_id: string
  channel_type: 'zalo' | 'facebook' | 'telegram' | 'webchat'
  name: string
  account_identifier?: string | null
  status: 'active' | 'disconnected' | 'error' | 'pending'
  status_message?: string | null
  metadata?: Record<string, unknown> | null
  last_active_at?: Date | null
  created_at: Date
  updated_at?: Date | null
}
