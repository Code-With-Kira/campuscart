<script setup lang="ts">
import { computed,onMounted,ref } from 'vue'
import { adminInventory } from '~/services/admin'
import type { DemoInventoryView } from '~/types/admin'
definePageMeta({layout:'admin',middleware:'admin'})
useHead({title:'Admin Inventory | CampusCart'})
const loading=ref(true),error=ref(''),search=ref(''),snapshot=ref<DemoInventoryView|null>(null)
const rows=computed(()=>(snapshot.value?.products??[]).filter(p=>`${p.sku} ${p.product_name}`.toLowerCase().includes(search.value.toLowerCase())))
const totalUnits=computed(()=>(snapshot.value?.products??[]).reduce((sum,p)=>sum+p.stock_quantity,0))
async function load(){loading.value=true;error.value='';try{snapshot.value=await adminInventory()}catch{error.value='Unable to load inventory.'}finally{loading.value=false}}
onMounted(load)
</script>
<template><section><h1 class="text-3xl font-black text-campus-emerald">Inventory Management</h1><p class="mt-3 text-sm text-gray-600">Stock is deducted when a demo order is placed and restored on cancellation. Low stock means 5 or fewer units. Manual adjustments remain disabled.</p>
 <p v-if="loading" role="status" class="mt-8 rounded-xl bg-campus-sage p-7">Loading inventory…</p><p v-else-if="error" role="alert" class="mt-8 rounded-xl bg-red-50 p-6 text-red-800">{{error}} <button class="font-bold underline" @click="load">Retry</button></p>
 <template v-else-if="snapshot"><div class="mt-7 grid gap-4 sm:grid-cols-3"><div class="rounded-xl bg-campus-sage p-5"><p class="text-sm">Products</p><p class="text-3xl font-black text-campus-emerald">{{snapshot.products.length}}</p></div><div class="rounded-xl bg-campus-sage p-5"><p class="text-sm">Total stock units</p><p class="text-3xl font-black text-campus-emerald">{{totalUnits}}</p></div><div class="rounded-xl bg-campus-sage p-5"><p class="text-sm">Movement records</p><p class="text-3xl font-black text-campus-emerald">{{snapshot.movements.length}}</p></div></div>
 <label for="stock-search" class="mb-2 mt-8 block text-sm font-bold">Find product</label><input id="stock-search" v-model.trim="search" placeholder="Search SKU or name" class="mb-4 w-full rounded-lg border p-3">
 <div class="overflow-x-auto rounded-xl border"><table class="min-w-full text-left text-sm"><thead class="bg-campus-sage"><tr><th scope="col" class="p-3">SKU</th><th scope="col" class="p-3">Product</th><th scope="col" class="p-3">Units</th><th scope="col" class="p-3">Stock level</th></tr></thead><tbody><tr v-for="r in rows" :key="r.product_id" class="border-t"><td class="p-3">{{r.sku}}</td><td class="p-3 font-bold">{{r.product_name}}</td><td class="p-3">{{r.stock_quantity}}</td><td class="p-3">{{r.stock_quantity<=5?'Low stock':'Available'}}</td></tr></tbody></table></div>
 <h2 class="mt-10 text-xl font-extrabold text-campus-emerald">Inventory Movement History</h2><p v-if="!snapshot.movements.length" class="mt-4 rounded-xl bg-campus-sage p-5">No orders have changed stock yet.</p>
 <div v-else class="mt-4 overflow-x-auto rounded-xl border"><table class="min-w-full text-left text-sm"><thead class="bg-campus-sage"><tr><th scope="col" class="p-3">Date</th><th scope="col" class="p-3">Product ID</th><th scope="col" class="p-3">Order</th><th scope="col" class="p-3">Type</th><th scope="col" class="p-3">Units</th><th scope="col" class="p-3">User</th></tr></thead><tbody><tr v-for="m in snapshot.movements" :key="m.movement_id" class="border-t"><td class="p-3">{{new Date(m.created_at).toLocaleString()}}</td><td class="p-3">{{m.product_id}}</td><td class="p-3">{{m.order_id}}</td><td class="p-3">{{m.movement_type}}</td><td class="p-3 font-bold">{{m.quantity_change>0?'+':''}}{{m.quantity_change}}</td><td class="p-3">{{m.created_by}}</td></tr></tbody></table></div>
 </template></section></template>
