<script setup lang="ts">
import type { MessageWithMeta } from '~/types'
import { formatFileSize, formatTime } from '~/lib/utils'

const props = defineProps<{
  message: MessageWithMeta
  showAvatar: boolean
}>()

defineEmits<{ viewImage: [url: string] }>()

const isAgent = computed(() => props.message.sender_type === 'agent')

const displayName = computed(() =>
  isAgent.value ? 'You' : (props.message.sender_name ?? 'Unknown'),
)

function proxyImageUrl(url: string) {
  if (!url) return url
  if (url.startsWith('/api/proxy/') || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `/api/proxy/image?url=${encodeURIComponent(url)}`
}

function isImageAttachment(attachment?: { type?: string, url?: string } | null) {
  if (!attachment) return false
  if (attachment.type === 'image') return true
  const url = attachment.url ?? ''
  return /\.(jpg|jpeg|png|gif|webp|bmp|heic)(\?|$)/i.test(url) || /\/(jpg|png|gif|img)\//i.test(url)
}

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
    <div class="flex gap-2 py-0.5 px-2 hover:bg-(--ui-bg-elevated)/50 group">
      <!-- Avatar column -->
      <div class="w-8 shrink-0 pt-0.5">
        <UAvatar
          v-if="showAvatar"
          :src="message.sender_avatar ?? undefined"
          :alt="message.sender_name ?? undefined"
          :text="message.sender_name?.[0]"
          size="sm"
        />
      </div>

      <div class="flex-1 min-w-0">
        <!-- Header: name + time (first message in group) -->
        <div v-if="showAvatar" class="flex items-baseline gap-2 mb-0.5">
          <span class="text-sm font-semibold text-(--ui-text)">
            {{ displayName }}
          </span>
          <span class="text-xs text-(--ui-text-muted)">
            {{ formatTime(message.sent_at) }}
          </span>
        </div>

        <!-- Reply quote -->
        <div
          v-if="message.reply_to_id"
          class="border-l-2 border-(--ui-border) pl-2 mb-1 text-xs opacity-70"
        >
          Replied to a message
        </div>

        <!-- Content by type -->
        <p v-if="message.message_type === 'text'" class="text-sm whitespace-pre-wrap break-words">
          {{ message.content }}
        </p>
        <img
          v-else-if="(message.message_type === 'image' || isImageAttachment(message.attachments?.[0])) && message.attachments?.[0]"
          :src="proxyImageUrl(message.attachments[0].thumbnailUrl || message.attachments[0].url)"
          class="rounded-lg max-w-xs cursor-pointer"
          :alt="message.attachments[0].fileName ?? 'image'"
          @click="$emit('viewImage', message.attachments[0].url)"
        >
        <div
          v-else-if="message.message_type === 'file' && message.attachments?.[0]"
          class="flex items-center gap-2"
        >
          <UIcon name="i-lucide-file" class="size-8 shrink-0" />
          <div>
            <div class="text-sm font-medium">
              {{ message.attachments[0].fileName }}
            </div>
            <div class="text-xs opacity-70">
              {{ formatFileSize(message.attachments[0].fileSize) }}
            </div>
          </div>
        </div>
        <div v-else-if="message.message_type === 'sticker'" class="text-4xl">
          {{ message.content }}
        </div>
        <div v-else-if="message.message_type === 'system'" class="text-xs italic opacity-60">
          {{ message.content }}
        </div>
      </div>
    </div>
  </UContextMenu>
</template>
