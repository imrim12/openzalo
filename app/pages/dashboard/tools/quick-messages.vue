<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="quick-messages" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Quick Messages" />
    </template>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-3 text-(--ui-text-muted)">
        <UIcon name="i-lucide-zap" class="size-12 opacity-30" />
        <div class="font-medium">
          Quick Messages
        </div>
        <div class="text-sm">
          Canned response templates — coming in Phase 4
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
