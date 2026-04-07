import { and, eq } from 'drizzle-orm'
import { contactTable, conversationTable } from '~~/server/db/pg/schema'

type Db = ReturnType<typeof getPgClient>

export async function upsertZaloContact(db: Db, opts: {
  userId: string
  channelConnectionId: string
  channelContactId: string
  name: string
  avatar?: string
  phone?: string
}) {
  const { userId, channelConnectionId, channelContactId, name, avatar, phone } = opts

  const [existing] = await db
    .select({ id: contactTable.id })
    .from(contactTable)
    .where(and(
      eq(contactTable.user_id, userId),
      eq(contactTable.channel_type, 'zalo'),
      eq(contactTable.channel_contact_id, channelContactId),
    ))

  if (existing) {
    const [updated] = await db
      .update(contactTable)
      .set({ name, avatar, phone, updated_at: new Date() })
      .where(eq(contactTable.id, existing.id))
      .returning()
    return updated!
  }

  const [created] = await db
    .insert(contactTable)
    .values({
      user_id: userId,
      channel_type: 'zalo',
      channel_connection_id: channelConnectionId,
      channel_contact_id: channelContactId,
      name,
      avatar,
      phone,
    })
    .returning()
  return created!
}

export async function upsertZaloConversation(db: Db, opts: {
  userId: string
  channelConnectionId: string
  channelThreadId: string
  threadType: 'user' | 'group'
  contactId?: string
  title?: string
  isPinned?: boolean
  unreadCount?: number
  metadata?: Record<string, unknown>
}) {
  const {
    userId,
    channelConnectionId,
    channelThreadId,
    threadType,
    contactId,
    title,
    isPinned,
    unreadCount,
    metadata,
  } = opts

  const [existing] = await db
    .select({ id: conversationTable.id })
    .from(conversationTable)
    .where(and(
      eq(conversationTable.channel_connection_id, channelConnectionId),
      eq(conversationTable.channel_thread_id, channelThreadId),
    ))

  if (existing) {
    const [updated] = await db
      .update(conversationTable)
      .set({
        contact_id: contactId,
        title,
        is_pinned: isPinned ?? false,
        unread_count: unreadCount ?? 0,
        metadata: metadata ?? {},
        updated_at: new Date(),
      })
      .where(eq(conversationTable.id, existing.id))
      .returning()
    return updated!
  }

  const [created] = await db
    .insert(conversationTable)
    .values({
      user_id: userId,
      channel_connection_id: channelConnectionId,
      channel_thread_id: channelThreadId,
      thread_type: threadType,
      contact_id: contactId,
      title,
      is_pinned: isPinned ?? false,
      unread_count: unreadCount ?? 0,
      metadata: metadata ?? {},
    })
    .returning()
  return created!
}
