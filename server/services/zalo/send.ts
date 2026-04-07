import type { ZaloThreadTypeValue } from '~~/shared/types/zalo'
import { eq } from 'drizzle-orm'
import { ZaloThreadType } from '~~/shared/types/zalo'
import { channelConnectionTable, conversationTable, messageTable } from '~~/server/db/pg/schema'
import { callZaloWorkerAction } from './worker'

type Db = ReturnType<typeof getPgClient>

interface SendTextOpts {
  db: Db
  conversationId: string
  content: string
  replyToId?: string
}

/**
 * Resolves session + thread info needed to send a message.
 */
async function resolveConvSendInfo(db: Db, conversationId: string) {
  const [conv] = await db
    .select({
      channel_thread_id: conversationTable.channel_thread_id,
      thread_type: conversationTable.thread_type,
      channel_connection_id: conversationTable.channel_connection_id,
    })
    .from(conversationTable)
    .where(eq(conversationTable.id, conversationId))

  if (!conv?.channel_thread_id)
    return null

  const [channel] = await db
    .select({ metadata: channelConnectionTable.metadata })
    .from(channelConnectionTable)
    .where(eq(channelConnectionTable.id, conv.channel_connection_id))

  const sessionId = (channel?.metadata as Record<string, unknown> | null)?.zaloSessionId as string | undefined
  if (!sessionId)
    return null

  const threadType: ZaloThreadTypeValue = conv.thread_type === 'group'
    ? ZaloThreadType.Group
    : ZaloThreadType.User

  return { sessionId, threadId: conv.channel_thread_id, threadType, channelId: conv.channel_connection_id }
}

/**
 * Sends a text message (optionally with a quote) via the Zalo worker.
 * Returns the channel message ID from the worker response.
 */
export async function sendZaloMessage(opts: SendTextOpts): Promise<string | undefined> {
  const { db, conversationId, content, replyToId } = opts

  const info = await resolveConvSendInfo(db, conversationId)
  if (!info)
    return undefined

  let messagePayload: unknown = content

  if (replyToId) {
    const [original] = await db
      .select({
        channel_message_id: messageTable.channel_message_id,
        content: messageTable.content,
        metadata: messageTable.metadata,
      })
      .from(messageTable)
      .where(eq(messageTable.id, replyToId))

    const meta = original?.metadata as Record<string, unknown> | null
    // Build a proper quote only when we have the Zalo sender ID and message type
    if (original?.channel_message_id && meta?.zaloFrom) {
      messagePayload = {
        msg: content,
        quote: {
          msgId: original.channel_message_id,
          cliMsgId: (meta.zaloCliMsgId as string | undefined) ?? original.channel_message_id,
          uidFrom: meta.zaloFrom as string,
          msgType: (meta.zaloMsgType as string | undefined) ?? 'chat.text',
          ts: (meta.zaloTs as number | undefined) ?? Date.now(),
          content: original.content ?? '',
        },
      }
    }
  }

  const result = await callZaloWorkerAction<{ message?: { msgId?: string } }>(
    info.sessionId,
    'sendMessage',
    [messagePayload, info.threadId, info.threadType],
  )

  return result?.message?.msgId
}

/**
 * Sends a reaction to a message via the Zalo worker.
 */
export async function sendZaloReaction(db: Db, opts: {
  conversationId: string
  messageId: string
  reactionType: number
}): Promise<void> {
  const { conversationId, messageId, reactionType } = opts

  const info = await resolveConvSendInfo(db, conversationId)
  if (!info)
    return

  const [msg] = await db
    .select({ channel_message_id: messageTable.channel_message_id })
    .from(messageTable)
    .where(eq(messageTable.id, messageId))

  if (!msg?.channel_message_id)
    return

  // Map rType to the Reactions enum string that Zalo uses as the icon identifier.
  // These match zca-js Reactions enum values exactly.
  const REACTION_ICONS: Record<number, string> = {
    0: ':>',       // HAHA
    2: ':-((',     // CRY
    3: '/-strong', // LIKE
    5: '/-heart',  // HEART
    7: ":')",      // TEARS_OF_JOY
    8: ':-*',      // KISS
    20: ':-h',     // ANGRY
    32: ':o',      // WOW
    66: '/-shit',  // SHIT
    99: '/-beer',  // BEER
  }
  const icon = REACTION_ICONS[reactionType] ?? '/-strong'

  // icon: { rType, source, icon } — source 6 = standard reaction panel
  // dest: { type, threadId, data: { msgId, cliMsgId } }
  await callZaloWorkerAction(
    info.sessionId,
    'addReaction',
    [
      { rType: reactionType, source: 6, icon },
      {
        type: info.threadType,
        threadId: info.threadId,
        data: {
          msgId: msg.channel_message_id,
          cliMsgId: msg.channel_message_id,
        },
      },
    ],
  )
}
