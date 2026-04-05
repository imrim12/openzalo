import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { contactTable } from '~~/server/db/pg/schema'

const bodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  phone: z.string().max(32).optional(),
  email: z.string().email().max(255).optional(),
  avatar: z.string().url().max(2048).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
  custom_data: z.record(z.unknown()).optional(),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const id = getRouterParam(event, 'id')!
  const body = await readValidatedBody(event, bodySchema.parse)
  const db = getPgClient()

  const [contact] = await db
    .update(contactTable)
    .set(body)
    .where(and(
      eq(contactTable.id, id),
      eq(contactTable.user_id, session.id),
    ))
    .returning()

  if (!contact) {
    throw createError({ statusCode: 404, statusMessage: 'Contact not found' })
  }

  return contact
})
