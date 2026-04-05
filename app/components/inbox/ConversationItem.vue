<script setup lang="ts">
import type { ConversationWithContact } from '~/types'
import { formatRelativeTime } from '~/lib/utils'

const props = defineProps<{
  conversation: ConversationWithContact
  active: boolean
}>()

const emit = defineEmits<{
  click: []
}>()

const contextMenuItems = [
  [
    { label: 'Pin', icon: 'i-lucide-pin' },
    { label: 'Star', icon: 'i-lucide-star' },
    { label: 'Mark as read', icon: 'i-lucide-check-check' },
  ],
  [
    { label: 'Archive', icon: 'i-lucide-archive' },
    { label: 'Close', icon: 'i-lucide-x-circle', color: 'error' as const },
  ],
]
</script>

<template>
  <UContextMenu :items="contextMenuItems">
    <div
      class="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-(--ui-bg-elevated) transition-colors"
      :class="{ 'bg-(--ui-bg-elevated)': active }"
      @click="emit('click')"
    >
      <!-- Avatar with channel badge overlay -->
      <div class="relative shrink-0">
        <UAvatar
          :src="conversation.contact?.avatar ?? undefined"
          :alt="conversation.title ?? undefined"
          :text="conversation.title?.[0]"
          size="lg"
        />
        <InboxChannelBadge
          v-if="conversation.channel_connection_id"
          type="zalo"
          class="absolute -bottom-0.5 -right-0.5"
        />
      </div>

      <!-- Name + preview -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between">
          <span class="font-medium text-sm truncate text-(--ui-text)">
            {{ conversation.title ?? conversation.contact?.name ?? 'Unknown' }}
          </span>
          <span class="text-xs text-(--ui-text-muted) shrink-0 ml-2">
            {{ conversation.last_message_at ? formatRelativeTime(conversation.last_message_at) : '' }}
          </span>
        </div>
        <div class="flex items-center justify-between mt-0.5">
          <span class="text-xs text-(--ui-text-muted) truncate">
            {{ conversation.last_message_preview ?? '' }}
          </span>
          <UBadge
            v-if="(conversation.unread_count ?? 0) > 0"
            :label="String(conversation.unread_count)"
            color="error"
            size="xs"
            class="shrink-0 rounded-full ml-1"
          />
        </div>
      </div>
    </div>
  </UContextMenu>
</template>
