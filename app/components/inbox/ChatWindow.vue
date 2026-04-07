<script setup lang="ts">
import type { MessageWithMeta } from '~/types'
import { formatDateSeparator } from '~/lib/utils'

const props = defineProps<{ conversationId: string }>()

const { messages, isLoading, hasMore, loadMore } = useChat(toRef(props, 'conversationId'))

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
  if (index === msgs.length - 1)
    return true
  const curr = msgs[index]
  const next = msgs[index + 1]
  return curr.sender_type !== next.sender_type || curr.sender_name !== next.sender_name
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
        <USkeleton class="size-6 rounded-full shrink-0" />
        <USkeleton class="h-10 rounded-xl" :class="i % 2 === 0 ? 'w-48 ml-auto' : 'w-64'" />
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
