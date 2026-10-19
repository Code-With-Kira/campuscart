<template>
  <div class="cc-container py-14" role="status" aria-label="Loading sample products">
    <div class="mb-6 h-8 w-56 animate-pulse rounded-xl bg-campus-sage" />
    <div class="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      <div v-for="item in 4" :key="item" class="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div class="aspect-[5/4] animate-pulse bg-campus-sage" />
        <div class="space-y-3 p-4">
          <div class="h-4 w-4/5 animate-pulse rounded bg-gray-100" />
          <div class="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
          <div class="h-10 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
    <span class="sr-only">Loading products...</span>
  </div>
</template>
