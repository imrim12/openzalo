<script setup lang="ts">
const props = defineProps<{
  activeId: string | null
}>()

const emit = defineEmits<{
  select: [id: string]
}>()

const { conversations, isLoading } = useInbox()
</script>

<template>
  <div class="flex flex-col overflow-y-auto h-full">
    <InboxConversationItem
      v-for="conv in conversations"
      :key="conv.id"
      :conversation="conv"
      :active="conv.id === activeId"
      @click="emit('select', conv.id)"
    />
    <div v-if="isLoading" class="p-3 space-y-2">
      <USkeleton class="h-14 rounded-lg" />
      <USkeleton class="h-14 rounded-lg" />
      <USkeleton class="h-14 rounded-lg" />
    </div>
    <div
      v-else-if="!isLoading && conversations.length === 0"
      class="flex flex-col items-center justify-center gap-2 py-12 text-(--ui-text-muted)"
    >
      <UIcon name="i-lucide-inbox" class="size-8 opacity-40" />
      <span class="text-sm">No conversations</span>
    </div>
  </div>
</template>
