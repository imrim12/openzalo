<script setup lang="ts">
const props = defineProps<{
  activeId: string | null | undefined
  search?: string
}>()

const { conversations, isLoading } = useInbox()

const filtered = computed(() => {
  const q = props.search?.trim().toLowerCase()
  if (!q) return conversations.value
  return conversations.value.filter(c =>
    c.title?.toLowerCase().includes(q)
    || c.contact?.name?.toLowerCase().includes(q)
    || c.last_message_preview?.toLowerCase().includes(q),
  )
})
</script>

<template>
  <div class="flex flex-col overflow-y-auto h-full">
    <InboxConversationItem
      v-for="conv in filtered"
      :key="conv.id"
      :conversation="conv"
      :active="conv.id === activeId"
      @click="navigateTo(`/dashboard/inbox/${conv.id}`)"
    />
    <div v-if="isLoading" class="p-3 space-y-2">
      <USkeleton class="h-14 rounded-lg" />
      <USkeleton class="h-14 rounded-lg" />
      <USkeleton class="h-14 rounded-lg" />
    </div>
    <div
      v-else-if="!isLoading && filtered.length === 0"
      class="flex flex-col items-center justify-center gap-2 py-12 text-(--ui-text-muted)"
    >
      <UIcon name="i-lucide-inbox" class="size-8 opacity-40" />
      <span class="text-sm">No conversations</span>
    </div>
  </div>
</template>
