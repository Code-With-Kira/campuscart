# CampusCart Stage 6 — Full Source for New/Modified Files

This is a copyable reference for files changed after the Stage 5 ZIP. It includes the **confirmed Stage 5 fixes** and all new Stage 6 Vue/TypeScript/server/test sources. The complete project (including all unchanged Stage 3–5 files) is in `CampusCart_Stage6.zip`.

Nuxt typecheck/build results are **not** claimed. See `docs/STAGE6_GUIDE.md` for instructions.

---

## `app/components/cart/CartItem.vue`

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DemoCartItem } from '~/utils/cartValidation'
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

---

## `app/components/layout/SiteHeader.vue`

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const isMenuOpen = ref(false)
const cart = useCartStore()
const auth = useAuthStore()

// Category labels are temporary navigation data; Stage 3/4 will read them
// from the mock API and use category_id as the canonical filter identifier.
const categories = [
  'School Supplies',
  'Tech Accessories',
  'Campus Merchandise',
]

watch(() => route.fullPath, () => { isMenuOpen.value = false })
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="cc-container">
      <div class="flex min-h-20 items-center justify-between gap-3">
        <NuxtLink
          to="/"
          class="shrink-0 text-xl font-extrabold tracking-tight text-campus-emerald sm:text-2xl"
          aria-label="CampusCart homepage"
        >
          Campus<span class="text-campus-green">Cart</span>
        </NuxtLink>

        <nav class="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Main navigation">
          <NuxtLink to="/" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Home
          </NuxtLink>
          <NuxtLink
            v-for="category in categories"
            :key="category"
            :to="{ path: '/products', query: { category_name: category } }"
            class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm"
          >
            {{ category }}
          </NuxtLink>
        </nav>

        <nav class="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Account and shopping navigation">
          <NuxtLink to="/products" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Search
          </NuxtLink>
          <NuxtLink :to="auth.isAdmin ? '/admin' : auth.isCustomer ? '/profile' : '/login'" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            {{ auth.user ? auth.user.first_name : 'Account' }}
          </NuxtLink>
          <NuxtLink
            to="/cart"
            class="rounded-lg bg-campus-emerald px-3 py-2 text-xs font-semibold text-white hover:bg-campus-green xl:px-4 xl:text-sm"
          >
            Cart <span v-if="cart.totalQuantity" class="ml-1 rounded-full bg-campus-gold px-2 py-0.5 text-xs font-extrabold text-campus-emerald" aria-label="Items in cart">{{ cart.totalQuantity }}</span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2 lg:hidden">
          <NuxtLink
            to="/cart"
            class="rounded-lg border border-campus-emerald px-3 py-2 text-xs font-semibold text-campus-emerald sm:text-sm"
            aria-label="Shopping cart"
          >
            Cart <span v-if="cart.totalQuantity" class="ml-1 font-extrabold">({{ cart.totalQuantity }})</span>
          </NuxtLink>
          <button
            type="button"
            class="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-campus-emerald sm:text-sm"
            aria-controls="mobile-menu"
            :aria-expanded="isMenuOpen"
            :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
            @click="isMenuOpen = !isMenuOpen"
          >
            {{ isMenuOpen ? 'Close' : 'Menu' }}
          </button>
        </div>
      </div>

      <nav
        v-if="isMenuOpen"
        id="mobile-menu"
        class="flex flex-col gap-1 border-t border-gray-200 py-4 lg:hidden"
        aria-label="Mobile navigation"
      >
        <NuxtLink to="/" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Home
        </NuxtLink>
        <NuxtLink
          v-for="category in categories"
          :key="category"
          :to="{ path: '/products', query: { category_name: category } }"
          class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage"
        >
          {{ category }}
        </NuxtLink>
        <NuxtLink to="/products" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Search Products
        </NuxtLink>
        <NuxtLink :to="auth.isAdmin ? '/admin' : auth.isCustomer ? '/profile' : '/login'" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          {{ auth.user ? auth.user.first_name + ' · Account' : 'Account' }}
        </NuxtLink>
        <NuxtLink to="/cart" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Shopping Cart <span v-if="cart.totalQuantity">({{ cart.totalQuantity }})</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
```

---

## `app/layouts/admin.vue`

```vue
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
async function exitPreview() { await auth.logout(); await navigateTo('/login') }
</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">
      Skip to main content
    </a>

    <header class="bg-campus-emerald text-white">
      <div class="cc-container flex min-h-16 items-center justify-between gap-4">
        <NuxtLink to="/admin" class="text-xl font-bold">CampusCart Admin</NuxtLink>
        <div class="flex flex-wrap items-center gap-2"><NuxtLink to="/" class="rounded-lg px-3 py-2 text-sm hover:bg-white/15">View Store</NuxtLink><button type="button" class="rounded-lg border border-white/50 px-3 py-2 text-sm hover:bg-white/15" @click="exitPreview">Exit Demo Admin</button></div>
      </div>
    </header>

    <div class="cc-container flex flex-col gap-6 py-6 md:flex-row">
      <aside class="w-full shrink-0 md:w-60">
        <nav
          aria-label="Administrator navigation"
          class="flex gap-2 overflow-x-auto rounded-xl bg-white p-3 shadow-sm md:flex-col"
        >
          <NuxtLink
            to="/admin"
            class="whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold text-campus-emerald hover:bg-campus-sage"
          >Dashboard</NuxtLink>
          <NuxtLink
            to="/admin/products"
            class="whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold text-campus-emerald hover:bg-campus-sage"
          >Products</NuxtLink>
          <div class="hidden border-t border-gray-100 pt-3 md:block">
            <p class="px-4 text-xs text-gray-500">More admin modules will be added later.</p>
          </div>
        </nav>
      </aside>

      <main id="main-content" class="min-w-0 flex-1 rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
```

---

## `app/middleware/admin.ts`

```typescript
import { useAuthStore } from '~/stores/auth'
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  const auth = useAuthStore()
  await auth.ensureSession()
  if (!auth.user) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  if (!auth.isAdmin) return navigateTo('/profile')
})
```

---

## `app/middleware/customer.ts`

```typescript
import { useAuthStore } from '~/stores/auth'
export default defineNuxtRouteMiddleware(async (to) => {
  // Client navigation is a usability check; API handlers enforce ownership.
  if (import.meta.server) return
  const auth = useAuthStore()
  await auth.ensureSession()
  if (!auth.user) return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  if (!auth.isCustomer) return navigateTo('/admin')
})
```

---

## `app/pages/admin/index.vue`

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Admin Dashboard | CampusCart' })
</script>

<template>
  <section>
    <h1 class="mb-4 text-3xl font-bold text-campus-emerald">Admin Dashboard</h1>
    <p class="mb-8 leading-7 text-gray-600">
      This is the administrator layout preview. Dashboard statistics,
      order summaries, and inventory information will be integrated later.
    </p>
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div
        v-for="label in ['Total Products', 'Total Orders', 'Total Customers', 'Low Stock']"
        :key="label"
        class="rounded-xl border border-gray-200 bg-campus-sage p-5"
      >
        <p class="mb-3 text-sm font-semibold text-gray-700">{{ label }}</p>
        <p class="text-2xl font-bold text-campus-emerald">—</p>
      </div>
    </div>
    <p class="mt-4 text-xs text-gray-500">These are layout placeholders, not actual dashboard values.</p>
  </section>
</template>
```

---

## `app/pages/admin/products/index.vue`

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Manage Products | CampusCart' })
</script>

