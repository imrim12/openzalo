import { z } from 'zod'
import { requireZaloConversationAccess } from '~~/server/services/zalo/conversation-access'
import { sendZaloReaction } from '~~/server/services/zalo/send'

const bodySchema = z.object({
  message_id: z.string().uuid(),
  reaction_type: z.number().int(),
})

/**
 * POST /api/conversations/:id/reaction
 * Sends a reaction to a message in this conversation via Zalo.
 */
export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  await requireZaloConversationAccess(db, id, session.id)

  try {
    await sendZaloReaction(db, {
      conversationId: id,
      messageId: body.message_id,
      reactionType: body.reaction_type,
    })
  }
  catch (err) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to send reaction via Zalo' })
  }

  return { ok: true }
})
