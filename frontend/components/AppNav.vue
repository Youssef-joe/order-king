<!-- components/AppNav.vue -->
<script setup lang="ts">
const { totalItems, isEmpty } = useCart()
const { user, signIn, signOut } = useAuth()
const showDropdown = ref(false)

async function handleSignIn() {
  await signIn()
}

async function handleSignOut() {
  await signOut()
  showDropdown.value = false
  navigateTo('/')
}

function goToProfile() {
  navigateTo('/profile')
  showDropdown.value = false
}
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <span class="text-2xl">🍔</span>
        <span class="font-display font-800 text-xl text-ink tracking-tight group-hover:text-brand-600 transition-colors">
          Order<span class="text-brand-500">King</span>
        </span>
      </NuxtLink>

      <!-- Right side -->
      <div class="flex items-center gap-3">
        <!-- Cart -->
        <NuxtLink
          to="/cart"
          class="relative flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface-subtle hover:bg-orange-50 transition-colors font-medium text-sm text-ink"
          :class="{ 'ring-2 ring-brand-400': !isEmpty }"
        >
          <span class="text-lg">🛒</span>
          <span class="hidden sm:inline">Cart</span>
          <span
            v-if="!isEmpty"
            class="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center font-display font-700 animate-fade-up"
          >
            {{ totalItems }}
          </span>
        </NuxtLink>

        <!-- Auth -->
        <button
          v-if="!user"
          @click="handleSignIn"
          class="px-4 py-2 bg-ink text-white rounded-2xl text-sm font-medium hover:bg-ink-soft transition-colors"
        >
          Sign in
        </button>
        <div v-else class="relative flex items-center gap-2">
          <button
            @click="showDropdown = !showDropdown"
            class="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              v-if="user.user_metadata?.avatar_url"
              :src="user.user_metadata.avatar_url"
              class="w-8 h-8 rounded-full object-cover border-2 border-brand-200"
              :alt="user.email"
            />
            <span v-else class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-display font-700 text-sm">
              {{ user.email?.[0].toUpperCase() }}
            </span>
          </button>

          <!-- Dropdown Menu -->
          <div
            v-if="showDropdown"
            class="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-lg border border-surface-subtle overflow-hidden z-50 min-w-48"
          >
            <div class="px-4 py-3 border-b border-surface-subtle">
              <p class="text-sm font-medium text-ink">{{ user.email }}</p>
            </div>
            <NuxtLink
              to="/profile"
              class="block px-4 py-2 text-sm text-ink hover:bg-surface-subtle transition-colors"
              @click="showDropdown = false"
            >
              📋 View Profile
            </NuxtLink>
            <button
              @click="handleSignOut"
              class="w-full text-left px-4 py-2 text-sm text-ink hover:bg-surface-subtle transition-colors"
            >
              👋 Sign Out
            </button>
          </div>

          <!-- Desktop menu -->
          <NuxtLink
            to="/profile"
            class="text-ink-muted text-sm hover:text-ink transition-colors hidden sm:block"
          >
            Profile
          </NuxtLink>
          <button
            @click="handleSignOut"
            class="text-ink-muted text-sm hover:text-ink transition-colors hidden sm:block"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