<template>
  <section>
    <h1 class="mb-4 text-3xl font-bold text-campus-emerald">Product Management</h1>
    <p class="mb-6 leading-7 text-gray-600">
      This page will eventually show the administrator's product table,
      search controls, stock information, and product management actions.
    </p>
    <div class="rounded-xl border border-gray-200 p-6">
      <p class="font-semibold text-campus-emerald">Product Management Layout</p>
      <p class="mt-2 text-sm text-gray-600">
        Product data and CRUD operations have not been implemented yet.
      </p>
    </div>
  </section>
</template>
```

---

## `app/pages/cart.vue`

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCartStore } from '~/stores/cart'
import CartItem from '~/components/cart/CartItem.vue'
import CartSummary from '~/components/cart/CartSummary.vue'
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
            <CartItem
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
        <CartSummary
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

---

## `app/pages/information/[slug].vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
const route = useRoute()
const entries: Record<string, { title: string; description: string; details: string[] }> = {
  about: {
    title: 'About CampusCart',
    description: 'CampusCart is a student e-commerce project designed for school supplies, tech accessories, and campus-inspired merchandise.',
    details: ['This demonstration is independently built for an ITE 18 academic project.', 'The colors are inspired by Caraga State University; this is not an official CSU store.'],
  },
  contact: {
    title: 'Contact Information',
    description: 'Official CampusCart contact channels have not yet been finalized.',
    details: ['No email address, phone number, or social media account is being claimed in this prototype.', 'Please do not provide personal, payment, or delivery details through this demo.'],
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'What should visitors know about this CampusCart demonstration?',
    details: ['Can I browse products? Yes. The homepage shows sample products from a local mock API.', 'Can I add products to a cart? Yes. The cart is a temporary Pinia demonstration.', 'Can I place a real order? No. Stage 6 has temporary demo accounts, but checkout, payment, and delivery are not active yet.'],
  },
  policies: {
    title: 'Policies and Privacy',
    description: 'Production purchasing and privacy policies are not finalized for this academic demonstration.',
    details: ['This demo does not accept actual purchases or payments. Stage 6 demo accounts and address records are kept only in server memory and vanish when the server restarts.', 'Do not enter real payment credentials or sensitive personal details.', 'The privacy, refund, and delivery policies must be reviewed before a future public launch.'],
  },
}
const entry = computed(() => entries[String(route.params.slug)])
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
useHead(() => ({ title: `${entry.value?.title ?? 'Information'} | CampusCart` }))
</script>
<template>
  <section class="cc-container max-w-3xl py-16">
    <NuxtLink to="/" class="text-sm font-semibold text-campus-green hover:underline">← Back to home</NuxtLink>
    <h1 class="mt-6 text-4xl font-black text-campus-emerald">{{ entry?.title }}</h1>
    <p class="mt-5 text-lg leading-8 text-gray-700">{{ entry?.description }}</p>
    <ul class="mt-8 space-y-4">
      <li v-for="(detail, index) in entry?.details ?? []" :key="index" class="rounded-xl border border-gray-100 bg-campus-sage p-5 leading-7">{{ detail }}</li>
    </ul>
  </section>
</template>
```

---

## `app/pages/login.vue`

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { validateEmail } from '~/utils/accountValidation'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Demo Login | CampusCart' })
const auth = useAuthStore()
const route = useRoute()
const email = ref('')
const password = ref('')
const visible = ref(false)
const errorMessage = ref('')
const emailError = ref('')
const showDemoButtons = import.meta.dev

function redirectFor(role: string) {
  const requested = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  // Only permit relative in-app paths; never redirect to third-party URLs.
  const safe = requested.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\')
  return safe ? requested : (role === 'ADMIN' ? '/admin' : '/profile')
}
async function submit() {
  emailError.value = validateEmail(email.value)
  errorMessage.value = ''
  if (emailError.value) return
  if (!password.value) { errorMessage.value = 'Enter the demo password for an account registered in this session.'; return }
  try {
    await auth.login(email.value, password.value)
    await navigateTo(redirectFor(auth.user?.role ?? 'CUSTOMER'))
  } catch {
    errorMessage.value = 'Login failed. Use a demo account created during this server session, or choose a preview below.'
  } finally { password.value = '' }
}
async function preview(role: 'CUSTOMER' | 'ADMIN') {
  errorMessage.value = ''
  try {
    await auth.preview(role)
    await navigateTo(role === 'ADMIN' ? '/admin' : '/profile')
  } catch { errorMessage.value = 'The development-only preview is unavailable.' }
}
</script>

<template>
  <section>
    <p class="mb-2 text-center text-xs font-bold uppercase tracking-widest text-campus-green">Stage 6 · Development demo</p>
    <h1 class="text-center text-3xl font-black text-campus-emerald">Welcome Back</h1>
    <p class="mt-3 text-center text-sm leading-6 text-gray-600">Log in to an account registered during this local server run. Accounts reset when the server restarts.</p>
    <div class="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900" role="note">
      Use fictional email addresses and passwords only. This is not a production account service.
    </div>
    <form class="mt-7 space-y-5" novalidate @submit.prevent="submit">
      <div>
        <label for="login-email" class="mb-2 block text-sm font-semibold text-gray-800">Email address</label>
        <input id="login-email" v-model.trim="email" type="email" autocomplete="username" maxlength="255" :aria-invalid="Boolean(emailError)" aria-describedby="login-email-error" class="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900" placeholder="student@example.test">
        <p id="login-email-error" v-if="emailError" class="mt-1 text-xs text-red-700">{{ emailError }}</p>
      </div>
      <div>
        <label for="login-password" class="mb-2 block text-sm font-semibold text-gray-800">Demo password</label>
        <div class="flex gap-2">
          <input id="login-password" v-model="password" :type="visible ? 'text' : 'password'" autocomplete="current-password" class="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-gray-900" maxlength="128" required>
          <button type="button" class="rounded-lg border border-gray-300 px-3 text-sm font-semibold text-campus-emerald" :aria-label="visible ? 'Hide password' : 'Show password'" @click="visible = !visible">{{ visible ? 'Hide' : 'Show' }}</button>
        </div>
      </div>
      <p v-if="errorMessage" class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{{ errorMessage }}</p>
      <button type="submit" :disabled="auth.busy" class="min-h-12 w-full rounded-xl bg-campus-emerald px-5 font-bold text-white hover:bg-campus-green disabled:cursor-wait disabled:opacity-60">{{ auth.busy ? 'Signing in…' : 'Log In' }}</button>
    </form>
    <div v-if="showDemoButtons" class="mt-7 border-t border-gray-200 pt-6">
      <p class="mb-3 text-center text-sm font-bold text-campus-emerald">Try the interface without registering</p>
      <div class="grid gap-3 sm:grid-cols-2">
        <button type="button" :disabled="auth.busy" class="rounded-lg border border-campus-emerald p-3 text-sm font-bold text-campus-emerald hover:bg-campus-sage disabled:opacity-60" @click="preview('CUSTOMER')">Demo Customer</button>
        <button type="button" :disabled="auth.busy" class="rounded-lg border border-campus-emerald p-3 text-sm font-bold text-campus-emerald hover:bg-campus-sage disabled:opacity-60" @click="preview('ADMIN')">Admin Preview</button>
      </div>
      <p class="mt-3 text-xs leading-5 text-gray-600">Preview shortcuts work only in development. They are intentionally unavailable in production builds.</p>
    </div>
    <p class="mt-7 text-center text-sm text-gray-700">Need a demo account? <NuxtLink to="/register" class="font-bold text-campus-green hover:underline">Register here</NuxtLink>.</p>
  </section>
</template>
```

---

## `app/pages/orders/[order_id].vue`

