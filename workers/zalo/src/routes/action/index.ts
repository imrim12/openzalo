import type { FastifyPluginAsync } from 'fastify'

export default (async (fastify) => {
  // POST /action → { result }
  // Body: { sessionId, method, args: [...] }
  fastify.post('/', async (request, reply) => {
    const { sessionId, method, args = [] } = request.body as {
      sessionId: string
      method: string
      args?: unknown[]
    }

    const api = fastify.zaloSessions.get(sessionId)
    if (!api) {
      return reply.status(404).send({ error: 'Session not found' })
    }

    const fn = (api as any)[method]
    if (typeof fn !== 'function') {
      return reply.status(400).send({ error: `Method "${method}" not found on API` })
    }

    try {
      const result = await fn.apply(api, args)
      return { result }
    } catch (err: any) {
      return reply.status(500).send({ error: err.message })
    }
  })
}) satisfies FastifyPluginAsync
