import { and, eq } from 'drizzle-orm'
import { contactTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  const [contact] = await db
    .select()
    .from(contactTable)
    .where(and(
      eq(contactTable.id, id),
      eq(contactTable.user_id, session.id),
    ))

  if (!contact) {
    throw createError({ statusCode: 404, statusMessage: 'Contact not found' })
  }

  return contact
})
