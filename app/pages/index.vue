<script setup lang="ts">
import { computed } from 'vue'
import { fetchHomepageCatalog } from '~/services/catalog'
import type { Product } from '~/types/catalog'
import { storefront } from '~/config/storefront'
useHead({ title: 'CampusCart | Campus Essentials Made Simple' })

const { data: catalog, pending, error, refresh } = await useAsyncData(
  'campuscart-home-catalog', fetchHomepageCatalog,
  { default: () => ({ products: [], categories: [] }) },
)
const products = computed(() => catalog.value?.products ?? [])
const categories = computed(() => catalog.value?.categories ?? [])
// Featured selection is a frontend/demo editorial choice; no is_featured DB field exists.
const featuredIds = storefront.featuredProductIds
const featured = computed<Product[]>(() => featuredIds
  .map(id => products.value.find(product => product.product_id === id))
  .filter((product): product is Product => Boolean(product)))
// Date is from products.created_at: no promotions or discount fields are assumed.
const arrivals = computed(() => [...products.value]
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 4))
</script>
<template>
  <div>
    <!-- Section 1: Announcement bar is reused from default.vue. -->
    <!-- Section 2: Navbar is reused from default.vue. -->
    <HomeHeroBanner />

    <!-- Section 4: Shop by Category -->
    <section class="bg-white py-14 sm:py-20" aria-labelledby="category-heading">
      <div class="cc-container">
        <div class="mb-9 text-center">
          <p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-campus-green">Find your essentials</p>
          <h2 id="category-heading" class="text-3xl font-black tracking-tight text-campus-emerald sm:text-4xl">Shop by Category</h2>
          <p class="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-600">A little something for every part of your campus day.</p>
        </div>
        <HomeCatalogSkeleton v-if="pending" />
        <div v-else-if="error" class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center" role="alert">
          <p class="font-semibold text-red-800">We couldn't load the product categories.</p>
          <p class="mt-1 text-sm text-red-700">Please try again. The mock API may be unavailable.</p>
          <button type="button" class="mt-4 rounded-lg bg-campus-emerald px-5 py-3 text-sm font-semibold text-white hover:bg-campus-green" @click="refresh()">Retry</button>
        </div>
        <HomeCategoryGrid v-else-if="categories.length" :categories="categories" />
        <p v-else class="rounded-2xl border border-gray-200 p-8 text-center text-gray-600" role="status">No categories are available yet.</p>
      </div>
    </section>

    <!-- Section 5: Featured Products -->
    <div class="bg-[#f8fbf7]">
      <HomeCatalogSkeleton v-if="pending" />
      <div v-else-if="error" class="cc-container py-10 text-center text-red-700" role="alert">Featured products couldn't load. Please retry above.</div>
      <HomeProductSection v-else eyebrow="Curated for your day" title="Featured Products" subtitle="Useful finds for your next class, study session, or campus errand." :products="featured" empty-message="No featured products are configured in this demo." />
    </div>

    <!-- Section 6: New Arrivals (no discounts or promotion fields in the ERD) -->
    <HomeCatalogSkeleton v-if="pending" />
    <div v-else-if="error" class="cc-container py-10 text-center text-red-700" role="alert">New arrivals couldn't load. Please retry above.</div>
    <HomeProductSection v-else eyebrow="Just added" title="New Arrivals" subtitle="Explore the latest additions to our sample CampusCart catalog." :products="arrivals" empty-message="No new products are available right now." />

    <!-- Section 7: Footer is reused from default.vue. -->
  </div>
</template>
