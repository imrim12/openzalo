import type { ChannelConnectionItem } from '~/types'
import { $http } from '~/lib/ofetch'

export function useChannels() {
  const channels = ref<ChannelConnectionItem[]>([])
  const isLoading = ref(false)

  async function fetchChannels() {
    isLoading.value = true
    try {
      channels.value = await $http<ChannelConnectionItem[]>('/api/channels')
    }
    finally {
      isLoading.value = false
    }
  }

  async function createChannel(data: { channel_type: 'zalo' | 'facebook' | 'telegram' | 'webchat', name: string }) {
    const ch = await $http<ChannelConnectionItem>('/api/channels', {
      method: 'POST',
      body: data,
    })
    channels.value.unshift(ch)
    return ch
  }

  async function updateChannel(id: string, data: Partial<ChannelConnectionItem>) {
    const ch = await $http<ChannelConnectionItem>(`/api/channels/${id}`, {
      method: 'PATCH',
      body: data,
    })
    const idx = channels.value.findIndex(c => c.id === id)
    if (idx >= 0)
      channels.value[idx] = ch
    return ch
  }

  async function deleteChannel(id: string) {
    await $http(`/api/channels/${id}`, { method: 'DELETE' })
    channels.value = channels.value.filter(c => c.id !== id)
  }

  onMounted(fetchChannels)

  return { channels, isLoading, fetchChannels, createChannel, updateChannel, deleteChannel }
}
