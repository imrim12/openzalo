import { and, desc, eq, getTableColumns, lt } from 'drizzle-orm'
import { z } from 'zod'
import { contactTable, conversationTable, messageTable } from '~~/server/db/pg/schema'
import { requireZaloConversationAccess } from '~~/server/services/zalo/conversation-access'
import { fetchAndStoreZaloHistory } from '~~/server/services/zalo/history'

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  /** Pass `fetch_older=true` or `fetch_older=1` to pull older messages from Zalo */
  fetch_older: z.enum(['true', '1', 'false', '0']).optional().transform(v => v === 'true' || v === '1'),
})

/**
 * Query messages with sender info resolved from contacts table.
 * Falls back to contact.name/avatar when message.sender_name/sender_avatar is NULL.
 */
async function queryMessages(db: ReturnType<typeof getPgClient>, conditions: any[], limit: number) {
  const rows = await db
    .select({
      ...getTableColumns(messageTable),
      _contact_name: contactTable.name,
      _contact_avatar: contactTable.avatar,
    })
    .from(messageTable)
    .leftJoin(conversationTable, eq(messageTable.conversation_id, conversationTable.id))
    .leftJoin(contactTable, eq(conversationTable.contact_id, contactTable.id))
    .where(and(...conditions))
    .orderBy(desc(messageTable.sent_at))
    .limit(limit)

  return rows.map(({ _contact_name, _contact_avatar, ...msg }) => ({
    ...msg,
    sender_name: msg.sender_name ?? (msg.sender_type === 'contact' ? _contact_name : null),
    sender_avatar: msg.sender_avatar ?? (msg.sender_type === 'contact' ? _contact_avatar : null),
  }))
}

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getPgClient()

  await requireZaloConversationAccess(db, id, session.id)

  const conditions = [eq(messageTable.conversation_id, id)]
  if (query.cursor) {
    conditions.push(lt(messageTable.sent_at, new Date(query.cursor)))
  }

  let messages = await queryMessages(db, conditions, query.limit)

  // If no messages in DB (first load or scrolled past all), fetch from Zalo
  if (messages.length === 0 || query.fetch_older) {
    const oldestChannelMsgId = messages.length > 0
      ? messages.at(-1)?.channel_message_id ?? undefined
      : undefined

    try {
      await fetchAndStoreZaloHistory(db, {
        conversationId: id,
        lastMsgId: oldestChannelMsgId ?? undefined,
        count: query.limit,
      })

      // Re-query after fetch
      messages = await queryMessages(db, conditions, query.limit)
    }
    catch {
      // History fetch is best-effort; return whatever is in DB
    }
  }

  return messages.reverse()
})
