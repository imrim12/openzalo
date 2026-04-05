<script setup lang="ts">
const props = defineProps<{ conversationId: string }>()
const emit = defineEmits<{ toggleInfo: [] }>()

const { conversation } = useChat(toRef(props, 'conversationId'))
</script>

<template>
  <UDashboardNavbar>
    <template #left>
      <div class="flex items-center gap-3">
        <UAvatar
          :src="conversation?.contact?.avatar ?? undefined"
          :alt="conversation?.title ?? undefined"
          :text="conversation?.title?.[0]"
          size="sm"
        />
        <div>
          <div class="font-medium text-sm">
            {{ conversation?.title ?? conversation?.contact?.name ?? 'Loading...' }}
          </div>
          <div class="text-xs text-(--ui-text-muted) flex items-center gap-1">
            <span>{{ conversation?.thread_type === 'group' ? 'Group' : 'Direct message' }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #right>
      <UButton icon="i-lucide-search" variant="ghost" size="sm" />
      <UButton icon="i-lucide-phone" variant="ghost" size="sm" />
      <UButton icon="i-lucide-video" variant="ghost" size="sm" />
      <UButton
        icon="i-lucide-panel-right"
        variant="ghost"
        size="sm"
        @click="emit('toggleInfo')"
      />
    </template>
  </UDashboardNavbar>
</template>
