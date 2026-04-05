import { and, eq } from 'drizzle-orm'
import { contactTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  const [deleted] = await db
    .delete(contactTable)
    .where(and(
      eq(contactTable.id, id),
      eq(contactTable.user_id, session.id),
    ))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Contact not found' })
  }

  return { success: true }
})
