# CampusCart — Stage 4 Full Source Reference

Complete contents of every **new or modified source code file**. Unchanged Stage 3 source files remain in the Stage 4 ZIP.

This source reference accompanies the full runnable project ZIP; it is not a standalone project.

## `app/components/catalog/CatalogFilters.vue`

```vue
<script setup lang="ts">
import type { Category, CatalogFilterDraft } from '~/types/catalog'

const props = defineProps<{ filters: CatalogFilterDraft; categories: Category[]; error?: string }>()
const emit = defineEmits<{
  'update:filters': [value: CatalogFilterDraft]
  apply: []
  clear: []
}>()
function update<K extends keyof CatalogFilterDraft>(key: K, value: CatalogFilterDraft[K]) {
  emit('update:filters', { ...props.filters, [key]: value })
}
</script>

<template>
  <form class="space-y-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm" aria-label="Product filters" @submit.prevent="emit('apply')">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-extrabold text-campus-emerald">Filters</h2>
      <button type="button" class="text-sm font-semibold text-campus-emerald underline underline-offset-4 hover:text-campus-green" @click="emit('clear')">Clear all</button>
    </div>
    <div>
      <label for="catalog-category" class="mb-2 block text-sm font-bold text-gray-800">Category</label>
      <select id="catalog-category" :value="filters.category_id" class="min-h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm text-gray-900" @change="update('category_id', ($event.target as HTMLSelectElement).value)">
        <option value="">All Categories</option>
        <option v-for="category in categories" :key="category.category_id" :value="String(category.category_id)">{{ category.category_name }}</option>
      </select>
    </div>
    <fieldset class="space-y-3">
      <legend class="text-sm font-bold text-gray-800">Price (PHP)</legend>
      <div class="grid grid-cols-2 gap-2">
        <div>
          <label for="catalog-min-price" class="mb-1 block text-xs text-gray-600">Minimum</label>
          <input id="catalog-min-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="₱0" :value="filters.min_price" class="min-h-11 w-full min-w-0 rounded-xl border border-gray-300 px-3 text-sm" @input="update('min_price', ($event.target as HTMLInputElement).value)">
        </div>
        <div>
          <label for="catalog-max-price" class="mb-1 block text-xs text-gray-600">Maximum</label>
          <input id="catalog-max-price" type="number" min="0" step="0.01" inputmode="decimal" placeholder="Any" :value="filters.max_price" class="min-h-11 w-full min-w-0 rounded-xl border border-gray-300 px-3 text-sm" @input="update('max_price', ($event.target as HTMLInputElement).value)">
        </div>
      </div>
    </fieldset>
    <label class="flex cursor-pointer items-center gap-3 text-sm font-medium text-gray-800">
      <input type="checkbox" :checked="filters.in_stock" class="h-4 w-4 accent-campus-emerald" @change="update('in_stock', ($event.target as HTMLInputElement).checked)">
      In-stock products only
    </label>
    <p v-if="error" class="rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{{ error }}</p>
    <button type="submit" class="min-h-11 w-full rounded-xl bg-campus-emerald px-4 py-3 text-sm font-bold text-white transition hover:bg-campus-green active:scale-[.99]">Apply Filters</button>
  </form>
</template>
```

## `app/components/product/ProductCard.vue`

```vue
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
        <img :src="productImage(product.product_id)" :alt="`Illustration of ${product.product_name}`" width="340" height="340" loading="lazy" class="aspect-[5/4] w-full object-cover transition-transform duration-300 group-hover:scale-105">
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
```

## `app/pages/cart.vue`

