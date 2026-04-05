<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
</script>

<template>
  <UDashboardPanel id="deals" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Deals" />
    </template>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-3 text-(--ui-text-muted)">
        <UIcon name="i-lucide-hand-coins" class="size-12 opacity-30" />
        <div class="font-medium">Deal Pipeline</div>
        <div class="text-sm">Coming in Phase 4</div>
      </div>
    </template>
  </UDashboardPanel>
</template>
