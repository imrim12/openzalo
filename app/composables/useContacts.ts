import type { ContactItem } from '~/types'
import { $http } from '~/lib/ofetch'

export function useContacts() {
  const contacts = ref<ContactItem[]>([])
  const isLoading = ref(false)
  const search = ref('')

  async function fetchContacts() {
    isLoading.value = true
    try {
      const params: Record<string, string> = {}
      if (search.value) params.search = search.value
      contacts.value = await $http<ContactItem[]>('/api/contacts', { params })
    }
    finally {
      isLoading.value = false
    }
  }

  async function createContact(data: Partial<ContactItem> & { name: string }) {
    const c = await $http<ContactItem>('/api/contacts', { method: 'POST', body: data })
    contacts.value.push(c)
    return c
  }

  async function updateContact(id: string, data: Partial<ContactItem>) {
    const c = await $http<ContactItem>(`/api/contacts/${id}`, { method: 'PATCH', body: data })
    const idx = contacts.value.findIndex(x => x.id === id)
    if (idx >= 0) contacts.value[idx] = c
    return c
  }

  async function deleteContact(id: string) {
    await $http(`/api/contacts/${id}`, { method: 'DELETE' })
    contacts.value = contacts.value.filter(c => c.id !== id)
  }

  watchDebounced(search, () => fetchContacts(), { debounce: 300 })

  onMounted(fetchContacts)

  return { contacts, isLoading, search, fetchContacts, createContact, updateContact, deleteContact }
}