```vue
<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { productImage } from '~/utils/productMedia'
import { formatCentavos, formatPrice } from '~/utils/money'
useHead({ title: 'Demo Cart | CampusCart' })
const cart = useCartStore()
</script>
<template>
  <section class="cc-container py-12 sm:py-16">
    <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="mb-2 text-xs font-bold uppercase tracking-widest text-campus-green">CampusCart demo</p>
        <h1 class="text-3xl font-extrabold text-campus-emerald sm:text-4xl">Your Cart</h1>
        <p class="mt-2 text-sm text-gray-600">This is an in-memory Midterm demo; items aren't saved to an account.</p>
      </div>
      <NuxtLink to="/products" class="rounded-xl border border-campus-emerald px-5 py-3 text-sm font-bold text-campus-emerald hover:bg-campus-sage">Browse Products</NuxtLink>
    </div>
    <div v-if="!cart.items.length" class="rounded-3xl border border-dashed border-gray-300 bg-campus-sage p-12 text-center">
      <h2 class="text-xl font-bold text-campus-emerald">Your demo cart is empty.</h2>
      <p class="mt-2 text-gray-600">Add a product from the homepage or catalog to see it here.</p>
      <NuxtLink to="/" class="mt-6 inline-flex rounded-xl bg-campus-emerald px-5 py-3 font-bold text-white hover:bg-campus-green">Explore homepage</NuxtLink>
    </div>
    <div v-else class="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div class="space-y-4">
        <div v-for="item in cart.items" :key="item.product_id" class="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-100 p-4 shadow-sm">
          <img :src="productImage(item.product_id)" :alt="`Illustration of ${item.product_name}`" width="100" height="100" class="h-24 w-24 rounded-xl bg-campus-sage object-cover">
          <div class="min-w-40 flex-1">
            <h2 class="font-bold text-campus-emerald">{{ item.product_name }}</h2>
            <p class="mt-1 text-sm text-gray-600">{{ formatPrice(item.price) }} each</p>
            <button type="button" class="mt-2 text-sm font-semibold text-red-700 underline-offset-2 hover:underline" :aria-label="`Remove ${item.product_name}`" @click="cart.removeProduct(item.product_id)">Remove</button>
          </div>
          <div class="flex items-center gap-3" :aria-label="`Quantity for ${item.product_name}`">
            <button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg hover:bg-campus-sage" :aria-label="`Decrease ${item.product_name} quantity`" @click="cart.setQuantity(item.product_id, item.quantity - 1)">−</button>
            <span class="min-w-6 text-center font-bold" aria-live="polite">{{ item.quantity }}</span>
            <button type="button" class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-lg hover:bg-campus-sage disabled:cursor-not-allowed disabled:opacity-40" :disabled="item.quantity >= item.stock_quantity" :aria-label="`Increase ${item.product_name} quantity`" @click="cart.setQuantity(item.product_id, item.quantity + 1)">+</button>
          </div>
        </div>
      </div>
      <aside class="h-fit rounded-2xl bg-campus-sage p-6" aria-label="Demo order summary">
        <h2 class="text-xl font-bold text-campus-emerald">Cart Summary</h2>
        <div class="mt-6 flex justify-between text-sm"><span>Total items</span><strong>{{ cart.totalQuantity }}</strong></div>
        <div class="mt-3 flex justify-between border-t border-gray-200 pt-4"><span class="font-semibold">Items subtotal</span><strong>{{ formatCentavos(cart.subtotalCentavos) }}</strong></div>
        <p class="mt-5 rounded-lg bg-white p-3 text-xs leading-5 text-gray-600">Shipping and payment are not calculated here. Checkout is reserved for a later stage.</p>
        <p class="mt-4 text-xs text-gray-500">Refresh will clear the demo cart. No actual orders or charges are created.</p>
      </aside>
    </div>
  </section>
</template>
```

## `app/pages/products/[product_id].vue`

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { fetchCategories, fetchProductById } from '~/services/catalog'
import { useCartStore } from '~/stores/cart'
import { formatPrice } from '~/utils/money'
import { productImage } from '~/utils/productMedia'

