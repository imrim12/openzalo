import type { API } from 'zca-js'

const FORWARDED_EVENTS = [
  'message',
  'reaction',
  'undo',
  'group_event',
  'friend_event',
  'typing',
  'seen_messages',
  'delivered_messages',
  'old_messages',
  'old_reactions',
  'upload_attachment',
] as const

export function setupListener(api: API, sessionId: string): void {
  const ssl = process.env.NUXT_PUBLIC_SSL_ENABLED === 'true'
  const domain = process.env.NUXT_PUBLIC_BASE_DOMAIN || 'localhost:3000'
  const webhookUrl = `${ssl ? 'https' : 'http'}://${domain}/api/webhooks/zalo-next`

  for (const eventName of FORWARDED_EVENTS) {
    api.listener.on(eventName, async (...args: unknown[]) => {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: eventName,
            sessionId,
            data: args.length === 1 ? args[0] : args,
          }),
        })
      } catch (err) {
        console.error(`[listener] ${eventName} webhook forward failed:`, err)
      }
    })
  }

  api.listener.on('error', (err: unknown) => {
    console.error(`[listener] error for ${sessionId}:`, err)
  })

  api.listener.on('closed', (code: unknown, reason: unknown) => {
    console.warn(`[listener] closed for ${sessionId}: ${code} ${reason}`)
  })

  api.listener.start()
}
