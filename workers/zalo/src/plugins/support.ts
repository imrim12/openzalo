import type { API } from 'zca-js'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  fastify.decorate('zaloSessions', new Map<string, API>())
})

declare module 'fastify' {
  interface FastifyInstance {
    zaloSessions: Map<string, API>
  }
}
