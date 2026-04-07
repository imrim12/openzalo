import 'dotenv/config'
import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {}

const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts) => {
  const secret = process.env.NUXT_WEBHOOK_SIGNING_SECRET

  fastify.addHook('onRequest', async (request, reply) => {
    if (request.url === '/health') return
    if (!secret) {
      reply.status(503).send({ error: 'NUXT_WEBHOOK_SIGNING_SECRET is not configured' })
      return
    }
    const auth = request.headers['authorization']
    if (auth !== `Bearer ${secret}`) {
      reply.status(401).send({ error: 'Unauthorized' })
    }
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })
}

export default app
export { app, options }
