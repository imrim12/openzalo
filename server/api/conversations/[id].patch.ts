import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { conversationTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  status: z.enum(['open', 'closed', 'archived', 'snoozed']).optional(),
  is_starred: z.boolean().optional(),
  is_pinned: z.boolean().optional(),
  title: z.string().max(255).optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  const [conversation] = await db
    .update(conversationTable)
    .set(body)
    .where(and(
      eq(conversationTable.id, id),
      eq(conversationTable.user_id, session.id),
    ))
    .returning()

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  return conversation
})