```vue
<script setup lang="ts">
definePageMeta({ middleware: 'customer' })
useHead({ title: 'Order Details | CampusCart' })
</script>
<template>
  <section class="cc-container max-w-2xl py-16">
    <NuxtLink to="/orders" class="text-sm font-bold text-campus-green hover:underline">← Back to My Orders</NuxtLink>
    <h1 class="mt-7 text-3xl font-black text-campus-emerald">Order Details Not Available</h1>
    <p class="mt-4 leading-7 text-gray-700">Stage 6 contains no placed orders. No order record exists to display; order details, payment history and status tracking will be connected only after checkout and backend workflows are implemented.</p>
  </section>
</template>
```

---

## `app/pages/orders/index.vue`

```vue
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getDemoOrders } from '~/services/account'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'customer' })
useHead({ title: 'My Orders | CampusCart' })
const auth = useAuthStore()
const loading = ref(true)
const error = ref('')
const orders = ref<unknown[]>([])
async function load() {
  error.value = ''; loading.value = true
  try { orders.value = await getDemoOrders() }
  catch { error.value = 'Unable to load order history for this demo session.' }
  finally { loading.value = false }
}
onMounted(async () => { await auth.ensureSession(); if (auth.isCustomer) await load() })
</script>
<template>
  <section class="cc-container py-12 sm:py-16">
    <NuxtLink to="/profile" class="text-sm font-bold text-campus-green hover:underline">← My Profile</NuxtLink>
    <p class="mt-7 text-xs font-bold uppercase tracking-widest text-campus-green">CampusCart customer area</p>
    <h1 class="mt-2 text-3xl font-black text-campus-emerald sm:text-4xl">My Orders</h1>
    <p class="mt-3 max-w-xl text-sm leading-7 text-gray-600">Your order history will appear here when checkout is implemented in a future stage. Stage 6 does not create mock purchases or fake payment records.</p>
    <div v-if="loading" class="mt-9 rounded-2xl bg-campus-sage p-10 text-center" role="status">Loading order history…</div>
    <div v-else-if="error" class="mt-9 rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert"><p class="font-semibold text-red-800">{{ error }}</p><button type="button" class="mt-4 rounded-lg bg-campus-emerald px-5 py-3 text-white" @click="load">Retry</button></div>
    <div v-else-if="!orders.length" class="mt-9 rounded-3xl border border-dashed border-gray-300 bg-campus-sage p-10 text-center sm:p-14">
      <div class="text-5xl" aria-hidden="true">📦</div>
      <h2 class="mt-5 text-2xl font-extrabold text-campus-emerald">No orders yet</h2>
      <p class="mx-auto mt-3 max-w-lg text-sm leading-7 text-gray-600">You can browse products and add items to the demo cart. Placing and paying for orders is not available during Stage 6.</p>
      <NuxtLink to="/products" class="mt-7 inline-flex rounded-xl bg-campus-emerald px-6 py-3 font-bold text-white hover:bg-campus-green">Explore Products →</NuxtLink>
    </div>
  </section>
</template>
```

---

## `app/pages/profile/addresses.vue`

```vue
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { AddressDraft, CampusAddress } from '~/types/account'
import { validateAddress, type FieldErrors } from '~/utils/accountValidation'
import { createDemoAddress, deleteDemoAddress, getDemoAddresses, makeDefaultDemoAddress, updateDemoAddress } from '~/services/account'

definePageMeta({ middleware: 'customer' })
useHead({ title: 'Saved Addresses | CampusCart' })
const auth = useAuthStore()
const rows = ref<CampusAddress[]>([])
const loading = ref(true)
const busy = ref(false)
const editingId = ref<number | null>(null)
const confirmDelete = ref<number | null>(null)
const errorMessage = ref('')
const feedback = ref('')
const errors = ref<FieldErrors>({})
const emptyDraft = (): AddressDraft => ({ address_label: '', recipient_name: '', phone_number: '', barangay: '', city: '', is_default: false })
const draft = reactive<AddressDraft>(emptyDraft())
async function reload() {
  loading.value = true; errorMessage.value = ''
  try { rows.value = await getDemoAddresses() }
  catch { errorMessage.value = 'Unable to retrieve your temporary saved addresses.' }
  finally { loading.value = false }
}
onMounted(async () => {
  await auth.ensureSession()
  if (auth.isCustomer) await reload()
})
function resetForm() {
  Object.assign(draft, emptyDraft()); editingId.value = null; errors.value = {}; confirmDelete.value = null
}
function startEdit(row: CampusAddress) {
  editingId.value = row.address_id
  Object.assign(draft, { address_label: row.address_label, recipient_name: row.recipient_name, phone_number: row.phone_number, barangay: row.barangay, city: row.city, is_default: row.is_default })
  errors.value = {}; feedback.value = ''; errorMessage.value = ''
  document.getElementById('address-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
async function save() {
  errors.value = validateAddress(draft)
  feedback.value = ''; errorMessage.value = ''
  if (Object.keys(errors.value).length) return
  busy.value = true
  try {
    if (editingId.value) await updateDemoAddress(editingId.value, { ...draft })
    else await createDemoAddress({ ...draft })
    feedback.value = editingId.value ? 'Demo address updated.' : 'Demo address added.'
    resetForm()
    await reload()
  } catch { errorMessage.value = 'Could not save this address. Check the fields and try again.' }
  finally { busy.value = false }
}
async function makeDefault(id: number) {
  busy.value = true; errorMessage.value = ''
  try { await makeDefaultDemoAddress(id); await reload(); feedback.value = 'Default demo address changed.' }
  catch { errorMessage.value = 'Unable to change the default address.' }
  finally { busy.value = false }
}
async function remove(id: number) {
  busy.value = true; errorMessage.value = ''
  try { await deleteDemoAddress(id); await reload(); feedback.value = 'Demo address removed.'; confirmDelete.value = null; if (editingId.value === id) resetForm() }
  catch { errorMessage.value = 'Unable to remove this address.' }
  finally { busy.value = false }
}
</script>

<template>
  <section class="cc-container py-10 sm:py-14">
    <NuxtLink to="/profile" class="text-sm font-bold text-campus-green hover:underline">← My Profile</NuxtLink>
    <h1 class="mt-5 text-3xl font-black text-campus-emerald sm:text-4xl">Saved Addresses</h1>
    <p class="mt-3 max-w-3xl text-sm leading-7 text-gray-600">Manage temporary addresses for your demo customer. The approved ERD currently stores label, recipient, phone, barangay and city. It does <strong>not</strong> include a street or unit field. Do not use real delivery information here.</p>
    <p v-if="feedback" role="status" class="mt-6 rounded-lg bg-campus-sage px-4 py-3 text-sm font-semibold text-campus-emerald">{{ feedback }}</p>
    <p v-if="errorMessage" role="alert" class="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{{ errorMessage }} <button v-if="!busy" type="button" class="ml-2 font-bold underline" @click="reload">Retry</button></p>
    <div class="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
      <section aria-labelledby="saved-heading">
        <h2 id="saved-heading" class="mb-5 text-xl font-extrabold text-campus-emerald">Your Addresses</h2>
        <div v-if="loading" role="status" class="rounded-xl bg-campus-sage p-6">Loading demo addresses…</div>
        <div v-else-if="!rows.length" role="status" class="rounded-2xl border border-dashed border-gray-300 bg-campus-sage p-8 text-center">
          <p class="text-lg font-bold text-campus-emerald">No saved addresses yet</p>
          <p class="mt-2 text-sm text-gray-600">Use the form to create your first temporary demo address.</p>
        </div>
        <div v-else class="space-y-4">
          <article v-for="row in rows" :key="row.address_id" class="rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div class="flex flex-wrap items-center justify-between gap-2"><h3 class="font-bold text-campus-emerald">{{ row.address_label }}</h3><span v-if="row.is_default" class="rounded-full bg-campus-sage px-3 py-1 text-xs font-bold text-campus-emerald">Default</span></div>
            <p class="mt-3 text-sm font-semibold text-gray-800">{{ row.recipient_name }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ row.phone_number }}</p>
            <p class="mt-1 text-sm text-gray-600">{{ row.barangay }}, {{ row.city }}</p>
            <div class="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
              <button type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-3 py-2 text-sm font-bold text-campus-emerald hover:bg-campus-sage" @click="startEdit(row)">Edit</button>
              <button v-if="!row.is_default" type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-3 py-2 text-sm font-bold text-campus-emerald hover:bg-campus-sage" @click="makeDefault(row.address_id)">Set Default</button>
              <button v-if="confirmDelete !== row.address_id" type="button" class="rounded-lg px-3 py-2 text-sm font-bold text-red-700 hover:bg-red-50" @click="confirmDelete = row.address_id">Remove</button>
              <div v-else class="flex flex-wrap items-center gap-2" role="group" aria-label="Confirm address deletion"><span class="text-xs text-red-800">Delete address?</span><button type="button" :disabled="busy" class="rounded-lg bg-red-700 px-3 py-2 text-xs font-bold text-white" @click="remove(row.address_id)">Delete</button><button type="button" class="rounded-lg border border-gray-300 px-3 py-2 text-xs" @click="confirmDelete = null">Cancel</button></div>
            </div>
          </article>
        </div>
      </section>
      <form id="address-form" class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7" novalidate @submit.prevent="save">
        <h2 class="text-xl font-extrabold text-campus-emerald">{{ editingId ? 'Edit Address' : 'Add a Demo Address' }}</h2>
        <p class="mt-2 text-xs leading-5 text-gray-600">For learning only · Maximum 10 per demo customer</p>
        <div class="mt-5 space-y-4">
          <div><label for="addr-label" class="mb-2 block text-sm font-semibold">Address label</label><input id="addr-label" v-model.trim="draft.address_label" maxlength="50" placeholder="Dorm / Home" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.address_label" class="mt-1 text-xs text-red-700">{{ errors.address_label }}</p></div>
          <div><label for="addr-name" class="mb-2 block text-sm font-semibold">Recipient name</label><input id="addr-name" v-model.trim="draft.recipient_name" maxlength="200" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.recipient_name" class="mt-1 text-xs text-red-700">{{ errors.recipient_name }}</p></div>
          <div><label for="addr-phone" class="mb-2 block text-sm font-semibold">Demo phone number</label><input id="addr-phone" v-model.trim="draft.phone_number" type="tel" maxlength="30" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.phone_number" class="mt-1 text-xs text-red-700">{{ errors.phone_number }}</p></div>
          <div><label for="addr-barangay" class="mb-2 block text-sm font-semibold">Barangay</label><input id="addr-barangay" v-model.trim="draft.barangay" maxlength="150" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.barangay" class="mt-1 text-xs text-red-700">{{ errors.barangay }}</p></div>
          <div><label for="addr-city" class="mb-2 block text-sm font-semibold">City</label><input id="addr-city" v-model.trim="draft.city" maxlength="150" class="w-full rounded-lg border border-gray-300 px-3 py-3"><p v-if="errors.city" class="mt-1 text-xs text-red-700">{{ errors.city }}</p></div>
          <label class="flex items-center gap-3 text-sm"><input v-model="draft.is_default" type="checkbox" class="h-4 w-4 accent-campus-green">Make this my default demo address</label>
        </div>
        <div class="mt-6 flex flex-wrap gap-3">
          <button type="submit" :disabled="busy" class="min-h-11 rounded-lg bg-campus-emerald px-5 text-sm font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ busy ? 'Saving…' : editingId ? 'Update Address' : 'Save Address' }}</button>
          <button v-if="editingId" type="button" class="rounded-lg border border-gray-300 px-4 text-sm font-bold text-gray-700" @click="resetForm">Cancel</button>
        </div>
      </form>
    </div>
  </section>
</template>
```

