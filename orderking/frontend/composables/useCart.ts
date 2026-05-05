// composables/useCart.ts
import { ref, computed } from 'vue'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string | null
  category: string
  quantity: number
  restaurantId: string
  restaurantName: string
}

const items = ref<CartItem[]>([])
const restaurantId = ref<string | null>(null)
const restaurantName = ref<string | null>(null)

export function useCart() {
  const totalItems = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  function addItem(item: Omit<CartItem, 'quantity'>) {
    // If cart has items from a different restaurant, clear first
    if (restaurantId.value && restaurantId.value !== item.restaurantId) {
      clearCart()
    }

    restaurantId.value = item.restaurantId
    restaurantName.value = item.restaurantName

    const existing = items.value.find((i) => i.id === item.id)
    if (existing) {
      // Optimistic update: increment immediately
      existing.quantity++
    } else {
      items.value.push({ ...item, quantity: 1 })
    }
  }

  function removeItem(id: string) {
    const idx = items.value.findIndex((i) => i.id === id)
    if (idx === -1) return
    if (items.value[idx].quantity > 1) {
      items.value[idx].quantity--
    } else {
      items.value.splice(idx, 1)
    }
    if (items.value.length === 0) clearCart()
  }

  function deleteItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id)
    if (items.value.length === 0) clearCart()
  }

  function clearCart() {
    items.value = []
    restaurantId.value = null
    restaurantName.value = null
  }

  function getQuantity(id: string): number {
    return items.value.find((i) => i.id === id)?.quantity ?? 0
  }

  return {
    items: computed(() => items.value),
    totalItems,
    totalPrice,
    isEmpty,
    restaurantId: computed(() => restaurantId.value),
    restaurantName: computed(() => restaurantName.value),
    addItem,
    removeItem,
    deleteItem,
    clearCart,
    getQuantity,
  }
}
