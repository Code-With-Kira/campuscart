<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { adminSummary } from '~/services/admin'
import type { DemoSummary } from '~/types/admin'
definePageMeta({layout:'admin',middleware:'admin'})
useHead({title:'Admin Dashboard | CampusCart'})
const summary=ref<DemoSummary|null>(null),loading=ref(true),error=ref('')
async function load(){loading.value=true;error.value='';try{summary.value=await adminSummary()}catch{error.value='Unable to load dashboard.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section><p class="text-xs font-bold uppercase tracking-widest text-campus-green">Administration · Demo-only data</p><h1 class="mt-2 text-3xl font-black text-campus-emerald">Dashboard</h1><p class="mt-3 text-sm text-gray-600">Counts come from the current server-memory catalog and order records. Low-stock means 5 or fewer units. This is not real revenue reporting.</p>
 <p v-if="loading" class="mt-8 rounded-xl bg-campus-sage p-7" role="status">Loading dashboard…</p><p v-else-if="error" role="alert" class="mt-8 rounded-xl bg-red-50 p-6 text-red-800">{{error}} <button class="font-bold underline" @click="load">Retry</button></p>
 <div v-else-if="summary" class="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><div v-for="metric in [
 {label:'Products',value:summary.total_products},{label:'Available products',value:summary.available_products},
 {label:'Stock units',value:summary.total_stock_units},{label:'Categories',value:summary.total_categories},
 {label:'Orders',value:summary.total_orders},{label:'Pending pickup orders',value:summary.pending_orders},
 {label:'Ready for pickup',value:summary.ready_orders},{label:'Completed',value:summary.completed_orders},
 {label:'Cancelled',value:summary.cancelled_orders},{label:'Low stock (≤5 units)',value:summary.low_stock_products}
 ]" :key="metric.label" class="rounded-xl border border-gray-200 bg-campus-sage p-5"><p class="text-sm font-semibold text-gray-700">{{metric.label}}</p><p class="mt-3 text-3xl font-black text-campus-emerald">{{metric.value}}</p></div></div>
 <div class="mt-8 flex flex-wrap gap-3"><NuxtLink to="/admin/orders" class="rounded-lg bg-campus-emerald px-5 py-3 text-sm font-bold text-white">Manage Orders</NuxtLink><NuxtLink to="/admin/inventory" class="rounded-lg border border-campus-emerald px-5 py-3 text-sm font-bold text-campus-emerald">View Inventory</NuxtLink></div>
</section></template>
