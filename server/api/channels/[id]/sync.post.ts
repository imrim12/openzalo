import { and, eq } from 'drizzle-orm'
import { channelConnectionTable } from '~~/server/db/pg/schema'
import { syncZaloFriends, syncZaloGroups, syncZaloPinnedConversations } from '~~/server/services/zalo/sync'

/**
 * POST /api/channels/:id/sync
 * Fetches friends, groups, and pinned conversations from Zalo and upserts into DB.
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
  if (channel.status !== 'active') {
    throw createError({ statusCode: 409, statusMessage: 'Channel is not active. Complete QR login first.' })
  }

  const sessionId = (channel.metadata as Record<string, unknown> | null)?.zaloSessionId as string | undefined
  if (!sessionId) {
    throw createError({ statusCode: 409, statusMessage: 'No Zalo session found for this channel.' })
  }

  const ctx = { db, userId: session.id, channelConnectionId: id, sessionId }

  const [friends, , pinned] = await Promise.allSettled([
    syncZaloFriends(ctx),
    syncZaloGroups(ctx),
    syncZaloPinnedConversations(ctx),
  ])

  await db
    .update(channelConnectionTable)
    .set({ last_active_at: new Date() })
    .where(eq(channelConnectionTable.id, id))

  return {
    success: true,
    friendsCount: friends.status === 'fulfilled' ? friends.value.size : 0,
    errors: [friends, pinned]
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason?.message),
  }
})
