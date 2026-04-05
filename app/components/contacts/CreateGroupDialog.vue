<script setup lang="ts">
const isOpen = defineModel<boolean>('open')

const groupName = ref('')
const memberSearch = ref('')
const activeLabel = ref('All')
const selectedMembers = ref<string[]>([])

const { contacts } = useContacts()

const filteredContacts = computed(() => {
  if (!memberSearch.value) return contacts.value.slice(0, 20)
  return contacts.value.filter(c =>
    c.name.toLowerCase().includes(memberSearch.value.toLowerCase()),
  )
})

function toggleMember(id: string) {
  const idx = selectedMembers.value.indexOf(id)
  if (idx >= 0) {
    selectedMembers.value.splice(idx, 1)
  }
  else {
    selectedMembers.value.push(id)
  }
}
</script>

<template>
  <UModal v-model:open="isOpen" title="Create Group">
    <template #body>
      <div class="space-y-4">
        <!-- Group avatar + name -->
        <div class="flex items-center gap-3">
          <UAvatar icon="i-lucide-camera" size="lg" class="cursor-pointer" />
          <UInput v-model="groupName" placeholder="Group name..." class="flex-1" />
        </div>

        <!-- Member search -->
        <UInput
          v-model="memberSearch"
          icon="i-lucide-search"
          placeholder="Search by name, phone..."
        />

        <!-- Label filter chips -->
        <div class="flex gap-2 overflow-x-auto pb-1">
          <UButton
            v-for="label in ['All', 'Customer', 'Family', 'Work', 'Friends', 'Reply Later']"
            :key="label"
            :label="label"
            :variant="activeLabel === label ? 'solid' : 'outline'"
            size="xs"
            @click="activeLabel = label"
          />
        </div>

        <!-- Contact list with checkboxes -->
        <div class="max-h-64 overflow-y-auto space-y-1">
          <div class="text-xs font-semibold text-(--ui-text-muted) mb-2">Contacts</div>
          <div
            v-for="contact in filteredContacts"
            :key="contact.id"
            class="flex items-center gap-3 p-2 rounded hover:bg-(--ui-bg-elevated) cursor-pointer"
            @click="toggleMember(contact.id)"
          >
            <UCheckbox :model-value="selectedMembers.includes(contact.id)" />
            <UAvatar
              :src="contact.avatar ?? undefined"
              :text="contact.name?.[0]"
              size="sm"
            />
            <span class="text-sm">{{ contact.name }}</span>
          </div>
          <div
            v-if="filteredContacts.length === 0"
            class="text-sm text-(--ui-text-muted) text-center py-4"
          >
            No contacts found
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Cancel" variant="ghost" @click="isOpen = false" />
        <UButton
          label="Create Group"
          color="primary"
          :disabled="!groupName || selectedMembers.length < 2"
        />
      </div>
    </template>
  </UModal>
</template>
