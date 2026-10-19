<script setup lang="ts">
import { computed,onMounted,ref } from 'vue'
import { adminOrder,adminUpdateOrderStatus } from '~/services/admin'
import type { OrderDetail,OrderStatus } from '~/types/orders'
import { formatPrice } from '~/utils/money'
definePageMeta({layout:'admin',middleware:'admin'})
useHead({title:'Manage Order | CampusCart'})
const route=useRoute(),detail=ref<OrderDetail|null>(null),loading=ref(true),busy=ref(false),error=ref(''),feedback=ref(''),confirm=ref<OrderStatus|null>(null)
const allowed=computed<OrderStatus[]>(()=>detail.value?.order.order_status==='PENDING'?['READY_FOR_PICKUP','CANCELLED']:detail.value?.order.order_status==='READY_FOR_PICKUP'?['COMPLETED','CANCELLED']:[])
const labels:Record<number,string>={1:'PENDING',2:'READY FOR PICKUP',3:'COMPLETED',4:'CANCELLED'}
async function load(){loading.value=true;error.value='';try{detail.value=await adminOrder(Number(route.params.order_id))}catch{error.value='Unable to retrieve demo order'}finally{loading.value=false}}
async function update(){if(!confirm.value||busy.value||!detail.value)return;busy.value=true;error.value='';feedback.value='';try{detail.value=await adminUpdateOrderStatus(detail.value.order.order_id,confirm.value);feedback.value='Demo order status updated.';confirm.value=null}catch(e){error.value=(e as {data?:{statusMessage?:string}}).data?.statusMessage||'Status update failed. Reload and try again.'}finally{busy.value=false}}
onMounted(load)
</script>
<template><section><NuxtLink to="/admin/orders" class="text-sm font-bold text-campus-green underline">← All Orders</NuxtLink><h1 class="mt-6 text-3xl font-black text-campus-emerald">Manage Order</h1>
 <p v-if="loading" class="mt-7" role="status">Loading…</p><p v-else-if="error" role="alert" class="mt-6 rounded-lg bg-red-50 p-4 text-red-800">{{error}} <button v-if="!busy" class="font-bold underline" @click="load">Retry</button></p>
 <div v-if="detail" class="mt-7 space-y-6"><section class="rounded-xl border p-6"><h2 class="text-xl font-bold text-campus-emerald">{{detail.order.order_number}}</h2><p class="mt-2">Status: <strong>{{detail.order.order_status}}</strong> · Total: <strong>{{formatPrice(detail.order.total_amount)}}</strong></p>
    <p class="mt-3 text-sm">Customer #{{detail.order.user_id}} · Pickup contact: {{detail.order_address.recipient_name}} · {{detail.order_address.phone_number}}</p>
    <p class="mt-1 text-sm text-gray-600">{{detail.order_address.barangay}}, {{detail.order_address.city}}</p>
    <div class="mt-4 rounded-lg bg-campus-sage p-4 text-sm">Payment: <strong>{{detail.payment.payment_status}}</strong> · Cash on Pickup (demo). Marking completed simulates collecting payment.</div>
    <ul class="mt-5 divide-y"><li v-for="item in detail.items" :key="item.order_item_id" class="flex justify-between gap-3 py-3 text-sm"><span>{{item.product_name}} × {{item.quantity}}</span><strong>{{formatPrice(item.subtotal)}}</strong></li></ul>
    <div v-if="allowed.length" class="mt-6"><h3 class="font-bold">Change order status</h3><div class="mt-3 flex flex-wrap gap-2"><button v-for="status in allowed" :key="status" type="button" :disabled="busy" class="rounded-lg border border-campus-emerald px-4 py-2 text-sm font-bold text-campus-emerald hover:bg-campus-sage" @click="confirm=status">{{status.replaceAll('_',' ')}}</button></div></div>
    <p v-else class="mt-4 text-sm text-gray-500">Terminal status — no further changes allowed.</p>
    <div v-if="confirm" class="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4" role="group" aria-label="Confirm status update"><p class="font-bold">Confirm {{confirm.replaceAll('_',' ')}}?</p><p class="mt-2 text-sm">Cancellation restores stock. Completion simulates receipt of pickup cash.</p><div class="mt-3 flex gap-3"><button type="button" :disabled="busy" class="rounded-lg bg-campus-emerald px-4 py-2 font-bold text-white" @click="update">{{busy?'Saving…':'Confirm'}}</button><button type="button" :disabled="busy" class="rounded-lg border px-4 py-2 font-bold" @click="confirm=null">Back</button></div></div>
    <p v-if="feedback" class="mt-4 text-sm font-bold text-campus-green" role="status">{{feedback}}</p>
  </section><section class="rounded-xl border p-6"><h2 class="text-lg font-bold text-campus-emerald">Status history</h2><ol class="mt-4 space-y-3"><li v-for="h in detail.history" :key="h.status_history_id" class="rounded-lg bg-campus-sage p-3 text-sm"><strong>{{labels[h.status]||'Unknown'}}</strong> · {{new Date(h.created_at).toLocaleString()}} · by user {{h.changed_by}}<p>{{h.remarks}}</p></li></ol></section></div>
</section></template>
