<script setup lang="ts">
const authStore = useAuthStore()

const items = computed(() => [
  [
    { label: 'Thông tin tài khoản', icon: 'i-lucide-user-circle' },
    { label: 'Cài đặt', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  ],
  [
    {
      label: 'Dữ liệu',
      icon: 'i-lucide-database',
      children: [[
        { label: 'Sao lưu tin nhắn', icon: 'i-lucide-archive' },
        { label: 'Quản lý dung lượng', icon: 'i-lucide-hard-drive' },
      ]],
    },
    {
      label: 'Ngôn ngữ',
      icon: 'i-lucide-globe',
      children: [[
        { label: 'Tiếng Việt' },
        { label: 'English' },
      ]],
    },
    {
      label: 'Hỗ trợ',
      icon: 'i-lucide-help-circle',
      children: [[
        { label: 'Trung tâm trợ giúp', icon: 'i-lucide-book-open' },
        { label: 'Báo lỗi', icon: 'i-lucide-bug' },
      ]],
    },
  ],
  [
    {
      label: 'Đăng xuất',
      icon: 'i-lucide-log-out',
      color: 'error' as const,
      onSelect: async () => {
        await authStore.logout()
        navigateTo('/auth/login')
      },
    },
    { label: 'Thoát', icon: 'i-lucide-x-circle' },
  ],
])
</script>

<template>
  <UTooltip text="Settings" :popper="{ placement: 'right' }">
    <UDropdownMenu :items="items">
      <UButton
        icon="i-lucide-settings"
        variant="ghost"
        color="neutral"
        size="sm"
        class="w-10 h-10 justify-center"
      />
    </UDropdownMenu>
  </UTooltip>
</template>
