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
