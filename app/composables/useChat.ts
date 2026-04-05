import type { MaybeRef } from 'vue'
import type { ConversationWithContact, MessageWithMeta } from '~/types'
import { $http } from '~/lib/ofetch'

export function useChat(conversationId: MaybeRef<string>) {
  const id = computed(() => toValue(conversationId))

  const messages = ref<MessageWithMeta[]>([])
  const conversation = ref<ConversationWithContact | null>(null)
  const isLoading = ref(false)
  const isSending = ref(false)
  const hasMore = ref(true)
  let cursor: string | undefined

  async function fetchConversation() {
    conversation.value = await $http<ConversationWithContact>(`/api/conversations/${id.value}`)
  }

  async function fetchMessages(reset = false) {
    if (reset) {
      cursor = undefined
      messages.value = []
      hasMore.value = true
    }
    isLoading.value = true
    try {
      const params: Record<string, string> = { limit: '50' }
      if (cursor) params.cursor = cursor

      const data = await $http<MessageWithMeta[]>(`/api/conversations/${id.value}/messages`, { params })

      if (reset) {
        messages.value = data
      }
      else {
        messages.value = [...data, ...messages.value]
      }

      if (data.length < 50) hasMore.value = false
      if (data.length > 0) {
        cursor = data[0].sent_at.toString()
      }
    }
    finally {
      isLoading.value = false
    }
  }

  async function sendMessage(content: string, type: 'text' | 'image' | 'file' | 'video' | 'sticker' | 'system' = 'text') {
    isSending.value = true
    try {
      const msg = await $http<MessageWithMeta>(`/api/conversations/${id.value}/messages`, {
        method: 'POST',
        body: { content, message_type: type },
      })
      messages.value.push(msg)

      await $http(`/api/conversations/${id.value}/read`, { method: 'POST' })
    }
    finally {
      isSending.value = false
    }
  }

  async function loadMore() {
    if (!hasMore.value || isLoading.value) return
    await fetchMessages(false)
  }

  async function markAsRead() {
    await $http(`/api/conversations/${id.value}/read`, { method: 'POST' })
    if (conversation.value) {
      conversation.value.unread_count = 0
    }
  }

  watch(id, (newId) => {
    if (newId) {
      fetchConversation()
      fetchMessages(true)
    }
  }, { immediate: true })

  return {
    messages,
    conversation,
    isLoading,
    isSending,
    hasMore,
    fetchMessages,
    sendMessage,
    loadMore,
    markAsRead,
  }
}
