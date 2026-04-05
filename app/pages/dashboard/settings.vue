<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const authStore = useAuthStore()
const user = computed(() => authStore.currentUser)

const form = reactive({
  name: user.value?.name ?? '',
})

async function handleSave() {
  await authStore.updateCurrentUser({ name: form.name })
}
</script>

<template>
  <UDashboardPanel id="settings" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Settings" />
    </template>

    <template #body>
      <div class="max-w-lg mx-auto p-6 space-y-6">
        <!-- Profile section -->
        <div class="space-y-4">
          <h3 class="font-semibold">Profile</h3>
          <div class="flex items-center gap-4">
            <UAvatar
              :src="user?.avatar ?? undefined"
              :alt="user?.name ?? undefined"
              size="xl"
            />
            <div>
              <div class="font-medium">{{ user?.name }}</div>
              <div class="text-sm text-(--ui-text-muted)">{{ user?.primary_email }}</div>
            </div>
          </div>
          <UFormField label="Display Name">
            <UInput v-model="form.name" class="w-full" />
          </UFormField>
          <UButton
            label="Save Changes"
            color="primary"
            @click="handleSave"
          />
        </div>

        <USeparator />

        <!-- Account section -->
        <div class="space-y-4">
          <h3 class="font-semibold">Account</h3>
          <div class="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
            <span class="text-(--ui-text-muted)">Email</span>
            <span>{{ user?.primary_email }}</span>
            <span class="text-(--ui-text-muted)">Phone</span>
            <span>{{ user?.primary_phone ?? 'Not set' }}</span>
            <span class="text-(--ui-text-muted)">Username</span>
            <span>{{ user?.username ?? 'Not set' }}</span>
          </div>
        </div>

        <USeparator />

        <!-- Danger zone -->
        <div class="space-y-4">
          <h3 class="font-semibold text-red-500">Danger Zone</h3>
          <UButton
            label="Log Out"
            color="error"
            variant="outline"
            icon="i-lucide-log-out"
            @click="async () => { await authStore.logout(); navigateTo('/login') }"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
