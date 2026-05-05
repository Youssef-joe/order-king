<!-- pages/order/[id].vue -->
<script setup lang="ts">
const route = useRoute()
const orderId = route.params.id as string
const { apiFetch } = useApi()
const supabase = useSupabaseClient()

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  menuItem: { name: string; imageUrl: string | null; category: string }
}

interface Order {
  id: string
  status: string
  paymentStatus: string
  totalAmount: number
  deliveryAddress: string | null
  notes: string | null
  createdAt: string
  restaurant: { name: string; imageUrl: string | null; address: string | null }
  items: OrderItem[]
}

const order = ref<Order | null>(null)
const loading = ref(true)
const error = ref('')
const activityLog = ref<Array<{ status: string; timestamp: Date }>>([])

const STATUS_STEPS = ['PENDING', 'PAID', 'PREPARING', 'READY', 'DELIVERED']

const STATUS_META: Record<string, { emoji: string; label: string; desc: string; color: string }> = {
  PENDING:   { emoji: '⏳', label: 'Order Received',  desc: 'We got your order!',                color: 'text-amber-500' },
  PAID:      { emoji: '✅', label: 'Payment Confirmed', desc: 'Payment accepted, preparing soon', color: 'text-green-500' },
  PREPARING: { emoji: '👨‍🍳', label: 'Preparing',       desc: "Chef's on it!",                   color: 'text-blue-500' },
  READY:     { emoji: '📦', label: 'Ready for Pickup', desc: 'Out for delivery soon',             color: 'text-purple-500' },
  DELIVERED: { emoji: '🎉', label: 'Delivered!',       desc: 'Enjoy your meal!',                  color: 'text-brand-500' },
  CANCELLED: { emoji: '❌', label: 'Cancelled',         desc: 'This order was cancelled',         color: 'text-red-500' },
}

const currentStepIndex = computed(() => {
  if (!order.value) return 0
  return STATUS_STEPS.indexOf(order.value.status)
})

const currentMeta = computed(() =>
  order.value ? STATUS_META[order.value.status] ?? STATUS_META.PENDING : STATUS_META.PENDING
)

const isDelivered = computed(() => order.value?.status === 'DELIVERED')

