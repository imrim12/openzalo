<script setup lang="ts">
import type { MessageWithMeta } from '~/types'
import { formatTime, formatFileSize } from '~/lib/utils'

const props = defineProps<{
  message: MessageWithMeta
  showAvatar: boolean
}>()

const isAgent = computed(() => props.message.sender_type === 'agent')

const contextMenuItems = [
  [
    { label: 'Reply', icon: 'i-lucide-reply' },
    { label: 'Copy', icon: 'i-lucide-copy' },
    { label: 'React', icon: 'i-lucide-smile-plus' },
  ],
  [
    { label: 'Delete', icon: 'i-lucide-trash', color: 'error' as const },
  ],
]
</script>

<template>
  <UContextMenu :items="contextMenuItems">
    <div
      class="flex gap-2 mb-1 max-w-[75%]"
      :class="isAgent ? 'ml-auto flex-row-reverse' : ''"
    >
      <!-- Avatar (contact messages only) -->
      <UAvatar
        v-if="!isAgent && showAvatar"
        :src="message.sender_avatar ?? undefined"
        :alt="message.sender_name ?? undefined"
        :text="message.sender_name?.[0]"
        size="xs"
        class="mt-auto shrink-0"
      />
      <div v-else-if="!isAgent" class="w-6 shrink-0" />

      <!-- Bubble -->
      <div
        class="rounded-xl px-3 py-2 text-sm"
        :class="isAgent
          ? 'bg-(--ui-primary) text-white rounded-br-sm'
          : 'bg-(--ui-bg-elevated) text-(--ui-text) rounded-bl-sm'"
      >
        <!-- Sender name (groups only) -->
        <div
          v-if="!isAgent && showAvatar && message.sender_name"
          class="text-xs font-medium text-(--ui-primary) mb-0.5"
        >
          {{ message.sender_name }}
        </div>

        <!-- Reply quote -->
        <div
          v-if="message.reply_to_id"
          class="border-l-2 border-(--ui-border) pl-2 mb-1 text-xs opacity-70"
        >
          Replied to a message
        </div>

        <!-- Content by type -->
        <p v-if="message.message_type === 'text'" class="whitespace-pre-wrap break-words">
          {{ message.content }}
        </p>
        <img
          v-else-if="message.message_type === 'image' && message.attachments?.[0]"
          :src="message.attachments[0].url"
          class="rounded-lg max-w-xs cursor-pointer"
          :alt="message.attachments[0].fileName"
        />
        <div
          v-else-if="message.message_type === 'file' && message.attachments?.[0]"
          class="flex items-center gap-2"
        >
          <UIcon name="i-lucide-file" class="size-8 shrink-0" />
          <div>
            <div class="font-medium">{{ message.attachments[0].fileName }}</div>
            <div class="text-xs opacity-70">{{ formatFileSize(message.attachments[0].fileSize) }}</div>
          </div>
        </div>
        <div v-else-if="message.message_type === 'sticker'" class="text-4xl">
          {{ message.content }}
        </div>
        <div v-else-if="message.message_type === 'system'" class="text-xs italic opacity-60">
          {{ message.content }}
        </div>

        <!-- Timestamp -->
        <div class="text-[10px] mt-1 opacity-60 text-right">
          {{ formatTime(message.sent_at) }}
        </div>
      </div>
    </div>
  </UContextMenu>
</template>