---

## `app/pages/profile/index.vue`

```vue
<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { validateEmail, validateNames, type FieldErrors } from '~/utils/accountValidation'

definePageMeta({ middleware: 'customer' })
useHead({ title: 'My Profile | CampusCart' })
const auth = useAuthStore()
const draft = reactive({ first_name: '', last_name: '', email: '' })
const errors = ref<FieldErrors>({})
const feedback = ref('')
const savingError = ref('')
watch(() => auth.user, (user) => {
  if (user) Object.assign(draft, { first_name: user.first_name, last_name: user.last_name, email: user.email })
}, { immediate: true })
async function save() {
  errors.value = validateNames(draft.first_name, draft.last_name)
  const problem = validateEmail(draft.email)
  if (problem) errors.value.email = problem
  if (Object.keys(errors.value).length) return
  savingError.value = ''; feedback.value = ''
  try { await auth.updateProfile({ ...draft }); feedback.value = 'Your temporary demo profile was updated.' }
  catch { savingError.value = 'Could not save your demo profile. Try again.' }
}
async function logout() {
  try { await auth.logout(); await navigateTo('/login') }
  catch { savingError.value = 'Unable to sign out. Please try again.' }
}
</script>

<template>
  <section class="cc-container py-10 sm:py-14">
    <p class="text-sm font-semibold text-campus-green">Customer account · Demo mode</p>
    <h1 class="mt-2 text-3xl font-black text-campus-emerald sm:text-4xl">My Profile</h1>
    <p class="mt-3 max-w-3xl text-sm leading-7 text-gray-600">Your profile exists in temporary server memory. Use fictional details only; this is not a secure production account.</p>
    <div class="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_290px]">
      <form class="rounded-2xl border border-gray-200 p-6 shadow-sm sm:p-8" novalidate @submit.prevent="save">
        <h2 class="mb-5 text-xl font-bold text-campus-emerald">Account details</h2>
        <div class="grid gap-5 sm:grid-cols-2">
          <div><label for="profile-first" class="mb-2 block text-sm font-semibold">First name</label><input id="profile-first" v-model.trim="draft.first_name" maxlength="100" autocomplete="given-name" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.first_name" class="mt-1 text-xs text-red-700">{{ errors.first_name }}</p></div>
          <div><label for="profile-last" class="mb-2 block text-sm font-semibold">Last name</label><input id="profile-last" v-model.trim="draft.last_name" maxlength="100" autocomplete="family-name" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.last_name" class="mt-1 text-xs text-red-700">{{ errors.last_name }}</p></div>
          <div class="sm:col-span-2"><label for="profile-email" class="mb-2 block text-sm font-semibold">Email</label><input id="profile-email" v-model.trim="draft.email" type="email" maxlength="255" autocomplete="email" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.email" class="mt-1 text-xs text-red-700">{{ errors.email }}</p></div>
        </div>
        <p v-if="feedback" role="status" class="mt-5 rounded-xl bg-campus-sage p-4 text-sm font-semibold text-campus-emerald">{{ feedback }}</p>
        <p v-if="savingError" role="alert" class="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">{{ savingError }}</p>
        <button type="submit" :disabled="auth.busy" class="mt-6 min-h-12 rounded-xl bg-campus-emerald px-6 font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ auth.busy ? 'Saving…' : 'Save Changes' }}</button>
        <dl class="mt-7 space-y-2 border-t border-gray-200 pt-5 text-xs text-gray-600"><div>Role: <strong>{{ auth.user?.role ?? '—' }}</strong></div><div>Account status: <strong>{{ auth.user?.account_status ?? '—' }}</strong></div></dl>
      </form>
      <aside class="rounded-2xl bg-campus-sage p-6">
        <h2 class="text-lg font-extrabold text-campus-emerald">My CampusCart</h2>
        <nav class="mt-5 flex flex-col gap-3" aria-label="Customer account navigation">
          <NuxtLink to="/profile/addresses" class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campus-emerald hover:underline">Saved Addresses →</NuxtLink>
          <NuxtLink to="/orders" class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campus-emerald hover:underline">My Orders →</NuxtLink>
          <NuxtLink to="/cart" class="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-campus-emerald hover:underline">Demo Cart →</NuxtLink>
        </nav>
        <button type="button" :disabled="auth.busy" class="mt-6 w-full rounded-xl border border-red-700 px-4 py-3 text-sm font-bold text-red-800 hover:bg-red-50" @click="logout">Sign Out</button>
      </aside>
    </div>
  </section>
</template>
```

