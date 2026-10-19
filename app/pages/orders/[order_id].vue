<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { myDemoOrder } from '~/services/orders'
import type { OrderDetail } from '~/types/orders'
import { formatPrice } from '~/utils/money'
definePageMeta({middleware:'customer'})
const route=useRoute(),detail=ref<OrderDetail|null>(null),loading=ref(true),error=ref('')
useHead({title:'Order Details | CampusCart'})
const labels:Record<number,string>={1:'PENDING',2:'READY FOR PICKUP',3:'COMPLETED',4:'CANCELLED'}
async function load(){loading.value=true;error.value='';try{detail.value=await myDemoOrder(Number(route.params.order_id))}catch{error.value='This order could not be retrieved. It may not belong to this account.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section class="cc-container py-12"><NuxtLink to="/orders" class="text-sm font-bold text-campus-green hover:underline">← My Orders</NuxtLink>
 <h1 class="mt-7 text-3xl font-black text-campus-emerald">Order Details</h1>
 <p v-if="route.query.placed==='1'" role="status" class="mt-5 rounded-xl bg-campus-sage p-5 font-bold text-campus-emerald">Demo order placed successfully. Cash remains UNPAID until pickup completion.</p>
 <p v-if="loading" role="status" class="mt-7">Loading order…</p><p v-else-if="error" role="alert" class="mt-7 text-red-800">{{error}} <button class="font-bold underline" @click="load">Retry</button></p>
 <div v-else-if="detail" class="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
  <div class="space-y-6">
    <section class="rounded-2xl border border-gray-200 p-6"><h2 class="text-xl font-bold text-campus-emerald">{{detail.order.order_number}}</h2><p class="mt-2 text-sm text-gray-600">{{detail.order.order_status.replaceAll('_',' ')}} · {{new Date(detail.order.placed_at).toLocaleString()}}</p>
      <ul class="mt-4 divide-y divide-gray-100"><li v-for="item in detail.items" :key="item.order_item_id" class="flex flex-wrap justify-between gap-3 py-3 text-sm"><div><strong>{{item.product_name}}</strong><p>{{item.quantity}} × {{formatPrice(item.unit_price)}}</p></div><strong>{{formatPrice(item.subtotal)}}</strong></li></ul>
    </section>
    <section class="rounded-2xl border border-gray-200 p-6"><h2 class="text-xl font-bold text-campus-emerald">Status History</h2><ol class="mt-4 space-y-3"><li v-for="h in detail.history" :key="h.status_history_id" class="rounded-lg bg-campus-sage p-3 text-sm"><strong>{{labels[h.status]||'Unknown'}}</strong> · {{new Date(h.created_at).toLocaleString()}}<p>{{h.remarks}}</p></li></ol></section>
  </div>
  <aside class="rounded-2xl bg-campus-sage p-6 text-sm"><h2 class="text-xl font-bold text-campus-emerald">Campus Pickup</h2><p class="mt-3">{{detail.order_address.recipient_name}} · {{detail.order_address.phone_number}}</p><p class="mt-1">{{detail.order_address.barangay}}, {{detail.order_address.city}}</p><p class="mt-2 text-xs text-gray-600">Contact snapshot only. No actual pickup venue is specified.</p>
    <dl class="mt-6 space-y-3"><div class="flex justify-between"><dt>Subtotal</dt><dd>{{formatPrice(detail.order.subtotal)}}</dd></div><div class="flex justify-between"><dt>Shipping</dt><dd>₱0.00</dd></div><div class="flex justify-between border-t pt-3 font-bold"><dt>Total</dt><dd>{{formatPrice(detail.order.total_amount)}}</dd></div><div class="flex justify-between"><dt>Payment</dt><dd>{{detail.payment.payment_status}}</dd></div></dl><p class="mt-3 text-xs text-gray-600">Simulated {{detail.payment.payment_method.replaceAll('_',' ').toLowerCase()}} only.</p>
  </aside>
 </div>
</section></template>
