<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const showInfoPanel = ref(true)
const activeConversationId = ref<string | null>(null)
</script>

<template>
  <!-- LEFT: Conversation list panel -->
  <UDashboardPanel id="inbox-list" resizable :default-size="25" :min-size="18" :max-size="40">
    <template #header>
      <UDashboardNavbar>
        <template #default>
          <UInput
            icon="i-lucide-search"
            placeholder="Search..."
            class="w-full"
            readonly
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UTabs
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Unread', value: 'unread' },
            ]"
            :content="false"
            variant="link"
            size="sm"
          />
        </template>
        <template #right>
          <InboxLabelFilter />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <InboxConversationList
        :active-id="activeConversationId"
        @select="activeConversationId = $event"
      />
    </template>
  </UDashboardPanel>

  <!-- CENTER: Chat panel (default slot = no auto-scroll/padding) -->
  <UDashboardPanel id="inbox-chat">
    <div class="flex flex-col h-full">
      <!-- Header -->
      <InboxChatHeader
        v-if="activeConversationId"
        :conversation-id="activeConversationId"
        @toggle-info="showInfoPanel = !showInfoPanel"
      />

      <!-- Messages (fills remaining height, scrolls internally) -->
      <div class="flex-1 min-h-0 overflow-hidden">
        <InboxChatWindow
          v-if="activeConversationId"
          :conversation-id="activeConversationId"
        />
        <div
          v-else
          class="h-full flex flex-col items-center justify-center gap-3 text-(--ui-text-muted)"
        >
          <UIcon name="i-lucide-message-circle" class="size-12 opacity-30" />
          <p class="text-sm">
            Select a conversation to start chatting
          </p>
        </div>
      </div>

      <!-- Input -->
      <InboxMessageInput
        v-if="activeConversationId"
        :conversation-id="activeConversationId"
      />
    </div>
  </UDashboardPanel>

  <!-- RIGHT: Conversation info sidebar -->
  <UDashboardSidebar
    id="inbox-info"
    side="right"
    resizable
    collapsible
    :collapsed="!showInfoPanel || !activeConversationId"
    :default-size="25"
    :min-size="18"
    :max-size="35"
  >
    <InboxConversationInfo
      v-if="activeConversationId"
      :conversation-id="activeConversationId"
    />
    <div v-else class="h-full" />
  </UDashboardSidebar>
</template>
