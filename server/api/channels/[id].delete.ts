import { and, eq } from 'drizzle-orm'
import { channelConnectionTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  const [deleted] = await db
    .delete(channelConnectionTable)
    .where(and(
      eq(channelConnectionTable.id, id),
      eq(channelConnectionTable.user_id, session.id),
    ))
    .returning()

  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Channel not found' })
  }

  return { success: true }
})
