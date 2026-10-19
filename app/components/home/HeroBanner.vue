<script setup lang="ts">
import { storefront } from '~/config/storefront'
</script>
<template>
  <section class="relative overflow-hidden bg-campus-sage" aria-labelledby="hero-heading">
    <div class="pointer-events-none absolute -right-32 -top-48 h-96 w-96 rounded-full bg-campus-gold/25 blur-3xl" aria-hidden="true" />
    <div class="pointer-events-none absolute -bottom-48 left-0 h-80 w-80 rounded-full bg-campus-green/10 blur-3xl" aria-hidden="true" />
    <div class="cc-container relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
      <div class="max-w-xl">
        <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-campus-green/20 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-campus-emerald shadow-sm">
          <span class="h-2 w-2 rounded-full bg-campus-green" aria-hidden="true" /> {{ storefront.hero.eyebrow }}
        </p>
        <h1 id="hero-heading" class="text-4xl font-black leading-tight tracking-tight text-campus-emerald sm:text-5xl xl:text-6xl">
          {{ storefront.hero.titleFirst }}<br><span class="text-campus-green">{{ storefront.hero.titleSecond }}</span>
        </h1>
        <p class="mt-6 max-w-lg text-base leading-8 text-gray-700 sm:text-lg">
          {{ storefront.hero.description }}
        </p>
        <div class="mt-8 flex flex-wrap items-center gap-4">
          <NuxtLink  :to="storefront.hero.primaryTo" class="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-campus-emerald px-7 py-3 font-bold text-white shadow-lg shadow-campus-emerald/15 transition hover:-translate-y-0.5 hover:bg-campus-green active:translate-y-0">
            {{ storefront.hero.primaryText }} <span aria-hidden="true">↗</span>
          </NuxtLink>
          <NuxtLink  :to="storefront.hero.secondaryTo" class="inline-flex min-h-12 items-center rounded-xl px-4 font-semibold text-campus-emerald underline-offset-4 hover:underline">
            {{ storefront.hero.secondaryText }}
          </NuxtLink>
        </div>
        <p class="mt-7 flex items-center gap-2 text-xs font-medium text-gray-600">
          <span class="text-campus-green" aria-hidden="true">✦</span> {{ storefront.hero.disclaimer }}
        </p>
      </div>
      <div class="relative mx-auto w-full max-w-lg" aria-label="Illustrations of a laptop accessory, notebook, and tote bag">
        <div class="absolute inset-8 rounded-[3rem] bg-campus-gold/40 blur-2xl" aria-hidden="true" />
        <div class="relative grid grid-cols-2 gap-4 sm:gap-6">
          <div class="mt-12 -rotate-3 rounded-3xl bg-white p-4 shadow-xl shadow-campus-emerald/10 transition-transform hover:rotate-0">
            <div class="aspect-square overflow-hidden rounded-2xl bg-[#e5f1e2]"><CommonMediaImage :src="storefront.hero.tiles.notebook.image" :alt="storefront.hero.tiles.notebook.alt" class="h-full w-full object-cover" :width="320" :height="320" /></div>
            <p class="mt-3 text-sm font-bold text-campus-emerald">{{ storefront.hero.tiles.notebook.label }}</p>
            <p class="text-xs text-gray-500">{{ storefront.hero.tiles.notebook.caption }}</p>
          </div>
          <div class="rotate-3 rounded-3xl bg-white p-4 shadow-xl shadow-campus-emerald/10 transition-transform hover:rotate-0">
            <div class="aspect-square overflow-hidden rounded-2xl bg-[#e6ebe7]"><CommonMediaImage :src="storefront.hero.tiles.headphones.image" :alt="storefront.hero.tiles.headphones.alt" class="h-full w-full object-cover" :width="320" :height="320" /></div>
            <p class="mt-3 text-sm font-bold text-campus-emerald">{{ storefront.hero.tiles.headphones.label }}</p>
            <p class="text-xs text-gray-500">{{ storefront.hero.tiles.headphones.caption }}</p>
          </div>
          <div class="col-span-2 mx-auto -mt-6 w-44 rotate-2 rounded-3xl bg-white p-3 shadow-xl shadow-campus-emerald/10 sm:w-52">
            <CommonMediaImage :src="storefront.hero.tiles.tote.image" :alt="storefront.hero.tiles.tote.alt" class="aspect-[5/4] w-full rounded-2xl object-cover" :width="320" :height="256" />
            <p class="pt-2 text-center text-xs font-bold text-campus-emerald">{{ storefront.hero.tiles.tote.label }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
