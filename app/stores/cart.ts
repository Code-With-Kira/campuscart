import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '~/types/catalog'
import { pesosToCentavos } from '~/utils/money'

// Frontend-only snapshot of product fields in the approved ERD.
// No cart_item_id is invented: real cart_item_id comes from the future backend.
import { MAX_DEMO_LINES, MAX_DEMO_QUANTITY, isPermittedQuantity, sanitizeDemoCart } from '~/utils/cartValidation'
import type { DemoCartItem } from '~/utils/cartValidation'

export const useCartStore = defineStore('cart', () => {
  const items = ref<DemoCartItem[]>([])
  const lastRemoved = ref<DemoCartItem | null>(null)
  // Set on the client after hydration. Prevents SSR/client mismatches on refresh.
  const isRestored = ref(false)

  const distinctItems = computed(() => items.value.length)
  const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotalCentavos = computed(() => items.value.reduce(
    (sum, item) => sum + pesosToCentavos(item.price) * item.quantity, 0,
  ))
  const hasStockIssues = computed(() => items.value.some(item =>
    item.status !== 'ACTIVE' || item.stock_quantity < item.quantity,
  ))

  function addProduct(product: Product, quantity = 1): boolean {
    if (!isPermittedQuantity(quantity, product.stock_quantity) || product.status !== 'ACTIVE') return false
    const existing = items.value.find(item => item.product_id === product.product_id)
    if (existing) {
      if (existing.quantity + quantity > product.stock_quantity) return false
      if (existing.quantity + quantity > MAX_DEMO_QUANTITY) return false
      existing.quantity += quantity
      existing.price = product.price
      existing.product_name = product.product_name
      existing.stock_quantity = product.stock_quantity
      existing.status = product.status
      return true
    }
    if (items.value.length >= MAX_DEMO_LINES) return false
    items.value.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      status: product.status,
      quantity,
    })
    return true
  }

  // Reject invalid edits rather than silently clamping quantities.
  // The dedicated Remove button avoids accidental removal when pressing minus at 1.
  function setQuantity(productId: number, next: number): boolean {
    const item = items.value.find(entry => entry.product_id === productId)
    if (!item || item.status !== 'ACTIVE' || !isPermittedQuantity(next, item.stock_quantity)) return false
    item.quantity = next
    return true
  }

  function removeProduct(productId: number): boolean {
    const found = items.value.find(item => item.product_id === productId)
    if (!found) return false
    lastRemoved.value = { ...found }
    items.value = items.value.filter(item => item.product_id !== productId)
    return true
  }

  function undoRemove(): boolean {
    const old = lastRemoved.value
    if (!old || old.status !== 'ACTIVE' || old.quantity > old.stock_quantity) return false
    const existing = items.value.find(item => item.product_id === old.product_id)
    if (existing) {
      if (existing.quantity + old.quantity > existing.stock_quantity) return false
      existing.quantity += old.quantity
    } else {
      if (items.value.length >= MAX_DEMO_LINES) return false
      items.value.push({ ...old })
    }
    lastRemoved.value = null
    return true
  }

  // Called only after the server confirms a placed order. Unlike ordinary
  // removal, purchased items must NOT be eligible for Undo Remove.
  function finalizeDemoPurchase(purchased: Array<{product_id: number; quantity: number}>): void {
    const byId = new Map(purchased.map(line => [line.product_id, line.quantity]))
    items.value = items.value.flatMap(item => {
      const bought = byId.get(item.product_id) ?? 0
      if (bought <= 0) return [item]
      return item.quantity > bought ? [{ ...item, quantity: item.quantity - bought }] : []
    })
    lastRemoved.value = null
  }

  function clearCart(): void {
    items.value = []
    lastRemoved.value = null
  }

  // Trust only the shape of this demo snapshot; the actual order backend must
  // never trust browser storage for price, stock, identity, or authorization.
  function restoreFromSession(payload: unknown): void {
    const restored = sanitizeDemoCart(payload)
    if (!restored) return
    items.value = restored
    lastRemoved.value = null
  }

  function markRestored(): void {
    isRestored.value = true
  }

  // Refresh demo snapshots from the API without deleting unavailable items.
  // Customers can inspect and remove those items explicitly.
  function reconcileWithProducts(products: Product[]): void {
    const byId = new Map(products.map(product => [product.product_id, product]))
    items.value = items.value.map(item => {
      const product = byId.get(item.product_id)
      return product
        ? {
            ...item,
            product_name: product.product_name,
            price: product.price,
            stock_quantity: product.stock_quantity,
            status: product.status,
          }
        : { ...item, status: 'INACTIVE' as const, stock_quantity: 0 }
    })
  }

  return {
    items, lastRemoved, isRestored, distinctItems, totalQuantity,
    subtotalCentavos, hasStockIssues,
    addProduct, setQuantity, removeProduct, undoRemove, clearCart, finalizeDemoPurchase,
    restoreFromSession, markRestored, reconcileWithProducts,
  }
})
