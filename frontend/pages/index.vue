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
const { user } = useAuth()
const { addItem } = useCart()

// Fetch last order
const lastOrder = ref<any>(null)
const loadingLastOrder = ref(false)

async function fetchLastOrder() {
  if (!user.value) return
  loadingLastOrder.value = true
  try {
    const orders = await apiFetch<any[]>('/users/orders')
    if (orders.length > 0) {
      lastOrder.value = orders[0]
    }
  } catch {
    // User might not have orders yet
  } finally {
    loadingLastOrder.value = false
  }
}

function orderAgain() {
  if (!lastOrder.value) return
  
  // Add all items from the last order to cart
  lastOrder.value.items.forEach((orderItem: any) => {
    addItem({
      id: orderItem.menuItem.id,
      name: orderItem.menuItem.name,
      price: orderItem.unitPrice,
      quantity: orderItem.quantity,
      imageUrl: orderItem.menuItem.imageUrl,
      category: orderItem.menuItem.category,
      restaurantId: lastOrder.value.restaurantId,
      restaurantName: lastOrder.value.restaurant.name,
    })
  })
  
  navigateTo('/cart')
}

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
  await fetchLastOrder()
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

    <!-- Recent Order -->
    <section v-if="user && lastOrder" class="mb-8 animate-fade-up">
      <div class="bg-gradient-to-br from-brand-50 to-orange-50 rounded-3xl p-5 border border-brand-100">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div class="flex-1">
            <p class="text-xs font-600 text-brand-600 uppercase tracking-wide mb-1">Your Last Order</p>
            <h3 class="font-display font-700 text-lg text-ink mb-1">{{ lastOrder.restaurant.name }}</h3>
            <p class="text-sm text-ink-muted mb-3">
              {{ lastOrder.items.length }} item{{ lastOrder.items.length !== 1 ? 's' : '' }} · EGP {{ lastOrder.totalAmount }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="item in lastOrder.items.slice(0, 3)"
                :key="item.id"
                class="text-xs bg-white px-3 py-1 rounded-full text-ink-muted border border-orange-100"
              >
                {{ item.quantity }}x {{ item.menuItem.name }}
              </span>
              <span v-if="lastOrder.items.length > 3" class="text-xs text-ink-muted">+{{ lastOrder.items.length - 3 }} more</span>
            </div>
          </div>
          <button
            @click="orderAgain"
            class="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl font-display font-600 text-sm transition-colors shadow-brand hover:shadow-none flex-shrink-0"
          >
            Order Again
          </button>
        </div>
      </div>
    </section>

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
