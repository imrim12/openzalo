<script setup lang="ts">
const isOpen = defineModel<boolean>('open')

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)
</script>

<template>
  <UModal v-model:open="isOpen" title="Account Info" :ui="{ body: 'p-0' }">
    <template #body>
      <!-- Cover photo -->
      <div class="h-32 bg-gradient-to-r from-blue-500 to-cyan-500 relative">
        <div class="absolute -bottom-8 left-4">
          <div class="relative">
            <UAvatar
              :src="user?.avatar ?? undefined"
              :alt="user?.name ?? undefined"
              size="xl"
              class="ring-4 ring-white dark:ring-gray-900"
            />
            <UButton
              icon="i-lucide-camera"
              size="xs"
              class="absolute bottom-0 right-0 rounded-full"
            />
          </div>
        </div>
      </div>

      <div class="pt-12 px-4 pb-4 space-y-4">
        <!-- Name -->
        <div class="flex items-center gap-2">
          <span class="font-semibold text-lg">{{ user?.name }}</span>
          <UButton icon="i-lucide-pencil" variant="ghost" size="xs" />
        </div>

        <USeparator />

        <!-- Personal info -->
        <div class="space-y-2">
          <div class="font-semibold text-sm">
            Personal Info
          </div>
          <div class="grid grid-cols-[100px_1fr] gap-y-2 text-sm">
            <span class="text-(--ui-text-muted)">Email</span>
            <span>{{ user?.primary_email }}</span>
            <span class="text-(--ui-text-muted)">Phone</span>
            <span>{{ user?.primary_phone ?? 'Not set' }}</span>
            <span class="text-(--ui-text-muted)">Username</span>
            <span>{{ user?.username ?? 'Not set' }}</span>
          </div>
          <UButton
            label="Update"
            variant="link"
            size="xs"
            icon="i-lucide-pencil"
            to="/dashboard/settings"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
