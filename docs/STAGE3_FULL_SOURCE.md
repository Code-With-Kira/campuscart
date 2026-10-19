# CampusCart Stage 3 — Complete Source Reference

Every new or modified Vue/TypeScript application file is reproduced below in full. Static SVG illustrations are included as individual complete files in the ZIP. Unchanged Stage 2 files are included in the ZIP but not duplicated here.

## `app/pages/index.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { fetchHomepageCatalog } from '~/services/catalog'
import type { Product } from '~/types/catalog'
useHead({ title: 'CampusCart | Campus Essentials Made Simple' })

const { data: catalog, pending, error, refresh } = await useAsyncData(
  'campuscart-home-catalog', fetchHomepageCatalog,
  { default: () => ({ products: [], categories: [] }) },
)
const products = computed(() => catalog.value?.products ?? [])
const categories = computed(() => catalog.value?.categories ?? [])
// Featured selection is a frontend/demo editorial choice; no is_featured DB field exists.
const featuredIds = [201, 101, 301, 202]
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
```

## `app/components/home/HeroBanner.vue`

```vue
<template>
  <section class="relative overflow-hidden bg-campus-sage" aria-labelledby="hero-heading">
    <div class="pointer-events-none absolute -right-32 -top-48 h-96 w-96 rounded-full bg-campus-gold/25 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-48 left-0 h-80 w-80 rounded-full bg-campus-green/10 blur-3xl" aria-hidden="true" />
    <div class="cc-container relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
      <div class="max-w-xl">
        <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-campus-green/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-campus-emerald shadow-sm">
          <span class="h-2 w-2 rounded-full bg-campus-green" aria-hidden="true" /> Made for campus life
        </p>
        <h1 id="hero-heading" class="text-4xl font-black leading-tight tracking-tight text-campus-emerald sm:text-5xl xl:text-6xl">
          Big goals.<br><span class="text-campus-green">Little essentials.</span>
        </h1>
        <p class="mt-6 max-w-lg text-base leading-8 text-gray-700 sm:text-lg">
          From the first lecture to the final project, find school supplies, useful tech and campus-inspired favorites in one easy place.
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <NuxtLink to="/products" class="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-campus-emerald px-7 py-3 font-bold text-white shadow-lg shadow-campus-emerald/15 transition hover:-translate-y-0.5 hover:bg-campus-green active:translate-y-0">
            Shop Now <span aria-hidden="true">↗</span>
          </NuxtLink>
          <NuxtLink to="/information/about" class="inline-flex min-h-12 items-center rounded-xl px-4 font-semibold text-campus-emerald underline-offset-4 hover:underline">
            About CampusCart
          </NuxtLink>
        </div>
        <p class="mt-7 flex items-center gap-2 text-xs font-medium text-gray-600">
          <span class="text-campus-green" aria-hidden="true">✦</span> A student ecommerce project · Product information is sample data
        </p>
      </div>
      <div class="relative mx-auto w-full max-w-lg" aria-label="Illustrations of a laptop accessory, notebook, and tote bag">
        <div class="absolute inset-8 rounded-[3rem] bg-campus-gold/40 blur-2xl" aria-hidden="true" />
        <div class="relative grid grid-cols-2 gap-4 sm:gap-6">
          <div class="mt-12 -rotate-3 rounded-3xl bg-white p-4 shadow-xl shadow-campus-emerald/10 transition-transform hover:rotate-0">
            <div class="aspect-square overflow-hidden rounded-2xl bg-[#e5f1e2]"><img src="/images/products/notebook.svg" alt="Illustration of a study notebook" class="h-full w-full object-cover" width="320" height="320"></div>
            <p class="mt-3 text-sm font-bold text-campus-emerald">Study ready</p>
            <p class="text-xs text-gray-500">School essentials</p>
          </div>
          <div class="rotate-3 rounded-3xl bg-white p-4 shadow-xl shadow-campus-emerald/10 transition-transform hover:rotate-0">
            <div class="aspect-square overflow-hidden rounded-2xl bg-[#e6ebe7]"><img src="/images/products/headphones.svg" alt="Illustration of headphones" class="h-full w-full object-cover" width="320" height="320"></div>
            <p class="mt-3 text-sm font-bold text-campus-emerald">Stay focused</p>
            <p class="text-xs text-gray-500">Tech accessories</p>
          </div>
          <div class="col-span-2 mx-auto -mt-6 w-44 rotate-2 rounded-3xl bg-white p-3 shadow-xl shadow-campus-emerald/10 sm:w-52">
            <img src="/images/products/tote.svg" alt="Illustration of a campus-inspired tote bag" class="aspect-[5/4] w-full rounded-2xl object-cover" width="320" height="256">
            <p class="pt-2 text-center text-xs font-bold text-campus-emerald">Carry your campus day</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `app/components/home/CategoryGrid.vue`

