<!-- pages/cart.vue -->
<script setup lang="ts">
const { items, totalPrice, totalItems, isEmpty, restaurantId, restaurantName, deleteItem, addItem, removeItem, clearCart } = useCart()
const { apiFetch } = useApi()
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const deliveryAddress = ref('')
const notes = ref('')
const placing = ref(false)
const error = ref('')

async function signIn() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/cart` },
  })
}

async function placeOrder() {
  if (!user.value) { await signIn(); return }
  if (!restaurantId.value || items.value.length === 0) return

  placing.value = true
  error.value = ''

  try {
    const order = await apiFetch<{ id: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify({
        restaurantId: restaurantId.value,
        items: items.value.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
        deliveryAddress: deliveryAddress.value || undefined,
        notes: notes.value || undefined,
      }),
    })
    clearCart()
    navigateTo(`/order/${order.id}`)
  } catch (e: any) {
    error.value = e.message || 'Failed to place order. Please try again.'
  } finally {
    placing.value = false
  }
}

const serviceFee = computed(() => Math.round(totalPrice.value * 0.05))
const grandTotal = computed(() => totalPrice.value + serviceFee.value + 20) // +20 delivery
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
    <h1 class="font-display font-800 text-3xl text-ink mb-8">
      Your Cart
      <span v-if="!isEmpty" class="text-brand-500 ml-1">{{ totalItems }}</span>
    </h1>

    <!-- Empty state -->
    <div v-if="isEmpty" class="text-center py-24 animate-fade-up">
      <p class="text-6xl mb-4">🛒</p>
      <h2 class="font-display font-700 text-xl text-ink mb-2">Your cart is empty</h2>
      <p class="text-ink-muted text-sm mb-6">Add some delicious items to get started</p>
      <NuxtLink
        to="/"
        class="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-2xl font-display font-600 hover:bg-brand-600 transition-colors shadow-brand"
      >
        Browse Menu
      </NuxtLink>
    </div>

    <!-- Cart content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">

      <!-- Items list -->
      <div class="lg:col-span-2 space-y-3">
        <p class="text-xs text-ink-muted font-600 uppercase tracking-widest mb-4">
          From {{ restaurantName }}
        </p>

        <div
          v-for="item in items"
          :key="item.id"
          class="bg-white rounded-3xl p-4 flex items-center gap-4 shadow-card animate-slide-in"
        >
          <!-- Image -->
          <div class="w-16 h-16 rounded-2xl overflow-hidden bg-surface-subtle flex-shrink-0">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <p class="font-display font-700 text-sm text-ink truncate">{{ item.name }}</p>
            <p class="text-xs text-ink-muted">{{ item.category }}</p>
            <p class="font-display font-800 text-brand-500 text-sm mt-0.5">
              EGP {{ (item.price * item.quantity).toFixed(0) }}
            </p>
          </div>

          <!-- Qty controls -->
          <div class="flex items-center gap-2 flex-shrink-0">
            <button
              @click="removeItem(item.id)"
              class="w-8 h-8 rounded-full bg-surface-subtle hover:bg-orange-100 flex items-center justify-center font-700 text-lg transition-colors"
            >−</button>
            <span class="font-display font-700 text-sm w-4 text-center">{{ item.quantity }}</span>
            <button
              @click="addItem({ ...item })"
              class="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white font-700 text-lg transition-colors"
            >+</button>
          </div>

          <!-- Remove -->
          <button
            @click="deleteItem(item.id)"
            class="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center text-ink-muted hover:text-red-500 transition-colors ml-1"
          >✕</button>
        </div>

        <!-- Delivery details -->
        <div class="bg-white rounded-3xl p-5 shadow-card mt-4">
          <h3 class="font-display font-700 text-sm text-ink mb-4">Delivery Details</h3>
          <div class="space-y-3">
            <div>
              <label class="text-xs font-600 text-ink-muted uppercase tracking-wide block mb-1.5">Delivery Address</label>
              <input
                v-model="deliveryAddress"
                type="text"
                placeholder="e.g. 15 Nasr Street, Nasr City, Cairo"
                class="w-full px-4 py-2.5 rounded-2xl border border-orange-100 bg-surface-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 transition-shadow"
              />
            </div>
            <div>
              <label class="text-xs font-600 text-ink-muted uppercase tracking-wide block mb-1.5">Order Notes (optional)</label>
              <textarea
                v-model="notes"
                placeholder="Any special requests?"
                rows="2"
                class="w-full px-4 py-2.5 rounded-2xl border border-orange-100 bg-surface-subtle text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none transition-shadow"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Order summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-3xl p-5 shadow-card sticky top-24">
          <h3 class="font-display font-700 text-base text-ink mb-4">Order Summary</h3>

          <div class="space-y-2.5 text-sm">
            <div class="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span>EGP {{ totalPrice }}</span>
            </div>
            <div class="flex justify-between text-ink-muted">
              <span>Delivery fee</span>
              <span>EGP 20</span>
            </div>
            <div class="flex justify-between text-ink-muted">
              <span>Service fee (5%)</span>
              <span>EGP {{ serviceFee }}</span>
            </div>
            <div class="h-px bg-surface-subtle my-1" />
            <div class="flex justify-between font-display font-800 text-base text-ink">
              <span>Total</span>
              <span>EGP {{ grandTotal }}</span>
            </div>
          </div>

          <!-- Error -->
          <p v-if="error" class="mt-4 text-red-500 text-xs bg-red-50 rounded-xl p-3">{{ error }}</p>

          <!-- Auth notice -->
          <p v-if="!user" class="mt-4 text-xs text-ink-muted bg-orange-50 rounded-xl p-3">
            Sign in with Google to place your order
          </p>

          <button
            @click="placeOrder"
            :disabled="placing"
            class="mt-5 w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 text-white rounded-2xl font-display font-700 text-base transition-all shadow-brand hover:shadow-none hover:scale-[0.98] active:scale-95"
          >
            <span v-if="placing">Placing order…</span>
            <span v-else-if="!user">Sign in & Order · EGP {{ grandTotal }}</span>
            <span v-else>Place Order · EGP {{ grandTotal }}</span>
          </button>

          <p class="text-center text-xs text-ink-muted mt-3">
            🔒 Secure checkout · Mock payment
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
