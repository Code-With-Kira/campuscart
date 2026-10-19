<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getDemoAddresses } from '~/services/account'
import { fetchProductById } from '~/services/catalog'
import { placeDemoOrder } from '~/services/orders'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import type { CampusAddress } from '~/types/account'
import type { Product } from '~/types/catalog'
import { formatCentavos, formatPrice, pesosToCentavos } from '~/utils/money'
import { productImage } from '~/utils/productMedia'

definePageMeta({middleware:'customer'})
useHead({title:'Campus Pickup Checkout | CampusCart'})
const cart=useCartStore(),auth=useAuthStore()
const addresses=ref<CampusAddress[]>([])
const chosenId=ref<number|null>(null)
const prices=ref<Record<number,Product>>({})
const loading=ref(true),placing=ref(false),error=ref(''),feedback=ref('')
const lines=computed(()=>cart.items.map(item=>({item,product:prices.value[item.product_id]})))
const stockReady=computed(()=>cart.isRestored && !loading.value && !error.value && cart.items.length>0 &&
  lines.value.every(({item,product})=>Boolean(product && product.status==='ACTIVE' && product.stock_quantity>=item.quantity && item.quantity>=1)))
const subtotal=computed(()=>stockReady.value?lines.value.reduce((sum,{item,product})=>sum+pesosToCentavos(product!.price)*item.quantity,0):null)
const selected=computed(()=>addresses.value.find(a=>a.address_id===chosenId.value)??null)
const canPlace=computed(()=>stockReady.value && !!selected.value && !placing.value)
// Keep request identity stable after network failures to prevent duplicate order submission.
let pendingKey:string|null=null
let pendingFingerprint:string|null=null
async function refreshReview(){
  if(!cart.isRestored)return
  loading.value=true;error.value='';feedback.value=''
  try{
    await auth.ensureSession()
    if(!auth.isCustomer)throw new Error('Customer login required')
    const products=await Promise.all(cart.items.map(i=>fetchProductById(i.product_id).catch(()=>null)))
    prices.value=Object.fromEntries(products.filter((p):p is Product=>p!==null).map(p=>[p.product_id,p]))
    addresses.value=await getDemoAddresses()
    if(!addresses.value.some(a=>a.address_id===chosenId.value))chosenId.value=addresses.value.find(a=>a.is_default)?.address_id??addresses.value[0]?.address_id??null
  }catch(e){error.value='Unable to refresh checkout. Check your session or connection and retry.'}
  finally{loading.value=false}
}
async function place(){
  if(!canPlace.value||chosenId.value===null||placing.value)return
  const purchased=cart.items.map(i=>({product_id:i.product_id,quantity:i.quantity}))
  const body={address_id:chosenId.value,payment_method:'CASH_ON_PICKUP' as const,items:purchased}
  const fingerprint=JSON.stringify(body)
  if(fingerprint!==pendingFingerprint){pendingKey=crypto.randomUUID();pendingFingerprint=fingerprint}
  placing.value=true;error.value='';feedback.value=''
  try{
    const result=await placeDemoOrder({...body,request_id:pendingKey!})
    // Never clear on failure; purchased items cannot be restored by Undo.
    cart.finalizeDemoPurchase(purchased)
    pendingKey=null;pendingFingerprint=null
    await navigateTo(`/orders/${result.order.order_id}?placed=1`)
  }catch(e){
    const status=(e as {statusCode?:number})?.statusCode
    const message=(e as {data?:{statusMessage?:string}})?.data?.statusMessage || 'Could not place the demo order. Your cart remains unchanged.'
    if(status===409){
      pendingKey=null;pendingFingerprint=null
      await refreshReview()
    }
    error.value=message
  }finally{placing.value=false}
}
onMounted(async()=>{await auth.ensureSession();if(cart.isRestored)await refreshReview()})
watch(()=>cart.isRestored,restored=>{if(restored)void refreshReview()})
</script>
<template>
  <section class="cc-container py-10 sm:py-14">
    <NuxtLink to="/cart" class="text-sm font-bold text-campus-green hover:underline">← Back to Cart</NuxtLink>
    <p class="mt-6 text-xs font-bold uppercase tracking-widest text-campus-green">Customer · Demo-only campus pickup</p>
    <h1 class="mt-2 text-3xl font-black text-campus-emerald sm:text-4xl">Checkout</h1>
    <p class="mt-3 max-w-3xl text-sm leading-7 text-gray-600">Campus pickup only · Shipping ₱0.00 · Cash on Pickup (simulated). No real money is collected and no actual pickup site is promised. Demo records disappear on server restart.</p>
    <div v-if="!cart.isRestored||loading" class="mt-8 rounded-xl bg-campus-sage p-8" role="status">Checking current prices, stock and pickup contact…</div>
    <div v-else-if="!cart.items.length" class="mt-8 rounded-xl bg-campus-sage p-8"><h2 class="font-bold text-campus-emerald">Your cart is empty.</h2><NuxtLink to="/products" class="mt-3 inline-block font-bold text-campus-green underline">Browse products</NuxtLink></div>
    <div v-else class="mt-8 grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div class="space-y-6">
        <section class="rounded-2xl border border-gray-200 p-5 sm:p-7"><h2 class="text-xl font-extrabold text-campus-emerald">Items to purchase</h2>
          <ul class="mt-4 divide-y divide-gray-100"><li v-for="line in lines" :key="line.item.product_id" class="flex gap-4 py-4">
            <CommonMediaImage :src="productImage(line.product ?? line.item.product_id)" :fallback="productImage(line.item.product_id)" alt="" :width="80" :height="80" class="h-20 w-20 shrink-0 rounded-lg bg-campus-sage object-contain" />
            <div><p class="font-bold text-campus-emerald">{{ line.product?.product_name||line.item.product_name }}</p><p class="mt-1 text-sm text-gray-600">Quantity {{ line.item.quantity }} · {{ line.product?formatPrice(line.product.price):'Unavailable' }} each</p>
              <p v-if="line.product" class="mt-2 font-bold">{{ formatCentavos(pesosToCentavos(line.product.price)*line.item.quantity) }}</p>
              <p v-if="!line.product||line.product.status!=='ACTIVE'||line.product.stock_quantity<line.item.quantity" class="mt-2 text-sm font-bold text-red-700">Insufficient stock or unavailable. Update your cart.</p>
            </div></li></ul>
          <p v-if="!stockReady" role="alert" class="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">Items cannot be ordered until stock is available. <NuxtLink to="/cart" class="font-bold underline">Update Cart</NuxtLink></p>
        </section>
        <section class="rounded-2xl border border-gray-200 p-5 sm:p-7"><h2 class="text-xl font-extrabold text-campus-emerald">Pickup Contact</h2>
          <p class="mt-2 text-sm leading-6 text-gray-600">Choose your saved contact details. The approved order address snapshot fields store your name, phone, barangay and city; they are not a delivery destination or a specified pickup venue.</p>
          <div v-if="!addresses.length" class="mt-5 rounded-lg bg-campus-sage p-5"><p class="font-bold">No saved contact address.</p><NuxtLink to="/profile/addresses" class="mt-2 inline-block text-campus-green font-bold underline">Add a saved address</NuxtLink></div>
          <fieldset v-else class="mt-5 space-y-3"><legend class="sr-only">Pickup contact details</legend>
            <label v-for="a in addresses" :key="a.address_id" class="flex cursor-pointer gap-3 rounded-xl border border-gray-200 p-4 hover:bg-campus-sage"><input v-model.number="chosenId" type="radio" name="pickup_contact" :value="a.address_id" class="mt-1 accent-campus-green"><span class="text-sm"><strong>{{ a.address_label }}</strong><span class="block mt-1">{{ a.recipient_name }} · {{ a.phone_number }}</span><span class="block text-gray-600">{{ a.barangay }}, {{ a.city }}</span></span></label>
          </fieldset>
          <NuxtLink to="/profile/addresses" class="mt-4 inline-block text-sm font-bold text-campus-green underline">Manage saved addresses</NuxtLink>
        </section>
      </div>
      <aside class="h-fit rounded-2xl bg-campus-sage p-6 lg:sticky lg:top-6"><h2 class="text-xl font-extrabold text-campus-emerald">Order Summary</h2>
        <dl class="mt-6 space-y-4 text-sm"><div class="flex justify-between"><dt>Subtotal</dt><dd class="font-bold">{{subtotal===null?'Unavailable':formatCentavos(subtotal)}}</dd></div><div class="flex justify-between"><dt>Campus pickup shipping</dt><dd class="font-bold">₱0.00</dd></div><div class="flex justify-between border-t border-gray-300 pt-4"><dt class="font-extrabold">Total</dt><dd class="font-extrabold">{{subtotal===null?'Unavailable':formatCentavos(subtotal)}}</dd></div></dl>
        <p class="mt-5 rounded-lg bg-white p-4 text-sm text-gray-700">Payment: <strong>Cash on Pickup</strong><span class="block mt-1">Initially UNPAID. Admin marks it PAID only on demo completion.</span></p>
        <p v-if="error" role="alert" class="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{{ error }} <button type="button" :disabled="placing" class="font-bold underline" @click="refreshReview">Refresh</button></p>
        <p v-if="feedback" role="status" class="mt-4 text-sm">{{feedback}}</p>
        <p v-if="!selected" class="mt-4 text-sm font-bold text-amber-800">Choose a saved pickup contact before placing your order.</p>
        <button type="button" :disabled="!canPlace" class="mt-5 min-h-12 w-full rounded-xl bg-campus-emerald px-5 py-3 text-sm font-bold text-white hover:bg-campus-green disabled:cursor-not-allowed disabled:opacity-50" @click="place">{{placing?'Placing order…':'Place Demo Order'}}</button>
        <p class="mt-3 text-xs leading-5 text-gray-600">No actual order fulfillment or payment is provided. Total and stock are validated again on the server.</p>
      </aside>
    </div>
  </section>
</template>
