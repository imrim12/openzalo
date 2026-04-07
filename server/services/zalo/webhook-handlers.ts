import type { MessageReaction } from '~~/shared/types/message'
import type { ZaloMessage, ZaloReaction } from '~~/shared/types/zalo'
import { and, eq } from 'drizzle-orm'
import {
  channelConnectionTable,
  conversationTable,
  messageTable,
} from '~~/server/db/pg/schema'
import { parseZaloAttachments } from './message-mapper'
import { pushZaloSseEvent } from './sse'
import { upsertZaloContact, upsertZaloConversation } from './upsert'

type Db = ReturnType<typeof getPgClient>

/**
 * Resolve which user owns the channel connection that this sessionId belongs to.
 * Returns { channelId, userId } or null if not found.
 */
async function resolveChannel(db: Db, sessionId: string) {
  const channels = await db
    .select({ id: channelConnectionTable.id, user_id: channelConnectionTable.user_id, metadata: channelConnectionTable.metadata })
    .from(channelConnectionTable)

  const channel = channels.find(
    c => (c.metadata as Record<string, unknown> | null)?.zaloSessionId === sessionId,
  )
  return channel ?? null
}

/**
 * Returns the SSE recipient user IDs for a conversation (owner + assignee if any).
 */
async function getSseRecipients(db: Db, conversationId: string): Promise<string[]> {
  const [conv] = await db
    .select({ user_id: conversationTable.user_id, assigned_user_id: conversationTable.assigned_user_id })
    .from(conversationTable)
    .where(eq(conversationTable.id, conversationId))

  if (!conv)
    return []
  return [conv.user_id, conv.assigned_user_id].filter(Boolean) as string[]
}

export async function handleZaloMessage(db: Db, sessionId: string, data: ZaloMessage): Promise<void> {
  const channel = await resolveChannel(db, sessionId)
  if (!channel)
    return

  const isGroup = Boolean(data.isGroup || data.groupId)
  const threadId = isGroup ? (data.groupId ?? data.toUid) : data.fromUid
  const threadType: 'user' | 'group' = isGroup ? 'group' : 'user'

  // Ensure contact exists for the sender (DMs only)
  let contactId: string | undefined
  if (!isGroup) {
    const contact = await upsertZaloContact(db, {
      userId: channel.user_id,
      channelConnectionId: channel.id,
      channelContactId: data.fromUid,
      name: data.fromUid, // best we can do without a name lookup
    })
    contactId = contact.id
  }

  const conv = await upsertZaloConversation(db, {
    userId: channel.user_id,
    channelConnectionId: channel.id,
    channelThreadId: threadId,
    threadType,
    contactId,
  })

  // Determine sender type: if fromUid is the channel owner's Zalo ID it's 'agent', else 'contact'
  const ownZaloId = (channel.metadata as Record<string, unknown> | null)?.zaloOwnId as string | undefined
  const senderType = ownZaloId && data.fromUid === ownZaloId ? 'agent' : 'contact'

  const attachments = parseZaloAttachments(data.attach)
  const msgType = attachments.length > 0
    ? (attachments[0]?.type === 'image' ? 'image' : 'file')
    : 'text'

  // Idempotent: skip if message already exists
  const [existing] = await db
    .select({ id: messageTable.id })
    .from(messageTable)
    .where(and(
      eq(messageTable.conversation_id, conv.id),
      eq(messageTable.channel_message_id, data.msgId),
    ))
  if (existing)
    return

  const sentAt = data.timestamp ? new Date(data.timestamp) : new Date()

  const [msg] = await db
    .insert(messageTable)
    .values({
      conversation_id: conv.id,
      channel_message_id: data.msgId,
      sender_type: senderType,
      message_type: msgType,
      content: data.message,
      attachments,
      sent_at: sentAt,
    })
    .returning()

  await db
    .update(conversationTable)
    .set({
      last_message_at: sentAt,
      last_message_preview: data.message?.slice(0, 100) ?? '',
      unread_count: senderType === 'contact' ? undefined : 0,
    })
    .where(eq(conversationTable.id, conv.id))

  const recipients = await getSseRecipients(db, conv.id)
  await pushZaloSseEvent(recipients, { type: 'message', conversationId: conv.id, message: msg })
}

