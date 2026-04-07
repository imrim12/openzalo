import { and, eq, ilike, or } from 'drizzle-orm'
import { z } from 'zod'
import { contactTable } from '~~/server/db/pg/schema'

const querySchema = z.object({
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
})

export default defineAuthenticatedHandler(async (event, session) => {
  const query = await getValidatedQuery(event, querySchema.parse)
  const db = getPgClient()

  const conditions = [eq(contactTable.user_id, session.id)]

  if (query.search) {
    const pattern = `%${query.search}%`
    conditions.push(or(
      ilike(contactTable.name, pattern),
      ilike(contactTable.phone, pattern),
      ilike(contactTable.email, pattern),
    )!)
  }

  const contacts = await db
    .select()
    .from(contactTable)
    .where(and(...conditions))
    .orderBy(contactTable.name)
    .limit(query.limit)

  return contacts
})
