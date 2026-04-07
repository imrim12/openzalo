import { desc, eq } from 'drizzle-orm'
import { channelConnectionTable } from '~~/server/db/pg/schema'

export default defineAuthenticatedHandler(async (event, session) => {
  const db = getPgClient()

  const channels = await db
    .select()
    .from(channelConnectionTable)
    .where(eq(channelConnectionTable.user_id, session.id))
    .orderBy(desc(channelConnectionTable.created_at))

  return channels
})
