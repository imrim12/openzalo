<script setup lang="ts">
import type { ChatInstance } from '~/composables/useChat'

const route = useRoute()
const id = computed(() => route.params.id as string)
const showInfoPanel = ref(true)

// Single useChat instance — provided to all children (ChatWindow, MessageInput)
const chat = useChat(id)
provide<ChatInstance>('chat', chat)
</script>

<template>
  <!-- CENTER: Chat panel -->
  <UDashboardPanel id="inbox-chat">
    <div class="flex flex-col h-full">
      <InboxChatHeader
        :conversation-id="id"
        @toggle-info="showInfoPanel = !showInfoPanel"
      />
      <div class="flex-1 min-h-0 overflow-hidden">
        <InboxChatWindow :conversation-id="id" />
      </div>
      <InboxMessageInput :conversation-id="id" />
    </div>
  </UDashboardPanel>

  <!-- RIGHT: Info sidebar -->
  <UDashboardSidebar
    id="inbox-info"
    side="right"
    resizable
    collapsible
    :collapsed="!showInfoPanel"
    :default-size="25"
    :min-size="18"
    :max-size="35"
  >
    <InboxConversationInfo :conversation-id="id" />
  </UDashboardSidebar>
</template>
