<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)

const isSearchOpen = ref(false)

const navItems = [
  { label: 'Chat', icon: 'i-lucide-message-circle', to: '/dashboard/inbox' },
  { label: 'Contacts', icon: 'i-lucide-contact', to: '/dashboard/contacts' },
  { label: 'Channels', icon: 'i-lucide-radio', to: '/dashboard/channels' },
  { label: 'Deals', icon: 'i-lucide-hand-coins', to: '/dashboard/deals' },
  { label: 'Tools', icon: 'i-lucide-wrench', to: '/dashboard/tools/quick-messages' },
]
</script>

<template>
  <!-- UDashboardGroup is position:fixed inset-0 flex — icon bar must be its first child -->
  <UDashboardGroup storage-key="openzalo">
    <!-- ZONE 1: Fixed 56px icon sidebar -->
    <aside class="flex flex-col w-14 shrink-0 border-r border-(--ui-border) items-center py-2 gap-1">
      <!-- User avatar -->
      <UAvatar
        :src="user?.avatar ?? undefined"
        :alt="user?.name ?? 'User'"
        size="sm"
        class="mb-2 cursor-pointer"
      />

      <!-- Nav items -->
      <UTooltip
        v-for="item in navItems"
        :key="item.to"
        :text="item.label"
        :popper="{ placement: 'right' }"
      >
        <UButton
          :icon="item.icon"
          :to="item.to"
          variant="ghost"
          color="neutral"
          size="sm"
          class="w-10 h-10 justify-center"
        />
      </UTooltip>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Search -->
      <UTooltip text="Search" :popper="{ placement: 'right' }">
        <UButton
          icon="i-lucide-search"
          variant="ghost"
          color="neutral"
          size="sm"
          class="w-10 h-10 justify-center"
          @click="isSearchOpen = true"
        />
      </UTooltip>

      <!-- Settings menu -->
      <AppSettingsMenu />
    </aside>

    <!-- ZONES 2–4: Page panels (UDashboardPanel / UDashboardSidebar from page) -->
    <slot />
  </UDashboardGroup>

  <!-- Search overlay — portal-based, renders in <body> -->
  <AppSearchOverlay v-model:open="isSearchOpen" />
</template>
