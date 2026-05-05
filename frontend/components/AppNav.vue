<!-- components/AppNav.vue -->
<script setup lang="ts">
const { totalItems, isEmpty } = useCart()
const { user, signIn, signOut } = useAuth()

async function handleSignIn() {
  await signIn()
}

async function handleSignOut() {
  await signOut()
  navigateTo('/')
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
        <div v-else class="flex items-center gap-2">
          <img
            v-if="user.user_metadata?.avatar_url"
            :src="user.user_metadata.avatar_url"
            class="w-8 h-8 rounded-full object-cover border-2 border-brand-200"
            :alt="user.email"
          />
          <span v-else class="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-display font-700 text-sm">
            {{ user.email?.[0].toUpperCase() }}
          </span>
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
