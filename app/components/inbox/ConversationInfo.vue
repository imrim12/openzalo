<script setup lang="ts">
const props = defineProps<{ conversationId: string }>()
const { conversation } = useChat(toRef(props, 'conversationId'))
</script>

<template>
  <UScrollArea class="h-full">
    <div v-if="!conversation" class="p-4 space-y-3">
      <USkeleton class="h-20 rounded-xl" />
      <USkeleton class="h-4 w-2/3 rounded" />
      <USkeleton class="h-4 w-1/2 rounded" />
    </div>
    <InboxInfoGroup
      v-else-if="conversation.thread_type === 'group'"
      :conversation="conversation"
    />
    <InboxInfoPerson
      v-else
      :conversation="conversation"
    />
  </UScrollArea>
</template>
