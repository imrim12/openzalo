import { and, eq } from 'drizzle-orm'
import { channelConnectionTable } from '~~/server/db/pg/schema'
import { callZaloWorker } from '~~/server/services/zalo/worker'

/**
 * GET /api/channels/:id/qr/status
 * Polls the Zalo worker for QR scan status.
 * When status is 'confirmed', transitions the channel to 'active'.
 */
export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const db = getPgClient()

  const [channel] = await db
    .select()
    .from(channelConnectionTable)
    .where(and(
      eq(channelConnectionTable.id, id),
      eq(channelConnectionTable.user_id, session.id),
    ))

  if (!channel) {
    throw createError({ statusCode: 404, statusMessage: 'Channel not found' })
  }

  const sessionId = (channel.metadata as Record<string, unknown> | null)?.zaloSessionId as string | undefined
  if (!sessionId) {
    return { status: 'no_session' as const }
  }

  const { status } = await callZaloWorker<{ status: string }>(`/auth/status/${sessionId}`)

  if (status === 'confirmed' && channel.status !== 'active') {
    await db
      .update(channelConnectionTable)
      .set({ status: 'active', last_active_at: new Date() })
      .where(eq(channelConnectionTable.id, id))
  }
  else if ((status === 'expired' || status === 'declined') && channel.status !== 'disconnected') {
    await db
      .update(channelConnectionTable)
      .set({ status: 'disconnected', status_message: `QR ${status}` })
      .where(eq(channelConnectionTable.id, id))
  }

  return { status }
})
