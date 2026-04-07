<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const channelId = route.params.id as string
const { getQrCode, pollQrStatus, syncChannel } = useChannels()

const qrUrl = ref('')
const status = ref<'idle' | 'loading' | 'pending' | 'confirmed' | 'expired' | 'declined'>('idle')
const syncLoading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | undefined

async function startLogin() {
  status.value = 'loading'
  const res = await getQrCode(channelId)
  qrUrl.value = res.qrUrl
  status.value = 'pending'
  pollTimer = setInterval(checkStatus, 2000)
}

async function checkStatus() {
  const res = await pollQrStatus(channelId)
  status.value = res.status as typeof status.value
  if (res.status === 'confirmed') {
    clearInterval(pollTimer)
    await doSync()
  }
  if (res.status === 'expired' || res.status === 'declined') {
    clearInterval(pollTimer)
  }
}

async function doSync() {
  syncLoading.value = true
  await syncChannel(channelId)
  syncLoading.value = false
  navigateTo('/dashboard/inbox')
}

onUnmounted(() => clearInterval(pollTimer))
</script>

<template>
  <UDashboardPanel id="channel-setup" class="flex-1">
    <template #header>
      <UDashboardNavbar title="Channel Setup">
        <template #left>
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            size="sm"
            to="/dashboard/channels"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col items-center justify-center h-full gap-6">
        <!-- Idle -->
        <template v-if="status === 'idle'">
          <UIcon name="i-lucide-qr-code" class="size-16 text-(--ui-text-muted)" />
          <p class="text-(--ui-text-muted) text-sm">
            Connect your Zalo account by scanning a QR code.
          </p>
          <UButton @click="startLogin">
            Connect with Zalo
          </UButton>
        </template>

        <!-- Loading QR -->
        <template v-else-if="status === 'loading'">
          <UIcon name="i-lucide-loader-circle" class="size-12 animate-spin text-(--ui-primary)" />
          <p class="text-sm text-(--ui-text-muted)">
            Generating QR code…
          </p>
        </template>

        <!-- Pending scan -->
        <template v-else-if="status === 'pending'">
          <img :src="qrUrl" alt="Zalo QR Code" class="w-56 h-56 rounded-xl border">
          <p class="text-sm text-(--ui-text-muted)">
            Open Zalo on your phone and scan this code
          </p>
          <UBadge color="warning" variant="soft">
            Waiting for scan…
          </UBadge>
        </template>

        <!-- Confirmed — syncing -->
        <template v-else-if="status === 'confirmed'">
          <UIcon name="i-lucide-check-circle" class="size-12 text-green-500" />
          <p class="text-sm font-medium">
            Zalo connected!
          </p>
          <p v-if="syncLoading" class="text-xs text-(--ui-text-muted)">
            Syncing contacts and groups…
          </p>
        </template>

        <!-- Expired / Declined -->
        <template v-else-if="status === 'expired' || status === 'declined'">
          <UIcon name="i-lucide-x-circle" class="size-12 text-red-500" />
          <p class="text-sm text-(--ui-text-muted)">
            QR code {{ status }}. Please try again.
          </p>
          <UButton variant="outline" @click="startLogin">
            Retry
          </UButton>
        </template>
      </div>
    </template>
  </UDashboardPanel>
</template>
