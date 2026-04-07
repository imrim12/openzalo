import { and, eq } from 'drizzle-orm'
import { channelConnectionTable } from '~~/server/db/pg/schema'
import { callZaloWorker } from '~~/server/services/zalo/worker'

/**
 * GET /api/channels/:id/qr
 * Calls the Zalo worker to start a QR login flow, saves the sessionId in channel metadata,
 * and returns { sessionId, qrImage } to the client.
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
  if (channel.channel_type !== 'zalo') {
    throw createError({ statusCode: 400, statusMessage: 'Channel is not Zalo type' })
  }

  const { sessionId, qrImage } = await callZaloWorker<{ sessionId: string, qrImage: string }>(
    '/auth/login',
    { method: 'POST' },
  )

  await db
    .update(channelConnectionTable)
    .set({
      metadata: { ...(channel.metadata as Record<string, unknown>), zaloSessionId: sessionId },
      status: 'pending',
    })
    .where(eq(channelConnectionTable.id, id))

  return { sessionId, qrImage, qrUrl: `data:image/png;base64,${qrImage}` }
})
