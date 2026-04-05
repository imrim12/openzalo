<script setup lang="ts">
import { formatRelativeTime } from '~/lib/utils'

// Placeholder until Phase 2 implements actual friend requests
const requests = ref<{
  id: string
  name: string
  avatar?: string
  isBusiness?: boolean
  source: string
  sentAt: Date
  message: string
}[]>([])
</script>

<template>
  <div class="p-4">
    <div class="text-sm text-(--ui-text-muted) mb-4">
      Received Requests ({{ requests.length }})
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      <UCard
        v-for="req in requests"
        :key="req.id"
        :ui="{ body: 'p-4' }"
      >
        <div class="flex items-start gap-3">
          <UAvatar
            :src="req.avatar"
            :alt="req.name"
            size="md"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-sm">{{ req.name }}</span>
              <UBadge
                v-if="req.isBusiness"
                label="Business"
                color="primary"
                size="xs"
              />
            </div>
            <div class="text-xs text-(--ui-text-muted) mt-0.5">
              {{ req.source }} &middot; {{ formatRelativeTime(req.sentAt) }}
            </div>
          </div>
        </div>

        <div class="mt-3 p-2 bg-(--ui-bg-elevated) rounded text-sm text-(--ui-text-muted)">
          {{ req.message }}
        </div>

        <div class="flex gap-2 mt-3">
          <UButton
            label="Decline"
            variant="outline"
            color="neutral"
            size="sm"
            class="flex-1"
          />
          <UButton
            label="Accept"
            color="primary"
            size="sm"
            class="flex-1"
          />
        </div>
      </UCard>
    </div>

    <div
      v-if="requests.length === 0"
      class="flex flex-col items-center justify-center gap-2 py-12 text-(--ui-text-muted)"
    >
      <UIcon name="i-lucide-user-plus" class="size-8 opacity-40" />
      <span class="text-sm">No friend requests</span>
    </div>
  </div>
</template>
