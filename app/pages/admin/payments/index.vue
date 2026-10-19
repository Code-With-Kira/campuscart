<script setup lang="ts">
import { onMounted,ref } from 'vue'
import { adminPayments } from '~/services/admin'
import type { DemoPayment } from '~/types/orders'
import { formatPrice } from '~/utils/money'
definePageMeta({layout:'admin',middleware:'admin'})
useHead({title:'Admin Payments | CampusCart'})
const payments=ref<DemoPayment[]>([]),loading=ref(true),error=ref('')
async function load(){loading.value=true;error.value='';try{payments.value=await adminPayments()}catch{error.value='Cannot load demo payment records.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section><h1 class="text-3xl font-black text-campus-emerald">Payment Management</h1><p class="mt-3 text-sm text-gray-600">Cash on Pickup simulation only. Initially UNPAID; marked PAID when an admin completes pickup. No real payments are processed.</p>
 <p v-if="loading" class="mt-8" role="status">Loading payments…</p><p v-else-if="error" class="mt-8 text-red-800" role="alert">{{error}} <button class="font-bold underline" @click="load">Retry</button></p><p v-else-if="!payments.length" class="mt-8 rounded-xl bg-campus-sage p-8">No payment records yet.</p>
 <div v-else class="mt-8 overflow-x-auto rounded-xl border"><table class="min-w-full text-left text-sm"><thead class="bg-campus-sage"><tr><th scope="col" class="p-3">Order</th><th scope="col" class="p-3">Method</th><th scope="col" class="p-3">Status</th><th scope="col" class="p-3">Amount</th><th scope="col" class="p-3">Details</th></tr></thead><tbody><tr v-for="pay in payments" :key="pay.payment_id" class="border-t"><td class="p-3">#{{pay.order_id}}</td><td class="p-3">{{pay.payment_method}}</td><td class="p-3 font-bold">{{pay.payment_status}}</td><td class="p-3">{{formatPrice(pay.amount)}}</td><td class="p-3"><NuxtLink :to="`/admin/orders/${pay.order_id}`" class="font-bold text-campus-green underline">View order</NuxtLink></td></tr></tbody></table></div>
</section></template>
