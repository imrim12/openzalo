<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="auto-replies" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Auto Replies" />
    </template>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-3 text-(--ui-text-muted)">
        <UIcon name="i-lucide-bot" class="size-12 opacity-30" />
        <div class="font-medium">Auto-Reply Rules</div>
        <div class="text-sm">Automation rules — coming in Phase 4</div>
      </div>
    </template>
  </UDashboardPanel>
</template>
