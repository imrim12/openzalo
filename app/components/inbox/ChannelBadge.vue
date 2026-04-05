<script setup lang="ts">
const props = defineProps<{ type: 'zalo' | 'facebook' | 'telegram' | 'webchat' }>()

const config: Record<string, { icon: string, bg: string }> = {
  zalo: { icon: 'i-simple-icons-zalo', bg: 'bg-blue-500' },
  facebook: { icon: 'i-simple-icons-facebook', bg: 'bg-blue-600' },
  telegram: { icon: 'i-simple-icons-telegram', bg: 'bg-sky-500' },
  webchat: { icon: 'i-lucide-message-circle', bg: 'bg-green-500' },
}
</script>

<template>
  <div
    class="size-4 rounded-full flex items-center justify-center"
    :class="config[type]?.bg ?? 'bg-gray-400'"
  >
    <UIcon :name="config[type]?.icon ?? 'i-lucide-plug'" class="size-2.5 text-white" />
  </div>
</template>
