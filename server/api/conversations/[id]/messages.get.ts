import { and, desc, eq, lt } from 'drizzle-orm'
import { z } from 'zod'
import { messageTable } from '~~/server/db/pg/schema'
import { requireZaloConversationAccess } from '~~/server/services/zalo/conversation-access'
import { fetchAndStoreZaloHistory } from '~~/server/services/zalo/history'

const querySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  /** Pass `fetch_older=true` or `fetch_older=1` to pull older messages from Zalo */
  fetch_older: z.enum(['true', '1', 'false', '0']).optional().transform(v => v === 'true' || v === '1'),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getPgClient()

  await requireZaloConversationAccess(db, id, session.id)

  const conditions = [eq(messageTable.conversation_id, id)]
  if (query.cursor) {
    conditions.push(lt(messageTable.sent_at, new Date(query.cursor)))
  }

  let messages = await db
    .select()
    .from(messageTable)
    .where(and(...conditions))
    .orderBy(desc(messageTable.sent_at))
    .limit(query.limit)

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
      messages = await db
        .select()
        .from(messageTable)
        .where(and(...conditions))
        .orderBy(desc(messageTable.sent_at))
        .limit(query.limit)
    }
    catch {
      // History fetch is best-effort; return whatever is in DB
    }
  }

  return messages.reverse()
})
