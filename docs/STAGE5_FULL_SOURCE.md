# CampusCart Stage 5 — Full Source Reference

Every Stage 5 new or modified application/configuration file is included below. Files unchanged from Stage 4 are included in the ZIP, not duplicated here.

**Important:** Preserve the local working Stage 4 Git history and `package-lock.json` when merging.

## `app/stores/cart.ts`

```typescript
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '~/types/catalog'
import { pesosToCentavos } from '~/utils/money'

// Frontend-only snapshot of product fields in the approved ERD.
// No cart_item_id is invented: real cart_item_id comes from the future backend.
import { MAX_DEMO_LINES, MAX_DEMO_QUANTITY, isPermittedQuantity, sanitizeDemoCart } from '~/utils/cartValidation'
import type { DemoCartItem } from '~/utils/cartValidation'
export type { DemoCartItem } from '~/utils/cartValidation'

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
    addProduct, setQuantity, removeProduct, undoRemove, clearCart,
    restoreFromSession, markRestored, reconcileWithProducts,
  }
})
```

## `app/utils/cartValidation.ts`

```typescript
// UI-only cart snapshot, NOT a database schema extension.
// Real cart_id/cart_item_id and authoritative prices belong to the backend.
export interface DemoCartItem {
  product_id: number
  product_name: string
  price: string
  stock_quantity: number
  status: 'ACTIVE' | 'INACTIVE' // Mock-only enum values; final SQL enum is unresolved.
  quantity: number
}

export const MAX_DEMO_QUANTITY = 999
export const MAX_DEMO_LINES = 60
const VALID_PRICE = /^\d{1,10}\.\d{2}$/

export function validDemoItem(value: unknown): value is DemoCartItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const item = value as Record<string, unknown>
  return typeof item.product_id === 'number' && Number.isSafeInteger(item.product_id) && item.product_id > 0
    && typeof item.product_name === 'string' && item.product_name.length > 0 && item.product_name.length <= 200
    && typeof item.price === 'string' && VALID_PRICE.test(item.price)
    && typeof item.stock_quantity === 'number' && Number.isSafeInteger(item.stock_quantity) && item.stock_quantity >= 0
    && (item.status === 'ACTIVE' || item.status === 'INACTIVE')
    && typeof item.quantity === 'number' && Number.isSafeInteger(item.quantity)
    && item.quantity >= 1 && item.quantity <= MAX_DEMO_QUANTITY
}

// An invalid storage envelope does not replace valid in-memory cart state.
// Invalid, duplicate, or malformed lines are ignored in a valid envelope.
export function sanitizeDemoCart(payload: unknown): DemoCartItem[] | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const value = payload as Record<string, unknown>
  if (value.version !== 1 || !Array.isArray(value.items) || value.items.length > MAX_DEMO_LINES) return null
  const seen = new Set<number>()
  const valid: DemoCartItem[] = []
  for (const candidate of value.items as unknown[]) {
    if (!validDemoItem(candidate) || seen.has(candidate.product_id)) continue
    seen.add(candidate.product_id)
    valid.push({
      product_id: candidate.product_id,
      product_name: candidate.product_name,
      price: candidate.price,
      stock_quantity: candidate.stock_quantity,
      status: candidate.status,
      quantity: candidate.quantity,
    })
  }
  return valid
}

export function isPermittedQuantity(next: number, stock: number): boolean {
  return Number.isSafeInteger(next) && next >= 1 && next <= MAX_DEMO_QUANTITY
    && Number.isSafeInteger(stock) && next <= stock
}
```

## `app/plugins/cart-persistence.client.ts`

```typescript
import { useCartStore } from '~/stores/cart'

// Demo-only browser-tab persistence; NEVER use for real authenticated carts.
// Initializing after app mount avoids SSR hydration mismatches.
const STORAGE_KEY = 'campuscart-demo-cart-v1'

export default defineNuxtPlugin((nuxtApp) => {
  const cart = useCartStore()

  nuxtApp.hook('app:mounted', () => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY)
      if (raw) cart.restoreFromSession(JSON.parse(raw) as unknown)
    } catch {
      // Blocked/invalid browser storage must not crash the storefront.
    }

    cart.markRestored()

    cart.$subscribe(() => {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 1,
          items: cart.items,
        }))
      } catch {
        // Cart continues to work in memory if browser storage is unavailable.
      }
    }, { detached: true })
  })
})
```

