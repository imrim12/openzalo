/**
 * Helpers for calling the Zalo worker (Fastify microservice).
 * The worker authenticates callers via `Authorization: Bearer <NUXT_WEBHOOK_SIGNING_SECRET>`.
 */

export async function callZaloWorker<T = unknown>(
  path: string,
  options: { method?: string, body?: unknown } = {},
): Promise<T> {
  const config = useRuntimeConfig()
  const workerUrl = (config.zaloWorkerUrl as string | undefined) || 'http://localhost:3001'
  const secret = config.webhookSigningSecret as string

  const hasBody = options.body !== undefined
  const res = await fetch(`${workerUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      'Authorization': `Bearer ${secret}`,
    },
    body: hasBody ? JSON.stringify(options.body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Worker error' })) as { error?: string }
    throw createError({ statusCode: res.status, statusMessage: err.error || 'Worker error' })
  }

  return res.json() as Promise<T>
}

export async function callZaloWorkerAction<T = unknown>(
  sessionId: string,
  method: string,
  args: unknown[] = [],
): Promise<T> {
  const { result } = await callZaloWorker<{ result: T }>('/action', {
    method: 'POST',
    body: { sessionId, method, args },
  })
  return result
}
