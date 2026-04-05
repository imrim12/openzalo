<script setup lang="ts">
const props = defineProps<{ conversationId: string }>()

const message = ref('')
const { sendMessage, isSending } = useChat(toRef(props, 'conversationId'))

async function handleSend() {
  if (!message.value.trim()) return
  await sendMessage(message.value)
  message.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

const commonEmojis = ['😀', '😂', '😍', '🥰', '😊', '🙏', '👍', '❤️', '🎉', '🔥', '✨', '😭', '😅', '🤣', '😎', '🥳', '💪', '👏', '🙌', '💯']

const attachItems = [
  [
    { label: 'Image', icon: 'i-lucide-image' },
    { label: 'File', icon: 'i-lucide-file-up' },
    { label: 'Video', icon: 'i-lucide-video' },
  ],
]
</script>

<template>
  <div class="flex items-end gap-1 px-3 py-2 border-t border-(--ui-border)">
    <!-- Emoji button -->
    <UPopover>
      <UButton icon="i-lucide-smile" variant="ghost" size="sm" />
      <template #content>
        <div class="p-2 grid grid-cols-5 gap-1 w-48">
          <button
            v-for="emoji in commonEmojis"
            :key="emoji"
            class="text-xl hover:bg-(--ui-bg-elevated) rounded p-1 cursor-pointer"
            @click="message += emoji"
          >
            {{ emoji }}
          </button>
        </div>
      </template>
    </UPopover>

    <!-- Attach dropdown -->
    <UDropdownMenu :items="attachItems">
      <UButton icon="i-lucide-paperclip" variant="ghost" size="sm" />
    </UDropdownMenu>

    <!-- Text input -->
    <UTextarea
      v-model="message"
      placeholder="Type a message..."
      :rows="1"
      autoresize
      :maxrows="5"
      class="flex-1"
      :ui="{ root: 'flex-1' }"
      @keydown="handleKeydown"
    />

    <!-- Send button -->
    <UButton
      icon="i-lucide-send"
      color="primary"
      size="sm"
      :loading="isSending"
      :disabled="!message.trim()"
      @click="handleSend"
    />
  </div>
</template>
