import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { conversationTable, messageTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  content: z.string().min(1),
  message_type: z.enum(['text', 'image', 'file', 'video', 'sticker', 'system']).default('text'),
  reply_to_id: z.string().uuid().optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  // Verify conversation ownership
  const [conv] = await db
    .select()
    .from(conversationTable)
    .where(and(
      eq(conversationTable.id, id),
      eq(conversationTable.user_id, session.id),
    ))

  if (!conv) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  const now = new Date()

  const [message] = await db
    .insert(messageTable)
    .values({
      conversation_id: id,
      sender_type: 'agent',
      sender_name: session.name,
      sender_avatar: session.avatar ?? undefined,
      message_type: body.message_type,
      content: body.content,
      reply_to_id: body.reply_to_id,
      sent_at: now,
    })
    .returning()

  // Update conversation last message preview
  await db
    .update(conversationTable)
    .set({
      last_message_at: now,
      last_message_preview: body.content.slice(0, 100),
    })
    .where(eq(conversationTable.id, id))

  return message
})
