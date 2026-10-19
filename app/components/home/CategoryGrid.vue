<script setup lang="ts">
import type { Category } from '~/types/catalog'
import { categoryImage, categoryImages } from '~/utils/productMedia'
defineProps<{ categories: Category[] }>()
</script>
<template>
  <div class="grid gap-5 sm:grid-cols-3 sm:gap-6">
    <NuxtLink
      v-for="category in categories"
      :key="category.category_id"
      :to="{ path: '/products', query: { category_id: category.category_id, category_name: category.category_name } }"
      class="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-campus-green/40 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-campus-green"
    >
      <CommonMediaImage :src="categoryImage(category)" :fallback="categoryImages[category.category_id]" :alt="`${category.category_name} category image`" :width="540" :height="320" class="aspect-[8/5] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
      <div class="flex items-center justify-between gap-3 px-5 py-5">
        <div>
          <h3 class="font-extrabold text-campus-emerald sm:text-lg">{{ category.category_name }}</h3>
          <p class="mt-1 text-xs leading-5 text-gray-500">{{ category.description }}</p>
        </div>
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-campus-sage text-xl text-campus-emerald transition group-hover:bg-campus-emerald group-hover:text-white" aria-hidden="true">↗</span>
      </div>
    </NuxtLink>
  </div>
</template>
