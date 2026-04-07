import crypto from 'node:crypto'
import {
  handleZaloFriendEvent,
  handleZaloGroupEvent,
  handleZaloMessage,
  handleZaloReaction,
  handleZaloTyping,
  handleZaloUndo,
} from '~~/server/services/zalo/webhook-handlers'

function verifySignature(payload: string, header: string | undefined, secret: string): boolean {
  if (!header)
    return false
  const expected = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`
  try {
    return crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected))
  }
  catch {
    return false
  }
}

/**
 * POST /api/webhooks/zalo
 * Receives HMAC-signed events from the Zalo worker and dispatches them to handlers.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secret = config.webhookSigningSecret as string

  const rawBody = await readRawBody(event) ?? ''
  const signature = getHeader(event, 'x-signature')

  if (!verifySignature(rawBody, signature, secret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid webhook signature' })
  }

  let payload: { event: string, sessionId: string, data: unknown }
  try {
    payload = JSON.parse(rawBody)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const { event: eventName, sessionId, data } = payload
  const db = getPgClient()

  try {
    switch (eventName) {
      case 'message':
        await handleZaloMessage(db, sessionId, data as any)
        break
      case 'reaction':
        await handleZaloReaction(db, sessionId, data as any)
        break
      case 'undo':
        await handleZaloUndo(db, sessionId, data as any)
        break
      case 'typing':
        await handleZaloTyping(db, sessionId, data as any)
        break
      case 'friend_event':
        await handleZaloFriendEvent(db, sessionId, data as any)
        break
      case 'group_event':
        await handleZaloGroupEvent(db, sessionId, data as any)
        break
      default:
        // seen_messages, delivered_messages, old_messages etc. handled elsewhere or ignored
        break
    }
  }
  catch (err) {
    console.error(`[webhook] handler error for ${eventName}:`, err)
  }

  return { ok: true }
})
