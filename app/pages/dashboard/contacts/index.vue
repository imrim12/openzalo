<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const activeTab = ref('friends')
const isAddFriendOpen = ref(false)
const isCreateGroupOpen = ref(false)

const contactSubNav = [
  { label: 'Friend List', value: 'friends', icon: 'i-lucide-users' },
  { label: 'Groups & Communities', value: 'groups', icon: 'i-lucide-users-round' },
  { label: 'Friend Requests', value: 'requests', icon: 'i-lucide-user-plus' },
  { label: 'Group Invitations', value: 'invitations', icon: 'i-lucide-user-round-plus' },
]

const activeTabTitle = computed(
  () => contactSubNav.find(n => n.value === activeTab.value)?.label ?? 'Contacts',
)

const addFriendItems = computed(() => [
  [
    {
      label: 'Add Friend',
      icon: 'i-lucide-user-plus',
      onSelect: () => { isAddFriendOpen.value = true },
    },
    {
      label: 'Create Group',
      icon: 'i-lucide-users-round',
      onSelect: () => { isCreateGroupOpen.value = true },
    },
  ],
])

const sortOptions = ['Name (A-Z)', 'Name (Z-A)', 'Recent']
const filterOptions = ['All', 'Customer', 'Family', 'Work', 'Friends']
const selectedSort = ref(sortOptions[0])
const selectedFilter = ref(filterOptions[0])
const search = ref('')
</script>

<template>
  <!-- LEFT: Contact sub-navigation -->
  <UDashboardPanel id="contacts-nav" resizable :default-size="22" :min-size="15">
    <template #header>
      <UDashboardNavbar>
        <template #default>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search..."
            class="w-full"
          />
        </template>
        <template #right>
          <UDropdownMenu :items="addFriendItems">
            <UButton icon="i-lucide-user-plus" variant="ghost" size="sm" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="py-2">
        <div
          v-for="item in contactSubNav"
          :key="item.value"
          class="flex items-center gap-2 px-3 py-2 mx-1 rounded-lg cursor-pointer text-sm transition-colors"
          :class="activeTab === item.value
            ? 'bg-(--ui-primary) text-white'
            : 'hover:bg-(--ui-bg-elevated) text-(--ui-text)'"
          @click="activeTab = item.value"
        >
          <UIcon :name="item.icon" class="size-4 shrink-0" />
          <span>{{ item.label }}</span>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- RIGHT: Content area -->
  <UDashboardPanel id="contacts-content" class="flex flex-col">
    <template #header>
      <UDashboardNavbar :title="activeTabTitle">
        <template #right>
          <UInput
            icon="i-lucide-search"
            placeholder="Search..."
            size="sm"
            class="w-40"
          />
          <USelectMenu
            v-if="activeTab === 'friends'"
            v-model="selectedSort"
            :items="sortOptions"
            placeholder="Sort"
            size="sm"
            class="w-36"
          />
          <USelectMenu
            v-model="selectedFilter"
            :items="filterOptions"
            placeholder="Filter"
            size="sm"
            class="w-28"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <ContactsFriendList v-if="activeTab === 'friends'" />
      <ContactsGroupList v-else-if="activeTab === 'groups'" />
      <ContactsFriendRequestGrid v-else-if="activeTab === 'requests'" />
      <div
        v-else-if="activeTab === 'invitations'"
        class="flex flex-col items-center justify-center gap-2 h-full text-(--ui-text-muted)"
      >
        <UIcon name="i-lucide-mail-open" class="size-12 opacity-30" />
        <div class="font-medium">
          No group invitations
        </div>
        <div class="text-sm">
          You have no pending group or community invitations.
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Dialogs -->
  <ContactsAddFriendDialog v-model:open="isAddFriendOpen" />
  <ContactsCreateGroupDialog v-model:open="isCreateGroupOpen" />
</template>
