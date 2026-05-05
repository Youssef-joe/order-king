<!-- pages/profile.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { user } = useAuth()
const { apiFetch } = useApi()

const profile = ref(null)
const orders = ref([])
const loading = ref(true)
const editMode = ref(false)
const fullName = ref('')

const isAuthenticated = computed(() => !!user.value)

onMounted(async () => {
  if (!user.value) {
    await navigateTo('/')
    return
  }

  try {
    const [profileData, ordersData] = await Promise.all([
      apiFetch('/users/profile'),
      apiFetch('/users/orders'),
    ])

    profile.value = profileData
    orders.value = ordersData
    fullName.value = profile.value?.fullName || ''
  } catch (error) {
    console.error('Failed to load profile:', error)
  } finally {
    loading.value = false
  }
})

async function updateProfile() {
  try {
    await apiFetch('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify({ fullName: fullName.value }),
    })
    editMode.value = false
    profile.value.fullName = fullName.value
  } catch (error) {
    console.error('Failed to update profile:', error)
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PAID: 'bg-blue-100 text-blue-800',
    PREPARING: 'bg-purple-100 text-purple-800',
    READY: 'bg-orange-100 text-orange-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}
</script>

<template>
  <div v-if="isAuthenticated" class="min-h-screen bg-surface">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <NuxtLink to="/" class="text-brand-500 hover:text-brand-600 mb-4 inline-block">
          ← Back to Home
        </NuxtLink>
        <h1 class="text-4xl font-display font-800 text-ink mb-2">My Profile</h1>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-ink-muted">Loading profile...</p>
      </div>

      <div v-else>
        <!-- Profile Card -->
        <div class="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-surface-subtle">
          <div class="flex items-start gap-6">
            <div class="flex-shrink-0">
              <img
                v-if="user?.user_metadata?.avatar_url"
                :src="user.user_metadata.avatar_url"
                class="w-24 h-24 rounded-full object-cover border-4 border-brand-200"
                :alt="user.email"
              />
              <div
                v-else
                class="w-24 h-24 rounded-full bg-gradient-to-br from-brand-300 to-brand-500 flex items-center justify-center text-white font-display font-800 text-3xl"
              >
                {{ user?.email?.[0].toUpperCase() }}
              </div>
            </div>

            <div class="flex-grow">
              <div v-if="editMode" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-ink mb-2">Full Name</label>
                  <input
                    v-model="fullName"
                    type="text"
                    class="w-full px-4 py-2 border border-surface-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    @click="updateProfile"
                    class="px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    @click="editMode = false"
                    class="px-4 py-2 bg-surface-subtle text-ink rounded-xl font-medium hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              <div v-else>
                <h2 class="text-2xl font-display font-700 text-ink mb-1">
                  {{ profile?.fullName || 'User' }}
                </h2>
                <p class="text-ink-muted mb-4">{{ user?.email }}</p>
                <button
                  @click="editMode = true"
                  class="px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Orders Section -->
        <div>
          <h3 class="text-2xl font-display font-700 text-ink mb-4">Order History</h3>

          <div v-if="orders.length === 0" class="bg-white rounded-3xl p-8 text-center border border-surface-subtle">
            <p class="text-ink-muted mb-4">No orders yet</p>
            <NuxtLink
              to="/"
              class="inline-block px-6 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
            >
              Order Now
            </NuxtLink>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="order in orders"
              :key="order.id"
              class="bg-white rounded-2xl p-4 border border-surface-subtle hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-medium text-ink">{{ order.restaurant.name }}</p>
                  <p class="text-sm text-ink-muted">{{ formatDate(order.createdAt) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-display font-700 text-lg text-ink">EGP {{ order.totalAmount }}</p>
                  <span :class="`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(order.status)}`">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <div class="text-sm text-ink-muted">
                <p>{{ order.items.length }} item{{ order.items.length !== 1 ? 's' : '' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center bg-surface">
    <div class="text-center">
      <p class="text-ink-muted mb-4">Please sign in to view your profile</p>
    </div>
  </div>
</template>