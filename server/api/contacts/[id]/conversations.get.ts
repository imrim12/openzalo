import { and, desc, eq } from 'drizzle-orm'
import { contactTable, conversationTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  // Verify contact ownership
  const [contact] = await db
    .select({ id: contactTable.id })
    .from(contactTable)
    .where(and(
      eq(contactTable.id, id),
      eq(contactTable.user_id, session.id),
    ))

  if (!contact) {
    throw createError({ statusCode: 404, statusMessage: 'Contact not found' })
  }

  const conversations = await db
    .select()
    .from(conversationTable)
    .where(and(
      eq(conversationTable.contact_id, id),
      eq(conversationTable.user_id, session.id),
    ))
    .orderBy(desc(conversationTable.last_message_at))

  return conversations
})