```vue
<script setup lang="ts">
import type { Category } from '~/types/catalog'
import { categoryImages } from '~/utils/productMedia'
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
      <img :src="categoryImages[category.category_id] || '/images/products/placeholder.svg'" :alt="`${category.category_name} category illustration`" width="540" height="320" class="aspect-[8/5] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy">
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
```

## `app/components/home/ProductSection.vue`

```vue
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
```

## `app/components/home/CatalogSkeleton.vue`

```vue
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
      <img :src="productImage(product.product_id)" :alt="`Illustration of ${product.product_name}`" width="340" height="340" loading="lazy" class="aspect-[5/4] w-full object-cover transition-transform duration-300 group-hover:scale-105">
      <span v-if="!available" class="absolute left-3 top-3 rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-white">Out of stock</span>
      <span v-else-if="product.stock_quantity <= 5" class="absolute left-3 top-3 rounded-full bg-campus-gold px-3 py-1 text-xs font-bold text-campus-emerald">Low stock</span>
    </div>
    <div class="flex flex-1 flex-col p-4 sm:p-5">
      <p class="text-[11px] font-semibold uppercase tracking-wider text-campus-green">{{ product.sku }}</p>
      <h3 class="mt-1 min-h-12 text-sm font-bold leading-6 text-campus-emerald sm:text-base">{{ product.product_name }}</h3>
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

## `app/components/layout/SiteHeader.vue`

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useCartStore } from '~/stores/cart'

const route = useRoute()
const isMenuOpen = ref(false)
const cart = useCartStore()

// Category labels are temporary navigation data; Stage 3/4 will read them
// from the mock API and use category_id as the canonical filter identifier.
const categories = [
  'School Supplies',
  'Tech Accessories',
  'Campus Merchandise',
]

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
          Campus<span class="text-campus-green">Cart</span>
        </NuxtLink>

        <nav class="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Main navigation">
          <NuxtLink to="/" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Home
          </NuxtLink>
          <NuxtLink
            v-for="category in categories"
            :key="category"
            :to="{ path: '/products', query: { category_name: category } }"
            class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm"
          >
            {{ category }}
          </NuxtLink>
        </nav>

        <nav class="hidden items-center gap-3 lg:flex xl:gap-5" aria-label="Account and shopping navigation">
          <NuxtLink to="/products" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Search
          </NuxtLink>
          <NuxtLink to="/login" class="text-xs font-medium text-gray-700 hover:text-campus-green xl:text-sm">
            Account
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
          :key="category"
          :to="{ path: '/products', query: { category_name: category } }"
          class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage"
        >
          {{ category }}
        </NuxtLink>
        <NuxtLink to="/products" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Search Products
        </NuxtLink>
        <NuxtLink to="/login" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Account
        </NuxtLink>
        <NuxtLink to="/cart" class="rounded-lg px-3 py-3 text-sm font-medium hover:bg-campus-sage">
          Shopping Cart <span v-if="cart.totalQuantity">({{ cart.totalQuantity }})</span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
```

## `app/components/layout/SiteFooter.vue`

