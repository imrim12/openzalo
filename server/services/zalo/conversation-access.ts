import { and, eq, or } from 'drizzle-orm'
import { conversationTable } from '~~/server/db/pg/schema'

type Db = ReturnType<typeof getPgClient>

/**
 * Returns the conversation if the given userId is either the owner or the assigned agent.
 * Throws 404 if not found or inaccessible.
 */
export async function requireZaloConversationAccess(db: Db, conversationId: string, userId: string) {
  const [conv] = await db
    .select()
    .from(conversationTable)
    .where(and(
      eq(conversationTable.id, conversationId),
      or(
        eq(conversationTable.user_id, userId),
        eq(conversationTable.assigned_user_id, userId),
      ),
    ))

  if (!conv) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  return conv
}

/**
 * Returns true if the user is the owner of the conversation (not just an assignee).
 */
export function isZaloConversationOwner(conv: { user_id: string }, userId: string): boolean {
  return conv.user_id === userId
}
