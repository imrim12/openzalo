import { and, eq } from 'drizzle-orm'
import { conversationTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  const [conversation] = await db
    .update(conversationTable)
    .set({ unread_count: 0 })
    .where(and(
      eq(conversationTable.id, id),
      eq(conversationTable.user_id, session.id),
    ))
    .returning()

  if (!conversation) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  return { success: true }
})