```vue
<template>
  <footer class="mt-auto bg-campus-emerald text-white">
    <div class="cc-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <section>
        <h2 class="mb-4 text-xl font-black">Campus<span class="text-campus-gold">Cart</span></h2>
        <p class="text-sm leading-7 text-white/85">Student essentials, thoughtfully gathered. An independent ITE 18 academic demo, not an official university store.</p>
      </section>
      <nav aria-label="Footer shop navigation">
        <h2 class="mb-4 text-sm font-extrabold uppercase tracking-wider">Explore</h2>
        <ul class="space-y-3 text-sm text-white/85">
          <li><NuxtLink to="/" class="hover:text-campus-gold hover:underline">Home</NuxtLink></li>
          <li><NuxtLink to="/products" class="hover:text-campus-gold hover:underline">All Products</NuxtLink></li>
          <li><NuxtLink to="/cart" class="hover:text-campus-gold hover:underline">Demo Cart</NuxtLink></li>
        </ul>
      </nav>
      <nav aria-label="CampusCart information">
        <h2 class="mb-4 text-sm font-extrabold uppercase tracking-wider">Help & Information</h2>
        <ul class="space-y-3 text-sm text-white/85">
          <li><NuxtLink to="/information/about" class="hover:text-campus-gold hover:underline">About CampusCart</NuxtLink></li>
          <li><NuxtLink to="/information/contact" class="hover:text-campus-gold hover:underline">Contact</NuxtLink></li>
          <li><NuxtLink to="/information/faq" class="hover:text-campus-gold hover:underline">FAQs</NuxtLink></li>
          <li><NuxtLink to="/information/policies" class="hover:text-campus-gold hover:underline">Policies & Privacy</NuxtLink></li>
        </ul>
      </nav>
      <section>
        <h2 class="mb-4 text-sm font-extrabold uppercase tracking-wider">Stay Connected</h2>
        <p class="text-sm leading-7 text-white/85">Social links will appear here once official CampusCart accounts are confirmed.</p>
        <p class="mt-4 text-xs text-white/65">No purchases or payments are processed in this demo.</p>
      </section>
    </div>
    <div class="border-t border-white/20">
      <div class="cc-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/75">
        <p>© 2026 CampusCart. Student ecommerce project.</p>
        <p>Made for learning · Inspired by campus life</p>
      </div>
    </div>
  </footer>
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
      <p class="mt-2 text-gray-600">Add a product from the homepage to see it here.</p>
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

## `app/pages/information/[slug].vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
const route = useRoute()
const entries: Record<string, { title: string; description: string; details: string[] }> = {
  about: {
    title: 'About CampusCart',
    description: 'CampusCart is a student e-commerce project designed for school supplies, tech accessories, and campus-inspired merchandise.',
    details: ['This demonstration is independently built for an ITE 18 academic project.', 'The colors are inspired by Caraga State University; this is not an official CSU store.'],
  },
  contact: {
    title: 'Contact Information',
    description: 'Official CampusCart contact channels have not yet been finalized.',
    details: ['No email address, phone number, or social media account is being claimed in this prototype.', 'Please do not provide personal, payment, or delivery details through this demo.'],
  },
  faq: {
    title: 'Frequently Asked Questions',
    description: 'What should visitors know about this CampusCart demonstration?',
    details: ['Can I browse products? Yes. The homepage shows sample products from a local mock API.', 'Can I add products to a cart? Yes. The cart is a temporary Pinia demonstration.', 'Can I place a real order? No. Authentication, payment, checkout, and delivery are not active yet.'],
  },
  policies: {
    title: 'Policies and Privacy',
    description: 'Production purchasing and privacy policies are not finalized for this academic demonstration.',
    details: ['This demo does not accept actual purchases or payments.', 'Do not enter real payment credentials or sensitive personal details.', 'The privacy, refund, and delivery policies must be reviewed before a future public launch.'],
  },
}
const entry = computed(() => entries[String(route.params.slug)])
if (!entry.value) throw createError({ statusCode: 404, statusMessage: 'Page not found' })
useHead(() => ({ title: `${entry.value?.title ?? 'Information'} | CampusCart` }))
</script>
<template>
  <section class="cc-container max-w-3xl py-16">
    <NuxtLink to="/" class="text-sm font-semibold text-campus-green hover:underline">← Back to home</NuxtLink>
    <h1 class="mt-6 text-4xl font-black text-campus-emerald">{{ entry?.title }}</h1>
    <p class="mt-5 text-lg leading-8 text-gray-700">{{ entry?.description }}</p>
    <ul class="mt-8 space-y-4">
      <li v-for="(detail, index) in entry?.details ?? []" :key="index" class="rounded-xl border border-gray-100 bg-campus-sage p-5 leading-7">{{ detail }}</li>
    </ul>
  </section>