---

## `app/pages/register.vue`

```vue
<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { validateRegistration, type FieldErrors } from '~/utils/accountValidation'
import type { RegistrationDraft } from '~/types/account'

definePageMeta({ layout: 'auth' })
useHead({ title: 'Create Demo Account | CampusCart' })
const auth = useAuthStore()
const draft = reactive<RegistrationDraft>({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' })
const errors = ref<FieldErrors>({})
const serverError = ref('')
const showPassword = ref(false)
async function submit() {
  errors.value = validateRegistration(draft)
  serverError.value = ''
  if (Object.keys(errors.value).length) return
  try {
    await auth.register({ first_name: draft.first_name, last_name: draft.last_name, email: draft.email, password: draft.password })
    draft.password = ''
    draft.confirm_password = ''
    await navigateTo('/profile')
  } catch {
    serverError.value = 'Registration failed. Check your details or try a different fictional demo email.'
  }
}
</script>

<template>
  <section>
    <p class="mb-2 text-center text-xs font-bold uppercase tracking-widest text-campus-green">Stage 6 · Local-only</p>
    <h1 class="text-center text-3xl font-black text-campus-emerald">Create Your Account</h1>
    <p class="mt-3 text-center text-sm leading-6 text-gray-600">Register a temporary demo customer. No real purchases or persistent accounts are created.</p>
    <p class="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">Use invented personal details and a unique demo password. Data lasts only while this server runs; do not enter real credentials.</p>
    <form class="mt-7 space-y-5" novalidate @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label for="reg-first" class="mb-2 block text-sm font-semibold">First name</label><input id="reg-first" v-model.trim="draft.first_name" autocomplete="given-name" maxlength="100" :aria-invalid="Boolean(errors.first_name)" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.first_name" class="mt-1 text-xs text-red-700">{{ errors.first_name }}</p></div>
        <div><label for="reg-last" class="mb-2 block text-sm font-semibold">Last name</label><input id="reg-last" v-model.trim="draft.last_name" autocomplete="family-name" maxlength="100" :aria-invalid="Boolean(errors.last_name)" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.last_name" class="mt-1 text-xs text-red-700">{{ errors.last_name }}</p></div>
      </div>
      <div><label for="reg-email" class="mb-2 block text-sm font-semibold">Demo email</label><input id="reg-email" v-model.trim="draft.email" type="email" autocomplete="email" maxlength="255" :aria-invalid="Boolean(errors.email)" class="w-full rounded-xl border border-gray-300 px-4 py-3" placeholder="student@example.test"><p v-if="errors.email" class="mt-1 text-xs text-red-700">{{ errors.email }}</p></div>
      <div><label for="reg-password" class="mb-2 block text-sm font-semibold">Demo password (at least 12 characters)</label><div class="flex gap-2"><input id="reg-password" v-model="draft.password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" minlength="12" maxlength="128" :aria-invalid="Boolean(errors.password)" class="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3"><button type="button" class="rounded-lg border border-gray-300 px-3 text-sm font-semibold text-campus-emerald" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</button></div><p v-if="errors.password" class="mt-1 text-xs text-red-700">{{ errors.password }}</p></div>
      <div><label for="reg-confirm" class="mb-2 block text-sm font-semibold">Confirm password</label><input id="reg-confirm" v-model="draft.confirm_password" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" maxlength="128" :aria-invalid="Boolean(errors.confirm_password)" class="w-full rounded-xl border border-gray-300 px-4 py-3"><p v-if="errors.confirm_password" class="mt-1 text-xs text-red-700">{{ errors.confirm_password }}</p></div>
      <p v-if="serverError" class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{{ serverError }}</p>
      <button type="submit" :disabled="auth.busy" class="min-h-12 w-full rounded-xl bg-campus-emerald px-5 font-bold text-white hover:bg-campus-green disabled:opacity-60">{{ auth.busy ? 'Creating demo account…' : 'Register Demo Account' }}</button>
    </form>
    <p class="mt-7 text-center text-sm">Already have a demo account? <NuxtLink to="/login" class="font-bold text-campus-green hover:underline">Log in</NuxtLink>.</p>
  </section>
</template>
```

---

## `app/plugins/auth-session.client.ts`

```typescript
import { useAuthStore } from '~/stores/auth'
export default defineNuxtPlugin((nuxtApp) => {
  // Browser starts without a visible identity, avoiding SSR profile mismatches.
  nuxtApp.hook('app:mounted', () => { void useAuthStore().ensureSession() })
})
```

---

## `app/services/account.ts`

```typescript
import type { AccountResponse, AddressDraft, CampusAddress, PublicAccount } from '~/types/account'

const PREFIX = '/api/v1'
const unwrap = <T>(response: AccountResponse<T>): T => {
  if (!response.success) throw new Error(response.message || 'Demo request failed.')
  return response.data
}

// These are temporary Nuxt server-memory handlers, not a production identity API.
export async function getDemoSession() {
  return unwrap(await $fetch<AccountResponse<PublicAccount | null>>(`${PREFIX}/auth/me`))
}
export async function loginDemoAccount(email: string, password: string) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/auth/login`, {
    method: 'POST', body: { email, password },
  }))
}
export async function registerDemoAccount(body: { first_name: string; last_name: string; email: string; password: string }) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/auth/register`, { method: 'POST', body }))
}
export async function enterDemoPersona(role: 'CUSTOMER' | 'ADMIN') {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/auth/demo`, { method: 'POST', body: { role } }))
}
export async function logoutDemoAccount() {
  return unwrap(await $fetch<AccountResponse<null>>(`${PREFIX}/auth/logout`, { method: 'POST' }))
}
export async function updateDemoProfile(body: { first_name: string; last_name: string; email: string }) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/me/profile`, { method: 'PATCH', body }))
}
export async function getDemoAddresses() {
  return unwrap(await $fetch<AccountResponse<CampusAddress[]>>(`${PREFIX}/me/addresses`))
}
export async function createDemoAddress(body: AddressDraft) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(`${PREFIX}/me/addresses`, { method: 'POST', body }))
}
export async function updateDemoAddress(addressId: number, body: AddressDraft) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(`${PREFIX}/me/addresses/${addressId}`, { method: 'PATCH', body }))
}
export async function deleteDemoAddress(addressId: number) {
  return unwrap(await $fetch<AccountResponse<null>>(`${PREFIX}/me/addresses/${addressId}`, { method: 'DELETE' }))
}
export async function makeDefaultDemoAddress(addressId: number) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(`${PREFIX}/me/addresses/${addressId}/default`, { method: 'PATCH' }))
}
export async function getDemoOrders(): Promise<[]> {
  return unwrap(await $fetch<AccountResponse<[]>>(`${PREFIX}/me/orders`))
}
```

---

## `app/stores/auth.ts`