export async function handleZaloReaction(db: Db, sessionId: string, data: ZaloReaction): Promise<void> {
  const [msg] = await db
    .select({ id: messageTable.id, reactions: messageTable.reactions, conversation_id: messageTable.conversation_id })
    .from(messageTable)
    .where(eq(messageTable.channel_message_id, data.targetMsgId))

  if (!msg)
    return

  const reactions: MessageReaction[] = (msg.reactions as MessageReaction[]) ?? []
  const emoji = String(data.reactionType)
  const existing = reactions.find(r => r.emoji === emoji)
  if (existing) {
    if (!existing.users.some(u => u.id === data.uid)) {
      existing.users.push({ id: data.uid, name: data.uid })
      existing.count = existing.users.length
    }
  }
  else {
    reactions.push({ emoji, count: 1, users: [{ id: data.uid, name: data.uid }] })
  }

  await db
    .update(messageTable)
    .set({ reactions })
    .where(eq(messageTable.id, msg.id))

  const recipients = await getSseRecipients(db, msg.conversation_id)
  await pushZaloSseEvent(recipients, { type: 'reaction', conversationId: msg.conversation_id, messageId: msg.id, reactions })
}

export async function handleZaloUndo(db: Db, _sessionId: string, data: { msgId: string }): Promise<void> {
  const [msg] = await db
    .select({ id: messageTable.id, conversation_id: messageTable.conversation_id })
    .from(messageTable)
    .where(eq(messageTable.channel_message_id, data.msgId))

  if (!msg)
    return

  await db
    .update(messageTable)
    .set({ is_deleted: true })
    .where(eq(messageTable.id, msg.id))

  const recipients = await getSseRecipients(db, msg.conversation_id)
  await pushZaloSseEvent(recipients, { type: 'message_deleted', conversationId: msg.conversation_id, messageId: msg.id })
}

export async function handleZaloTyping(db: Db, sessionId: string, data: { fromUid: string, isGroup?: boolean, groupId?: string }): Promise<void> {
  const channel = await resolveChannel(db, sessionId)
  if (!channel)
    return

  const threadId = data.isGroup ? data.groupId : data.fromUid
  if (!threadId)
    return

  const [conv] = await db
    .select({ id: conversationTable.id, user_id: conversationTable.user_id, assigned_user_id: conversationTable.assigned_user_id })
    .from(conversationTable)
    .where(and(
      eq(conversationTable.channel_connection_id, channel.id),
      eq(conversationTable.channel_thread_id, threadId),
    ))

  if (!conv)
    return

  const recipients = [conv.user_id, conv.assigned_user_id].filter(Boolean) as string[]
  await pushZaloSseEvent(recipients, { type: 'typing', conversationId: conv.id, fromUid: data.fromUid })
}

export async function handleZaloFriendEvent(db: Db, sessionId: string, data: { uid: string, zaloName?: string, avatar?: string }): Promise<void> {
  const channel = await resolveChannel(db, sessionId)
  if (!channel)
    return

  if (data.uid && data.zaloName) {
    await upsertZaloContact(db, {
      userId: channel.user_id,
      channelConnectionId: channel.id,
      channelContactId: data.uid,
      name: data.zaloName,
      avatar: data.avatar,
    })
  }
}

export async function handleZaloGroupEvent(db: Db, sessionId: string, data: { groupId: string, name?: string, avt?: string }): Promise<void> {
  const channel = await resolveChannel(db, sessionId)
  if (!channel)
    return

  if (data.groupId) {
    await upsertZaloConversation(db, {
      userId: channel.user_id,
      channelConnectionId: channel.id,
      channelThreadId: data.groupId,
      threadType: 'group',
      title: data.name,
      metadata: { avatar: data.avt },
    })
  }
}
