<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { storefront } from '~/config/storefront'
import { fetchCategories } from '~/services/catalog'

const route = useRoute()
const isMenuOpen = ref(false)
const cart = useCartStore()
const auth = useAuthStore()

// Category names come from the catalog API; keep approved local links if it is offline.
const { data: availableCategories } = await useAsyncData(
  'campuscart-header-categories', fetchCategories, { default: () => [] },
)
const categories = computed(() => {
  const fromApi = (availableCategories.value ?? []).filter(c => c.status === 'ACTIVE')
  return fromApi.length
    ? fromApi.map(c => ({ name: c.category_name, id: c.category_id }))
    : storefront.navigationFallbackCategories.map(name => ({ name, id: null }))
})

watch(() => route.fullPath, () => { isMenuOpen.value = false })
</script>

<template>
  <header class="border-b border-gray-200 bg-white">
    <div class="cc-container">
      <div class="flex min-h-20 items-center justify-between gap-3">
        <NuxtLink
          to="/"
          class="shrink-0 text-xl font-extrabold tracking-tight text-campus-emerald sm:text-2xl"
          aria-label="CampusCart homepage"
        >
          <CommonStoreBrand />
        </NuxtLink>

        <nav class="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Main navigation">
          <NuxtLink to="/" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Home
          </NuxtLink>
          <NuxtLink
            v-for="category in categories"
            :key="category.id ?? category.name"
            :to="{ path: '/products', query: { category_name: category.name, ...(category.id === null ? {} : { category_id: category.id }) } }"
            class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm"
          >
            {{ category.name }}
          </NuxtLink>
        </nav>

        <nav class="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Account and shopping navigation">
          <NuxtLink to="/products" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Search
          </NuxtLink>
          <NuxtLink :to="auth.isAdmin ? '/admin' : auth.isCustomer ? '/profile' : '/login'" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            {{ auth.user ? auth.user.first_name : 'Account' }}
          </NuxtLink>
          <NuxtLink
            to="/cart"
            class="rounded-lg bg-campus-emerald px-3 py-2 text-xs font-semibold text-white hover:bg-campus-green xl:px-4 xl:text-sm"
          >
            Cart <span v-if="cart.totalQuantity" class="ml-1 rounded-full bg-campus-gold px-2 py-0.5 text-xs font-extrabold text-campus-emerald" aria-label="Items in cart">{{ cart.totalQuantity }}</span>
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2 lg:hidden">
          <NuxtLink
            to="/cart"
            class="rounded-lg border border-campus-emerald px-3 py-2 text-xs font-semibold text-campus-emerald sm:text-sm"
            aria-label="Shopping cart"
          >
            Cart <span v-if="cart.totalQuantity" class="ml-1 font-extrabold">({{ cart.totalQuantity }})</span>
          </NuxtLink>
          <button
            type="button"
            class="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-campus-emerald sm:text-sm"
            aria-controls="mobile-menu"
            :aria-expanded="isMenuOpen"
            :aria-label="isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'"
            @click="isMenuOpen = !isMenuOpen"
          >
            {{ isMenuOpen ? 'Close' : 'Menu' }}
          </button>
        </div>
      </div>

      <nav
        v-if="isMenuOpen"
        id="mobile-menu"
        class="flex flex-col gap-1 border-t border-gray-200 py-4 lg:hidden"
        aria-label="Mobile navigation"
      >
        <NuxtLink to="/" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Home
        </NuxtLink>
        <NuxtLink
          v-for="category in categories"
          :key="category.id ?? category.name"
          :to="{ path: '/products', query: { category_name: category.name, ...(category.id === null ? {} : { category_id: category.id }) } }"
          class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage"
        >
          {{ category.name }}
        </NuxtLink>
        <NuxtLink to="/products" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Search Products
        </NuxtLink>
        <NuxtLink :to="auth.isAdmin ? '/admin' : auth.isCustomer ? '/profile' : '/login'" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          {{ auth.user ? auth.user.first_name + ' · Account' : 'Account' }}
        </NuxtLink>
        <NuxtLink to="/cart" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Shopping Cart <span v-if="cart.totalQuantity">({{ cart.totalQuantity }})</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
