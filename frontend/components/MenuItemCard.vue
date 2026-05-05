<!-- components/MenuItemCard.vue -->
<script setup lang="ts">
interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  category: string
  restaurantId: string
  restaurantName: string
}

const props = defineProps<{ item: MenuItem }>()
const { addItem, removeItem, getQuantity } = useCart()

const qty = computed(() => getQuantity(props.item.id))
const adding = ref(false)

function handleAdd() {
  adding.value = true
  addItem({
    id: props.item.id,
    name: props.item.name,
    price: props.item.price,
    imageUrl: props.item.imageUrl,
    category: props.item.category,
    restaurantId: props.item.restaurantId,
    restaurantName: props.item.restaurantName,
  })
  setTimeout(() => (adding.value = false), 300)
}
</script>

<template>
  <div class="bg-white rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 group flex flex-col">
    <!-- Image -->
    <div class="relative h-44 overflow-hidden bg-surface-subtle">
      <img
        v-if="item.imageUrl"
        :src="item.imageUrl"
        :alt="item.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-else class="w-full h-full flex items-center justify-center text-5xl">🍽️</div>

      <!-- Category badge -->
      <span class="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-display font-600 text-ink-muted">
        {{ item.category }}
      </span>
    </div>

    <!-- Content -->
    <div class="p-4 flex flex-col flex-1 gap-2">
      <h3 class="font-display font-700 text-base text-ink leading-tight">{{ item.name }}</h3>
      <p v-if="item.description" class="text-ink-muted text-xs leading-relaxed line-clamp-2 flex-1">
        {{ item.description }}
      </p>

      <!-- Price + CTA -->
      <div class="flex items-center justify-between mt-2">
        <span class="font-display font-800 text-lg text-ink">
          EGP {{ item.price }}
        </span>

        <!-- Quantity controls (show when in cart) -->
        <div v-if="qty > 0" class="flex items-center gap-2">
          <button
            @click="removeItem(item.id)"
            class="w-8 h-8 rounded-full bg-surface-subtle hover:bg-orange-100 flex items-center justify-center text-ink font-700 text-lg transition-colors"
          >
            −
          </button>
          <span class="font-display font-700 text-base w-4 text-center">{{ qty }}</span>
          <button
            @click="handleAdd"
            class="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-white font-700 text-lg transition-colors shadow-brand"
          >
            +
          </button>
        </div>

        <!-- Add button (when not in cart) -->
        <button
          v-else
          @click="handleAdd"
          :class="[
            'flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-display font-600 transition-all duration-200',
            adding
              ? 'bg-brand-600 text-white scale-95'
              : 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand hover:shadow-none hover:scale-95'
          ]"
        >
          <span>+ Add</span>
        </button>
      </div>
    </div>
  </div>
</template>
