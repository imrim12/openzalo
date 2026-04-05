<script setup lang="ts">
definePageMeta({ layout: false })

// Redirect to inbox if authenticated, else to login
const authStore = useAuthStore()

onMounted(async () => {
  try {
    await authStore.fetchCurrentUser()
    navigateTo('/dashboard/inbox')
  }
  catch {
    navigateTo('/auth/login')
  }
})
</script>

<template>
  <div />
</template>
