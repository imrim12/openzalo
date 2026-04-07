import type { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify) => {
  fastify.get('/health', async () => ({
    status: 'ok',
    sessions: fastify.zaloSessions.size,
  }))
}

export default root
