<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { adminOrders } from '~/services/admin'
import { formatPrice } from '~/utils/money'
import type { DemoOrder } from '~/types/orders'
definePageMeta({layout:'admin',middleware:'admin'})
useHead({title:'Admin Orders | CampusCart'})
const loading=ref(true),error=ref(''),orders=ref<DemoOrder[]>([])
async function load(){loading.value=true;error.value='';try{orders.value=await adminOrders()}catch{error.value='Unable to load orders.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section><h1 class="text-3xl font-black text-campus-emerald">Order Management</h1><p class="mt-3 text-sm text-gray-600">In-memory campus pickup orders. Open an order to manage its approved status transitions.</p>
 <div v-if="loading" role="status" class="mt-8 rounded-xl bg-campus-sage p-7">Loading…</div>
 <p v-else-if="error" role="alert" class="mt-8 rounded-xl bg-red-50 p-6 text-red-800">{{error}} <button type="button" class="font-bold underline" @click="load">Retry</button></p>
 <p v-else-if="!orders.length" class="mt-8 rounded-xl bg-campus-sage p-8">No orders recorded yet.</p>
 <div v-else class="mt-8 overflow-x-auto rounded-xl border"><table class="min-w-full text-left text-sm"><thead class="bg-campus-sage"><tr><th scope="col" class="p-3">Order</th><th scope="col" class="p-3">Customer ID</th><th scope="col" class="p-3">Total</th><th scope="col" class="p-3">Status</th><th scope="col" class="p-3">Details</th></tr></thead><tbody><tr v-for="o in orders" :key="o.order_id" class="border-t"><td class="p-3 font-bold">{{o.order_number}}</td><td class="p-3">{{o.user_id}}</td><td class="p-3">{{formatPrice(o.total_amount)}}</td><td class="p-3">{{o.order_status}}</td><td class="p-3"><NuxtLink :to="`/admin/orders/${o.order_id}`" class="font-bold text-campus-green underline">Manage</NuxtLink></td></tr></tbody></table></div>
 </section></template>