// Load order
async function loadOrder() {
  try {
    order.value = await apiFetch<Order>(`/orders/${orderId}`)
    // Initialize log with current status
    if (order.value) {
      activityLog.value = [{ status: order.value.status, timestamp: new Date() }]
    }
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

// Real-time status via Supabase Realtime
let channel: ReturnType<typeof supabase.channel> | null = null

onMounted(async () => {
  await loadOrder()

  // Subscribe to realtime changes on this order row
  channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'Order',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (order.value && payload.new) {
          const newStatus = payload.new.status
          const oldStatus = order.value.status
          
          order.value.status = newStatus
          order.value.paymentStatus = payload.new.paymentStatus
          
          // Add to activity log if status changed
          if (newStatus !== oldStatus) {
            activityLog.value.unshift({ status: newStatus, timestamp: new Date() })
          }
        }
      }
    )
    .subscribe()
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

// Fallback: poll every 5s if status isn't final
let pollTimer: ReturnType<typeof setInterval> | null = null

watch(
  () => order.value?.status,
  (status) => {
    if (status === 'DELIVERED' || status === 'CANCELLED') {
      if (pollTimer) clearInterval(pollTimer)
      return
    }
    if (!pollTimer) {
      pollTimer = setInterval(async () => {
        try {
          const s = await apiFetch<{ status: string; paymentStatus: string }>(`/orders/${orderId}/status`)
          if (order.value) {
            const oldStatus = order.value.status
            order.value.status = s.status
            order.value.paymentStatus = s.paymentStatus
            
            // Add to activity log if status changed
            if (s.status !== oldStatus) {
              activityLog.value.unshift({ status: s.status, timestamp: new Date() })
            }
          }
        } catch {}
      }, 5000)
    }
  },
  { immediate: true }
)

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const deliveryFee = 20
const serviceFee = computed(() => Math.round((order.value?.totalAmount || 0) * 0.05))
const grandTotal = computed(() => (order.value?.totalAmount || 0) + deliveryFee + serviceFee.value)

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
      <div class="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      <p class="text-ink-muted text-sm">Loading your order…</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-16">
      <p class="text-4xl mb-3">❌</p>
      <p class="font-display font-700 text-xl text-ink mb-2">Order not found</p>
      <p class="text-ink-muted text-sm mb-6">{{ error }}</p>
      <NuxtLink to="/" class="px-6 py-3 bg-brand-500 text-white rounded-2xl font-display font-600 hover:bg-brand-600 transition-colors">
        Back to Menu
      </NuxtLink>
    </div>

    <!-- Order content -->
    <div v-else-if="order" class="space-y-6 animate-fade-up">

      <!-- Status hero -->
      <div
        :class="[
          'rounded-4xl p-6 text-center transition-all duration-700',
          isDelivered ? 'bg-gradient-to-br from-orange-50 to-amber-50' : 'bg-white shadow-card'
        ]"
      >
        <div class="text-5xl mb-3 animate-pulse-dot inline-block">{{ currentMeta.emoji }}</div>
        <h1 :class="['font-display font-800 text-2xl', currentMeta.color]">
          {{ currentMeta.label }}
        </h1>
        <p class="text-ink-muted text-sm mt-1">{{ currentMeta.desc }}</p>
        <p class="text-xs text-ink-muted mt-3 font-mono">Order #{{ order.id.slice(-8).toUpperCase() }}</p>
      </div>

      <!-- Progress tracker -->
      <div class="bg-white rounded-3xl p-5 shadow-card">
        <h2 class="font-display font-700 text-sm text-ink mb-5">Order Progress</h2>
        <div class="relative">
          <!-- Track line -->
          <div class="absolute top-4 left-4 right-4 h-0.5 bg-surface-subtle" />
          <div
            class="absolute top-4 left-4 h-0.5 bg-brand-400 transition-all duration-700"
            :style="{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * (100 - 8)}%` }"
          />

          <div class="relative flex justify-between">
            <div
              v-for="(step, i) in STATUS_STEPS"
              :key="step"
              class="flex flex-col items-center gap-2"
            >
              <div
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 z-10',
                  i < currentStepIndex
                    ? 'bg-brand-500 text-white'
                    : i === currentStepIndex
                    ? 'bg-brand-500 text-white ring-4 ring-brand-100 scale-110'
                    : 'bg-surface-subtle text-ink-muted'
                ]"
              >
                <span v-if="i < currentStepIndex">✓</span>
                <span v-else-if="i === currentStepIndex" class="animate-pulse-dot">●</span>
                <span v-else>·</span>
              </div>
              <span class="text-xs text-ink-muted font-600 text-center max-w-12 leading-tight hidden sm:block">
                {{ STATUS_META[step]?.label.split(' ')[0] }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Items -->
      <div class="bg-white rounded-3xl p-5 shadow-card">
        <h2 class="font-display font-700 text-sm text-ink mb-4">
          {{ order.restaurant.name }} · {{ order.items.length }} item{{ order.items.length > 1 ? 's' : '' }}
        </h2>
        <div class="divide-y divide-surface-subtle">
          <div v-for="item in order.items" :key="item.id" class="py-3 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl overflow-hidden bg-surface-subtle flex-shrink-0">
              <img v-if="item.menuItem.imageUrl" :src="item.menuItem.imageUrl" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-lg">🍽️</div>
            </div>
            <div class="flex-1">
              <p class="font-600 text-sm text-ink">{{ item.menuItem.name }}</p>
              <p class="text-xs text-ink-muted">× {{ item.quantity }}</p>
            </div>
            <p class="font-display font-700 text-sm text-ink">
              EGP {{ (item.unitPrice * item.quantity).toFixed(0) }}
            </p>
          </div>
        </div>

        <!-- Totals -->
        <div class="mt-4 pt-4 border-t border-surface-subtle space-y-1.5 text-sm">
          <div class="flex justify-between text-ink-muted">
            <span>Subtotal</span><span>EGP {{ order.totalAmount.toFixed(0) }}</span>
          </div>
          <div class="flex justify-between text-ink-muted">
            <span>Delivery</span><span>EGP {{ deliveryFee }}</span>
          </div>
          <div class="flex justify-between text-ink-muted">
            <span>Service fee</span><span>EGP {{ serviceFee }}</span>
          </div>
          <div class="flex justify-between font-display font-800 text-base text-ink pt-1">
            <span>Total</span><span>EGP {{ grandTotal }}</span>
          </div>
        </div>
      </div>

      <!-- Delivery address -->
      <div v-if="order.deliveryAddress" class="bg-white rounded-3xl p-5 shadow-card">
        <h2 class="font-display font-700 text-sm text-ink mb-2">Delivery Address</h2>
        <p class="text-ink-muted text-sm">📍 {{ order.deliveryAddress }}</p>
      </div>

      <!-- Activity Log -->
      <div class="bg-white rounded-3xl p-5 shadow-card">
        <h2 class="font-display font-700 text-sm text-ink mb-4">Real-Time Activity Log</h2>
        <div class="space-y-3">
          <div
            v-for="(log, index) in activityLog"
            :key="index"
            class="flex items-start gap-3 animate-fade-up"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-sm">
              {{ STATUS_META[log.status]?.emoji || '📝' }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-600 text-sm text-ink">{{ STATUS_META[log.status]?.label || log.status }}</p>
              <p class="text-xs text-ink-muted">{{ STATUS_META[log.status]?.desc || 'Status updated' }}</p>
            </div>
            <span class="text-xs text-ink-muted font-mono flex-shrink-0">{{ formatTime(log.timestamp) }}</span>
          </div>
          <div v-if="activityLog.length === 0" class="text-center py-4 text-ink-muted text-sm">
            No activity yet
          </div>
        </div>
      </div>

      <!-- CTAs -->
      <div class="flex gap-3 flex-wrap">
        <NuxtLink
          to="/"
          class="flex-1 py-3 text-center bg-white border border-orange-100 rounded-2xl font-display font-600 text-sm text-ink hover:bg-orange-50 transition-colors shadow-card"
        >
          Order Again
        </NuxtLink>
        <NuxtLink
          v-if="isDelivered"
          to="/"
          class="flex-1 py-3 text-center bg-brand-500 rounded-2xl font-display font-600 text-sm text-white hover:bg-brand-600 transition-colors shadow-brand"
        >
          Back to Menu 🎉
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
