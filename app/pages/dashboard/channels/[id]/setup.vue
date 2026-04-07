<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="channel-setup" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Channel Setup">
        <template #left>
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            size="sm"
            to="/dashboard/channels"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-3 text-(--ui-text-muted)">
        <UIcon name="i-lucide-qr-code" class="size-12 opacity-30" />
        <div class="font-medium">
          QR Code Login
        </div>
        <div class="text-sm">
          Zalo QR login coming in Phase 2
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
