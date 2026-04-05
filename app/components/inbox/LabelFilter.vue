<script setup lang="ts">
const labels = [
  { label: 'Customer', color: 'bg-red-500', value: 'customer' },
  { label: 'Family', color: 'bg-green-500', value: 'family' },
  { label: 'Work', color: 'bg-orange-500', value: 'work' },
  { label: 'Friends', color: 'bg-purple-500', value: 'friends' },
  { label: 'Reply Later', color: 'bg-yellow-500', value: 'reply_later' },
  { label: 'Strangers', icon: 'i-lucide-user-x', value: 'strangers' },
]

const selected = ref<string[]>([])

function toggle(value: string) {
  const idx = selected.value.indexOf(value)
  if (idx >= 0) selected.value.splice(idx, 1)
  else selected.value.push(value)
}
</script>

<template>
  <UPopover>
    <UButton
      label="Labels"
      icon="i-lucide-tag"
      variant="ghost"
      size="xs"
      trailing-icon="i-lucide-chevron-down"
      :color="selected.length ? 'primary' : 'neutral'"
    />
    <template #content>
      <div class="py-1 w-52">
        <div class="px-3 py-1.5 text-xs font-semibold text-(--ui-text-muted)">
          Filter by label
        </div>
        <div
          v-for="item in labels"
          :key="item.value"
          class="flex items-center gap-2.5 px-3 py-1.5 cursor-pointer hover:bg-(--ui-bg-elevated)"
          @click="toggle(item.value)"
        >
          <UCheckbox
            :model-value="selected.includes(item.value)"
            @click.stop
            @change="toggle(item.value)"
          />
          <div v-if="item.color" class="w-3 h-3 rounded-sm shrink-0" :class="item.color" />
          <UIcon v-else :name="item.icon!" class="size-3 shrink-0 text-(--ui-text-muted)" />
          <span class="text-sm">{{ item.label }}</span>
        </div>
        <USeparator class="my-1" />
        <div
          class="px-3 py-1.5 text-sm cursor-pointer hover:bg-(--ui-bg-elevated) text-(--ui-text-muted)"
        >
          Manage labels
        </div>
      </div>
    </template>
  </UPopover>
</template>
