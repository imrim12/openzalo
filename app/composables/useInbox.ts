import type { ConversationWithContact } from '~/types'
import { $http } from '~/lib/ofetch'

export function useInbox() {
  const conversations = ref<ConversationWithContact[]>([])
  const isLoading = ref(false)
  const filter = ref<'all' | 'unread'>('all')
  const labelFilter = ref<string | null>(null)
  let cursor: string | undefined

  async function fetchConversations(reset = false) {
    if (reset) {
      cursor = undefined
      conversations.value = []
    }
    isLoading.value = true
    try {
      const params: Record<string, string> = {}
      if (filter.value === 'unread') params.status = 'open'
      if (cursor) params.cursor = cursor

      const data = await $http<ConversationWithContact[]>('/api/conversations', { params })

      if (reset) {
        conversations.value = data
      }
      else {
        conversations.value = [...conversations.value, ...data]
      }

      if (data.length > 0) {
        const last = data[data.length - 1]
        cursor = last.last_message_at?.toString()
      }
    }
    finally {
      isLoading.value = false
    }
  }

  function fetchMore() {
    return fetchConversations(false)
  }

  // SSE for real-time updates
  function connectSSE(): EventSource {
    const es = new EventSource('/api/conversations/sse')
    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'new_message' && data.conversation_id) {
          const idx = conversations.value.findIndex(c => c.id === data.conversation_id)
          if (idx >= 0) {
            const conv = { ...conversations.value[idx] }
            conv.last_message_preview = data.preview ?? conv.last_message_preview
            conv.last_message_at = data.at ? new Date(data.at) : conv.last_message_at
            conv.unread_count = (conv.unread_count ?? 0) + 1
            conversations.value.splice(idx, 1)
            conversations.value.unshift(conv)
          }
          else {
            fetchConversations(true)
          }
        }
      }
      catch {
        //
      }
    }
    return es
  }

  onMounted(() => fetchConversations(true))

  return { conversations, isLoading, filter, labelFilter, fetchConversations, fetchMore, connectSSE }
}
