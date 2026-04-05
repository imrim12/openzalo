import { and, eq } from 'drizzle-orm'
import { contactTable, conversationTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  const [row] = await db
    .select({
      conversation: conversationTable,
      contact: contactTable,
    })
    .from(conversationTable)
    .leftJoin(contactTable, eq(conversationTable.contact_id, contactTable.id))
    .where(and(
      eq(conversationTable.id, id),
      eq(conversationTable.user_id, session.id),
    ))

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  return { ...row.conversation, contact: row.contact }
})
