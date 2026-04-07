<script setup lang="ts">
const isOpen = defineModel<boolean>('open')

defineShortcuts({
  meta_k: () => {
    isOpen.value = true
  }
})

const { conversations } = useInbox()

const groups = computed(() => [
  {
    id: 'conversations',
    label: 'Conversations',
    items: conversations.value.slice(0, 10).map(c => ({
      label: c.title ?? c.contact?.name ?? 'Unknown',
      description: c.last_message_preview ?? '',
      icon: 'i-lucide-message-circle',
      onSelect: () => {
        isOpen.value = false
        navigateTo('/dashboard/inbox')
      },
    })),
  },
])
</script>

<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'p-0 overflow-hidden' }">
    <template #content>
      <UCommandPalette
        :groups="groups"
        placeholder="Search conversations, contacts..."
        close
        @update:open="isOpen = $event"
      />
    </template>
  </UModal>
</template>
