<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const search = ref('')
const activeConversationId = computed(() => route.params.id as string | undefined)
</script>

<template>
  <!-- LEFT: Conversation list panel -->
  <UDashboardPanel id="inbox-list" resizable :default-size="25" :min-size="18" :max-size="40">
    <template #header>
      <UDashboardNavbar>
        <template #default>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search..."
            class="w-full"
            :trailing-icon="search ? 'i-lucide-x' : undefined"
            @click:trailing="search = ''"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UTabs
            :items="[
              { label: 'All', value: 'all' },
              { label: 'Unread', value: 'unread' },
            ]"
            :content="false"
            variant="link"
            size="sm"
          />
        </template>
        <template #right>
          <InboxLabelFilter />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <InboxConversationList
        :active-id="activeConversationId ?? null"
        :search="search"
      />
    </template>
  </UDashboardPanel>

  <!-- CENTER + RIGHT: rendered by child routes -->
  <NuxtPage />
</template>
