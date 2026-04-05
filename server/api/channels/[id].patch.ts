import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { channelConnectionTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['active', 'disconnected', 'error', 'pending']).optional(),
  status_message: z.string().optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  const [channel] = await db
    .update(channelConnectionTable)
    .set(body)
    .where(and(
      eq(channelConnectionTable.id, id),
      eq(channelConnectionTable.user_id, session.id),
    ))
    .returning()

  if (!channel) {
    throw createError({ statusCode: 404, statusMessage: 'Channel not found' })
  }

  return channel
})
