<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchCategories, fetchProductById } from '~/services/catalog'
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/money'
import { productImage, productImagesFor } from '~/utils/productMedia'

const route = useRoute()
const cart = useCartStore()
const quantity = ref(1)
const feedback = ref('')
const selectedImageIndex = ref(0)
const productId = computed(() => Number(route.params.product_id))
const { data: product, pending, error, refresh } = await useAsyncData(
  () => `campuscart-product-${route.params.product_id}`,
  () => fetchProductById(productId.value),
)
const { data: categories } = await useAsyncData(
  'campuscart-catalog-categories', fetchCategories, { default: () => [] },
)
const category = computed(() => categories.value?.find(c => c.category_id === product.value?.category_id))
const gallery = computed(() => product.value ? productImagesFor(product.value) : [])
const activeImage = computed(() => gallery.value[selectedImageIndex.value] ?? gallery.value[0])
const inCart = computed(() => cart.items.find(item => item.product_id === productId.value)?.quantity ?? 0)
const available = computed(() => product.value?.status === 'ACTIVE' && (product.value?.stock_quantity ?? 0) > 0)
const remaining = computed(() => Math.max(0, (product.value?.stock_quantity ?? 0) - inCart.value))
const maxQuantity = computed(() => Math.max(1, remaining.value))
watch(productId, () => { quantity.value = 1; feedback.value = ''; selectedImageIndex.value = 0 })
watch(gallery, () => { selectedImageIndex.value = 0 })
watch(remaining, () => { if (quantity.value > maxQuantity.value) quantity.value = maxQuantity.value })
useHead(() => ({ title: product.value ? `${product.value.product_name} | CampusCart` : 'Product Details | CampusCart' }))

function changeQuantity(next: number) {
  if (Number.isSafeInteger(next)) quantity.value = Math.min(maxQuantity.value, Math.max(1, next))
}
function addToCart() {
  if (!product.value) return
  if (!Number.isSafeInteger(quantity.value) || quantity.value < 1 || quantity.value > remaining.value) {
    feedback.value = 'Please select an available quantity.'
    return
  }
  const added = cart.addProduct(product.value, quantity.value)
  feedback.value = added ? `${quantity.value} ${quantity.value === 1 ? 'item' : 'items'} added to your demo cart.` : 'Unable to add the requested quantity.'
  if (added) quantity.value = 1
}
</script>

