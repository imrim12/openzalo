<script setup lang="ts">
import type { MessageAttachment } from '~~/shared/types/message'

const props = defineProps<{ conversationId: string }>()

const { messages } = useChat(toRef(props, 'conversationId'))

const sharedMedia = computed<MessageAttachment[]>(() =>
  messages.value
    .filter(m => m.message_type === 'image' || m.message_type === 'video')
    .flatMap(m => m.attachments ?? []),
)
</script>

<template>
  <UCollapsible default-open>
    <div class="flex items-center justify-between w-full cursor-pointer py-0.5">
      <span class="text-sm font-semibold">Photos / Videos</span>
      <UIcon name="i-lucide-chevron-down" class="size-4 text-(--ui-text-muted)" />
    </div>

    <template #content>
      <div class="mt-2 grid grid-cols-4 gap-1">
        <img
          v-for="(media, i) in sharedMedia.slice(0, 8)"
          :key="i"
          :src="media.thumbnailUrl || media.url"
          class="aspect-square object-cover rounded cursor-pointer hover:opacity-80"
          :alt="media.fileName"
        >
        <div
          v-if="sharedMedia.length === 0"
          class="col-span-4 text-xs text-(--ui-text-muted) text-center py-3"
        >
          No media shared yet
        </div>
      </div>
      <UButton
        v-if="sharedMedia.length > 8"
        label="View all"
        variant="outline"
        size="xs"
        block
        class="mt-2"
      />
    </template>
  </UCollapsible>
</template>