```typescript
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { PublicAccount } from '~/types/account'
import {
  enterDemoPersona, getDemoSession, loginDemoAccount,
  logoutDemoAccount, registerDemoAccount, updateDemoProfile,
} from '~/services/account'

// The cookie is HttpOnly on the server; Pinia stores only the public profile.
// This does NOT implement production auth or authorization.
export const useAuthStore = defineStore('auth', () => {
  const user = ref<PublicAccount | null>(null)
  const initialized = ref(false)
  const busy = ref(false)
  const isCustomer = computed(() => user.value?.role === 'CUSTOMER')
  const isAdmin = computed(() => user.value?.role === 'ADMIN')
  let loadingSession: Promise<void> | null = null

  async function ensureSession(force = false) {
    if (!force && initialized.value) return
    if (loadingSession) return loadingSession
    loadingSession = (async () => {
      try { user.value = await getDemoSession() }
      catch { user.value = null }
      finally { initialized.value = true }
    })()
    try { await loadingSession } finally { loadingSession = null }
  }
  async function login(email: string, password: string) {
    busy.value = true
    try { user.value = await loginDemoAccount(email, password); initialized.value = true }
    finally { busy.value = false }
  }
  async function register(body: { first_name: string; last_name: string; email: string; password: string }) {
    busy.value = true
    try { user.value = await registerDemoAccount(body); initialized.value = true }
    finally { busy.value = false }
  }
  async function preview(role: 'CUSTOMER' | 'ADMIN') {
    busy.value = true
    try { user.value = await enterDemoPersona(role); initialized.value = true }
    finally { busy.value = false }
  }
  async function updateProfile(body: { first_name: string; last_name: string; email: string }) {
    busy.value = true
    try { user.value = await updateDemoProfile(body) }
    finally { busy.value = false }
  }
  async function logout() {
    busy.value = true
    try { await logoutDemoAccount(); user.value = null; initialized.value = true }
    finally { busy.value = false }
  }
  return { user, initialized, busy, isCustomer, isAdmin, ensureSession, login, register, preview, updateProfile, logout }
})
```

---

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

---

## `app/types/account.ts`

```typescript
// Field names originate from the approved CampusCart ERD.
// These role/status strings are PROVISIONAL mock values, not the finalized SQL enums.
export type DemoRole = 'CUSTOMER' | 'ADMIN'
export type DemoAccountStatus = 'ACTIVE'

export interface PublicAccount {
  user_id: number
  first_name: string
  last_name: string
  email: string
  role: DemoRole
  account_status: DemoAccountStatus
  created_at: string
  updated_at: string
  // password_hash is deliberately never included in client responses.
}

export interface CampusAddress {
  address_id: number
  user_id: number
  address_label: string
  recipient_name: string
  phone_number: string
  barangay: string
  city: string
  is_default: boolean
  created_at: string
}

export type AddressDraft = Pick<CampusAddress,
  'address_label' | 'recipient_name' | 'phone_number' | 'barangay' | 'city' | 'is_default'
>

export interface RegistrationDraft {
  first_name: string
  last_name: string
  email: string
  password: string
  confirm_password: string // form-only; not a database column
}

export interface AccountResponse<T> {
  success: boolean
  data: T
  message: string
}
```

---

## `app/utils/accountValidation.ts`

```typescript
import type { AddressDraft, RegistrationDraft } from '../types/account'

// Shared client-side form checks; all write endpoints validate independently too.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9 ()-]{7,30}$/
export type FieldErrors = Record<string, string>

export function validateNames(first: string, last: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!first.trim() || first.trim().length > 100) errors.first_name = 'First name must be 1–100 characters.'
  if (!last.trim() || last.trim().length > 100) errors.last_name = 'Last name must be 1–100 characters.'
  return errors
}
export function validateEmail(value: string): string {
  return value.length <= 255 && emailPattern.test(value.trim()) ? '' : 'Enter a valid email address (up to 255 characters).'
}
export function validateRegistration(draft: RegistrationDraft): FieldErrors {
  const errors = validateNames(draft.first_name, draft.last_name)
  const emailError = validateEmail(draft.email)
  if (emailError) errors.email = emailError
  if (draft.password.length < 12 || draft.password.length > 128) errors.password = 'Use a demo password between 12 and 128 characters.'
  if (draft.password !== draft.confirm_password) errors.confirm_password = 'Passwords do not match.'
  return errors
}
export function validateAddress(draft: AddressDraft): FieldErrors {
  const errors: FieldErrors = {}
  if (!draft.address_label.trim() || draft.address_label.trim().length > 50) errors.address_label = 'Use a label between 1 and 50 characters.'
  if (!draft.recipient_name.trim() || draft.recipient_name.trim().length > 200) errors.recipient_name = 'Recipient name must be 1–200 characters.'
  if (!phonePattern.test(draft.phone_number.trim())) errors.phone_number = 'Enter a valid demo phone number (7–30 characters).'
  if (!draft.barangay.trim() || draft.barangay.trim().length > 150) errors.barangay = 'Barangay must be 1–150 characters.'
  if (!draft.city.trim() || draft.city.trim().length > 150) errors.city = 'City must be 1–150 characters.'
  return errors
}
```

---

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
check('Cart uses reusable item and summary components', () => assert.ok(page.includes("import CartItem from '~/components/cart/CartItem.vue'") && page.includes("import CartSummary from '~/components/cart/CartSummary.vue'") && page.includes('<CartItem') && page.includes('<CartSummary')))
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

---

## `scripts/verify-stage6.mjs`

