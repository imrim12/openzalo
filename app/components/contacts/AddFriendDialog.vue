<script setup lang="ts">
const isOpen = defineModel<boolean>('open')

const phone = ref('')
const countryCode = ref('+84')

const countryCodes = ['+84', '+1', '+44', '+61', '+65', '+81', '+82']

const recentResults = ref<{ id: string, name: string, avatar?: string, phone: string }[]>([])
const suggestions = ref<{ id: string, name: string, avatar?: string, source: string }[]>([])
</script>

<template>
  <UModal v-model:open="isOpen" title="Add Friend">
    <template #body>
      <div class="space-y-4">
        <!-- Phone input with country code -->
        <div class="flex gap-2">
          <USelectMenu
            v-model="countryCode"
            :items="countryCodes"
            class="w-24"
          />
          <UInput
            v-model="phone"
            placeholder="Phone number"
            type="tel"
            class="flex-1"
          />
        </div>

        <!-- Recent results -->
        <div v-if="recentResults.length" class="space-y-1">
          <div class="text-xs font-semibold text-(--ui-text-muted)">
            Recent results
          </div>
          <div
            v-for="r in recentResults"
            :key="r.id"
            class="flex items-center gap-3 p-2 rounded hover:bg-(--ui-bg-elevated)"
          >
            <UAvatar :src="r.avatar" size="sm" />
            <div>
              <div class="text-sm font-medium">
                {{ r.name }}
              </div>
              <div class="text-xs text-(--ui-text-muted)">
                {{ r.phone }}
              </div>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div v-if="suggestions.length" class="space-y-1">
          <div class="text-xs font-semibold text-(--ui-text-muted)">
            People you may know
          </div>
          <div
            v-for="s in suggestions"
            :key="s.id"
            class="flex items-center gap-3 p-2 rounded hover:bg-(--ui-bg-elevated)"
          >
            <UAvatar :src="s.avatar" size="sm" />
            <div class="flex-1">
              <div class="text-sm font-medium">
                {{ s.name }}
              </div>
              <div class="text-xs text-(--ui-text-muted)">
                {{ s.source }}
              </div>
            </div>
            <UButton label="Add" variant="outline" size="xs" />
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" variant="ghost" @click="isOpen = false" />
        <UButton label="Search" color="primary" :disabled="!phone" />
      </div>
    </template>
  </UModal>
</template>