const route = useRoute()
const cart = useCartStore()
const quantity = ref(1)
const feedback = ref('')
const productId = computed(() => Number(route.params.product_id))
const { data: product, pending, error, refresh } = await useAsyncData(
  () => `campuscart-product-${route.params.product_id}`,
  () => fetchProductById(productId.value),
)
const { data: categories } = await useAsyncData(
  'campuscart-catalog-categories', fetchCategories, { default: () => [] },
)
const category = computed(() => categories.value?.find(c => c.category_id === product.value?.category_id))
const inCart = computed(() => cart.items.find(item => item.product_id === productId.value)?.quantity ?? 0)
const available = computed(() => product.value?.status === 'ACTIVE' && (product.value?.stock_quantity ?? 0) > 0)
const remaining = computed(() => Math.max(0, (product.value?.stock_quantity ?? 0) - inCart.value))
const maxQuantity = computed(() => Math.max(1, remaining.value))
watch(productId, () => { quantity.value = 1; feedback.value = '' })
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
        <div class="overflow-hidden rounded-3xl border border-gray-100 bg-campus-sage shadow-sm">
          <img :src="productImage(product.product_id)" :alt="`Illustration of ${product.product_name}`" width="640" height="640" class="aspect-square w-full object-contain">
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
```

## `app/pages/products/index.vue`

```vue
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { CatalogFilterDraft, CatalogQuery, CatalogSort } from '~/types/catalog'
import { fetchCatalogPage, fetchCategories } from '~/services/catalog'
import CatalogFilters from '~/components/catalog/CatalogFilters.vue'
import ProductCard from '~/components/product/ProductCard.vue'
import { pesosToCentavos } from '~/utils/money'