```javascript
// Structural and shared-validation checks for Stage 6. Not a Nuxt build or browser test.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { validateRegistration, validateAddress, validateEmail, validateNames } from '../app/utils/accountValidation.ts'
const read = (file) => fs.readFileSync(file, 'utf8')
const file = (path) => assert.ok(fs.existsSync(path), `Missing ${path}`)
let done = 0
function check(label, fn) { fn(); console.log(`PASS ${String(++done).padStart(2, '0')} ${label}`) }
const registration = {first_name:'Alex',last_name:'Student',email:'demo.student@example.test',password:'temporaryDemoPass123',confirm_password:'temporaryDemoPass123'}
const address = {address_label:'Dorm',recipient_name:'Alex Student',phone_number:'0912 000 0000',barangay:'Mock Barangay',city:'Demo City',is_default:true}
check('Valid fictional registration passes shared form checks',()=>assert.deepEqual(validateRegistration(registration),{}))
check('Invalid email fails validation',()=>assert.ok(validateEmail('no-at-sign')))
check('Blank first name is rejected',()=>assert.ok(validateNames('', 'Student').first_name))
check('Short demo password is rejected',()=>assert.ok(validateRegistration({...registration,password:'123'}).password))
check('Password mismatch is rejected',()=>assert.ok(validateRegistration({...registration,confirm_password:'bad'}).confirm_password))
check('Email length is limited',()=>assert.ok(validateEmail('a'.repeat(254)+'@example.test')))
check('Valid ERD-based address draft passes',()=>assert.deepEqual(validateAddress(address),{}))
check('Missing barangay fails',()=>assert.ok(validateAddress({...address,barangay:''}).barangay))
check('Missing city fails',()=>assert.ok(validateAddress({...address,city:''}).city))
check('Invalid demo phone fails',()=>assert.ok(validateAddress({...address,phone_number:'abc'}).phone_number))
check('Overlong address label fails',()=>assert.ok(validateAddress({...address,address_label:'x'.repeat(51)}).address_label))
for(const path of ['app/pages/login.vue','app/pages/register.vue','app/pages/profile/index.vue','app/pages/profile/addresses.vue','app/pages/orders/index.vue','app/pages/orders/[order_id].vue','app/stores/auth.ts','app/middleware/customer.ts','app/middleware/admin.ts','app/plugins/auth-session.client.ts','app/services/account.ts','app/types/account.ts','server/utils/mockAccounts.ts']){
  check(`Stage 6 source exists: ${path}`,()=>file(path))
}
const server = read('server/utils/mockAccounts.ts')
check('Mock sessions are opaque and HttpOnly',()=>assert.ok(server.includes('randomBytes(32)')&&server.includes('httpOnly: true')&&server.includes("sameSite: 'strict'")))
check('Passwords are hashed only on the server',()=>assert.ok(server.includes('scryptSync')&&server.includes('timingSafeEqual')&&!read('app/stores/auth.ts').includes('password_hash')))
check('Server strips hash from account response',()=>assert.ok(server.includes('function publicly')&&!server.split('function publicly')[1].split('function newUser')[0].includes('password_hash')))
check('Registration does not accept client role',()=>assert.ok(server.includes("'CUSTOMER', password")))
check('Development shortcut disabled outside development',()=>assert.ok(server.includes("process.env.NODE_ENV !== 'development'")))
check('Server enforces customer role for me routes',()=>assert.ok(server.includes('function requireCustomer')&&server.includes('account.role !== \'CUSTOMER\'')))
check('Addresses checked against user ID',()=>assert.ok(server.includes('address.user_id === userId')))
check('One default address per user handled',()=>assert.ok(server.includes('clearDefault(userId)')))
check('One account owns at most ten demo addresses',()=>assert.ok(server.includes('existing.length >= 10')))
check('Temporary sessions are stored in server memory',()=>assert.ok(server.includes('new Map<string, StoredSession>')))
check('Address fields match the approved ERD',()=>assert.ok(['address_label','recipient_name','phone_number','barangay','city','is_default'].every(x=>server.includes(x))))
check('Orders remain empty until checkout',()=>assert.ok(read('server/api/v1/me/orders/index.get.ts').includes('data: []')))
check('Customer and admin routes use middleware',()=>assert.ok(read('app/pages/profile/index.vue').includes("middleware: 'customer'")&&read('app/pages/admin/index.vue').includes("middleware: 'admin'")))
check('Nav dynamically reflects demo login',()=>assert.ok(read('app/components/layout/SiteHeader.vue').includes('useAuthStore')))
check('Stage 5 cart component fixes preserved',()=>assert.ok(read('app/pages/cart.vue').includes('<CartItem')&&read('app/pages/cart.vue').includes('<CartSummary')))
check('Duplicate DemoCartItem store re-export removed',()=>assert.ok(!read('app/stores/cart.ts').includes("export type { DemoCartItem }")))
check('Stage 5 verifier updated for explicit imports',()=>assert.ok(read('scripts/verify-stage5.mjs').includes("import CartItem from")))
check('Original Nuxt and Tailwind config retained',()=>assert.ok(read('nuxt.config.ts').includes("'@pinia/nuxt'")&&read('nuxt.config.ts').includes('tailwindcss()')))
for(const path of ['server/api/v1/auth/login.post.ts','server/api/v1/auth/register.post.ts','server/api/v1/auth/me.get.ts','server/api/v1/auth/logout.post.ts','server/api/v1/auth/demo.post.ts','server/api/v1/me/profile.patch.ts','server/api/v1/me/addresses/index.get.ts','server/api/v1/me/addresses/index.post.ts','server/api/v1/me/addresses/[address_id].patch.ts','server/api/v1/me/addresses/[address_id].delete.ts','server/api/v1/me/addresses/[address_id]/default.patch.ts','server/api/v1/me/orders/index.get.ts'])check(`Mock API handler exists: ${path}`,()=>file(path))
console.log(`\n${done} Stage 6 structural/validation checks passed. Run Nuxt typecheck, build, API and browser tests on your laptop.`)
```

---

## `server/api/v1/auth/demo.post.ts`

```typescript
import { beginSession, getDemoPersona } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (body?.role !== 'CUSTOMER' && body?.role !== 'ADMIN') throw createError({ statusCode: 422, statusMessage: 'Invalid demo persona' })
  return { success: true, data: beginSession(event, getDemoPersona(body.role)), message: 'Development-only demo preview session' }
})
```

---

## `server/api/v1/auth/login.post.ts`

```typescript
import { beginSession, loginUser } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => ({
  success: true,
  data: beginSession(event, loginUser(await readBody(event))),
  message: 'Demo login successful',
}))
```

---

## `server/api/v1/auth/logout.post.ts`

```typescript
import { endSession } from '../../../utils/mockAccounts'
export default defineEventHandler((event) => {
  endSession(event)
  return { success: true, data: null, message: 'Signed out of demo session' }
})
```

---

## `server/api/v1/auth/me.get.ts`

```typescript
import { currentUser, publicly } from '../../../utils/mockAccounts'
export default defineEventHandler((event) => ({
  success: true, data: currentUser(event) ? publicly(currentUser(event)!) : null,
  message: 'Demo session checked',
}))
```

---

## `server/api/v1/auth/register.post.ts`

```typescript
import { beginSession, registerUser } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => {
  const account = registerUser(await readBody(event))
  setResponseStatus(event, 201)
  return { success: true, data: beginSession(event, account), message: 'Temporary demo customer registered' }
})
```

---

## `server/api/v1/me/addresses/[address_id]/default.patch.ts`

```typescript
import { parsedAddressId, requireCustomer, setDefaultAddress } from '../../../../../utils/mockAccounts'
export default defineEventHandler((event) => ({
  success: true,
  data: setDefaultAddress(requireCustomer(event).user_id, parsedAddressId(getRouterParam(event, 'address_id'))),
  message: 'Default demo address updated',
}))
```

---

## `server/api/v1/me/addresses/[address_id].delete.ts`

```typescript
import { parsedAddressId, removeAddress, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler((event) => {
  removeAddress(requireCustomer(event).user_id, parsedAddressId(getRouterParam(event, 'address_id')))
  return { success: true, data: null, message: 'Demo address deleted' }
})
```

---

## `server/api/v1/me/addresses/[address_id].patch.ts`

```typescript
import { editAddress, parsedAddressId, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler(async (event) => ({
  success: true, data: editAddress(requireCustomer(event).user_id, parsedAddressId(getRouterParam(event, 'address_id')), await readBody(event)),
  message: 'Demo address updated',
}))
```

---

## `server/api/v1/me/addresses/index.get.ts`

```typescript
import { listAddresses, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler((event) => ({
  success: true, data: listAddresses(requireCustomer(event).user_id), message: 'Demo addresses retrieved',
}))
```

---

## `server/api/v1/me/addresses/index.post.ts`

```typescript
import { addAddress, requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler(async (event) => {
  const row = addAddress(requireCustomer(event).user_id, await readBody(event))
  setResponseStatus(event, 201)
  return { success: true, data: row, message: 'Demo address saved' }
})
```

---

## `server/api/v1/me/orders/index.get.ts`

```typescript
import { requireCustomer } from '../../../../utils/mockAccounts'
export default defineEventHandler((event) => {
  requireCustomer(event)
  // There is no checkout/order placement yet. Never invent order history.
  return { success: true, data: [], message: 'No demo orders placed' }
})
```

---

## `server/api/v1/me/profile.patch.ts`

```typescript
import { requireCustomer, updateUser } from '../../../utils/mockAccounts'
export default defineEventHandler(async (event) => ({
  success: true,
  data: updateUser(requireCustomer(event), await readBody(event)),
  message: 'Demo profile updated',
}))
```

---

## `server/utils/mockAccounts.ts`

