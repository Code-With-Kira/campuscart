<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DemoCartItem } from '~/utils/cartValidation'
import { productImage } from '~/utils/productMedia'
import type { Product } from '~/types/catalog'
import { formatCentavos, formatPrice, pesosToCentavos } from '~/utils/money'

const props = defineProps<{ item: DemoCartItem; updating: boolean; product?: Product }>()
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
        <CommonMediaImage :src="productImage(product ?? item.product_id)" :fallback="productImage(item.product_id)" :alt="`Illustration of ${item.product_name}`" :width="120" :height="120" class="h-28 w-28 object-contain sm:h-32 sm:w-32" />
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