</template>
```

## `app/types/catalog.ts`

```typescript
// Names match the supplied CampusCart ERD. Values are mock only.
export type MockProductStatus = 'ACTIVE' | 'INACTIVE' // Provisional API values, NOT confirmed DB enum.
export interface Product {
  product_id: number
  category_id: number
  sku: string
  product_name: string
  description: string
  price: string // Decimal(12,2), transmitted as a string.
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
```

## `app/services/catalog.ts`

```typescript
import type { ApiResponse, Product, Category } from '~/types/catalog'

// All API calls are centralized here. Replace endpoints with the real backend in Final.
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
```

## `app/utils/money.ts`

```typescript
// Use integer centavos for client-side *display* calculations.
// Checkout totals must be recalculated by the real backend.
export function pesosToCentavos(value: string): number {
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) return 0
  const [whole, fraction = ''] = value.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}
export function formatCentavos(centavos: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP', minimumFractionDigits: 2,
  }).format(centavos / 100)
}
export function formatPrice(price: string): string {
  return formatCentavos(pesosToCentavos(price))
}
```

## `app/utils/productMedia.ts`

```typescript
// Presentation-only image map. The provided ERD does not define any image column.
// These paths are static illustrative assets, not product database fields.
const productImages: Record<number, string> = {
  101: '/images/products/notebook.svg',
  102: '/images/products/pen-set.svg',
  103: '/images/products/calculator.svg',
  104: '/images/products/organizer.svg',
  201: '/images/products/mouse.svg',
  202: '/images/products/headphones.svg',
  203: '/images/products/usb-drive.svg',
  204: '/images/products/stand.svg',
  301: '/images/products/tote.svg',
  302: '/images/products/tumbler.svg',
  303: '/images/products/shirt.svg',
  304: '/images/products/lanyard.svg',
}
export function productImage(productId: number): string {
  return productImages[productId] ?? '/images/products/placeholder.svg'
}
export const categoryImages: Record<number, string> = {
  1: '/images/categories/school.svg',
  2: '/images/categories/tech.svg',
  3: '/images/categories/merch.svg',
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

  function addProduct(product: Product): boolean {
    if (product.status !== 'ACTIVE' || product.stock_quantity <= 0) return false
    const existing = items.value.find(item => item.product_id === product.product_id)
    if (existing) {
      if (existing.quantity >= product.stock_quantity) return false
      existing.quantity += 1
      existing.stock_quantity = product.stock_quantity
      return true
    }
    items.value.push({
      product_id: product.product_id, product_name: product.product_name,
      price: product.price, stock_quantity: product.stock_quantity, quantity: 1,
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

## `server/utils/mockCatalog.ts`

```typescript
// DEMONSTRATION RECORDS, NOT AN IMPLEMENTED DATABASE.
// Names and field types follow the user's uploaded CampusCart ERD.
// 'ACTIVE'/'INACTIVE' are provisional mock values; the SQL ENUM is unresolved.
import type { Category, Product } from '../../app/types/catalog'

const oldDate = '2026-09-22T08:00:00+08:00'
const mk = (product_id: number, category_id: number, sku: string,
  product_name: string, description: string, price: string, stock_quantity: number,
  created_at: string = oldDate): Product => ({
    product_id, category_id, sku, product_name, description, price,
    stock_quantity, status: 'ACTIVE', created_at, updated_at: created_at,
  })
export const mockCategories: Category[] = [
  { category_id: 1, category_name: 'School Supplies', description: 'Everyday tools for studying and staying organized.', status: 'ACTIVE', created_at: oldDate, updated_at: oldDate },
  { category_id: 2, category_name: 'Tech Accessories', description: 'Useful gear for class, study, and creative projects.', status: 'ACTIVE', created_at: oldDate, updated_at: oldDate },
  { category_id: 3, category_name: 'Campus Merchandise', description: 'Campus-inspired everyday essentials and keepsakes.', status: 'ACTIVE', created_at: oldDate, updated_at: oldDate },
]
export const mockProducts: Product[] = [
  mk(101, 1, 'SCH-001', 'Study Notes Notebook', 'Hard-cover ruled notebook for lectures and reviews.', '129.00', 34),
  mk(102, 1, 'SCH-002', 'Color Study Pen Set', 'Set of colorful pens for note-taking and planning.', '89.00', 48, '2026-10-10T08:00:00+08:00'),
  mk(103, 1, 'SCH-003', 'Scientific Calculator', 'Handy calculator for academic exercises.', '549.00', 10),
  mk(104, 1, 'SCH-004', 'Desktop Organizer', 'Compact desk organizer for stationery and accessories.', '219.00', 8, '2026-10-14T08:00:00+08:00'),
  mk(201, 2, 'TEC-001', 'Wireless Study Mouse', 'Comfortable wireless mouse for laptop work.', '499.00', 21),
  mk(202, 2, 'TEC-002', 'Everyday Headphones', 'Lightweight over-ear headphones for focused study sessions.', '899.00', 15, '2026-10-12T08:00:00+08:00'),
  mk(203, 2, 'TEC-003', '32GB USB Flash Drive', 'Portable USB flash drive for projects and documents.', '349.00', 39),
  mk(204, 2, 'TEC-004', 'Foldable Laptop Stand', 'Portable stand that raises a laptop above the desk.', '429.00', 0, '2026-10-13T08:00:00+08:00'),
  mk(301, 3, 'MER-001', 'Campus Everyday Tote', 'Reusable everyday tote for books and daily essentials.', '269.00', 18, '2026-10-11T08:00:00+08:00'),
  mk(302, 3, 'MER-002', 'Reusable Campus Tumbler', 'Reusable bottle for everyday use.', '399.00', 12, '2026-10-15T08:00:00+08:00'),
  mk(303, 3, 'MER-003', 'Campus Comfort Tee', 'Everyday cotton t-shirt with a simple campus-inspired design.', '459.00', 17),
  mk(304, 3, 'MER-004', 'Classic ID Lanyard', 'Comfortable ID lanyard for campus life.', '99.00', 40, '2026-10-16T08:00:00+08:00'),
]
```

## `server/api/v1/products.get.ts`

```typescript
import { getQuery } from 'h3'
import { mockProducts } from '../../utils/mockCatalog'

export default defineEventHandler(event => {
  const query = getQuery(event)
  const category = typeof query.category_id === 'string' ? Number(query.category_id) : undefined
  const search = typeof query.q === 'string' ? query.q.trim().slice(0, 100).toLowerCase() : ''
  const data = mockProducts.filter(product =>
    product.status === 'ACTIVE'
    && (!Number.isInteger(category) || product.category_id === category)
    && (!search || `${product.product_name} ${product.sku}`.toLowerCase().includes(search)),
  )
  return { success: true, data, message: 'Demo products retrieved successfully' }
})
```

## `server/api/v1/categories.get.ts`

```typescript
import { mockCategories } from '../../utils/mockCatalog'
export default defineEventHandler(() => ({
  success: true,
  data: mockCategories.filter(category => category.status === 'ACTIVE'),
  message: 'Demo categories retrieved successfully',
}))
```
