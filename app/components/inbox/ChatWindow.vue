<script setup lang="ts">
import type { MessageWithMeta } from '~/types'
import type { ChatInstance } from '~/composables/useChat'
import { formatDateSeparator } from '~/lib/utils'

const props = defineProps<{ conversationId: string }>()

// Prefer the instance provided by the parent page (inbox/[id].vue) so ChatWindow
// and MessageInput share the exact same reactive state.
const chat = inject<ChatInstance | null>('chat', null)
const { messages, isLoading, hasMore, loadMore } = chat ?? useChat(toRef(props, 'conversationId'))

const scrollRef = ref<HTMLElement>()

// Auto-scroll to bottom when new messages arrive
watch(() => messages.value.length, async () => {
  await nextTick()
  if (scrollRef.value) {
    scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
})

function shouldShowDateSeparator(msgs: MessageWithMeta[], index: number): boolean {
  if (index === 0)
    return true
  const prev = msgs[index - 1]
  const curr = msgs[index]
  return new Date(prev.sent_at).toDateString() !== new Date(curr.sent_at).toDateString()
}

function shouldShowAvatar(msgs: MessageWithMeta[], index: number): boolean {
  if (index === 0) return true
  const prev = msgs[index - 1]
  const curr = msgs[index]
  if (curr.sender_type !== prev.sender_type || curr.sender_name !== prev.sender_name)
    return true
  const gap = new Date(curr.sent_at).getTime() - new Date(prev.sent_at).getTime()
  return gap > 5 * 60 * 1000
}

function onScroll() {
  if (scrollRef.value && scrollRef.value.scrollTop < 50 && hasMore.value && !isLoading.value) {
    loadMore()
  }
}
</script>

<template>
  <div
    ref="scrollRef"
    class="h-full overflow-y-auto px-4 py-2"
    @scroll="onScroll"
  >
    <div v-if="isLoading && messages.length === 0" class="space-y-3 py-4">
      <div v-for="i in 5" :key="i" class="flex gap-2">
        <USkeleton class="size-8 rounded-full shrink-0" />
        <USkeleton class="h-10 rounded-xl w-64" />
      </div>
    </div>

    <template v-for="(msg, index) in messages" :key="msg.id">
      <!-- Date separator -->
      <div
        v-if="shouldShowDateSeparator(messages, index)"
        class="flex items-center gap-3 my-4"
      >
        <div class="flex-1 h-px bg-(--ui-border)" />
        <span class="text-xs text-(--ui-text-muted) shrink-0 px-2">
          {{ formatDateSeparator(msg.sent_at) }}
        </span>
        <div class="flex-1 h-px bg-(--ui-border)" />
      </div>

      <InboxMessageBubble
        :message="msg"
        :show-avatar="shouldShowAvatar(messages, index)"
      />
    </template>

    <div
      v-if="!isLoading && messages.length === 0"
      class="h-full flex flex-col items-center justify-center gap-2 text-(--ui-text-muted)"
    >
      <UIcon name="i-lucide-message-circle" class="size-8 opacity-30" />
      <p class="text-sm">
        No messages yet
      </p>
    </div>
  </div>
</template>
