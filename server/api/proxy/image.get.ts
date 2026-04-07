/**
 * GET /api/proxy/image?url=<encoded-zalo-cdn-url>
 * Fetches images from Zalo CDN server-side to avoid CORS issues in the browser.
 * Only allows requests to known Zalo CDN domains.
 */

const ALLOWED_HOSTS = [
  'zdn.vn',       // covers *.zdn.vn (photo-stal-*.zdn.vn, stc-chat.zdn.vn, stc.zdn.vn, etc.)
  'zalo.me',
  'zaloapp.com',
  'cdn.zaloapp.com',
  'img.zaloapp.com',
]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawUrl = query.url as string | undefined

  if (!rawUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' })
  }

  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid URL' })
  }

  const isAllowed = ALLOWED_HOSTS.some(host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))
  if (!isAllowed) {
    throw createError({ statusCode: 403, statusMessage: 'URL host not allowed' })
  }

  const res = await fetch(rawUrl, {
    headers: {
      'Referer': 'https://chat.zalo.me/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  })

  if (!res.ok) {
    throw createError({ statusCode: res.status, statusMessage: 'Failed to fetch image' })
  }

  const contentType = res.headers.get('content-type') ?? 'image/jpeg'
  setResponseHeader(event, 'Content-Type', contentType)
  setResponseHeader(event, 'Cache-Control', 'public, max-age=86400')

  return sendStream(event, res.body!)
})
