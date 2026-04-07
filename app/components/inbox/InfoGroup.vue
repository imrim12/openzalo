<script setup lang="ts">
import type { ConversationWithContact } from '~/types'

defineProps<{ conversation: ConversationWithContact }>()
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="text-center font-semibold text-sm text-(--ui-text-muted)">
      Group Info
    </div>

    <!-- Avatar + Name -->
    <div class="flex flex-col items-center gap-2">
      <div class="relative">
        <UAvatar
          :alt="conversation.title ?? undefined"
          :text="conversation.title?.[0]"
          size="xl"
        />
        <UBadge
          v-if="(conversation.metadata as any)?.memberCount"
          :label="String((conversation.metadata as any).memberCount)"
          color="neutral"
          size="xs"
          class="absolute -bottom-1 -right-1"
        />
      </div>
      <div class="flex items-center gap-1.5">
        <span class="font-semibold text-center">{{ conversation.title }}</span>
        <UButton icon="i-lucide-pencil" variant="ghost" size="xs" />
      </div>
    </div>

    <!-- 4 action buttons -->
    <div class="grid grid-cols-4 gap-2 text-center">
      <div
        v-for="btn in [
          { icon: 'i-lucide-bell-off', label: 'Mute' },
          { icon: 'i-lucide-pin', label: 'Pin' },
          { icon: 'i-lucide-user-plus', label: 'Add' },
          { icon: 'i-lucide-settings', label: 'Manage' },
        ]" :key="btn.label" class="flex flex-col items-center gap-1 cursor-pointer"
      >
        <UButton :icon="btn.icon" variant="ghost" size="sm" />
        <span class="text-[10px] text-(--ui-text-muted)">{{ btn.label }}</span>
      </div>
    </div>

    <USeparator />

    <!-- Members collapsible -->
    <UCollapsible default-open>
      <div class="flex items-center justify-between cursor-pointer py-0.5">
        <span class="text-sm font-semibold">Members</span>
        <UIcon name="i-lucide-chevron-down" class="size-4 text-(--ui-text-muted)" />
      </div>
      <template #content>
        <div class="mt-2 flex items-center gap-2 text-sm text-(--ui-text-muted)">
          <UIcon name="i-lucide-users" class="size-4" />
          <span>{{ (conversation.metadata as any)?.memberCount ?? 0 }} members</span>
        </div>
      </template>
    </UCollapsible>

    <USeparator />

    <!-- Group board -->
    <div class="space-y-2">
      <span class="text-sm font-semibold">Group Board</span>
      <div class="flex items-center gap-2 text-sm cursor-pointer hover:text-(--ui-primary)">
        <UIcon name="i-lucide-clock" class="size-4" />
        <span>Reminders</span>
      </div>
      <div class="flex items-center gap-2 text-sm cursor-pointer hover:text-(--ui-primary)">
        <UIcon name="i-lucide-file-text" class="size-4" />
        <span>Notes, pins, polls</span>
      </div>
    </div>

    <USeparator />

    <InboxInfoMediaGallery :conversation-id="conversation.id" />
    <USeparator />
    <InboxInfoFileList :conversation-id="conversation.id" />
  </div>
</template>
