import { and, desc, eq, lt } from 'drizzle-orm'
import { z } from 'zod'
import { conversationTable, messageTable } from '~~/server/db/pg/schema'

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getPgClient()

  // Verify conversation ownership
  const [conv] = await db
    .select({ id: conversationTable.id })
    .from(conversationTable)
    .where(and(
      eq(conversationTable.id, id),
      eq(conversationTable.user_id, session.id),
    ))

  if (!conv) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  const conditions = [eq(messageTable.conversation_id, id)]

  if (query.cursor) {
    conditions.push(lt(messageTable.sent_at, new Date(query.cursor)))
  }

  const messages = await db
    .select()
    .from(messageTable)
    .where(and(...conditions))
    .orderBy(desc(messageTable.sent_at))
    .limit(query.limit)

  return messages.reverse()
})
