<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const links = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Inventory', to: '/admin/inventory' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Payments', to: '/admin/payments' },
]
async function exitPreview() { await auth.logout(); await navigateTo('/login') }
</script>
<template>
  <div class="min-h-screen bg-gray-50">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to main content</a>
    <header class="bg-campus-emerald text-white">
      <div class="cc-container flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
        <NuxtLink to="/admin" class="text-xl font-bold"><CommonStoreBrand footer /> <span class="text-sm font-semibold text-white">Admin</span></NuxtLink>
        <div class="flex flex-wrap items-center gap-2">
          <NuxtLink to="/" class="rounded-lg px-3 py-2 text-sm hover:bg-white/15">View Store</NuxtLink>
          <button type="button" class="rounded-lg border border-white/50 px-3 py-2 text-sm hover:bg-white/15" @click="exitPreview">Exit Demo Admin</button>
        </div>
      </div>
    </header>
    <div class="cc-container flex flex-col gap-6 py-6 md:flex-row">
      <aside class="w-full shrink-0 md:w-60">
        <nav aria-label="Administrator navigation" class="flex gap-1 overflow-x-auto rounded-xl bg-white p-3 shadow-sm md:flex-col">
          <NuxtLink v-for="link in links" :key="link.to" :to="link.to" active-class="bg-campus-sage font-extrabold"
            class="whitespace-nowrap rounded-lg px-4 py-3 text-sm font-semibold text-campus-emerald hover:bg-campus-sage">{{ link.label }}</NuxtLink>
        </nav>
      </aside>
      <main id="main-content" class="min-w-0 flex-1 rounded-xl bg-white p-5 shadow-sm sm:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>
