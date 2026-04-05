<script setup lang="ts">
import type { ConversationWithContact } from '~/types'

defineProps<{ conversation: ConversationWithContact }>()
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="text-center font-semibold text-sm text-(--ui-text-muted)">
      Conversation Info
    </div>

    <!-- Avatar + Name -->
    <div class="flex flex-col items-center gap-2">
      <UAvatar
        :src="conversation.contact?.avatar ?? undefined"
        :alt="conversation.contact?.name ?? undefined"
        size="xl"
      />
      <div class="flex items-center gap-1.5">
        <span class="font-semibold">
          {{ conversation.contact?.name ?? conversation.title ?? 'Unknown' }}
        </span>
        <UButton icon="i-lucide-pencil" variant="ghost" size="xs" />
      </div>
      <div v-if="conversation.contact?.phone" class="text-sm text-(--ui-text-muted)">
        {{ conversation.contact.phone }}
      </div>
    </div>

    <USeparator />

    <!-- Tags -->
    <div v-if="conversation.contact?.tags?.length" class="flex flex-wrap gap-1">
      <UBadge
        v-for="tag in conversation.contact.tags"
        :key="tag"
        :label="tag"
        color="primary"
        variant="subtle"
        size="xs"
      />
    </div>

    <USeparator v-if="conversation.contact?.tags?.length" />

    <!-- Notes collapsible -->
    <UCollapsible>
      <div class="flex items-center justify-between cursor-pointer py-0.5">
        <span class="text-sm font-semibold">Notes</span>
        <UIcon name="i-lucide-chevron-down" class="size-4 text-(--ui-text-muted)" />
      </div>
      <template #content>
        <p class="mt-2 text-sm text-(--ui-text-muted)">
          {{ conversation.contact?.notes ?? 'No notes yet.' }}
        </p>
      </template>
    </UCollapsible>

    <USeparator />

    <div class="flex items-center gap-2 text-sm cursor-pointer hover:text-(--ui-primary)">
      <UIcon name="i-lucide-clock" class="size-4" />
      <span>Reminders</span>
    </div>

    <USeparator />

    <InboxInfoMediaGallery :conversation-id="conversation.id" />
    <USeparator />
    <InboxInfoFileList :conversation-id="conversation.id" />
  </div>
</template>