## `app/components/cart/CartItem.vue`

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DemoCartItem } from '~/stores/cart'
import { productImage } from '~/utils/productMedia'
import { formatCentavos, formatPrice, pesosToCentavos } from '~/utils/money'

const props = defineProps<{ item: DemoCartItem; updating: boolean }>()
const emit = defineEmits<{
  (e: 'set-quantity', productId: number, quantity: number): void
  (e: 'remove', productId: number): void
}>()
const draft = ref(String(props.item.quantity))
const validationError = ref('')
const outOfStock = computed(() => props.item.status !== 'ACTIVE' || props.item.stock_quantity === 0)
const tooMany = computed(() => props.item.quantity > props.item.stock_quantity)
const rowTotal = computed(() => pesosToCentavos(props.item.price) * props.item.quantity)
const inputId = computed(() => `cart-quantity-${props.item.product_id}`)

watch(() => props.item.quantity, (current) => {
  draft.value = String(current)
  validationError.value = ''
})
watch(() => props.item.stock_quantity, () => { validationError.value = '' })

function submitQuantity() {
  validationError.value = ''
  if (!/^\d+$/.test(draft.value.trim())) {
    validationError.value = 'Enter a whole-number quantity.'
    return
  }
  const next = Number(draft.value.trim())
  if (!Number.isSafeInteger(next) || next < 1) {
    validationError.value = 'Quantity must be at least 1. Use Remove to delete the item.'
    return
  }
  if (outOfStock.value) {
    validationError.value = 'This product is unavailable. Please remove it.'
    return
  }
  if (next > props.item.stock_quantity) {
    validationError.value = `Only ${props.item.stock_quantity} available in the demo catalog.`
    return
  }
  emit('set-quantity', props.item.product_id, next)
}
function adjust(amount: number) {
  if (props.updating) return
  emit('set-quantity', props.item.product_id, props.item.quantity + amount)
}
</script>

<template>
  <article class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5" :aria-label="`Cart item: ${item.product_name}`">
    <div class="flex flex-col gap-4 sm:flex-row">
      <NuxtLink :to="`/products/${item.product_id}`" class="block shrink-0 self-start overflow-hidden rounded-xl bg-campus-sage">
        <img :src="productImage(item.product_id)" :alt="`Illustration of ${item.product_name}`" width="120" height="120" class="h-28 w-28 object-contain sm:h-32 sm:w-32">
      </NuxtLink>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <h2 class="text-base font-extrabold leading-6 text-campus-emerald sm:text-lg">
              <NuxtLink :to="`/products/${item.product_id}`" class="hover:underline">{{ item.product_name }}</NuxtLink>
            </h2>
            <p class="mt-1 text-sm text-gray-600">{{ formatPrice(item.price) }} each</p>
            <p class="mt-1 text-xs font-semibold" :class="outOfStock || tooMany ? 'text-red-700' : 'text-campus-green'">
              <template v-if="outOfStock">Unavailable in demo catalog — remove this item</template>
              <template v-else-if="tooMany">Only {{ item.stock_quantity }} available — reduce the quantity</template>
              <template v-else>{{ item.stock_quantity }} available in demo catalog</template>
            </p>
          </div>
          <button type="button" class="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 underline-offset-4 hover:bg-red-50 hover:underline" :aria-label="`Remove ${item.product_name} from cart`" @click="emit('remove', item.product_id)">
            Remove
          </button>
        </div>
        <div class="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <label :for="inputId" class="mb-2 block text-xs font-bold text-gray-700">Quantity</label>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" class="h-11 w-11 rounded-lg border border-gray-300 text-lg font-semibold hover:bg-campus-sage disabled:cursor-not-allowed disabled:opacity-40" :disabled="updating || outOfStock || item.quantity <= 1" :aria-label="`Decrease quantity of ${item.product_name}`" @click="adjust(-1)">−</button>
              <input :id="inputId" v-model="draft" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" class="h-11 w-16 rounded-lg border border-gray-300 text-center text-sm font-semibold" :aria-invalid="Boolean(validationError)" :aria-describedby="validationError ? `${inputId}-error` : undefined" :disabled="updating || outOfStock" @keydown.enter.prevent="submitQuantity">
              <button type="button" class="h-11 w-11 rounded-lg border border-gray-300 text-lg font-semibold hover:bg-campus-sage disabled:cursor-not-allowed disabled:opacity-40" :disabled="updating || outOfStock || item.quantity >= item.stock_quantity" :aria-label="`Increase quantity of ${item.product_name}`" @click="adjust(1)">+</button>
              <button type="button" class="min-h-11 rounded-lg border border-campus-emerald px-3 text-xs font-bold text-campus-emerald hover:bg-campus-sage disabled:cursor-not-allowed disabled:opacity-40" :disabled="updating || outOfStock" :aria-label="`Apply ${item.product_name} quantity`" @click="submitQuantity">Update</button>
            </div>
            <p v-if="validationError" :id="`${inputId}-error`" class="mt-2 text-xs font-semibold text-red-700" role="alert">{{ validationError }}</p>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-xs text-gray-600">Line subtotal</p>
            <p class="mt-1 text-xl font-extrabold text-campus-emerald">{{ formatCentavos(rowTotal) }}</p>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