useHead({ title: 'Shop Products | CampusCart' })
const route = useRoute()
const showMobileFilters = ref(false)
const formError = ref('')
const sortOptions: { value: CatalogSort; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name_asc', label: 'Name: A–Z' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]
const draft = reactive<CatalogFilterDraft>({
  q: '', category_id: '', min_price: '', max_price: '', in_stock: false, sort: 'newest',
})
const { data: categoryData, pending: categoriesPending, error: categoriesError, refresh: refreshCategories } = await useAsyncData(
  'campuscart-catalog-categories', fetchCategories, { default: () => [] },
)
const categories = computed(() => categoryData.value ?? [])
function queryText(key: string): string {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}
const selectedCategoryId = computed(() => {
  const id = queryText('category_id')
  if (id && /^\d+$/.test(id) && Number(id) > 0) return Number(id)
  const name = queryText('category_name').trim().toLocaleLowerCase()
  return categories.value.find(category => category.category_name.toLocaleLowerCase() === name)?.category_id
})
const requestedPage = computed(() => {
  const raw = queryText('page')
  return /^\d+$/.test(raw) && Number(raw) > 0 ? Number(raw) : 1
})
const appliedQuery = computed<CatalogQuery>(() => ({
  q: queryText('q').trim() || undefined,
  category_id: selectedCategoryId.value,
  min_price: queryText('min_price') || undefined,
  max_price: queryText('max_price') || undefined,
  in_stock: queryText('in_stock') === 'true' ? true : undefined,
  sort: sortOptions.some(option => option.value === queryText('sort'))
    ? queryText('sort') as CatalogSort : 'newest',
  page: requestedPage.value,
  page_size: 8,
}))
const { data: catalogResponse, pending, error, refresh } = await useAsyncData(
  'campuscart-catalog-page', () => fetchCatalogPage(appliedQuery.value),
  { watch: [appliedQuery] },
)
const products = computed(() => catalogResponse.value?.data ?? [])
const meta = computed(() => catalogResponse.value?.meta)
const totalPages = computed(() => meta.value?.total_pages ?? 1)
const activeCategoryName = computed(() => categories.value.find(item => item.category_id === selectedCategoryId.value)?.category_name ?? '')
const hasActiveFilters = computed(() => Boolean(queryText('q') || selectedCategoryId.value || queryText('min_price') || queryText('max_price') || queryText('in_stock')))

watch([() => route.fullPath, categories], () => {
  Object.assign(draft, {
    q: queryText('q'),
    category_id: selectedCategoryId.value ? String(selectedCategoryId.value) : '',
    min_price: queryText('min_price'),
    max_price: queryText('max_price'),
    in_stock: queryText('in_stock') === 'true',
    sort: appliedQuery.value.sort ?? 'newest',
  })
  formError.value = ''
}, { immediate: true })

function updateDraft(value: CatalogFilterDraft) { Object.assign(draft, value) }
function validateDraft(): boolean {
  const validMoney = (value: string) => !value || /^\d{1,10}(?:\.\d{1,2})?$/.test(value)
  if (draft.q.length > 100) { formError.value = 'Search must be 100 characters or fewer.'; return false }
  if (!validMoney(draft.min_price) || !validMoney(draft.max_price)) {
    formError.value = 'Enter a valid nonnegative price with no more than two decimal places.'; return false
  }
  if (draft.min_price && draft.max_price && pesosToCentavos(draft.min_price) > pesosToCentavos(draft.max_price)) {
    formError.value = 'Minimum price cannot exceed maximum price.'; return false
  }
  formError.value = ''
  return true
}
async function applyFilters() {
  if (!validateDraft()) return
  const query: Record<string, string> = {}
  if (draft.q.trim()) query.q = draft.q.trim()
  if (draft.category_id) {
    const category = categories.value.find(item => String(item.category_id) === draft.category_id)
    if (category) { query.category_id = String(category.category_id); query.category_name = category.category_name }
  }
  if (draft.min_price) query.min_price = draft.min_price
  if (draft.max_price) query.max_price = draft.max_price
  if (draft.in_stock) query.in_stock = 'true'
  if (draft.sort !== 'newest') query.sort = draft.sort
  showMobileFilters.value = false
  await navigateTo({ path: '/products', query })
}
async function clearFilters() {
  showMobileFilters.value = false
  formError.value = ''
  await navigateTo('/products')
}
async function goToPage(next: number) {
  if (next < 1 || next > totalPages.value) return
  await navigateTo({ path: '/products', query: { ...route.query, page: String(next) } })
}
</script>

<template>
  <section class="bg-[#f8fbf7] pb-20 pt-10 sm:pt-14">
    <div class="cc-container">
      <nav aria-label="Breadcrumb" class="mb-6 text-sm text-gray-600">
        <NuxtLink to="/" class="font-semibold text-campus-emerald hover:underline">Home</NuxtLink>
        <span class="mx-2" aria-hidden="true">/</span>
        <span aria-current="page">Products</span>
      </nav>
      <div class="mb-8 max-w-2xl">
        <p class="mb-2 text-xs font-extrabold uppercase tracking-[.2em] text-campus-green">Explore the collection</p>
        <h1 class="text-3xl font-black tracking-tight text-campus-emerald sm:text-4xl">{{ activeCategoryName || 'Shop Campus Essentials' }}</h1>
        <p class="mt-3 text-sm leading-6 text-gray-600">Browse school supplies, tech accessories, and campus merchandise. Product availability is demo data.</p>
      </div>

      <div class="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between">
        <form class="flex w-full min-w-0 items-end gap-2 sm:max-w-lg" role="search" @submit.prevent="applyFilters">
          <div class="min-w-0 flex-1">
            <label for="catalog-search" class="mb-1 block text-xs font-semibold text-gray-700">Search products</label>
            <input id="catalog-search" v-model.trim="draft.q" type="search" maxlength="100" placeholder="Search by name or SKU" class="min-h-11 w-full rounded-xl border border-gray-300 px-3 text-sm">
          </div>
          <button type="submit" class="min-h-11 rounded-xl bg-campus-emerald px-4 font-bold text-white hover:bg-campus-green">Search</button>
        </form>
        <div class="flex flex-wrap items-end gap-2">
          <button type="button" class="min-h-11 rounded-xl border border-campus-emerald px-4 text-sm font-semibold text-campus-emerald hover:bg-campus-sage lg:hidden" :aria-expanded="showMobileFilters" aria-controls="catalog-mobile-filters" @click="showMobileFilters = !showMobileFilters">{{ showMobileFilters ? 'Hide filters' : 'Filters' }}</button>
          <div>
            <label for="catalog-sort" class="mb-1 block text-xs font-semibold text-gray-700">Sort by</label>
            <select id="catalog-sort" v-model="draft.sort" class="min-h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm" @change="applyFilters">
              <option v-for="option in sortOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </div>
        </div>
      </div>
      <p v-if="formError" class="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800" role="alert">{{ formError }}</p>
      <div v-if="showMobileFilters" id="catalog-mobile-filters" class="mb-6 lg:hidden">
        <CatalogFilters :filters="draft" :categories="categories" :error="formError" @update:filters="updateDraft" @apply="applyFilters" @clear="clearFilters" />
      </div>

      <div class="grid gap-8 lg:grid-cols-[245px_minmax(0,1fr)]">
        <aside class="hidden lg:block" aria-label="Product filtering options">
          <CatalogFilters :filters="draft" :categories="categories" :error="formError" @update:filters="updateDraft" @apply="applyFilters" @clear="clearFilters" />
        </aside>
        <div class="min-w-0">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p v-if="!pending && !error" class="text-sm text-gray-700" role="status">{{ meta?.total_items ?? 0 }} {{ (meta?.total_items ?? 0) === 1 ? 'product' : 'products' }} found</p>
            <p v-else class="text-sm text-gray-600">Loading catalog...</p>
            <button v-if="hasActiveFilters" type="button" class="text-sm font-semibold text-campus-emerald underline-offset-4 hover:underline" @click="clearFilters">Clear filters</button>
          </div>
          <div v-if="categoriesError" class="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950" role="alert">Categories could not load. <button type="button" class="font-bold underline" @click="refreshCategories()">Retry categories</button></div>
          <HomeCatalogSkeleton v-if="pending || categoriesPending" />
          <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-8 text-center" role="alert">
            <h2 class="text-xl font-bold text-red-900">We couldn't load the products.</h2>
            <p class="mt-2 text-sm text-red-800">Please try again. Check your filters or the demo API.</p>
            <button type="button" class="mt-5 min-h-11 rounded-xl bg-campus-emerald px-5 font-bold text-white" @click="refresh()">Retry</button>
          </div>
          <div v-else-if="products.length" class="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
            <ProductCard v-for="product in products" :key="product.product_id" :product="product" />
          </div>
          <div v-else class="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center" role="status">
            <h2 class="text-xl font-bold text-campus-emerald">No products found</h2>
            <p class="mt-2 text-sm text-gray-600">Try changing your search or filters.</p>
            <button type="button" class="mt-5 min-h-11 rounded-xl bg-campus-emerald px-6 font-bold text-white" @click="clearFilters">Show all products</button>
          </div>
          <nav v-if="!pending && !error && totalPages > 1" aria-label="Catalog pages" class="mt-10 flex items-center justify-center gap-4">
            <button type="button" class="min-h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold disabled:opacity-40" :disabled="requestedPage <= 1" @click="goToPage(requestedPage - 1)">Previous</button>
            <span class="text-sm text-gray-700" aria-live="polite">Page {{ requestedPage }} of {{ totalPages }}</span>
            <button type="button" class="min-h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm font-bold disabled:opacity-40" :disabled="requestedPage >= totalPages" @click="goToPage(requestedPage + 1)">Next</button>
          </nav>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `app/services/catalog.ts`

```typescript
import type {
  ApiResponse, Category, CatalogPageResponse, CatalogQuery, Product,
} from '~/types/catalog'

// Centralized API access. Replace the transport/backend later, not the presentation components.
export async function fetchProducts(): Promise<Product[]> {
  const response = await $fetch<ApiResponse<Product[]>>('/api/v1/products')
  if (!response.success || !Array.isArray(response.data)) throw new Error('Invalid products response')
  return response.data
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await $fetch<ApiResponse<Category[]>>('/api/v1/categories')
  if (!response.success || !Array.isArray(response.data)) throw new Error('Invalid categories response')
  return response.data
}

export async function fetchHomepageCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()])
  return { products, categories }
}

// Stage 4: filtered and paginated catalog, using the SAME endpoint as Stage 3.
export async function fetchCatalogPage(query: CatalogQuery = {}): Promise<CatalogPageResponse> {
  const response = await $fetch<CatalogPageResponse>('/api/v1/products', { query })
  if (!response.success || !Array.isArray(response.data) || !response.meta) {
    throw new Error('Invalid catalog response')
  }
  return response
}

export async function fetchProductById(productId: number): Promise<Product> {
  if (!Number.isSafeInteger(productId) || productId <= 0) throw new Error('Invalid product ID')
  const response = await $fetch<ApiResponse<Product>>(`/api/v1/products/${productId}`)
  if (!response.success || !response.data || response.data.product_id !== productId) {
    throw new Error('Invalid product details response')
  }
  return response.data
}
```

## `app/stores/cart.ts`

```typescript
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '~/types/catalog'
import { pesosToCentavos } from '~/utils/money'

export interface DemoCartItem {
  product_id: number
  product_name: string
  price: string
  stock_quantity: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  // Midterm demo only: this store is in-memory. There is no login, saved cart or order.
  const items = ref<DemoCartItem[]>([])
  const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotalCentavos = computed(() => items.value.reduce(
    (sum, item) => sum + pesosToCentavos(item.price) * item.quantity, 0,
  ))

  function addProduct(product: Product, quantity = 1): boolean {
    if (!Number.isSafeInteger(quantity) || quantity < 1) return false
    if (product.status !== 'ACTIVE' || product.stock_quantity < quantity) return false
    const existing = items.value.find(item => item.product_id === product.product_id)
    if (existing) {
      if (existing.quantity + quantity > product.stock_quantity) return false
      existing.quantity += quantity
      existing.stock_quantity = product.stock_quantity
      return true
    }
    items.value.push({
      product_id: product.product_id, product_name: product.product_name,
      price: product.price, stock_quantity: product.stock_quantity, quantity,
    })
    return true
  }
  function setQuantity(productId: number, next: number): void {
    const item = items.value.find(entry => entry.product_id === productId)
    if (!item || !Number.isInteger(next)) return
    if (next <= 0) { removeProduct(productId); return }
    item.quantity = Math.min(next, item.stock_quantity)
  }
  function removeProduct(productId: number): void {
    items.value = items.value.filter(item => item.product_id !== productId)
  }
  return { items, totalQuantity, subtotalCentavos, addProduct, setQuantity, removeProduct }
})
```

## `app/types/catalog.ts`

```typescript
// Database field names are copied from the supplied CampusCart ERD.
// ACTIVE/INACTIVE remain provisional mock enum values until the group approves the SQL enums.
export type MockProductStatus = 'ACTIVE' | 'INACTIVE'

export interface Product {
  product_id: number
  category_id: number
  sku: string
  product_name: string
  description: string
  price: string // DECIMAL(12,2) transmitted as a decimal string
  stock_quantity: number
  status: MockProductStatus
  created_at: string
  updated_at: string
}

export interface Category {
  category_id: number
  category_name: string
  description: string
  status: MockProductStatus
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export type CatalogSort = 'newest' | 'name_asc' | 'price_asc' | 'price_desc'

export interface CatalogQuery {
  q?: string
  category_id?: number
  min_price?: string
  max_price?: string
  in_stock?: boolean
  sort?: CatalogSort
  page?: number
  page_size?: number
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}

export interface CatalogPageResponse extends ApiResponse<Product[]> {
  meta: PaginationMeta
}

// UI-only draft values. These are not new database fields.
export interface CatalogFilterDraft {
  q: string
  category_id: string
  min_price: string
  max_price: string
  in_stock: boolean
  sort: CatalogSort
}
```

## `server/api/v1/products.get.ts`

```typescript
import { mockProducts } from '../../utils/mockCatalog'
import { pesosToCentavos } from '../../../app/utils/money'
import type { CatalogSort } from '../../../app/types/catalog'

const SORTS: readonly CatalogSort[] = ['newest', 'name_asc', 'price_asc', 'price_desc']

function single(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined
}

function decimalCents(value: string | undefined, field: string): number | undefined {
  if (value === undefined || value === '') return undefined
  if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(value)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` })
  }
  return pesosToCentavos(value)
}

