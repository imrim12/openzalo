<script setup lang="ts">
definePageMeta({ layout: 'default' })

// @ts-ignore
const isDev = import.meta.dev
const toast = useToast()

function signIn(provider: string) {
  toast.add({ title: provider, description: `Signing in with ${provider}...` })
  window.location.href = `/api/auth/${provider.toLowerCase()}`
}
</script>

<template>
  <div class="w-full max-w-sm space-y-6">
    <div class="text-center space-y-2">
      <h1 class="text-2xl font-bold">OpenZalo</h1>
      <p class="text-(--ui-text-muted) text-sm">
        Unified inbox for Zalo &amp; Facebook
      </p>
    </div>

    <UCard>
      <div class="space-y-3">
        <UButton
          label="Continue with Google"
          icon="i-simple-icons-google"
          block
          variant="outline"
          @click="signIn('google')"
        />
        <UButton
          label="Continue with GitHub"
          icon="i-simple-icons-github"
          block
          variant="outline"
          @click="signIn('github')"
        />
        <template v-if="isDev">
          <USeparator label="dev only" />
          <UButton
            label="Sign in as Agent"
            icon="i-lucide-bot"
            block
            variant="soft"
            color="neutral"
            @click="signIn('agent')"
          />
        </template>
      </div>
    </UCard>
  </div>
</template>
