import type { ZaloMessage } from '~~/shared/types/zalo'
import { ZaloThreadType } from '~~/shared/types/zalo'
import { eq } from 'drizzle-orm'
import { channelConnectionTable, conversationTable, messageTable } from '~~/server/db/pg/schema'
import { mapZaloMessageToInsert } from './message-mapper'
import { callZaloWorker } from './worker'

type Db = ReturnType<typeof getPgClient>

/**
 * Fetches old messages from the Zalo worker and inserts them into DB.
 * Skips messages that already exist (idempotent via unique index on conversation_id + channel_message_id).
 *
 * @returns number of newly inserted messages
 */
export async function fetchAndStoreZaloHistory(db: Db, opts: {
  conversationId: string
  lastMsgId?: string
  count?: number
}): Promise<number> {
  const { conversationId, lastMsgId, count = 50 } = opts

  // Get conversation + channel info
  const [conv] = await db
    .select({
      channel_thread_id: conversationTable.channel_thread_id,
      thread_type: conversationTable.thread_type,
      channel_connection_id: conversationTable.channel_connection_id,
    })
    .from(conversationTable)
    .where(eq(conversationTable.id, conversationId))

  if (!conv?.channel_thread_id)
    return 0

  const [channel] = await db
    .select({ metadata: channelConnectionTable.metadata })
    .from(channelConnectionTable)
    .where(eq(channelConnectionTable.id, conv.channel_connection_id))

  if (!channel)
    return 0

  const sessionId = (channel.metadata as Record<string, unknown> | null)?.zaloSessionId as string | undefined
  if (!sessionId)
    return 0

  const threadType = conv.thread_type === 'group' ? ZaloThreadType.Group : ZaloThreadType.User

  const { messages } = await callZaloWorker<{ messages: ZaloMessage[] }>('/history', {
    method: 'POST',
    body: { sessionId, threadId: conv.channel_thread_id, threadType, count, lastMsgId },
  })

  if (!messages?.length)
    return 0

  const ownZaloId = (channel.metadata as Record<string, unknown> | null)?.zaloOwnId as string | undefined

  let inserted = 0
  for (const msg of messages) {
    if (!msg.msgId)
      continue
    try {
      await db
        .insert(messageTable)
        .values(mapZaloMessageToInsert(msg, conversationId, ownZaloId))
        .onConflictDoNothing()
      inserted++
    }
    catch {
      // Ignore conflicts (unique index)
    }
  }

  return inserted
}