```

## `app/components/cart/CartSummary.vue`

```vue
<script setup lang="ts">
import { formatCentavos } from '~/utils/money'

defineProps<{
  distinctItems: number
  totalQuantity: number
  subtotalCentavos: number
  hasStockIssues: boolean
  stockVerified: boolean
}>()
</script>

<template>
  <aside class="h-fit rounded-2xl border border-gray-200 bg-campus-sage p-6 lg:sticky lg:top-6" aria-labelledby="cart-summary-title">
    <h2 id="cart-summary-title" class="text-xl font-extrabold text-campus-emerald">Cart Summary</h2>
    <dl class="mt-6 space-y-4 text-sm">
      <div class="flex items-center justify-between gap-3">
        <dt class="text-gray-700">Different products</dt><dd class="font-semibold">{{ distinctItems }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-gray-700">Total quantity</dt><dd class="font-semibold">{{ totalQuantity }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <dt class="font-bold text-campus-emerald">Items subtotal</dt>
        <dd class="text-xl font-extrabold text-campus-emerald">{{ formatCentavos(subtotalCentavos) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-gray-700">Shipping fee</dt><dd class="text-right font-medium text-gray-700">Not calculated</dd>
      </div>
    </dl>
    <div v-if="hasStockIssues" class="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      Review the unavailable or over-limit items before a future checkout.
    </div>
    <div v-else-if="!stockVerified" class="mt-5 rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-900">
      Stock and prices have not been refreshed from the demo API.
    </div>
    <p class="mt-5 rounded-lg bg-white p-4 text-xs leading-6 text-gray-700">
      This is a frontend demonstration. The amount above covers items only, not shipping or payment. A real backend must recalculate prices and validate stock during checkout.
    </p>
    <NuxtLink to="/products" class="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-campus-emerald px-5 text-sm font-bold text-white hover:bg-campus-green focus-visible:outline-campus-gold">
      Continue Shopping →
    </NuxtLink>
    <p class="mt-3 text-center text-xs leading-5 text-gray-600">Checkout and real payment processing are not available at Stage 5.</p>
  </aside>
</template>
```

## `app/pages/cart.vue`

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCartStore } from '~/stores/cart'
import { fetchProducts } from '~/services/catalog'
import { formatCentavos } from '~/utils/money'

useHead({ title: 'Shopping Cart | CampusCart' })
const cart = useCartStore()
const showClearConfirmation = ref(false)
const feedback = ref('')

// The same read-only API used by the homepage; no duplicate mock-cart endpoints.
const { data: currentProducts, pending, error, refresh } = await useAsyncData(
  'campuscart-cart-availability', fetchProducts,
)
const stockVerified = computed(() => Boolean(cart.isRestored && !pending.value && !error.value && currentProducts.value))
const updating = computed(() => !stockVerified.value)

watch([() => cart.isRestored, currentProducts], ([restored, products]) => {
  if (restored && products) cart.reconcileWithProducts(products)
}, { immediate: true })

function updateQuantity(productId: number, next: number) {
  feedback.value = cart.setQuantity(productId, next)
    ? 'Demo cart quantity updated.'
    : 'Quantity could not be updated. Check the available stock.'
}
function removeItem(productId: number) {
  if (cart.removeProduct(productId)) {
    feedback.value = 'Product removed from demo cart.'
    showClearConfirmation.value = false
  }
}
function undoRemoval() {
  feedback.value = cart.undoRemove()
    ? 'Removed product restored.'
    : 'Unable to restore this product; check its available quantity.'
}
function clearItems() {
  cart.clearCart()
  showClearConfirmation.value = false
  feedback.value = 'Your demo cart has been cleared.'
}
</script>

<template>
  <section class="cc-container py-10 sm:py-14">
    <nav class="mb-7 text-sm text-gray-600" aria-label="Breadcrumb">
      <NuxtLink to="/" class="font-semibold text-campus-emerald hover:underline">Home</NuxtLink>
      <span class="mx-2" aria-hidden="true">/</span>
      <span aria-current="page">Shopping Cart</span>
    </nav>

    <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-campus-green">CampusCart student essentials</p>
        <h1 class="text-3xl font-extrabold tracking-tight text-campus-emerald sm:text-4xl">Your Shopping Cart</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
          Stage 5 demo cart. Items are kept in this browser tab session, not in a student account or database.
        </p>
      </div>
      <NuxtLink to="/products" class="inline-flex min-h-11 items-center rounded-xl border border-campus-emerald px-5 py-2 text-sm font-bold text-campus-emerald hover:bg-campus-sage">
        Continue Shopping
      </NuxtLink>
    </header>

    <p v-if="feedback" class="mb-5 rounded-lg border border-gray-200 bg-campus-sage px-4 py-3 text-sm font-semibold text-campus-emerald" role="status" aria-live="polite">{{ feedback }}</p>

    <!-- The server renders the same loading state that the client initially hydrates. -->
    <div v-if="!cart.isRestored" class="rounded-2xl bg-campus-sage p-10 text-center" role="status">
      Restoring your demo cart…
    </div>
    <template v-else>
      <div v-if="cart.lastRemoved" class="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-campus-green bg-campus-sage p-4" role="status">
        <span class="text-sm font-semibold text-campus-emerald">{{ cart.lastRemoved.product_name }} was removed.</span>
        <button type="button" class="rounded-lg border border-campus-emerald px-4 py-2 text-sm font-bold text-campus-emerald hover:bg-white" @click="undoRemoval">Undo Remove</button>
      </div>

      <div v-if="pending" class="mb-6 rounded-xl bg-campus-sage p-4 text-sm text-gray-700" role="status">Checking product prices and availability…</div>
      <div v-else-if="error" class="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4" role="alert">
        <p class="max-w-xl text-sm font-medium text-red-800">Unable to refresh demo product availability. Your cart items are still visible; quantity changes are temporarily disabled.</p>
        <button type="button" class="rounded-lg border border-red-700 px-4 py-2 text-sm font-bold text-red-800 hover:bg-white" @click="refresh()">Retry stock check</button>
      </div>

      <div v-if="!cart.items.length" class="rounded-3xl border border-dashed border-gray-300 bg-campus-sage p-8 text-center sm:p-14">
        <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-4xl" aria-hidden="true">🛒</div>
        <h2 class="mt-5 text-2xl font-extrabold text-campus-emerald">Your demo cart is empty.</h2>
        <p class="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-700">Find notebooks, tech accessories, or campus merchandise and add something useful for your next class.</p>
        <NuxtLink to="/products" class="mt-7 inline-flex min-h-12 items-center rounded-xl bg-campus-emerald px-6 text-sm font-bold text-white hover:bg-campus-green">Browse Products →</NuxtLink>
      </div>

      <div v-else class="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_330px]">
        <div class="min-w-0">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-bold text-campus-emerald">Cart Items <span class="text-sm font-medium text-gray-600">({{ cart.distinctItems }} products)</span></h2>
            <button v-if="!showClearConfirmation" type="button" class="rounded-lg px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50" @click="showClearConfirmation = true">Clear Cart</button>
          </div>

          <div v-if="showClearConfirmation" class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4" role="group" aria-label="Clear cart confirmation">
            <p class="text-sm font-bold text-red-800">Remove all {{ cart.totalQuantity }} items from your demo cart?</p>
            <div class="mt-3 flex flex-wrap gap-3">
              <button type="button" class="min-h-11 rounded-lg bg-red-700 px-4 text-sm font-bold text-white hover:bg-red-800" @click="clearItems">Yes, Clear Cart</button>
              <button type="button" class="min-h-11 rounded-lg border border-gray-300 bg-white px-4 text-sm font-bold text-gray-800 hover:bg-gray-100" @click="showClearConfirmation = false">Cancel</button>
            </div>
          </div>

          <div class="space-y-4">
            <CartCartItem
              v-for="item in cart.items"
              :key="item.product_id"
              :item="item"
              :updating="updating"
              @set-quantity="updateQuantity"
              @remove="removeItem"
            />
          </div>
          <p class="mt-5 text-right text-sm font-semibold text-campus-emerald" aria-live="polite">
            Items subtotal: {{ formatCentavos(cart.subtotalCentavos) }}
          </p>
        </div>
        <CartCartSummary
          :distinct-items="cart.distinctItems"
          :total-quantity="cart.totalQuantity"
          :subtotal-centavos="cart.subtotalCentavos"
          :has-stock-issues="cart.hasStockIssues"
          :stock-verified="stockVerified"
        />
      </div>
    </template>
  </section>
</template>
```

## `package.json`

```json
{
  "name": "campuscart",
  "private": true,
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "nuxt": "^4.0.0",
    "vue": "^3.5.0",
    "vue-router": "^5.0.0",
    "pinia": "^3.0.0",
    "@pinia/nuxt": "^0.11.0",
    "@fontsource-variable/inter": "^5.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "typescript": "^5.0.0"
  },
  "engines": {
    "node": "^20.19.0 || >=22.12.0"
  }
}
```

## `scripts/verify-stage5.mjs`

```javascript
// Stage 5 dependency-free source & cart-rule checks. Requires Node >=22.12.
// This does NOT replace a Nuxt typecheck, production build, or browser tests.
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import {
  MAX_DEMO_QUANTITY,
  isPermittedQuantity,
  sanitizeDemoCart,
  validDemoItem,
} from '../app/utils/cartValidation.ts'

const root = process.cwd()
const read = (path) => {
  const file = resolve(root, path)
  assert.ok(existsSync(file), `Missing: ${path}`)
  return readFileSync(file, 'utf8')
}
let checked = 0
function check(label, action) {
  action()
  checked++
  console.log(`PASS ${String(checked).padStart(2, '0')} ${label}`)
}

const sample = {
  product_id: 201,
  product_name: 'Wireless Study Mouse',
  price: '499.00',
  stock_quantity: 21,
  status: 'ACTIVE',
  quantity: 2,
}
const envelope = (items) => ({ version: 1, items })

check('Demo cart record accepts valid ERD-aligned fields', () => assert.equal(validDemoItem(sample), true))
check('Price must be a decimal string with two places', () => assert.equal(validDemoItem({ ...sample, price: '499' }), false))
check('Invalid product IDs are rejected', () => assert.equal(validDemoItem({ ...sample, product_id: -1 }), false))
check('Zero quantities are rejected', () => assert.equal(validDemoItem({ ...sample, quantity: 0 }), false))
check('Fractional quantities are rejected', () => assert.equal(validDemoItem({ ...sample, quantity: 1.5 }), false))
check('Invalid provisional status is rejected', () => assert.equal(validDemoItem({ ...sample, status: 'PAID' }), false))
check('Negative stock is rejected', () => assert.equal(validDemoItem({ ...sample, stock_quantity: -1 }), false))
check('Permitted quantity accepts an in-stock integer', () => assert.equal(isPermittedQuantity(3, 3), true))
check('Quantity above available stock is rejected', () => assert.equal(isPermittedQuantity(4, 3), false))
check('Quantity 0 is rejected', () => assert.equal(isPermittedQuantity(0, 3), false))
check('Fractional or non-finite quantity is rejected', () => {
  assert.equal(isPermittedQuantity(1.5, 3), false)
  assert.equal(isPermittedQuantity(Infinity, 3), false)
})
check('Maximum quantity bound is enforced', () => assert.equal(isPermittedQuantity(MAX_DEMO_QUANTITY + 1, 2000), false))
check('Valid storage envelope restores product', () => assert.deepEqual(sanitizeDemoCart(envelope([sample])), [sample]))
check('Duplicate product entries cannot be restored twice', () => assert.equal(sanitizeDemoCart(envelope([sample, sample]))?.length, 1))
check('Malformed and invalid entries are removed', () => assert.deepEqual(sanitizeDemoCart(envelope([null, { ...sample, price: 'oops' }, sample])), [sample]))
check('Wrong storage version is safely ignored', () => assert.equal(sanitizeDemoCart({ version: 2, items: [sample] }), null))
check('Oversized stored payload is safely ignored', () => assert.equal(sanitizeDemoCart(envelope(Array(61).fill(sample))), null))
check('Corrupted storage shape is safely ignored', () => assert.equal(sanitizeDemoCart('corrupt'), null))

const cart = read('app/stores/cart.ts')
const page = read('app/pages/cart.vue')
const item = read('app/components/cart/CartItem.vue')
const summary = read('app/components/cart/CartSummary.vue')
const plugin = read('app/plugins/cart-persistence.client.ts')
const pkg = JSON.parse(read('package.json'))
check('Original Pinia store is extended, not replaced with another store', () => {
  assert.ok(cart.includes("defineStore('cart'") && cart.includes('addProduct') && cart.includes('setQuantity'))
})
check('Cart rejects excess stock rather than partially adding products', () => assert.ok(cart.includes('existing.quantity + quantity > product.stock_quantity')))
check('Cart supports remove, undo, and clearing all items', () => assert.ok(['removeProduct', 'undoRemove', 'clearCart'].every(name => cart.includes(`function ${name}`))))
check('Client-only persistence waits for mount', () => assert.ok(plugin.includes("app:mounted") && plugin.includes('sessionStorage')))
check('Stored data is validated before state restoration', () => assert.ok(cart.includes('sanitizeDemoCart(payload)')))
check('Cart checks the existing product API via centralized service', () => assert.ok(page.includes('fetchProducts') && page.includes('reconcileWithProducts')))
check('Cart API error state offers a real retry button', () => assert.ok(page.includes('Retry stock check') && page.includes('refresh()')))
check('Cart shows a purposeful empty state', () => assert.ok(page.includes('Your demo cart is empty.')))
check('Cart uses reusable item and summary components', () => assert.ok(page.includes('CartCartItem') && page.includes('CartCartSummary')))
check('Cart uses a confirmation before clearing all items', () => assert.ok(page.includes('showClearConfirmation') && page.includes('Yes, Clear Cart')))
check('Item entry validates numeric inputs and stock', () => assert.ok(item.includes('validationError') && item.includes('item.stock_quantity')))
check('Item has explicit accessible remove action', () => assert.ok(item.includes('Remove ${item.product_name} from cart')))
check('Line subtotal uses integer centavos', () => assert.ok(item.includes('pesosToCentavos(props.item.price) * props.item.quantity')))
check('Summary does not advertise unfinished checkout as active', () => assert.ok(summary.includes('not available at Stage 5') && summary.includes('Not calculated')))
check('Stage 4 Vue Router 5 dependency fix is preserved', () => assert.ok(pkg.dependencies['vue-router']?.startsWith('^5.')))
check('Stage 4 endpoints and original pages remain present', () => {
  assert.ok(read('server/api/v1/products.get.ts').includes('mockProducts'))
  assert.ok(read('app/pages/index.vue').includes('HomeProductSection'))
  assert.ok(read('app/pages/products/index.vue').includes('CatalogFilters'))
})
console.log(`\n${checked} Stage 5 source/data checks passed. Run Nuxt typecheck, build, and browser checks separately.`)
```
