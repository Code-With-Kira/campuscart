<script setup lang="ts">
import { storefront } from '~/config/storefront'
</script>
<template>
  <footer class="mt-auto bg-campus-emerald text-white">
    <div class="cc-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <section>
        <h2 class="mb-4 text-xl font-black"><CommonStoreBrand footer /></h2>
        <p class="text-sm leading-7 text-white/85">{{ storefront.footer.description }}</p>
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
        <p class="text-sm leading-7 text-white/85">{{ storefront.footer.socialNotice }}</p>
        <p class="mt-4 text-xs text-white/65">{{ storefront.footer.paymentNotice }}</p>
      </section>
    </div>
    <div class="border-t border-white/20">
      <div class="cc-container flex flex-wrap items-center justify-between gap-3 py-5 text-xs text-white/75">
        <p>{{ storefront.footer.copyright }}</p>
        <p>{{ storefront.footer.tagline }}</p>
      </div>
    </div>
  </footer>
</template>
