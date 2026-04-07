import { type FastifyPluginAsync } from 'fastify'
import { Zalo, LoginQRCallbackEventType } from 'zca-js'
import crypto from 'node:crypto'
import { setupListener } from '../../lib/listener'

interface PendingQR {
  status: 'pending' | 'scanned' | 'confirmed' | 'expired' | 'declined'
  qrImage: string
  abortFn?: () => unknown
}

const pendingQRs = new Map<string, PendingQR>()

export default (async (fastify) => {
  // POST /auth/login → { sessionId, qrImage }
  fastify.post('/login', async () => {
    const sessionId = crypto.randomUUID()
    const zalo = new Zalo({ selfListen: false, logging: false })

    return new Promise((resolve) => {
      const loginPromise = zalo.loginQR({}, (event) => {
        switch (event.type) {
          case LoginQRCallbackEventType.QRCodeGenerated:
            pendingQRs.set(sessionId, {
              status: 'pending',
              qrImage: event.data.image,
              abortFn: event.actions.abort,
            })
            resolve({ sessionId, qrImage: event.data.image })
            break
          case LoginQRCallbackEventType.QRCodeScanned: {
            const p = pendingQRs.get(sessionId)
            if (p) p.status = 'scanned'
            break
          }
          case LoginQRCallbackEventType.QRCodeExpired: {
            const p = pendingQRs.get(sessionId)
            if (p) p.status = 'expired'
            break
          }
          case LoginQRCallbackEventType.QRCodeDeclined: {
            const p = pendingQRs.get(sessionId)
            if (p) p.status = 'declined'
            break
          }
        }
      })

      loginPromise.then((api) => {
        const p = pendingQRs.get(sessionId)
        if (p) p.status = 'confirmed'
        setupListener(api, sessionId)
        fastify.zaloSessions.set(sessionId, api)
        pendingQRs.delete(sessionId)
      }).catch((err) => {
        const p = pendingQRs.get(sessionId)
        if (p) p.status = 'expired'
        console.error('[auth] QR login failed:', err)
      })
    })
  })

  // GET /auth/status/:sessionId → { status }
  fastify.get('/status/:sessionId', async (request) => {
    const { sessionId } = request.params as { sessionId: string }
    const pending = pendingQRs.get(sessionId)
    if (!pending) {
      return { status: fastify.zaloSessions.has(sessionId) ? 'confirmed' : 'expired' }
    }
    return { status: pending.status }
  })
}) satisfies FastifyPluginAsync