function positiveInt(value: string | undefined, field: string, fallback: number, max = 10000): number {
  if (value === undefined) return fallback
  if (!/^[1-9]\d*$/.test(value) || Number(value) > max || !Number.isSafeInteger(Number(value))) {
    throw createError({ statusCode: 400, statusMessage: `Invalid ${field}` })
  }
  return Number(value)
}

export default defineEventHandler(event => {
  const query = getQuery(event)
  const qRaw = single(query.q) ?? ''
  if (qRaw.length > 100) throw createError({ statusCode: 400, statusMessage: 'Search must be 100 characters or fewer' })
  const q = qRaw.trim().toLocaleLowerCase()
  const categoryId = query.category_id === undefined
    ? undefined : positiveInt(single(query.category_id), 'category_id', 1)
  const min = decimalCents(single(query.min_price), 'min_price')
  const max = decimalCents(single(query.max_price), 'max_price')
  if (min !== undefined && max !== undefined && min > max) {
    throw createError({ statusCode: 400, statusMessage: 'min_price must not exceed max_price' })
  }
  const stockValue = single(query.in_stock)
  if (stockValue !== undefined && !['true', 'false'].includes(stockValue)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid in_stock value' })
  }
  const onlyStock = stockValue === 'true'
  const sort = single(query.sort) ?? 'newest'
  if (!SORTS.includes(sort as CatalogSort)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid sort value' })
  }
  const page = positiveInt(single(query.page), 'page', 1)
  const pageSize = positiveInt(single(query.page_size), 'page_size', 12, 24)

  const results = mockProducts.filter(product => product.status === 'ACTIVE'
    && (categoryId === undefined || product.category_id === categoryId)
    && (!q || `${product.product_name} ${product.sku} ${product.description}`.toLocaleLowerCase().includes(q))
    && (!onlyStock || product.stock_quantity > 0)
    && (min === undefined || pesosToCentavos(product.price) >= min)
    && (max === undefined || pesosToCentavos(product.price) <= max))

  // Stage 3 homepage uses the default catalog call. With 12 products and default page_size 12,
  // it still receives all the same mock products and the same `data` array response shape.
  if (sort === 'newest') results.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at) || a.product_id - b.product_id)
  if (sort === 'name_asc') results.sort((a, b) => a.product_name.localeCompare(b.product_name))
  if (sort === 'price_asc') results.sort((a, b) => pesosToCentavos(a.price) - pesosToCentavos(b.price) || a.product_id - b.product_id)
  if (sort === 'price_desc') results.sort((a, b) => pesosToCentavos(b.price) - pesosToCentavos(a.price) || a.product_id - b.product_id)

  const totalItems = results.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const start = (page - 1) * pageSize
  return {
    success: true,
    data: results.slice(start, start + pageSize),
    meta: { page, page_size: pageSize, total_items: totalItems, total_pages: totalPages },
    message: 'Demo products retrieved successfully',
  }
})
```

## `server/api/v1/products/[product_id].get.ts`

```typescript
import { mockProducts } from '../../../utils/mockCatalog'

export default defineEventHandler(event => {
  const raw = getRouterParam(event, 'product_id')
  if (!raw || !/^[1-9]\d*$/.test(raw) || !Number.isSafeInteger(Number(raw))) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }
  const product = mockProducts.find(item => item.product_id === Number(raw) && item.status === 'ACTIVE')
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  return { success: true, data: product, message: 'Demo product retrieved successfully' }
})
```
