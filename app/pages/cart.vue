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
              :product="currentProducts?.find(p => p.product_id === item.product_id)"
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
