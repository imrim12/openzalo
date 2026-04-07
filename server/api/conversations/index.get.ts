import { and, desc, eq, lt, or, sql } from 'drizzle-orm'
import { z } from 'zod'
import { contactTable, conversationTable } from '~~/server/db/pg/schema'

const querySchema = z.object({
  status: z.enum(['open', 'closed', 'archived', 'snoozed']).optional(),
  channel_connection_id: z.string().uuid().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getPgClient()

  // Owner sees all their conversations; assignees see only conversations assigned to them
  const conditions = [
    or(
      eq(conversationTable.user_id, session.id),
      eq(conversationTable.assigned_user_id, session.id),
    ),
  ]

  if (query.status) {
    conditions.push(eq(conversationTable.status, query.status))
  }
  if (query.channel_connection_id) {
    conditions.push(eq(conversationTable.channel_connection_id, query.channel_connection_id))
  }
  if (query.cursor) {
    conditions.push(lt(conversationTable.last_message_at, new Date(query.cursor)))
  }

  const rows = await db
    .select({
      conversation: conversationTable,
      contact: contactTable,
    })
    .from(conversationTable)
    .leftJoin(contactTable, eq(conversationTable.contact_id, contactTable.id))
    .where(and(...conditions))
    .orderBy(desc(sql`COALESCE(${conversationTable.last_message_at}, ${conversationTable.created_at})`))
    .limit(query.limit)

  return rows.map(r => ({ ...r.conversation, contact: r.contact }))
})
