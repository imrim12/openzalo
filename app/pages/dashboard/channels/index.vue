<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const isAddOpen = ref(false)
const { channels, isLoading, createChannel, deleteChannel } = useChannels()

const channelTypeOptions = [
  { label: 'Zalo', value: 'zalo', icon: 'i-simple-icons-zalo' },
  { label: 'Facebook', value: 'facebook', icon: 'i-simple-icons-facebook' },
]

const newChannel = reactive({ channel_type: 'zalo' as const, name: '' })

async function handleCreate() {
  await createChannel(newChannel)
  isAddOpen.value = false
  newChannel.name = ''
}

const statusColor: Record<string, string> = {
  active: 'success',
  disconnected: 'warning',
  error: 'error',
  pending: 'neutral',
}
</script>

<template>
  <UDashboardPanel id="channels" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Channels">
        <template #right>
          <UButton
            label="Add Channel"
            icon="i-lucide-plus"
            color="primary"
            size="sm"
            @click="isAddOpen = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="p-6">
        <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <USkeleton v-for="i in 3" :key="i" class="h-32 rounded-xl" />
        </div>

        <div v-else-if="channels.length === 0" class="flex flex-col items-center justify-center py-20 gap-3 text-(--ui-text-muted)">
          <UIcon name="i-lucide-radio" class="size-12 opacity-30" />
          <div class="font-medium">
            No channels connected
          </div>
          <div class="text-sm">
            Add a Zalo account or Facebook page to get started
          </div>
          <UButton
            label="Add Channel"
            icon="i-lucide-plus"
            color="primary"
            @click="isAddOpen = true"
          />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <UCard
            v-for="ch in channels"
            :key="ch.id"
            :ui="{ body: 'p-4' }"
          >
            <div class="flex items-start gap-3">
              <div
                class="size-10 rounded-full flex items-center justify-center shrink-0"
                :class="ch.channel_type === 'zalo' ? 'bg-blue-500' : 'bg-blue-600'"
              >
                <UIcon
                  :name="ch.channel_type === 'zalo' ? 'i-simple-icons-zalo' : 'i-simple-icons-facebook'"
                  class="size-5 text-white"
                />
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-medium text-sm truncate">
                  {{ ch.name }}
                </div>
                <div class="text-xs text-(--ui-text-muted) mt-0.5">
                  {{ ch.account_identifier ?? ch.channel_type }}
                </div>
                <UBadge
                  :label="ch.status"
                  :color="statusColor[ch.status] as any"
                  size="xs"
                  class="mt-1"
                />
              </div>
              <UDropdownMenu :items="[[{ label: 'Setup', icon: 'i-lucide-settings', to: `/dashboard/channels/${ch.id}/setup` }, { label: 'Delete', icon: 'i-lucide-trash', color: 'error' as const, onSelect: () => deleteChannel(ch.id) }]]">
                <UButton icon="i-lucide-ellipsis" variant="ghost" size="xs" />
              </UDropdownMenu>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Add Channel Modal -->
  <UModal v-model:open="isAddOpen" title="Add Channel">
    <template #body>
      <div class="space-y-4">
        <UFormField label="Channel Type">
          <USelectMenu
            v-model="newChannel.channel_type"
            :items="channelTypeOptions"
            value-key="value"
            class="w-full"
          />
        </UFormField>
        <UFormField label="Display Name">
          <UInput v-model="newChannel.name" placeholder="e.g. My Shop Zalo" class="w-full" />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" variant="ghost" @click="isAddOpen = false" />
        <UButton
          label="Add Channel"
          color="primary"
          :disabled="!newChannel.name"
          @click="handleCreate"
        />
      </div>
    </template>
  </UModal>
</template>
