<!-- pages/index.vue -->
<script setup lang="ts">
interface Restaurant {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  address: string | null
  _count: { menuItems: number }
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string
  restaurantId: string
}

const { apiFetch } = useApi()

// Fetch restaurants
const { data: restaurants, pending: loadingRestaurants } = await useAsyncData<Restaurant[]>(
  'restaurants',
  () => apiFetch('/restaurants')
)

const selectedRestaurant = ref<Restaurant | null>(null)
const menuItems = ref<MenuItem[]>([])
const categories = ref<string[]>([])
const selectedCategory = ref<string>('All')
const loadingMenu = ref(false)

async function selectRestaurant(restaurant: Restaurant) {
  selectedRestaurant.value = restaurant
  selectedCategory.value = 'All'
  loadingMenu.value = true

  try {
    const [items, cats] = await Promise.all([
      apiFetch<MenuItem[]>(`/restaurants/${restaurant.id}/menu`),
      apiFetch<string[]>(`/restaurants/${restaurant.id}/menu/categories`),
    ])
    menuItems.value = items
    categories.value = cats
  } finally {
    loadingMenu.value = false
  }
}

const filteredItems = computed(() => {
  if (selectedCategory.value === 'All') return menuItems.value
  return menuItems.value.filter((i) => i.category === selectedCategory.value)
})

// Auto-select first restaurant
onMounted(async () => {
  if (restaurants.value?.length) {
    await selectRestaurant(restaurants.value[0])
  }
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">

    <!-- Hero -->
    <header class="mb-10 animate-fade-up">
      <p class="text-brand-500 font-display font-600 text-sm tracking-widest uppercase mb-2">Fast delivery · Cairo</p>
      <h1 class="font-display font-800 text-4xl sm:text-5xl text-ink leading-tight">
        What are you<br class="hidden sm:block" />
        <span class="text-brand-500">hungry for?</span>
      </h1>
    </header>

    <!-- Restaurant selector -->
    <section class="mb-8">
      <h2 class="font-display font-700 text-lg text-ink mb-4">Restaurants</h2>
      <div v-if="loadingRestaurants" class="flex gap-4">
        <div v-for="i in 2" :key="i" class="h-28 w-56 rounded-3xl bg-surface-subtle animate-pulse" />
      </div>
      <div v-else class="flex gap-4 flex-wrap">
        <button
          v-for="r in restaurants"
          :key="r.id"
          @click="selectRestaurant(r)"
          :class="[
            'relative flex items-end rounded-3xl overflow-hidden h-28 w-56 text-left transition-all duration-200',
            selectedRestaurant?.id === r.id
              ? 'ring-2 ring-brand-500 ring-offset-2 shadow-brand scale-[1.02]'
              : 'hover:scale-[1.01] shadow-card hover:shadow-card-hover'
          ]"
        >
          <img
            v-if="r.imageUrl"
            :src="r.imageUrl"
            :alt="r.name"
            class="absolute inset-0 w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div class="relative p-3">
            <p class="text-white font-display font-700 text-sm leading-tight">{{ r.name }}</p>
            <p class="text-white/70 text-xs">{{ r._count.menuItems }} items</p>
          </div>
          <span
            v-if="selectedRestaurant?.id === r.id"
            class="absolute top-2 right-2 w-5 h-5 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs"
          >✓</span>
        </button>
      </div>
    </section>

    <!-- Restaurant info + menu -->
    <section v-if="selectedRestaurant">
      <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 class="font-display font-800 text-2xl text-ink">{{ selectedRestaurant.name }}</h2>
          <p v-if="selectedRestaurant.address" class="text-ink-muted text-sm mt-0.5">
            📍 {{ selectedRestaurant.address }}
          </p>
        </div>
      </div>

      <!-- Category filter -->
      <div v-if="categories.length" class="flex gap-2 flex-wrap mb-6">
        <button
          v-for="cat in ['All', ...categories]"
          :key="cat"
          @click="selectedCategory = cat"
          :class="[
            'px-4 py-1.5 rounded-full text-sm font-display font-600 transition-all duration-150',
            selectedCategory === cat
              ? 'bg-ink text-white'
              : 'bg-surface-subtle text-ink-muted hover:bg-orange-50 hover:text-ink'
          ]"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Menu grid -->
      <div v-if="loadingMenu" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="i in 6" :key="i" class="h-72 rounded-3xl bg-surface-subtle animate-pulse" />
      </div>
      <div v-else-if="filteredItems.length === 0" class="text-center py-16 text-ink-muted">
        <p class="text-4xl mb-3">🍽️</p>
        <p class="font-display font-600">No items in this category</p>
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MenuItemCard
          v-for="item in filteredItems"
          :key="item.id"
          :item="{ ...item, restaurantId: selectedRestaurant.id, restaurantName: selectedRestaurant.name }"
          class="animate-fade-up"
        />
      </div>
    </section>
  </div>
</template>
