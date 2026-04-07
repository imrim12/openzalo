import type { FastifyPluginAsync } from 'fastify'

interface HistoryBody {
  sessionId: string
  threadId: string
  threadType: 0 | 1 // 0 = User (DM), 1 = Group
  count?: number
  lastMsgId?: string
}

/** Normalize a raw Zalo history message to a consistent shape matching ZaloMessage. */
function normalizeMsg(raw: any): any {
  // Group history: raw is { data: {...}, type, isSelf, threadId }
  const d = raw?.data ?? raw
  return {
    msgId: d.msgId ?? d.msgID,
    clientMsgId: d.cliMsgId ?? d.clientMsgId,
    fromUid: d.uidFrom ?? d.fromUid,
    toUid: d.idTo ?? d.toUid,
    message: typeof d.content === 'string' ? d.content : '',
    type: d.type ?? 1,
    timestamp: d.ts ? Number(d.ts) : Date.now(),
    msgType: d.msgType,
    attach: typeof d.content === 'object' ? JSON.stringify([d.content]) : undefined,
  }
}

/**
 * POST /history
 * Fetches old messages for a conversation.
 *
 * Groups: uses HTTP API `getGroupChatHistory` directly.
 * DMs: uses WebSocket `listener.requestOldMessages` + waits for `old_messages` event.
 */
export default (async (fastify) => {
  fastify.post('/', async (request, reply) => {
    const { sessionId, threadId, threadType, count = 50, lastMsgId } = request.body as HistoryBody

    const api = fastify.zaloSessions.get(sessionId)
    if (!api) {
      return reply.status(404).send({ error: 'Session not found' })
    }

    try {
      if (threadType === 1) {
        // Group — HTTP API
        const result = await (api as any).getGroupChatHistory(threadId, count, lastMsgId)
        // Result shape: { lastActionId, groupMsgs: [{ type, data, threadId, isSelf }] }
        const rawMsgs: any[] = result?.groupMsgs ?? result?.msgs ?? []
        return { messages: rawMsgs.map(normalizeMsg) }
      }
      else {
        // DM — WebSocket request/event pattern
        const messages = await new Promise<unknown[]>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('old_messages timeout')), 15000)

          api.listener.once('old_messages', (data: any) => {
            clearTimeout(timeout)
            const rawMsgs: any[] = data?.msgs ?? data ?? []
            resolve(rawMsgs.map(normalizeMsg))
          })

          try {
            ;(api as any).listener.requestOldMessages(0, lastMsgId ?? '0', threadId)
          }
          catch (err) {
            clearTimeout(timeout)
            reject(err)
          }
        })

        return { messages }
      }
    }
    catch (err: any) {
      return reply.status(500).send({ error: err.message })
    }
  })
}) satisfies FastifyPluginAsync
