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
    details: ['Can I browse products? Yes. The homepage shows sample products from a local mock API.', 'Can I add products to a cart? Yes. The cart is a temporary Pinia demonstration.', 'Can I place a real order? No. Checkout creates simulated campus-pickup orders in temporary server memory; no money is collected or real pickup is arranged.'],
  },
  policies: {
    title: 'Policies and Privacy',
    description: 'Production purchasing and privacy policies are not finalized for this academic demonstration.',
    details: ['This demo does not accept actual purchases or payments. Accounts, addresses and simulated orders are kept only in server memory and vanish when the mock server restarts.', 'Do not enter real payment credentials or sensitive personal details.', 'The privacy, refund, and delivery policies must be reviewed before a future public launch.'],
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
