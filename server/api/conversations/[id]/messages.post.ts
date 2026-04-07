import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { conversationTable, messageTable } from '~~/server/db/pg/schema'
import { requireZaloConversationAccess } from '~~/server/services/zalo/conversation-access'
import { sendZaloMessage } from '~~/server/services/zalo/send'
import { pushZaloSseEvent } from '~~/server/services/zalo/sse'

const bodySchema = z.object({
  content: z.string().min(1),
  message_type: z.enum(['text', 'image', 'file', 'video', 'sticker', 'system']).default('text'),
  reply_to_id: z.string().uuid().optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  const conv = await requireZaloConversationAccess(db, id, session.id)

  // Route through Zalo worker if this is a Zalo conversation
  let channelMessageId: string | undefined
  try {
    channelMessageId = await sendZaloMessage({
      db,
      conversationId: id,
      content: body.content,
      replyToId: body.reply_to_id,
    })
  }
  catch (err) {
    // If Zalo send fails, do NOT persist the message
    console.error('[messages.post] Zalo send failed:', err)
    throw createError({ statusCode: 502, statusMessage: 'Failed to send message via Zalo' })
  }

  const now = new Date()

  const [message] = await db
    .insert(messageTable)
    .values({
      conversation_id: id,
      channel_message_id: channelMessageId,
      sender_type: 'agent',
      sender_name: session.name,
      sender_avatar: session.avatar ?? undefined,
      message_type: body.message_type,
      content: body.content,
      reply_to_id: body.reply_to_id,
      sent_at: now,
    })
    .returning()

  await db
    .update(conversationTable)
    .set({
      last_message_at: now,
      last_message_preview: body.content.slice(0, 100),
    })
    .where(eq(conversationTable.id, id))

  // Push SSE to owner + assignee
  const recipients = [conv.user_id, conv.assigned_user_id].filter(Boolean) as string[]
  await pushZaloSseEvent(recipients, { type: 'message', conversationId: id, message })

  return message
})
