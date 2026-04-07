<script setup lang="ts">
import type { ContactItem } from '~/types'

const { contacts } = useContacts()

const groupedContacts = computed(() => {
  const groups: Record<string, ContactItem[]> = {}
  for (const c of contacts.value) {
    const letter = (c.name?.[0] || '#').toUpperCase()
    ;(groups[letter] ||= []).push(c)
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
})

const tagDotColors: Record<string, string> = {
  customer: 'bg-red-500',
  family: 'bg-green-500',
  work: 'bg-orange-500',
  friends: 'bg-purple-500',
  reply_later: 'bg-yellow-500',
}

const tagLabels: Record<string, string> = {
  customer: 'Khách hàng',
  family: 'Gia đình',
  work: 'Công việc',
  friends: 'Bạn bè',
  reply_later: 'Trả lời sau',
}

function tagDotColor(tag: string): string {
  return tagDotColors[tag] ?? 'bg-gray-400'
}

function tagLabel(tag: string): string {
  return tagLabels[tag] ?? tag
}

function contactMenuItems(contact: ContactItem) {
  return [
    [
      { label: 'View profile', icon: 'i-lucide-user' },
      { label: 'Send message', icon: 'i-lucide-message-circle' },
    ],
    [
      { label: 'Edit label', icon: 'i-lucide-tag' },
      { label: 'Block', icon: 'i-lucide-ban', color: 'error' as const },
    ],
  ]
}
</script>

<template>
  <div class="p-4">
    <div class="text-sm text-(--ui-text-muted) mb-4">
      Friends ({{ contacts.length }})
    </div>

    <template v-for="[letter, group] in groupedContacts" :key="letter">
      <div class="text-xs font-bold text-(--ui-text-muted) mt-4 mb-2">
        {{ letter }}
      </div>
      <div
        v-for="contact in group"
        :key="contact.id"
        class="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-(--ui-bg-elevated) cursor-pointer"
      >
        <UAvatar
          :src="contact.avatar ?? undefined"
          :alt="contact.name"
          :text="contact.name?.[0]"
          size="md"
        />
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium">
            {{ contact.name }}
          </div>
          <div v-if="(contact.tags ?? []).length" class="flex items-center gap-1 mt-0.5">
            <span
              v-for="(tag, i) in (contact.tags ?? []).slice(0, 2)"
              :key="tag"
              class="flex items-center gap-1 text-xs text-(--ui-text-muted)"
            >
              <span v-if="i > 0" class="text-(--ui-text-muted)">·</span>
              <span class="size-2 rounded-sm shrink-0 inline-block" :class="tagDotColor(tag)" />
              {{ tagLabel(tag) }}
            </span>
          </div>
        </div>
        <UDropdownMenu :items="contactMenuItems(contact)">
          <UButton icon="i-lucide-ellipsis" variant="ghost" size="xs" />
        </UDropdownMenu>
      </div>
    </template>

    <div
      v-if="contacts.length === 0"
      class="flex flex-col items-center justify-center gap-2 py-12 text-(--ui-text-muted)"
    >
      <UIcon name="i-lucide-users" class="size-8 opacity-40" />
      <span class="text-sm">No contacts yet</span>
    </div>
  </div>
</template>
