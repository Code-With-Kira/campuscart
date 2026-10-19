<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { myDemoOrders } from '~/services/orders'
import type { DemoOrder } from '~/types/orders'
import { formatPrice } from '~/utils/money'
import { useAuthStore } from '~/stores/auth'
definePageMeta({middleware:'customer'})
useHead({title:'My Orders | CampusCart'})
const auth=useAuthStore(),loading=ref(true),error=ref(''),orders=ref<DemoOrder[]>([])
async function load(){loading.value=true;error.value='';try{orders.value=await myDemoOrders()}catch{error.value='Unable to load demo orders.'}finally{loading.value=false}}
onMounted(async()=>{await auth.ensureSession();if(auth.isCustomer)await load()})
</script>
<template><section class="cc-container py-12 sm:py-16"><NuxtLink to="/profile" class="text-sm font-bold text-campus-green hover:underline">← My Profile</NuxtLink>
  <h1 class="mt-7 text-3xl font-black text-campus-emerald">My Orders</h1><p class="mt-3 text-sm text-gray-600">Campus pickup demo orders. Records reset on server restart; no real payment is collected.</p>
  <div v-if="loading" role="status" class="mt-8 rounded-xl bg-campus-sage p-8">Loading orders…</div>
  <div v-else-if="error" role="alert" class="mt-8 rounded-xl bg-red-50 p-6 text-red-800">{{error}} <button type="button" class="font-bold underline" @click="load">Retry</button></div>
  <div v-else-if="!orders.length" class="mt-8 rounded-xl bg-campus-sage p-10 text-center"><h2 class="text-xl font-bold text-campus-emerald">No orders yet</h2><NuxtLink to="/products" class="mt-5 inline-block font-bold text-campus-green underline">Browse products</NuxtLink></div>
  <ul v-else class="mt-8 space-y-4"><li v-for="o in orders" :key="o.order_id" class="rounded-xl border border-gray-200 p-5 sm:p-6"><div class="flex flex-wrap items-center justify-between gap-3"><div><h2 class="font-extrabold text-campus-emerald">{{o.order_number}}</h2><p class="mt-1 text-sm text-gray-600">{{new Date(o.placed_at).toLocaleString()}} · {{o.order_status.replaceAll('_',' ')}}</p></div><div class="text-right"><p class="font-bold">{{formatPrice(o.total_amount)}}</p><NuxtLink :to="`/orders/${o.order_id}`" class="mt-2 inline-block text-sm font-bold text-campus-green underline">View details</NuxtLink></div></div></li></ul>
</section></template>
