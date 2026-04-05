import { z } from 'zod'
import { channelConnectionTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  channel_type: z.enum(['zalo', 'facebook', 'telegram', 'webchat']),
  name: z.string().min(1).max(255),
  account_identifier: z.string().max(255).optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  const [channel] = await db
    .insert(channelConnectionTable)
    .values({
      user_id: session.id,
      channel_type: body.channel_type,
      name: body.name,
      account_identifier: body.account_identifier,
      status: 'pending',
    })
    .returning()

  return channel
})
