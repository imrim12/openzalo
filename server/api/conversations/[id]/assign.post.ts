import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { conversationTable, userTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  user_id: z.string().uuid().nullable(),
})

/**
 * POST /api/conversations/:id/assign
 * Assigns (or unassigns) a conversation to a team member.
 * Only the conversation owner may assign/unassign.
 */
export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  // Only the owner may assign
  const [conv] = await db
    .select({ id: conversationTable.id, user_id: conversationTable.user_id })
    .from(conversationTable)
    .where(and(
      eq(conversationTable.id, id),
      eq(conversationTable.user_id, session.id),
    ))

  if (!conv) {
    throw createError({ statusCode: 404, statusMessage: 'Conversation not found' })
  }

  // Validate target user exists (if assigning)
  if (body.user_id) {
    const [targetUser] = await db
      .select({ id: userTable.id })
      .from(userTable)
      .where(eq(userTable.id, body.user_id))

    if (!targetUser) {
      throw createError({ statusCode: 404, statusMessage: 'Target user not found' })
    }
  }

  const [updated] = await db
    .update(conversationTable)
    .set({ assigned_user_id: body.user_id })
    .where(eq(conversationTable.id, id))
    .returning()

  return updated
})
