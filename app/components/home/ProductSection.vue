<script setup lang="ts">
import type { Product } from '~/types/catalog'
import ProductCard from '~/components/product/ProductCard.vue'
defineProps<{ title: string; subtitle: string; products: Product[]; eyebrow: string; emptyMessage: string }>()
</script>
<template>
  <section class="py-14 sm:py-20" :aria-label="title">
    <div class="cc-container">
      <div class="mb-9 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="mb-2 text-xs font-bold uppercase tracking-[.2em] text-campus-green">{{ eyebrow }}</p>
          <h2 class="text-3xl font-black tracking-tight text-campus-emerald sm:text-4xl">{{ title }}</h2>
          <p class="mt-2 text-sm leading-6 text-gray-600">{{ subtitle }}</p>
        </div>
        <NuxtLink to="/products" class="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-campus-emerald underline-offset-4 hover:underline">View All Products <span aria-hidden="true">↗</span></NuxtLink>
      </div>
      <div v-if="products.length" class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        <ProductCard v-for="product in products" :key="product.product_id" :product="product" />
      </div>
      <div v-else class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-600" role="status">{{ emptyMessage }}</div>
    </div>
  </section>
</template>
