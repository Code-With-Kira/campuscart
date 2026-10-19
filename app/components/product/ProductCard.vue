<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Product } from '~/types/catalog'
import { productImage } from '~/utils/productMedia'
import { formatPrice } from '~/utils/money'
import { useCartStore } from '~/stores/cart'
const props = defineProps<{ product: Product }>()
const cart = useCartStore()
const feedback = ref('')
const inCart = computed(() => cart.items.find(item => item.product_id === props.product.product_id)?.quantity ?? 0)
const available = computed(() => props.product.status === 'ACTIVE' && props.product.stock_quantity > 0)
const atLimit = computed(() => !available.value || inCart.value >= props.product.stock_quantity)
function addToCart() {
  const success = cart.addProduct(props.product)
  feedback.value = success ? 'Added to demo cart' : 'Maximum available quantity reached'
}
</script>
<template>
  <article class="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
    <div class="relative overflow-hidden bg-campus-sage">
      <NuxtLink :to="`/products/${product.product_id}`" :aria-label="`View details for ${product.product_name}`" class="block focus-visible:outline-2 focus-visible:outline-campus-emerald">
        <CommonMediaImage :src="productImage(product)" :fallback="productImage(product.product_id)" :alt="`Image of ${product.product_name}`" :width="340" :height="340" loading="lazy" class="aspect-[5/4] w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </NuxtLink>
      <span v-if="!available" class="absolute left-3 top-3 rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">Out of stock</span>
      <span v-else-if="product.stock_quantity <= 5" class="absolute left-3 top-3 rounded-full bg-campus-gold px-3 py-1 text-xs font-bold text-campus-emerald">Low stock</span>
    </div>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-campus-green">{{ product.sku }}</p>
      <h3 class="mt-1 min-h-12 text-sm font-bold leading-6 text-campus-emerald sm:text-base"><NuxtLink :to="`/products/${product.product_id}`" class="hover:underline focus-visible:underline">{{ product.product_name }}</NuxtLink></h3>
      <p class="mt-1 line-clamp-2 text-xs leading-5 text-gray-500">{{ product.description }}</p>
      <div class="mt-auto pt-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-lg font-extrabold text-campus-emerald">{{ formatPrice(product.price) }}</span>
          <span :class="available ? 'text-campus-green' : 'text-red-700'" class="text-xs font-semibold">{{ available ? `${product.stock_quantity} available` : 'Unavailable' }}</span>
        </div>
        <button
          type="button"
          :disabled="atLimit"
          class="mt-4 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-campus-emerald px-3 py-2.5 text-sm font-bold text-white transition hover:bg-campus-green active:scale-[.99] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-600"
          :aria-label="`Add ${product.product_name} to demo cart`"
          @click="addToCart"
        >
          <span aria-hidden="true">＋</span> {{ atLimit ? (available ? 'Limit in Cart' : 'Out of Stock') : 'Add to Cart' }}
        </button>
        <p class="min-h-5 pt-1 text-center text-xs text-campus-green" aria-live="polite">{{ feedback }}</p>
      </div>
    </div>
  </article>
</template>
