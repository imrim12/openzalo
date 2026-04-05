export default defineAuthenticatedHandler(async (event, session) => {
  setHeader(event, 'Content-Type', 'text/event-stream')
  setHeader(event, 'Cache-Control', 'no-cache')
  setHeader(event, 'Connection', 'keep-alive')
  setHeader(event, 'X-Accel-Buffering', 'no')

  const storage = useStorage('redis')
  const channelKey = `sse:${session.id}`

  let closed = false

  event.node.req.on('close', () => {
    closed = true
  })

  // Send keep-alive ping every 25s
  const heartbeat = setInterval(async () => {
    if (closed) {
      clearInterval(heartbeat)
      return
    }
    try {
      await event.node.res.write(': ping\n\n')
    }
    catch {
      clearInterval(heartbeat)
    }
  }, 25000)

  // Poll Redis for queued events
  const poll = setInterval(async () => {
    if (closed) {
      clearInterval(poll)
      return
    }
    try {
      const events = await storage.getItem<string[]>(channelKey)
      if (events && events.length > 0) {
        await storage.removeItem(channelKey)
        for (const ev of events) {
          await event.node.res.write(`data: ${ev}\n\n`)
        }
      }
    }
    catch {
      clearInterval(poll)
    }
  }, 1000)

  // Send initial connected event
  await event.node.res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)

  // Keep connection alive
  await new Promise<void>((resolve) => {
    event.node.req.on('close', () => {
      clearInterval(heartbeat)
      clearInterval(poll)
      resolve()
    })
  })
})
