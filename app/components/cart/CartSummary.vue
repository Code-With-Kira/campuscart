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
      Review the unavailable or over-limit items before demo checkout.
    </div>
    <div v-else-if="!stockVerified" class="mt-5 rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-900">
      Stock and prices have not been refreshed from the demo API.
    </div>
    <p class="mt-5 rounded-lg bg-white p-4 text-xs leading-6 text-gray-700">
      This demo cart shows the items subtotal. Approved campus pickup has ₱0.00 shipping; the demo checkout recalculates current prices and stock on the server. No real payment is processed.
    </p>
    <NuxtLink v-if="stockVerified && !hasStockIssues && totalQuantity > 0" to="/checkout" class="mt-5 flex min-h-12 items-center justify-center rounded-xl border-2 border-campus-emerald bg-white px-5 text-sm font-bold text-campus-emerald hover:bg-campus-sage">
      Proceed to Checkout (Demo) →
    </NuxtLink>
    <NuxtLink to="/products" class="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-campus-emerald px-5 text-sm font-bold text-white hover:bg-campus-green focus-visible:outline-campus-gold">
      Continue Shopping →
    </NuxtLink>
    <p class="mt-3 text-center text-xs leading-5 text-gray-600">Place a demo-only order for campus pickup; Cash on Pickup remains simulated.</p>
  </aside>
</template>
