<script setup lang="ts">
import type { ConversationWithContact } from '~/types'

const { conversations } = useInbox()

const groups = computed(() =>
  conversations.value.filter(c => c.thread_type === 'group'),
)

const groupMenuItems = [
  [
    { label: 'View group', icon: 'i-lucide-users' },
    { label: 'Mute', icon: 'i-lucide-bell-off' },
  ],
  [
    { label: 'Leave group', icon: 'i-lucide-log-out', color: 'error' as const },
  ],
]
</script>

<template>
  <div class="p-4">
    <div class="text-sm text-(--ui-text-muted) mb-4">
      Groups & Communities ({{ groups.length }})
    </div>

    <div class="space-y-1">
      <div
        v-for="group in groups"
        :key="group.id"
        class="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-(--ui-bg-elevated) cursor-pointer"
      >
        <!-- Stacked 2x2 avatar grid like Zalo -->
        <div class="relative size-10 shrink-0">
          <div class="grid grid-cols-2 gap-px size-10 rounded-lg overflow-hidden bg-(--ui-bg-elevated)">
            <div class="bg-blue-400 flex items-center justify-center text-white text-[9px] font-bold">
              {{ group.title?.[0]?.toUpperCase() }}
            </div>
            <div class="bg-green-400 flex items-center justify-center text-white text-[9px] font-bold">
              {{ group.title?.[1]?.toUpperCase() ?? group.title?.[0]?.toUpperCase() }}
            </div>
            <div class="bg-purple-400 flex items-center justify-center text-white text-[9px] font-bold">
              {{ group.title?.[2]?.toUpperCase() ?? group.title?.[0]?.toUpperCase() }}
            </div>
            <div class="bg-orange-400 flex items-center justify-center text-white text-[9px] font-bold">
              {{ group.title?.[3]?.toUpperCase() ?? group.title?.[0]?.toUpperCase() }}
            </div>
          </div>
          <span
            v-if="(group.metadata as any)?.memberCount"
            class="absolute -bottom-1 -right-1 bg-(--ui-bg-elevated) text-(--ui-text) text-[9px] font-semibold rounded-full px-1 border border-(--ui-border) leading-4"
          >
            {{ (group.metadata as any).memberCount }}
          </span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <UIcon
              v-if="(group.metadata as any)?.type === 'community'"
              name="i-lucide-globe"
              class="size-3.5 text-(--ui-text-muted)"
            />
            <span class="text-sm font-medium truncate">{{ group.title }}</span>
          </div>
          <div class="text-xs text-(--ui-text-muted)">
            {{ (group.metadata as any)?.memberCount ?? 0 }} members
          </div>
        </div>
        <UDropdownMenu :items="groupMenuItems">
          <UButton icon="i-lucide-ellipsis" variant="ghost" size="xs" />
        </UDropdownMenu>
      </div>

      <div
        v-if="groups.length === 0"
        class="flex flex-col items-center justify-center gap-2 py-12 text-(--ui-text-muted)"
      >
        <UIcon name="i-lucide-users-round" class="size-8 opacity-40" />
        <span class="text-sm">No groups yet</span>
      </div>
    </div>
  </div>
</template>
