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
