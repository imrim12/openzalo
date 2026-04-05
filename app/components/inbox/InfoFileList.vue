<script setup lang="ts">
import type { MessageAttachment } from '~~/shared/types/message'
import { formatFileSize, formatDate } from '~/lib/utils'

const props = defineProps<{ conversationId: string }>()

const { messages } = useChat(toRef(props, 'conversationId'))

const sharedFiles = computed(() =>
  messages.value
    .filter(m => m.message_type === 'file')
    .flatMap(m => (m.attachments ?? []).map(a => ({ ...a, sentAt: m.sent_at }))),
)

function fileTypeIcon(file: MessageAttachment): string {
  const ext = file.fileName?.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'i-lucide-file-text'
  if (['doc', 'docx'].includes(ext)) return 'i-lucide-file-type'
  if (['xls', 'xlsx'].includes(ext)) return 'i-lucide-file-spreadsheet'
  if (['zip', 'rar', '7z'].includes(ext)) return 'i-lucide-file-archive'
  return 'i-lucide-file'
}

function fileTypeBg(file: MessageAttachment): string {
  const ext = file.fileName?.split('.').pop()?.toLowerCase() ?? ''
  if (ext === 'pdf') return 'bg-red-500'
  if (['doc', 'docx'].includes(ext)) return 'bg-blue-500'
  if (['xls', 'xlsx'].includes(ext)) return 'bg-green-500'
  return 'bg-gray-500'
}
</script>

<template>
  <UCollapsible default-open>
    <div class="flex items-center justify-between w-full cursor-pointer py-0.5">
      <span class="text-sm font-semibold">Files</span>
      <UIcon name="i-lucide-chevron-down" class="size-4 text-(--ui-text-muted)" />
    </div>

    <template #content>
      <div class="mt-2 space-y-1">
        <div
          v-for="(file, i) in sharedFiles"
          :key="i"
          class="flex items-center gap-3 p-2 rounded hover:bg-(--ui-bg-elevated) cursor-pointer"
        >
          <div class="size-10 rounded flex items-center justify-center shrink-0" :class="fileTypeBg(file)">
            <UIcon :name="fileTypeIcon(file)" class="size-5 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-sm font-medium truncate">{{ file.fileName ?? 'File' }}</div>
            <div class="text-xs text-(--ui-text-muted)">
              {{ formatFileSize(file.fileSize) }}
              <span class="mx-1">&middot;</span>
              {{ formatDate(file.sentAt) }}
            </div>
          </div>
        </div>
        <div
          v-if="sharedFiles.length === 0"
          class="text-xs text-(--ui-text-muted) text-center py-3"
        >
          No files shared yet
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