```typescript
// STAGE 6 DEMO ONLY: In-memory records disappear on Nuxt server restart.
// No PostgreSQL, production identity provider, or durable account storage exists.
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { createError, deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import type { AddressDraft, CampusAddress, DemoRole, PublicAccount } from '../../app/types/account'

interface StoredAccount extends PublicAccount { password_hash: string }
interface StoredSession { user_id: number; expires: number }
const users = new Map<number, StoredAccount>()
const sessions = new Map<string, StoredSession>()
const addresses = new Map<number, CampusAddress>()
let nextUserId = 1001
let nextAddressId = 3001
const cookieName = 'campuscart_demo_sid'
const sessionLifetime = 1000 * 60 * 60 * 8

function fail(code: number, message: string): never { throw createError({ statusCode: code, statusMessage: message }) }
function stringField(value: unknown, limit: number): string {
  return typeof value === 'string' && value.trim().length > 0 && value.trim().length <= limit ? value.trim() : ''
}
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[0-9 ()-]{7,30}$/
export function normalizeProfile(body: unknown) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return fail(422, 'Invalid profile details')
  const row = body as Record<string, unknown>
  const first_name = stringField(row.first_name, 100)
  const last_name = stringField(row.last_name, 100)
  const email = stringField(row.email, 255).toLowerCase()
  if (!first_name || !last_name || !emailPattern.test(email)) fail(422, 'Check first name, last name, and email')
  return { first_name, last_name, email }
}
function ensureAvailableEmail(email: string, except?: number) {
  if ([...users.values()].some(user => user.email === email && user.user_id !== except)) fail(409, 'This demo email is already registered')
}
function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
function passwordMatches(password: string, stored: string): boolean {
  const [salt, digest] = stored.split(':')
  if (!salt || !digest) return false
  const actual = scryptSync(password, salt, 64)
  const expected = Buffer.from(digest, 'hex')
  return expected.length === actual.length && timingSafeEqual(actual, expected)
}
export function publicly(account: StoredAccount): PublicAccount {
  const { user_id, first_name, last_name, email, role, account_status, created_at, updated_at } = account
  return { user_id, first_name, last_name, email, role, account_status, created_at, updated_at }
}
function newUser(first_name: string, last_name: string, email: string, role: DemoRole, password: string) {
  const created_at = new Date().toISOString()
  const account: StoredAccount = {
    user_id: nextUserId++, first_name, last_name, email, role,
    account_status: 'ACTIVE', created_at, updated_at: created_at, password_hash: hashPassword(password),
  }
  users.set(account.user_id, account)
  return account
}
export function registerUser(body: unknown): StoredAccount {
  const fields = normalizeProfile(body)
  const password = (body as Record<string, unknown>).password
  if (typeof password !== 'string' || password.length < 12 || password.length > 128) fail(422, 'Demo password must be 12–128 characters')
  ensureAvailableEmail(fields.email)
  // The client NEVER gets to set its role; registrations are customer accounts.
  return newUser(fields.first_name, fields.last_name, fields.email, 'CUSTOMER', password)
}
export function loginUser(body: unknown): StoredAccount {
  if (!body || typeof body !== 'object') fail(400, 'Invalid login details')
  const value = body as Record<string, unknown>
  const email = typeof value.email === 'string' ? value.email.trim().toLowerCase() : ''
  const password = typeof value.password === 'string' ? value.password : ''
  const account = [...users.values()].find(user => user.email === email)
  if (!account || !passwordMatches(password, account.password_hash)) fail(401, 'Incorrect email or password for this demo session')
  return account
}
export function beginSession(event: H3Event, account: StoredAccount) {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { user_id: account.user_id, expires: Date.now() + sessionLifetime })
  setCookie(event, cookieName, token, {
    httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production',
    path: '/', maxAge: Math.floor(sessionLifetime / 1000),
  })
  return publicly(account)
}
export function currentUser(event: H3Event): StoredAccount | null {
  const token = getCookie(event, cookieName)
  if (!token) return null
  const session = sessions.get(token)
  if (!session || session.expires < Date.now()) {
    sessions.delete(token)
    return null
  }
  return users.get(session.user_id) ?? null
}
export function requireUser(event: H3Event): StoredAccount {
  return currentUser(event) ?? fail(401, 'A demo session is required')
}
export function requireCustomer(event: H3Event): StoredAccount {
  const account = requireUser(event)
  if (account.role !== 'CUSTOMER') fail(403, 'Customer access required')
  return account
}
export function endSession(event: H3Event) {
  const token = getCookie(event, cookieName)
  if (token) sessions.delete(token)
  deleteCookie(event, cookieName, { path: '/' })
}
export function getDemoPersona(role: DemoRole): StoredAccount {
  // This account-switching shortcut is available ONLY in the Nuxt dev server.
  if (process.env.NODE_ENV !== 'development') fail(404, 'Demo shortcut unavailable')
  const email = role === 'ADMIN' ? 'admin.preview@example.test' : 'student.preview@example.test'
  const existing = [...users.values()].find(user => user.email === email)
  if (existing) return existing
  return role === 'ADMIN'
    ? newUser('CampusCart', 'Administrator', email, 'ADMIN', randomBytes(32).toString('hex'))
    : newUser('Demo', 'Student', email, 'CUSTOMER', randomBytes(32).toString('hex'))
}
export function updateUser(user: StoredAccount, body: unknown): PublicAccount {
  const fields = normalizeProfile(body)
  ensureAvailableEmail(fields.email, user.user_id)
  Object.assign(user, fields, { updated_at: new Date().toISOString() })
  return publicly(user)
}
function normalizeAddress(body: unknown): AddressDraft {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(422, 'Invalid address')
  const row = body as Record<string, unknown>
  const address_label = stringField(row.address_label, 50)
  const recipient_name = stringField(row.recipient_name, 200)
  const phone_number = stringField(row.phone_number, 30)
  const barangay = stringField(row.barangay, 150)
  const city = stringField(row.city, 150)
  if (!address_label || !recipient_name || !phonePattern.test(phone_number) || !barangay || !city) fail(422, 'Check all address fields')
  return { address_label, recipient_name, phone_number, barangay, city, is_default: row.is_default === true }
}
export function listAddresses(userId: number) {
  return [...addresses.values()].filter(row => row.user_id === userId).sort((a, b) => a.address_id - b.address_id)
}
function clearDefault(userId: number) {
  for (const record of addresses.values()) if (record.user_id === userId) record.is_default = false
}
export function addAddress(userId: number, body: unknown): CampusAddress {
  const draft = normalizeAddress(body)
  const existing = listAddresses(userId)
  if (existing.length >= 10) fail(422, 'Maximum of 10 demo addresses')
  const isDefault = draft.is_default || existing.length === 0
  if (isDefault) clearDefault(userId)
  const row: CampusAddress = { ...draft, is_default: isDefault,
    address_id: nextAddressId++, user_id: userId, created_at: new Date().toISOString(),
  }
  addresses.set(row.address_id, row)
  return row
}
export function requireAddress(userId: number, addressId: number): CampusAddress {
  const address = addresses.get(addressId)
  return address && address.user_id === userId ? address : fail(404, 'Demo address not found')
}
export function editAddress(userId: number, addressId: number, body: unknown): CampusAddress {
  const record = requireAddress(userId, addressId)
  const draft = normalizeAddress(body)
  if (draft.is_default) clearDefault(userId)
  Object.assign(record, draft)
  if (!listAddresses(userId).some(row => row.is_default)) record.is_default = true
  return record
}
export function setDefaultAddress(userId: number, addressId: number): CampusAddress {
  const record = requireAddress(userId, addressId)
  clearDefault(userId)
  record.is_default = true
  return record
}
export function removeAddress(userId: number, addressId: number) {
  const record = requireAddress(userId, addressId)
  addresses.delete(record.address_id)
  if (record.is_default) {
    const first = listAddresses(userId)[0]
    if (first) first.is_default = true
  }
}
export function parsedAddressId(value: string | undefined) {
  const id = Number(value)
  if (!value || !/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) fail(400, 'Invalid address ID')
  return id
}
```