<template>
  <section class="cc-container py-10 sm:py-14">
    <nav class="mb-8 text-sm text-gray-600" aria-label="Breadcrumb">
      <NuxtLink to="/" class="font-semibold text-campus-emerald hover:underline">Home</NuxtLink>
      <span class="mx-2" aria-hidden="true">/</span>
      <NuxtLink to="/products" class="font-semibold text-campus-emerald hover:underline">Products</NuxtLink>
      <span class="mx-2" aria-hidden="true">/</span>
      <span aria-current="page">{{ product?.product_name || 'Product details' }}</span>
    </nav>

    <div v-if="pending" class="grid animate-pulse gap-8 lg:grid-cols-2" role="status" aria-label="Loading product details">
      <div class="aspect-square rounded-3xl bg-campus-sage"></div>
      <div class="space-y-5 py-5"><div class="h-5 w-24 rounded bg-gray-200"></div><div class="h-10 w-3/4 rounded bg-gray-200"></div><div class="h-6 w-32 rounded bg-gray-200"></div><div class="h-24 w-full rounded bg-gray-100"></div></div>
      <span class="sr-only">Loading product details</span>
    </div>
    <div v-else-if="error || !product" class="rounded-3xl border border-gray-200 bg-campus-sage p-10 text-center" role="alert">
      <h1 class="text-2xl font-extrabold text-campus-emerald">{{ (error && ('statusCode' in error) && error.statusCode === 404) || !Number.isInteger(productId) ? 'Product not found' : 'Product unavailable' }}</h1>
      <p class="mx-auto mt-3 max-w-lg text-gray-700">This item might no longer be available, or the demo API could not load it.</p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <NuxtLink to="/products" class="inline-flex min-h-11 items-center rounded-xl bg-campus-emerald px-5 text-sm font-bold text-white hover:bg-campus-green">Back to Products</NuxtLink>
        <button type="button" class="min-h-11 rounded-xl border border-campus-emerald px-5 text-sm font-semibold text-campus-emerald" @click="refresh()">Retry</button>
      </div>
    </div>
    <template v-else>
      <div class="grid items-start gap-9 lg:grid-cols-2 lg:gap-12">
        <div class="min-w-0">
          <div class="overflow-hidden rounded-3xl border border-gray-100 bg-campus-sage shadow-sm">
            <CommonMediaImage :src="activeImage?.url" :fallback="productImage(product.product_id)" :alt="activeImage?.alt || `Image of ${product.product_name}`" :width="640" :height="640" :loading="'eager'" class="aspect-square w-full object-contain" />
          </div>
          <div v-if="gallery.length > 1" class="mt-4 flex flex-wrap gap-3" aria-label="Product images">
            <button
              v-for="(image, index) in gallery"
              :key="`${index}-${image.url}`"
              type="button"
              :aria-label="`Show image ${index + 1} of ${gallery.length} for ${product.product_name}`"
              :aria-pressed="selectedImageIndex === index"
              class="overflow-hidden rounded-xl border-2 bg-campus-sage focus-visible:outline-2 focus-visible:outline-campus-emerald"
              :class="selectedImageIndex === index ? 'border-campus-green' : 'border-transparent'"
              @click="selectedImageIndex = index"
            >
              <CommonMediaImage :src="image.url" alt="" :width="88" :height="88" class="h-20 w-20 object-cover" />
            </button>
          </div>
        </div>
        <div class="py-1 lg:py-5">
          <NuxtLink v-if="category" :to="{ path: '/products', query: { category_id: String(category.category_id), category_name: category.category_name } }" class="text-sm font-bold uppercase tracking-widest text-campus-green hover:underline">{{ category.category_name }}</NuxtLink>
          <h1 class="mt-3 text-3xl font-black tracking-tight text-campus-emerald sm:text-4xl">{{ product.product_name }}</h1>
          <p class="mt-2 text-sm text-gray-500">SKU: {{ product.sku }}</p>
          <p class="mt-7 text-3xl font-black text-campus-emerald">{{ formatPrice(product.price) }}</p>
          <div class="mt-4 flex items-center gap-2 text-sm font-semibold" :class="available ? 'text-campus-green' : 'text-red-700'">
            <span aria-hidden="true">{{ available ? '●' : '○' }}</span>
            {{ available ? `${product.stock_quantity} available` : 'Out of stock' }}
          </div>
          <div class="mt-8 border-y border-gray-200 py-7">
            <label for="product-quantity" class="mb-3 block text-sm font-bold text-gray-800">Quantity</label>
            <div class="flex items-center gap-2">
              <button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 text-xl disabled:opacity-40" :disabled="!available || quantity <= 1" aria-label="Decrease quantity" @click="changeQuantity(quantity - 1)">−</button>
              <input id="product-quantity" v-model.number="quantity" class="h-11 w-16 rounded-xl border border-gray-300 text-center font-semibold" type="number" min="1" :max="maxQuantity" step="1" inputmode="numeric" :disabled="!available || remaining === 0" @change="changeQuantity(Number(quantity))">
              <button type="button" class="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-300 text-xl disabled:opacity-40" :disabled="!available || quantity >= remaining" aria-label="Increase quantity" @click="changeQuantity(quantity + 1)">+</button>
            </div>
            <p v-if="inCart" class="mt-2 text-xs text-gray-600">{{ inCart }} already in your demo cart.</p>
            <button type="button" class="mt-6 min-h-12 w-full rounded-xl bg-campus-emerald px-6 font-bold text-white transition hover:bg-campus-green disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-700" :disabled="!available || remaining === 0" @click="addToCart">{{ remaining === 0 ? (available ? 'Available quantity in cart' : 'Out of Stock') : 'Add to Cart' }}</button>
            <p class="mt-2 min-h-5 text-sm font-medium text-campus-emerald" role="status" aria-live="polite">{{ feedback }}</p>
            <NuxtLink to="/cart" class="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-campus-emerald underline-offset-4 hover:underline">View Demo Cart →</NuxtLink>
          </div>
          <h2 class="mt-8 text-xl font-extrabold text-campus-emerald">Product Description</h2>
          <p class="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700">{{ product.description }}</p>
          <p class="mt-6 text-xs text-gray-500">Product data and imagery are for the ITE 18 Midterm demonstration; no purchase or payment is processed here.</p>
        </div>
      </div>
    </template>
  </section>
</template>
