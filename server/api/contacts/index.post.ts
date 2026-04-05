import { z } from 'zod'
import { contactTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(255),
  phone: z.string().max(32).optional(),
  email: z.string().email().max(255).optional(),
  avatar: z.string().url().max(2048).optional(),
  channel_type: z.enum(['zalo', 'facebook', 'telegram', 'webchat']).optional(),
  channel_contact_id: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  const [contact] = await db
    .insert(contactTable)
    .values({ user_id: session.id, ...body })
    .returning()

  return contact
})
