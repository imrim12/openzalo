/**
 * Push an SSE event to one or more users via the Redis queue consumed by /api/conversations/sse.
 */
export async function pushZaloSseEvent(userIds: string[], payload: Record<string, unknown>): Promise<void> {
  const storage = useStorage('redis')
  const serialized = JSON.stringify(payload)

  await Promise.all(
    userIds.map(async (uid) => {
      const key = `sse:${uid}`
      const existing = await storage.getItem<string[]>(key) ?? []
      existing.push(serialized)
      // Keep at most 100 buffered events per user to avoid memory bloat
      const trimmed = existing.slice(-100)
      await storage.setItem(key, trimmed)
    }),
  )
}
