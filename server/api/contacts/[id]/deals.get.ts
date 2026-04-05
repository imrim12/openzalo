import { and, desc, eq } from 'drizzle-orm'
import { contactTable, dealTable } from '~~/server/db/pg/schema'

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

  const deals = await db
    .select()
    .from(dealTable)
    .where(and(
      eq(dealTable.contact_id, id),
      eq(dealTable.user_id, session.id),
    ))
    .orderBy(desc(dealTable.created_at))

  return deals
})
