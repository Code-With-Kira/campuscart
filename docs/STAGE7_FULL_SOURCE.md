# CampusCart Stage 7 Final — Source Reference

Files are relative to the existing project root `campuscart/`. Complete source below accompanies the ZIP. Existing unchanged files remain in the project archive. No database schema files were added or modified.


## `app/pages/admin/orders/[order_id].vue`

```vue
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

```

## `app/services/orders.ts`

```typescript
import type { ApiResponse } from '~/types/catalog'
import type { DemoOrder, OrderDetail, PlaceOrderBody } from '~/types/orders'
const api='/api/v1'
async function unwrap<T>(url:string,opts?:Parameters<typeof $fetch>[1]):Promise<T>{
  const response=await $fetch<ApiResponse<T>>(url,opts)
  if(!response.success) throw new Error(response.message || 'Demo request failed')
  return response.data
}
export const placeDemoOrder=(body:PlaceOrderBody)=>unwrap<OrderDetail>(`${api}/orders`,{method:'POST',body})
export const myDemoOrders=()=>unwrap<DemoOrder[]>(`${api}/me/orders`)
export const myDemoOrder=(id:number)=>unwrap<OrderDetail>(`${api}/me/orders/${id}`)

```

## `app/types/orders.ts`

```typescript
// Stage 7 demonstration contracts. Field names mirror the approved ERD.
// Enums and numeric history mapping below are approved for MOCK use only.
export type OrderStatus = 'PENDING' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED'
export type PaymentStatus = 'UNPAID' | 'PAID'
export type PaymentMethod = 'CASH_ON_PICKUP'
export type MovementType = 'ORDER_DEDUCTION' | 'ORDER_RESTORATION' // mock enum labels pending final SQL mapping
export interface DemoOrder {
  order_id: number; user_id: number; order_number: string
  subtotal: string; shipping_fee: string; total_amount: string
  order_status: OrderStatus; placed_at: string; created_at: string; updated_at: string
}
export interface DemoOrderItem {
  order_item_id: number; order_id: number; product_id: number
  product_name: string; quantity: number; unit_price: string; subtotal: string
}
export interface DemoOrderAddress {
  order_address_id: number; order_id: number; recipient_name: string
  phone_number: string; barangay: string; city: string
}
export interface DemoPayment {
  payment_id: number; order_id: number; payment_method: PaymentMethod
  payment_status: PaymentStatus; amount: string; payment_reference: string | null
  paid_at: string | null; created_at: string
}
export interface DemoStatusHistory {
  status_history_id: number; order_id: number; changed_by: number
  status: number // ERD is INT: mock mapping 1=PENDING, 2=READY_FOR_PICKUP, 3=COMPLETED, 4=CANCELLED
  remarks: string; created_at: string
}
export interface DemoInventoryMovement {
  movement_id: number; product_id: number; order_id: number | null
  created_by: number; movement_type: MovementType; quantity_change: number
  notes: string; created_at: string
}
export interface OrderDetail {
  order: DemoOrder
  items: DemoOrderItem[]
  order_address: DemoOrderAddress
  payment: DemoPayment
  history: DemoStatusHistory[]
}
export interface PlaceOrderBody {
  address_id: number
  payment_method: PaymentMethod
  items: { product_id: number; quantity: number }[]
  request_id: string // transport-only idempotency token; NOT a database column
}

```

## `scripts/verify-stage7-complete.mjs`

```javascript
// Structural checks for approved Stage 7 checkout and admin order implementation.
import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
const root=path.resolve(import.meta.dirname,'..')
const read=(p)=>fs.readFileSync(path.join(root,p),'utf8')
let ok=0
function test(label,condition){assert.ok(condition,label); console.log(`PASS ${String(++ok).padStart(2,'0')} ${label}`)}
const routes={
 customerCreate:'server/api/v1/orders/index.post.ts',
 customerList:'server/api/v1/me/orders/index.get.ts',
 customerDetail:'server/api/v1/me/orders/[order_id].get.ts',
 adminList:'server/api/v1/admin/orders/index.get.ts',
 adminDetail:'server/api/v1/admin/orders/[order_id].get.ts',
 adminStatus:'server/api/v1/admin/orders/[order_id]/status.patch.ts',
 adminPayments:'server/api/v1/admin/payments/index.get.ts',
 adminInventory:'server/api/v1/admin/inventory/index.get.ts',
}
for(const [name,route] of Object.entries(routes)) {
 test(`${name} route exists`,fs.existsSync(path.join(root,route)))
 test(`${name} route enforces role`,/require(Customer|Admin)\(event\)/.test(read(route)))
}
const mock=read('server/utils/mockOrders.ts')
test('Approved shipping fee zero',mock.includes("shipping_fee:'0.00'"))
test('Cash on pickup only',mock.includes("payment_method !== 'CASH_ON_PICKUP'"))
test('Idempotency request keyed by user',mock.includes('`${userId}:${request.request_id}`'))
test('Idempotency rejects payload mismatch',mock.includes('replay.fingerprint !== fingerprint'))
test('Stock validated before any mutation',mock.indexOf('for (const line of validLines)')>mock.indexOf('Insufficient stock for'))
test('Placed order reduces available product stock',mock.includes('line.product.stock_quantity -= line.quantity'))
test('Cancel restores stock',mock.includes('product.stock_quantity+=item.quantity'))
test('Completion marks simulated payment paid',mock.includes("payment.payment_status='PAID'"))
test('Records product name/price snapshots',mock.includes('unit_price:asMoney(line.price)')&&mock.includes('product_name:line.product.product_name'))
test('Order saves approved address snapshot only',mock.includes('orderAddresses.push')&&!mock.includes('street_address'))
test('ERD numeric history mapping explicit',mock.includes('PENDING: 1, READY_FOR_PICKUP: 2, COMPLETED: 3, CANCELLED: 4'))
test('No direct order DB integration',!mock.includes('prisma')&&!mock.includes('postgres'))
test('Terminal statuses reject further transitions',mock.includes('COMPLETED:[],CANCELLED:[]'))
const checkout=read('app/pages/checkout.vue')
test('Checkout uses cart and saved addresses',checkout.includes('useCartStore')&&checkout.includes('getDemoAddresses'))
test('Checkout calls centralized order service',checkout.includes('placeDemoOrder(')&&checkout.includes('from \'~/services/orders\''))
test('Checkout clears only on success',checkout.indexOf('cart.finalizeDemoPurchase(')>checkout.indexOf('await placeDemoOrder('))
test('Frontend disables repeated clicking while pending',checkout.includes(':disabled="!canPlace"')&&checkout.includes('placing.value=true'))
test('Customer order history and detail screens connected',read('app/pages/orders/index.vue').includes('myDemoOrders')&&read('app/pages/orders/[order_id].vue').includes('myDemoOrder'))
test('Admin order actions linked to status API',read('app/pages/admin/orders/[order_id].vue').includes('adminUpdateOrderStatus'))
test('Admin inventory exposes movement history',read('app/pages/admin/inventory/index.vue').includes('snapshot.movements'))
test('Admin payment screens show status',read('app/pages/admin/payments/index.vue').includes('pay.payment_status'))
test('Cart checkout finalization cannot undo purchased items',read('app/stores/cart.ts').includes('function finalizeDemoPurchase')&&read('app/stores/cart.ts').includes('lastRemoved.value = null'))
test('No payment gateway endpoint added',!fs.existsSync(path.join(root,'server/api/v1/payments/index.post.ts')))
console.log(`\n${ok} Stage 7 final structural checks passed.`)

```

## `scripts/verify-stage7-transactions.mjs`

```javascript
// Stage 7 unit tests for mock checkout transactional logic.
// Uses TypeScript's own transpiler to exercise the pure server-memory module
// without starting Nuxt. Run `node scripts/verify-stage7-transactions.mjs`.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import vm from 'node:vm'
const require = createRequire(import.meta.url)
let ts
try { ts = require('typescript') }
catch { ts = require(path.resolve(path.dirname(process.execPath), '../lib/node_modules/typescript')) }
const root = path.resolve(import.meta.dirname,'..')
const get = p => fs.readFileSync(path.join(root,p),'utf8')
let counter=0
function check(label,fn){fn();console.log(`PASS ${String(++counter).padStart(2,'0')} ${label}`)}
// Fake simple dependencies only; the production module itself is unmodified.
const products=[
  {product_id:101,product_name:'Notebook',price:'129.00',stock_quantity:5,status:'ACTIVE',updated_at:''},
  {product_id:201,product_name:'Mouse',price:'499.00',stock_quantity:2,status:'ACTIVE',updated_at:''},
]
const address={address_id:7,user_id:17,recipient_name:'Test Student',phone_number:'09123456789',barangay:'Ampayon',city:'Butuan'}
const mockAccounts={requireAddress:(userId,addrId)=>{
  if(userId!==address.user_id||addrId!==address.address_id){const e=new Error('Address not found');e.statusCode=404;throw e}
  return address
}}
const original=get('server/utils/mockOrders.ts')
const transpiled=ts.transpileModule(original,{fileName:'mockOrders.ts',reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}})
assert.equal(transpiled.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0)
const mod={exports:{}}
vm.runInNewContext(transpiled.outputText,{
  module:mod,exports:mod.exports,require:(id)=>{
    if(id==='h3')return {createError:(v)=>{const e=new Error(v.statusMessage);e.statusCode=v.statusCode;return e}}
    if(id==='./mockCatalog')return {mockProducts:products}
    if(id==='./mockAccounts')return mockAccounts
    throw Error(`Unexpected dependency ${id}`)
  },console,Date,Map,Set},{filename:'server/utils/mockOrders.ts'})
const m=mod.exports
const place=(id='REQUEST-ABCD123456789',items=[{product_id:101,quantity:2}])=>m.placeDemoOrder(17,{address_id:7,payment_method:'CASH_ON_PICKUP',request_id:id,items})
check('Placement snapshots order, items, contact and unpaid cash',()=>{
 const x=place()
 assert.equal(x.order.subtotal,'258.00')
 assert.equal(x.order.shipping_fee,'0.00')
 assert.equal(x.order.total_amount,'258.00')
 assert.equal(x.order.order_status,'PENDING')
 assert.equal(x.payment.payment_status,'UNPAID')
 assert.equal(x.order_address.recipient_name,'Test Student')
 assert.equal(x.items[0].unit_price,'129.00')
 assert.equal(x.history[0].status,1)
 assert.equal(products[0].stock_quantity,3)
})
check('Idempotent replay returns original order and does not double-deduct',()=>{
 const x=place()
 assert.equal(x.order.order_id,1)
 assert.equal(m.listAllOrders().length,1)
 assert.equal(products[0].stock_quantity,3)
 assert.equal(m.listMovements().length,1)
})
check('Same request ID with altered cart is rejected',()=>assert.throws(()=>place('REQUEST-ABCD123456789',[{product_id:101,quantity:1}]),e=>e.statusCode===409))
check('Another customer cannot access order or pickup contact',()=>assert.throws(()=>m.getOrderDetail(1,18),e=>e.statusCode===404))
check('Fake address owned by another user is rejected',()=>assert.throws(()=>m.placeDemoOrder(18,{address_id:7,payment_method:'CASH_ON_PICKUP',request_id:'REQUEST-WRONGOWNER',items:[{product_id:101,quantity:1}]}),e=>e.statusCode===404))
check('Invalid method and duplicate products rejected',()=>{
 assert.throws(()=>m.placeDemoOrder(17,{address_id:7,payment_method:'CARD',request_id:'REQUEST-BADMETHOD',items:[{product_id:101,quantity:1}]}),e=>e.statusCode===422)
 assert.throws(()=>place('REQUEST-DUPLICATES',[{product_id:101,quantity:1},{product_id:101,quantity:1}]),e=>e.statusCode===422)
})
check('Stock shortfall rejects all lines without partial changes',()=>{
 const count=m.listAllOrders().length
 assert.throws(()=>place('REQUEST-STOCKFAIL',[{product_id:101,quantity:1},{product_id:201,quantity:3}]),e=>e.statusCode===409)
 assert.equal(m.listAllOrders().length,count)
 assert.equal(products[0].stock_quantity,3)
 assert.equal(products[1].stock_quantity,2)
})
check('Price and quantity snapshots survive subsequent product edits',()=>{
 products[0].price='999.00'
 const x=m.getOrderDetail(1,17)
 assert.equal(x.items[0].unit_price,'129.00')
 assert.equal(x.order.total_amount,'258.00')
})
check('Valid ready transition records numeric history code 2',()=>{
 const x=m.updateDemoOrderStatus(1,99,'READY_FOR_PICKUP')
 assert.equal(x.order.order_status,'READY_FOR_PICKUP')
 assert.equal(x.history.at(-1).status,2)
 assert.equal(x.payment.payment_status,'UNPAID')
})
check('Payment switches to PAID only on completed pickup',()=>{
 const x=m.updateDemoOrderStatus(1,99,'COMPLETED')
 assert.equal(x.payment.payment_status,'PAID')
 assert.ok(x.payment.paid_at)
 assert.equal(x.order.order_status,'COMPLETED')
 assert.equal(products[0].stock_quantity,3)
})
check('Completed orders cannot be cancelled or completed twice',()=>{
 assert.throws(()=>m.updateDemoOrderStatus(1,99,'CANCELLED'),e=>e.statusCode===409)
 assert.throws(()=>m.updateDemoOrderStatus(1,99,'COMPLETED'),e=>e.statusCode===409)
})
check('Cancellation restores stock exactly once and logs movement',()=>{
 const x=place('REQUEST-CANCEL1234567',[{product_id:201,quantity:1}])
 assert.equal(products[1].stock_quantity,1)
 const id=x.order.order_id
 const y=m.updateDemoOrderStatus(id,99,'CANCELLED')
 assert.equal(y.payment.payment_status,'UNPAID')
 assert.equal(products[1].stock_quantity,2)
 assert.equal(m.listMovements().filter(r=>r.order_id===id).length,2)
 assert.throws(()=>m.updateDemoOrderStatus(id,99,'CANCELLED'),e=>e.statusCode===409)
 assert.equal(products[1].stock_quantity,2)
})
check('Invalid transition and invalid price never create an order',()=>{
 assert.throws(()=>m.updateDemoOrderStatus(999,99,'COMPLETED'),e=>e.statusCode===404)
 products[1].price='abc'
 assert.throws(()=>place('REQUEST-BADPRICE123',[{product_id:201,quantity:1}]),e=>e.statusCode===422)
 assert.equal(m.listAllOrders().length,2)
})
console.log(`\n${counter} Stage 7 transactional unit tests passed.`)

```

## `server/api/v1/admin/orders/[order_id].get.ts`

```typescript
import { requireAdmin,parsedAddressId } from '../../../../utils/mockAccounts'
import { getOrderDetail } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return {success:true,data:getOrderDetail(parsedAddressId(getRouterParam(event,'order_id'))),message:'Demo order detail'}
})

```

## `server/api/v1/admin/orders/[order_id]/status.patch.ts`

```typescript
import { requireAdmin,parsedAddressId } from '../../../../../utils/mockAccounts'
import { updateDemoOrderStatus } from '../../../../../utils/mockOrders'
export default defineEventHandler(async event => {
  const admin=requireAdmin(event)
  const body=await readBody(event)
  const updated=updateDemoOrderStatus(parsedAddressId(getRouterParam(event,'order_id')),admin.user_id,body?.order_status)
  return {success:true,data:updated,message:'Demo order status updated'}
})

```

## `server/api/v1/me/orders/[order_id].get.ts`

```typescript
import { requireCustomer, parsedAddressId } from '../../../../utils/mockAccounts'
import { getOrderDetail } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  const user=requireCustomer(event)
  return {success:true,data:getOrderDetail(parsedAddressId(getRouterParam(event,'order_id')),user.user_id),message:'Your demo order details'}
})

```

## `server/api/v1/orders/index.post.ts`

```typescript
import { requireCustomer } from '../../../utils/mockAccounts'
import { placeDemoOrder } from '../../../utils/mockOrders'
export default defineEventHandler(async event => {
  const user = requireCustomer(event)
  const order = placeDemoOrder(user.user_id, await readBody(event))
  return { success: true, data: order, message: 'Demo campus pickup order placed' }
})

```

## `server/utils/mockOrders.ts`

```typescript
// Demo server-memory orders. Process restarts erase records; no real payment or PostgreSQL.
import { createError } from 'h3'
import type { Product } from '../../app/types/catalog'
import type { PlaceOrderBody, DemoOrder, DemoOrderItem, DemoOrderAddress, DemoPayment, DemoStatusHistory, DemoInventoryMovement, OrderStatus, OrderDetail } from '../../app/types/orders'
import { mockProducts } from './mockCatalog'
import { requireAddress } from './mockAccounts'

const orders: DemoOrder[] = []
const orderItems: DemoOrderItem[] = []
const orderAddresses: DemoOrderAddress[] = []
const payments: DemoPayment[] = []
const histories: DemoStatusHistory[] = []
const movements: DemoInventoryMovement[] = []
const requests = new Map<string, { fingerprint: string; order_id: number }>()
const historyCodes: Record<OrderStatus, number> = { PENDING: 1, READY_FOR_PICKUP: 2, COMPLETED: 3, CANCELLED: 4 }
let nextOrderId = 1, nextItemId = 1, nextPaymentId = 1, nextHistoryId = 1, nextMovementId = 1
const err = (statusCode: number, statusMessage: string): never => { throw createError({ statusCode, statusMessage }) }
function asMoney(cents: number): string { return `${Math.floor(cents / 100)}.${String(cents % 100).padStart(2,'0')}` }
function priceCents(value: string): number {
  if (!/^\d{1,10}\.\d{2}$/.test(value)) err(422, 'Invalid mock product price')
  const [whole, fractional] = value.split('.')
  const cents = Number(whole) * 100 + Number(fractional)
  if (!Number.isSafeInteger(cents) || cents < 0) err(422, 'Invalid product price')
  return cents
}
function validBody(input: unknown): PlaceOrderBody {
  if (!input || typeof input !== 'object' || Array.isArray(input)) err(422, 'Invalid checkout request')
  const value = input as Record<string, unknown>
  if (!Number.isSafeInteger(value.address_id) || Number(value.address_id) <= 0) err(422,'Choose a saved pickup contact')
  if (value.payment_method !== 'CASH_ON_PICKUP') err(422, 'Only demo Cash on Pickup is supported')
  if (typeof value.request_id !== 'string' || !/^[a-zA-Z0-9-]{16,100}$/.test(value.request_id)) err(422,'Invalid checkout request ID')
  if (!Array.isArray(value.items) || value.items.length === 0 || value.items.length > 40) err(422,'Cart must have 1–40 products')
  const seen = new Set<number>()
  const items = value.items.map((item): {product_id:number;quantity:number} => {
    if (!item || typeof item !== 'object') err(422,'Invalid cart product')
    const row = item as Record<string,unknown>
    if (!Number.isSafeInteger(row.product_id) || Number(row.product_id) <= 0 ||
      !Number.isSafeInteger(row.quantity) || Number(row.quantity) < 1 || Number(row.quantity) > 99 || seen.has(Number(row.product_id))) err(422,'Invalid or duplicate cart item')
    seen.add(Number(row.product_id))
    return { product_id: Number(row.product_id), quantity: Number(row.quantity) }
  })
  return { address_id: Number(value.address_id), payment_method: 'CASH_ON_PICKUP', request_id: value.request_id, items }
}
export function listCustomerOrders(userId: number): DemoOrder[] { return orders.filter(o=>o.user_id===userId).slice().reverse() }
export function listAllOrders(): DemoOrder[] { return orders.slice().reverse() }
export function listPayments(): DemoPayment[] { return payments.slice().reverse() }
export function listMovements(): DemoInventoryMovement[] { return movements.slice().reverse() }
export function getOrderDetail(orderId: number, userId?: number): OrderDetail {
  const order = orders.find(o=>o.order_id===orderId)
  if (!order || (userId !== undefined && order.user_id !== userId)) err(404,'Order not found')
  const order_address = orderAddresses.find(a=>a.order_id===orderId)
  const payment = payments.find(p=>p.order_id===orderId)
  if (!order_address || !payment) err(500,'Order snapshot incomplete')
  return { order, items: orderItems.filter(i=>i.order_id===orderId), order_address, payment,
    history: histories.filter(h=>h.order_id===orderId).sort((a,b)=>a.status_history_id-b.status_history_id) }
}
function logHistory(orderId: number, status: OrderStatus, changedBy: number, remarks: string) {
  histories.push({ status_history_id: nextHistoryId++, order_id:orderId, changed_by:changedBy,
    status: historyCodes[status], remarks, created_at:new Date().toISOString() })
}
function stockMovement(product: Product, orderId: number, changedBy: number, quantityChange: number) {
  movements.push({ movement_id: nextMovementId++, product_id:product.product_id, order_id:orderId,
    created_by:changedBy, movement_type: quantityChange<0?'ORDER_DEDUCTION':'ORDER_RESTORATION',
    quantity_change:quantityChange, notes:quantityChange<0?'Demo order placed':'Demo order cancelled',
    created_at:new Date().toISOString() })
}
// The synchronous validate-then-commit block has no await. It is only atomic within ONE Node process.
export function placeDemoOrder(userId: number, input: unknown): OrderDetail {
  const request = validBody(input)
  const fingerprint = JSON.stringify({ address_id:request.address_id, payment_method:request.payment_method, items:request.items })
  const key = `${userId}:${request.request_id}`
  const replay = requests.get(key)
  if (replay) {
    if (replay.fingerprint !== fingerprint) err(409,'Checkout request ID was used with different cart details')
    return getOrderDetail(replay.order_id, userId)
  }
  const address = requireAddress(userId,request.address_id) // verifies ownership
  let subtotal = 0
  const validLines = request.items.map(item => {
    const product = mockProducts.find(p=>p.product_id===item.product_id)
    if (!product || product.status!=='ACTIVE') err(409,`Product ${item.product_id} is unavailable`)
    if (product.stock_quantity < item.quantity) err(409,`Insufficient stock for ${product.product_name}`)
    const price = priceCents(product.price)
    const lineCents = price * item.quantity
    if (!Number.isSafeInteger(lineCents)) err(422,'Order amount is too large')
    subtotal += lineCents
    return {product,quantity:item.quantity,price,lineCents}
  })
  if (!Number.isSafeInteger(subtotal) || subtotal > 999999999999) err(422,'Order amount is too large')
  const now = new Date().toISOString(), id = nextOrderId++
  const order: DemoOrder = { order_id:id, user_id:userId, order_number:`CC-DEMO-${String(id).padStart(5,'0')}`,
    subtotal:asMoney(subtotal), shipping_fee:'0.00', total_amount:asMoney(subtotal), order_status:'PENDING',
    placed_at:now, created_at:now, updated_at:now }
  // All validation above succeeds before modifying products or appending records.
  orders.push(order)
  orderAddresses.push({ order_address_id:id, order_id:id, recipient_name:address.recipient_name,
    phone_number:address.phone_number, barangay:address.barangay, city:address.city })
  payments.push({ payment_id:nextPaymentId++,order_id:id,payment_method:'CASH_ON_PICKUP',
    payment_status:'UNPAID',amount:asMoney(subtotal),payment_reference:null,paid_at:null,created_at:now })
  for (const line of validLines) {
    line.product.stock_quantity -= line.quantity
    line.product.updated_at = now
    orderItems.push({ order_item_id:nextItemId++,order_id:id,product_id:line.product.product_id,
      product_name:line.product.product_name,quantity:line.quantity,unit_price:asMoney(line.price),subtotal:asMoney(line.lineCents) })
    stockMovement(line.product,id,userId,-line.quantity)
  }
  logHistory(id,'PENDING',userId,'Order placed for campus pickup (demo)')
  requests.set(key,{fingerprint,order_id:id})
  return getOrderDetail(id,userId)
}
const transitions: Record<OrderStatus,OrderStatus[]> = {
  PENDING:['READY_FOR_PICKUP','CANCELLED'],
  READY_FOR_PICKUP:['COMPLETED','CANCELLED'],
  COMPLETED:[],CANCELLED:[],
}
export function updateDemoOrderStatus(orderId: number, adminId: number, desired: unknown): OrderDetail {
  const order = orders.find(o=>o.order_id===orderId)
  if (!order) err(404,'Demo order not found')
  if (typeof desired !== 'string' || !transitions[order.order_status].includes(desired as OrderStatus)) err(409,'Invalid order status transition')
  const next = desired as OrderStatus
  if (next==='CANCELLED') {
    const lines = orderItems.filter(i=>i.order_id===orderId)
    // Refuse partial restock before making any changes.
    for (const item of lines) {
      const product = mockProducts.find(p=>p.product_id===item.product_id)
      if (!product || !Number.isSafeInteger(product.stock_quantity+item.quantity)) err(409,'Cannot restore stock')
    }
    for (const item of lines) {
      const product = mockProducts.find(p=>p.product_id===item.product_id)!
      product.stock_quantity+=item.quantity
      product.updated_at=new Date().toISOString()
      stockMovement(product,orderId,adminId,item.quantity)
    }
  }
  if (next==='COMPLETED') {
    const payment = payments.find(p=>p.order_id===orderId)!
    payment.payment_status='PAID' // simulated cash handover, not gateway processing
    payment.paid_at=new Date().toISOString()
    payment.payment_reference=`DEMO-CASH-${order.order_number}`
  }
  order.order_status=next
  order.updated_at=new Date().toISOString()
  logHistory(orderId,next,adminId,next==='COMPLETED'?'Demo Cash on Pickup marked received':next==='CANCELLED'?'Demo order cancelled; stock restored':'Ready for campus pickup')
  return getOrderDetail(orderId)
}
export function orderStats() {
  return { total:orders.length,pending:orders.filter(o=>o.order_status==='PENDING').length,
    ready:orders.filter(o=>o.order_status==='READY_FOR_PICKUP').length,
    completed:orders.filter(o=>o.order_status==='COMPLETED').length,
    cancelled:orders.filter(o=>o.order_status==='CANCELLED').length,
    lowStock:mockProducts.filter(p=>p.stock_quantity<=5).length }
}

```

## `app/components/cart/CartSummary.vue`

```vue
<script setup lang="ts">
import { formatCentavos } from '~/utils/money'

defineProps<{
  distinctItems: number
  totalQuantity: number
  subtotalCentavos: number
  hasStockIssues: boolean
  stockVerified: boolean
}>()
</script>

<template>
  <aside class="h-fit rounded-2xl border border-gray-200 bg-campus-sage p-6 lg:sticky lg:top-6" aria-labelledby="cart-summary-title">
    <h2 id="cart-summary-title" class="text-xl font-extrabold text-campus-emerald">Cart Summary</h2>
    <dl class="mt-6 space-y-4 text-sm">
      <div class="flex items-center justify-between gap-3">
        <dt class="text-gray-700">Different products</dt><dd class="font-semibold">{{ distinctItems }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-gray-700">Total quantity</dt><dd class="font-semibold">{{ totalQuantity }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3 border-t border-gray-200 pt-5">
        <dt class="font-bold text-campus-emerald">Items subtotal</dt>
        <dd class="text-xl font-extrabold text-campus-emerald">{{ formatCentavos(subtotalCentavos) }}</dd>
      </div>
      <div class="flex items-center justify-between gap-3">
        <dt class="text-gray-700">Shipping fee</dt><dd class="text-right font-medium text-gray-700">Not calculated</dd>
      </div>
    </dl>
    <div v-if="hasStockIssues" class="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      Review the unavailable or over-limit items before demo checkout.
    </div>
    <div v-else-if="!stockVerified" class="mt-5 rounded-lg border border-amber-200 bg-white p-3 text-sm text-amber-900">
      Stock and prices have not been refreshed from the demo API.
    </div>
    <p class="mt-5 rounded-lg bg-white p-4 text-xs leading-6 text-gray-700">
      This demo cart shows the items subtotal. Approved campus pickup has ₱0.00 shipping; the demo checkout recalculates current prices and stock on the server. No real payment is processed.
    </p>
    <NuxtLink v-if="stockVerified && !hasStockIssues && totalQuantity > 0" to="/checkout" class="mt-5 flex min-h-12 items-center justify-center rounded-xl border-2 border-campus-emerald bg-white px-5 text-sm font-bold text-campus-emerald hover:bg-campus-sage">
      Proceed to Checkout (Demo) →
    </NuxtLink>
    <NuxtLink to="/products" class="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-campus-emerald px-5 text-sm font-bold text-white hover:bg-campus-green focus-visible:outline-campus-gold">
      Continue Shopping →
    </NuxtLink>
    <p class="mt-3 text-center text-xs leading-5 text-gray-600">Place a demo-only order for campus pickup; Cash on Pickup remains simulated.</p>
  </aside>
</template>

```

## `app/pages/admin/index.vue`

```vue
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

```

## `app/pages/admin/inventory/index.vue`

```vue
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

```

## `app/pages/admin/orders/index.vue`

```vue
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

```

## `app/pages/admin/payments/index.vue`

```vue
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

```

## `app/pages/checkout.vue`

```vue
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
            <img :src="productImage(line.item.product_id)" alt="" class="h-20 w-20 shrink-0 rounded-lg bg-campus-sage object-contain">
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

```

## `app/pages/orders/[order_id].vue`

```vue
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

```

## `app/pages/orders/index.vue`

```vue
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

```

## `app/services/account.ts`

```typescript
import type { AccountResponse, AddressDraft, CampusAddress, PublicAccount } from '~/types/account'
import type { DemoOrder } from '~/types/orders'

const PREFIX = '/api/v1'
const unwrap = <T>(response: AccountResponse<T>): T => {
  if (!response.success) throw new Error(response.message || 'Demo request failed.')
  return response.data
}

// These are temporary Nuxt server-memory handlers, not a production identity API.
export async function getDemoSession() {
  return unwrap(await $fetch<AccountResponse<PublicAccount | null>>(`${PREFIX}/auth/me`))
}
export async function loginDemoAccount(email: string, password: string) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/auth/login`, {
    method: 'POST', body: { email, password },
  }))
}
export async function registerDemoAccount(body: { first_name: string; last_name: string; email: string; password: string }) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/auth/register`, { method: 'POST', body }))
}
export async function enterDemoPersona(role: 'CUSTOMER' | 'ADMIN') {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/auth/demo`, { method: 'POST', body: { role } }))
}
export async function logoutDemoAccount() {
  return unwrap(await $fetch<AccountResponse<null>>(`${PREFIX}/auth/logout`, { method: 'POST' }))
}
export async function updateDemoProfile(body: { first_name: string; last_name: string; email: string }) {
  return unwrap(await $fetch<AccountResponse<PublicAccount>>(`${PREFIX}/me/profile`, { method: 'PATCH', body }))
}
export async function getDemoAddresses() {
  return unwrap(await $fetch<AccountResponse<CampusAddress[]>>(`${PREFIX}/me/addresses`))
}
export async function createDemoAddress(body: AddressDraft) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(`${PREFIX}/me/addresses`, { method: 'POST', body }))
}
export async function updateDemoAddress(addressId: number, body: AddressDraft) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(`${PREFIX}/me/addresses/${addressId}`, { method: 'PATCH', body }))
}
export async function deleteDemoAddress(addressId: number) {
  return unwrap(await $fetch<AccountResponse<null>>(`${PREFIX}/me/addresses/${addressId}`, { method: 'DELETE' }))
}
export async function makeDefaultDemoAddress(addressId: number) {
  return unwrap(await $fetch<AccountResponse<CampusAddress>>(`${PREFIX}/me/addresses/${addressId}/default`, { method: 'PATCH' }))
}
export async function getDemoOrders(): Promise<DemoOrder[]> {
  return unwrap(await $fetch<AccountResponse<DemoOrder[]>>(`${PREFIX}/me/orders`))
}

```

## `app/services/admin.ts`

```typescript
import type { Product, Category } from '~/types/catalog'
import type { AdminEnvelope, CategoryDraft, DemoInventoryView, DemoSummary, NewProductDraft, ProductDraft } from '~/types/admin'
import type { DemoOrder, DemoPayment, OrderDetail, OrderStatus } from '~/types/orders'
const root = '/api/v1/admin'
async function request<T>(path:string,options?:Parameters<typeof $fetch>[1]):Promise<T>{
  const response=await $fetch<AdminEnvelope<T>>(`${root}${path}`,options)
  if(!response.success)throw new Error(response.message||'Demo request failed')
  return response.data
}
export const adminSummary=()=>request<DemoSummary>('/dashboard/summary')
export const adminProducts=()=>request<Product[]>('/products')
export const adminCreateProduct=(body:NewProductDraft)=>request<Product>('/products',{method:'POST',body})
export const adminUpdateProduct=(id:number,body:ProductDraft)=>request<Product>(`/products/${id}`,{method:'PATCH',body})
export const adminCategories=()=>request<Category[]>('/categories')
export const adminCreateCategory=(body:CategoryDraft)=>request<Category>('/categories',{method:'POST',body})
export const adminUpdateCategory=(id:number,body:CategoryDraft)=>request<Category>(`/categories/${id}`,{method:'PATCH',body})
export const adminInventory=()=>request<DemoInventoryView>('/inventory')
export const adminOrders=()=>request<DemoOrder[]>('/orders')
export const adminOrder=(id:number)=>request<OrderDetail>(`/orders/${id}`)
export const adminUpdateOrderStatus=(id:number,order_status:OrderStatus)=>request<OrderDetail>(`/orders/${id}/status`,{method:'PATCH',body:{order_status}})
export const adminPayments=()=>request<DemoPayment[]>('/payments')

```

## `app/stores/cart.ts`

```typescript
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Product } from '~/types/catalog'
import { pesosToCentavos } from '~/utils/money'

// Frontend-only snapshot of product fields in the approved ERD.
// No cart_item_id is invented: real cart_item_id comes from the future backend.
import { MAX_DEMO_LINES, MAX_DEMO_QUANTITY, isPermittedQuantity, sanitizeDemoCart } from '~/utils/cartValidation'
import type { DemoCartItem } from '~/utils/cartValidation'

export const useCartStore = defineStore('cart', () => {
  const items = ref<DemoCartItem[]>([])
  const lastRemoved = ref<DemoCartItem | null>(null)
  // Set on the client after hydration. Prevents SSR/client mismatches on refresh.
  const isRestored = ref(false)

  const distinctItems = computed(() => items.value.length)
  const totalQuantity = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))
  const subtotalCentavos = computed(() => items.value.reduce(
    (sum, item) => sum + pesosToCentavos(item.price) * item.quantity, 0,
  ))
  const hasStockIssues = computed(() => items.value.some(item =>
    item.status !== 'ACTIVE' || item.stock_quantity < item.quantity,
  ))

  function addProduct(product: Product, quantity = 1): boolean {
    if (!isPermittedQuantity(quantity, product.stock_quantity) || product.status !== 'ACTIVE') return false
    const existing = items.value.find(item => item.product_id === product.product_id)
    if (existing) {
      if (existing.quantity + quantity > product.stock_quantity) return false
      if (existing.quantity + quantity > MAX_DEMO_QUANTITY) return false
      existing.quantity += quantity
      existing.price = product.price
      existing.product_name = product.product_name
      existing.stock_quantity = product.stock_quantity
      existing.status = product.status
      return true
    }
    if (items.value.length >= MAX_DEMO_LINES) return false
    items.value.push({
      product_id: product.product_id,
      product_name: product.product_name,
      price: product.price,
      stock_quantity: product.stock_quantity,
      status: product.status,
      quantity,
    })
    return true
  }

  // Reject invalid edits rather than silently clamping quantities.
  // The dedicated Remove button avoids accidental removal when pressing minus at 1.
  function setQuantity(productId: number, next: number): boolean {
    const item = items.value.find(entry => entry.product_id === productId)
    if (!item || item.status !== 'ACTIVE' || !isPermittedQuantity(next, item.stock_quantity)) return false
    item.quantity = next
    return true
  }

  function removeProduct(productId: number): boolean {
    const found = items.value.find(item => item.product_id === productId)
    if (!found) return false
    lastRemoved.value = { ...found }
    items.value = items.value.filter(item => item.product_id !== productId)
    return true
  }

  function undoRemove(): boolean {
    const old = lastRemoved.value
    if (!old || old.status !== 'ACTIVE' || old.quantity > old.stock_quantity) return false
    const existing = items.value.find(item => item.product_id === old.product_id)
    if (existing) {
      if (existing.quantity + old.quantity > existing.stock_quantity) return false
      existing.quantity += old.quantity
    } else {
      if (items.value.length >= MAX_DEMO_LINES) return false
      items.value.push({ ...old })
    }
    lastRemoved.value = null
    return true
  }

  // Called only after the server confirms a placed order. Unlike ordinary
  // removal, purchased items must NOT be eligible for Undo Remove.
  function finalizeDemoPurchase(purchased: Array<{product_id: number; quantity: number}>): void {
    const byId = new Map(purchased.map(line => [line.product_id, line.quantity]))
    items.value = items.value.flatMap(item => {
      const bought = byId.get(item.product_id) ?? 0
      if (bought <= 0) return [item]
      return item.quantity > bought ? [{ ...item, quantity: item.quantity - bought }] : []
    })
    lastRemoved.value = null
  }

  function clearCart(): void {
    items.value = []
    lastRemoved.value = null
  }

  // Trust only the shape of this demo snapshot; the actual order backend must
  // never trust browser storage for price, stock, identity, or authorization.
  function restoreFromSession(payload: unknown): void {
    const restored = sanitizeDemoCart(payload)
    if (!restored) return
    items.value = restored
    lastRemoved.value = null
  }

  function markRestored(): void {
    isRestored.value = true
  }

  // Refresh demo snapshots from the API without deleting unavailable items.
  // Customers can inspect and remove those items explicitly.
  function reconcileWithProducts(products: Product[]): void {
    const byId = new Map(products.map(product => [product.product_id, product]))
    items.value = items.value.map(item => {
      const product = byId.get(item.product_id)
      return product
        ? {
            ...item,
            product_name: product.product_name,
            price: product.price,
            stock_quantity: product.stock_quantity,
            status: product.status,
          }
        : { ...item, status: 'INACTIVE' as const, stock_quantity: 0 }
    })
  }

  return {
    items, lastRemoved, isRestored, distinctItems, totalQuantity,
    subtotalCentavos, hasStockIssues,
    addProduct, setQuantity, removeProduct, undoRemove, clearCart, finalizeDemoPurchase,
    restoreFromSession, markRestored, reconcileWithProducts,
  }
})

```

## `app/types/admin.ts`

```typescript
// Stage 7 admin view models, not changes to the database ERD.
import type { Product, Category, ApiResponse } from './catalog'
import type { DemoInventoryMovement } from './orders'
export type ProductDraft = Pick<Product, 'sku' | 'product_name' | 'category_id' | 'price' | 'description'>
export type NewProductDraft = ProductDraft & Pick<Product, 'stock_quantity'>
export type CategoryDraft = Pick<Category, 'category_name' | 'description'>
export interface DemoSummary {
  total_products:number; available_products:number; total_stock_units:number; total_categories:number
  total_orders:number; pending_orders:number; ready_orders:number; completed_orders:number
  cancelled_orders:number; low_stock_products:number
}
export interface DemoInventoryRow { product_id:number; sku:string; product_name:string; stock_quantity:number }
export interface DemoInventoryView { products:DemoInventoryRow[]; movements:DemoInventoryMovement[] }
export type AdminEnvelope<T> = ApiResponse<T>

```

## `scripts/verify-stage5.mjs`

```javascript
// Stage 5 dependency-free source & cart-rule checks. Requires Node >=22.12.
// This does NOT replace a Nuxt typecheck, production build, or browser tests.
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import assert from 'node:assert/strict'
import {
  MAX_DEMO_QUANTITY,
  isPermittedQuantity,
  sanitizeDemoCart,
  validDemoItem,
} from '../app/utils/cartValidation.ts'

const root = process.cwd()
const read = (path) => {
  const file = resolve(root, path)
  assert.ok(existsSync(file), `Missing: ${path}`)
  return readFileSync(file, 'utf8')
}
let checked = 0
function check(label, action) {
  action()
  checked++
  console.log(`PASS ${String(checked).padStart(2, '0')} ${label}`)
}

const sample = {
  product_id: 201,
  product_name: 'Wireless Study Mouse',
  price: '499.00',
  stock_quantity: 21,
  status: 'ACTIVE',
  quantity: 2,
}
const envelope = (items) => ({ version: 1, items })

check('Demo cart record accepts valid ERD-aligned fields', () => assert.equal(validDemoItem(sample), true))
check('Price must be a decimal string with two places', () => assert.equal(validDemoItem({ ...sample, price: '499' }), false))
check('Invalid product IDs are rejected', () => assert.equal(validDemoItem({ ...sample, product_id: -1 }), false))
check('Zero quantities are rejected', () => assert.equal(validDemoItem({ ...sample, quantity: 0 }), false))
check('Fractional quantities are rejected', () => assert.equal(validDemoItem({ ...sample, quantity: 1.5 }), false))
check('Invalid provisional status is rejected', () => assert.equal(validDemoItem({ ...sample, status: 'PAID' }), false))
check('Negative stock is rejected', () => assert.equal(validDemoItem({ ...sample, stock_quantity: -1 }), false))
check('Permitted quantity accepts an in-stock integer', () => assert.equal(isPermittedQuantity(3, 3), true))
check('Quantity above available stock is rejected', () => assert.equal(isPermittedQuantity(4, 3), false))
check('Quantity 0 is rejected', () => assert.equal(isPermittedQuantity(0, 3), false))
check('Fractional or non-finite quantity is rejected', () => {
  assert.equal(isPermittedQuantity(1.5, 3), false)
  assert.equal(isPermittedQuantity(Infinity, 3), false)
})
check('Maximum quantity bound is enforced', () => assert.equal(isPermittedQuantity(MAX_DEMO_QUANTITY + 1, 2000), false))
check('Valid storage envelope restores product', () => assert.deepEqual(sanitizeDemoCart(envelope([sample])), [sample]))
check('Duplicate product entries cannot be restored twice', () => assert.equal(sanitizeDemoCart(envelope([sample, sample]))?.length, 1))
check('Malformed and invalid entries are removed', () => assert.deepEqual(sanitizeDemoCart(envelope([null, { ...sample, price: 'oops' }, sample])), [sample]))
check('Wrong storage version is safely ignored', () => assert.equal(sanitizeDemoCart({ version: 2, items: [sample] }), null))
check('Oversized stored payload is safely ignored', () => assert.equal(sanitizeDemoCart(envelope(Array(61).fill(sample))), null))
check('Corrupted storage shape is safely ignored', () => assert.equal(sanitizeDemoCart('corrupt'), null))

const cart = read('app/stores/cart.ts')
const page = read('app/pages/cart.vue')
const item = read('app/components/cart/CartItem.vue')
const summary = read('app/components/cart/CartSummary.vue')
const plugin = read('app/plugins/cart-persistence.client.ts')
const pkg = JSON.parse(read('package.json'))
check('Original Pinia store is extended, not replaced with another store', () => {
  assert.ok(cart.includes("defineStore('cart'") && cart.includes('addProduct') && cart.includes('setQuantity'))
})
check('Cart rejects excess stock rather than partially adding products', () => assert.ok(cart.includes('existing.quantity + quantity > product.stock_quantity')))
check('Cart supports remove, undo, and clearing all items', () => assert.ok(['removeProduct', 'undoRemove', 'clearCart'].every(name => cart.includes(`function ${name}`))))
check('Client-only persistence waits for mount', () => assert.ok(plugin.includes("app:mounted") && plugin.includes('sessionStorage')))
check('Stored data is validated before state restoration', () => assert.ok(cart.includes('sanitizeDemoCart(payload)')))
check('Cart checks the existing product API via centralized service', () => assert.ok(page.includes('fetchProducts') && page.includes('reconcileWithProducts')))
check('Cart API error state offers a real retry button', () => assert.ok(page.includes('Retry stock check') && page.includes('refresh()')))
check('Cart shows a purposeful empty state', () => assert.ok(page.includes('Your demo cart is empty.')))
check('Cart uses reusable item and summary components', () => assert.ok(page.includes("import CartItem from '~/components/cart/CartItem.vue'") && page.includes("import CartSummary from '~/components/cart/CartSummary.vue'") && page.includes('<CartItem') && page.includes('<CartSummary')))
check('Cart uses a confirmation before clearing all items', () => assert.ok(page.includes('showClearConfirmation') && page.includes('Yes, Clear Cart')))
check('Item entry validates numeric inputs and stock', () => assert.ok(item.includes('validationError') && item.includes('item.stock_quantity')))
check('Item has explicit accessible remove action', () => assert.ok(item.includes('Remove ${item.product_name} from cart')))
check('Line subtotal uses integer centavos', () => assert.ok(item.includes('pesosToCentavos(props.item.price) * props.item.quantity')))
check('Summary links to approved demo checkout and indicates no real payment', () => assert.ok(summary.includes('Proceed to Checkout (Demo)') && summary.includes('₱0.00 shipping') && summary.includes('No real payment')))
check('Stage 4 Vue Router 5 dependency fix is preserved', () => assert.ok(pkg.dependencies['vue-router']?.startsWith('^5.')))
check('Stage 4 endpoints and original pages remain present', () => {
  assert.ok(read('server/api/v1/products.get.ts').includes('mockProducts'))
  assert.ok(read('app/pages/index.vue').includes('HomeProductSection'))
  assert.ok(read('app/pages/products/index.vue').includes('CatalogFilters'))
})
console.log(`\n${checked} Stage 5 source/data checks passed. Run Nuxt typecheck, build, and browser checks separately.`)

```

## `scripts/verify-stage6.mjs`

```javascript
// Structural and shared-validation checks for Stage 6. Not a Nuxt build or browser test.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import { validateRegistration, validateAddress, validateEmail, validateNames } from '../app/utils/accountValidation.ts'
const read = (file) => fs.readFileSync(file, 'utf8')
const file = (path) => assert.ok(fs.existsSync(path), `Missing ${path}`)
let done = 0
function check(label, fn) { fn(); console.log(`PASS ${String(++done).padStart(2, '0')} ${label}`) }
const registration = {first_name:'Alex',last_name:'Student',email:'demo.student@example.test',password:'temporaryDemoPass123',confirm_password:'temporaryDemoPass123'}
const address = {address_label:'Dorm',recipient_name:'Alex Student',phone_number:'0912 000 0000',barangay:'Mock Barangay',city:'Demo City',is_default:true}
check('Valid fictional registration passes shared form checks',()=>assert.deepEqual(validateRegistration(registration),{}))
check('Invalid email fails validation',()=>assert.ok(validateEmail('no-at-sign')))
check('Blank first name is rejected',()=>assert.ok(validateNames('', 'Student').first_name))
check('Short demo password is rejected',()=>assert.ok(validateRegistration({...registration,password:'123'}).password))
check('Password mismatch is rejected',()=>assert.ok(validateRegistration({...registration,confirm_password:'bad'}).confirm_password))
check('Email length is limited',()=>assert.ok(validateEmail('a'.repeat(254)+'@example.test')))
check('Valid ERD-based address draft passes',()=>assert.deepEqual(validateAddress(address),{}))
check('Missing barangay fails',()=>assert.ok(validateAddress({...address,barangay:''}).barangay))
check('Missing city fails',()=>assert.ok(validateAddress({...address,city:''}).city))
check('Invalid demo phone fails',()=>assert.ok(validateAddress({...address,phone_number:'abc'}).phone_number))
check('Overlong address label fails',()=>assert.ok(validateAddress({...address,address_label:'x'.repeat(51)}).address_label))
for(const path of ['app/pages/login.vue','app/pages/register.vue','app/pages/profile/index.vue','app/pages/profile/addresses.vue','app/pages/orders/index.vue','app/pages/orders/[order_id].vue','app/stores/auth.ts','app/middleware/customer.ts','app/middleware/admin.ts','app/plugins/auth-session.client.ts','app/services/account.ts','app/types/account.ts','server/utils/mockAccounts.ts']){
  check(`Stage 6 source exists: ${path}`,()=>file(path))
}
const server = read('server/utils/mockAccounts.ts')
check('Mock sessions are opaque and HttpOnly',()=>assert.ok(server.includes('randomBytes(32)')&&server.includes('httpOnly: true')&&server.includes("sameSite: 'strict'")))
check('Passwords are hashed only on the server',()=>assert.ok(server.includes('scryptSync')&&server.includes('timingSafeEqual')&&!read('app/stores/auth.ts').includes('password_hash')))
check('Server strips hash from account response',()=>assert.ok(server.includes('function publicly')&&!server.split('function publicly')[1].split('function newUser')[0].includes('password_hash')))
check('Registration does not accept client role',()=>assert.ok(server.includes("'CUSTOMER', password")))
check('Development shortcut disabled outside development',()=>assert.ok(server.includes("process.env.NODE_ENV !== 'development'")))
check('Server enforces customer role for me routes',()=>assert.ok(server.includes('function requireCustomer')&&server.includes('account.role !== \'CUSTOMER\'')))
check('Addresses checked against user ID',()=>assert.ok(server.includes('address.user_id === userId')))
check('One default address per user handled',()=>assert.ok(server.includes('clearDefault(userId)')))
check('One account owns at most ten demo addresses',()=>assert.ok(server.includes('existing.length >= 10')))
check('Temporary sessions are stored in server memory',()=>assert.ok(server.includes('new Map<string, StoredSession>')))
check('Address fields match the approved ERD',()=>assert.ok(['address_label','recipient_name','phone_number','barangay','city','is_default'].every(x=>server.includes(x))))
check('Customer orders now use authenticated demo order records',()=>assert.ok(read('server/api/v1/me/orders/index.get.ts').includes('listCustomerOrders') && read('server/api/v1/me/orders/index.get.ts').includes('requireCustomer(event)')))
check('Customer and admin routes use middleware',()=>assert.ok(read('app/pages/profile/index.vue').includes("middleware: 'customer'")&&read('app/pages/admin/index.vue').match(/middleware:\s*'admin'/)))
check('Nav dynamically reflects demo login',()=>assert.ok(read('app/components/layout/SiteHeader.vue').includes('useAuthStore')))
check('Stage 5 cart component fixes preserved',()=>assert.ok(read('app/pages/cart.vue').includes('<CartItem')&&read('app/pages/cart.vue').includes('<CartSummary')))
check('Duplicate DemoCartItem store re-export removed',()=>assert.ok(!read('app/stores/cart.ts').includes("export type { DemoCartItem }")))
check('Stage 5 verifier updated for explicit imports',()=>assert.ok(read('scripts/verify-stage5.mjs').includes("import CartItem from")))
check('Original Nuxt and Tailwind config retained',()=>assert.ok(read('nuxt.config.ts').includes("'@pinia/nuxt'")&&read('nuxt.config.ts').includes('tailwindcss()')))
for(const path of ['server/api/v1/auth/login.post.ts','server/api/v1/auth/register.post.ts','server/api/v1/auth/me.get.ts','server/api/v1/auth/logout.post.ts','server/api/v1/auth/demo.post.ts','server/api/v1/me/profile.patch.ts','server/api/v1/me/addresses/index.get.ts','server/api/v1/me/addresses/index.post.ts','server/api/v1/me/addresses/[address_id].patch.ts','server/api/v1/me/addresses/[address_id].delete.ts','server/api/v1/me/addresses/[address_id]/default.patch.ts','server/api/v1/me/orders/index.get.ts'])check(`Mock API handler exists: ${path}`,()=>file(path))
console.log(`\n${done} Stage 6 structural/validation checks passed. Run Nuxt typecheck, build, API and browser tests on your laptop.`)

```

## `scripts/verify-stage7.mjs`

```javascript
// Stage 7 source/data invariant checks. These are NOT a replacement for Nuxt typecheck/build/browser tests.
import fs from 'node:fs'
import assert from 'node:assert/strict'
import path from 'node:path'
const root = path.resolve(import.meta.dirname, '..')
const read = f => fs.readFileSync(path.join(root, f), 'utf8')
let passed = 0
function check(name, operation) {
  operation()
  console.log(`PASS ${String(++passed).padStart(2, '0')} ${name}`)
}
const config = read('nuxt.config.ts')
const pkg = JSON.parse(read('package.json'))
check('Original Nuxt/Pinia config preserved', () => assert.ok(config.includes("'@pinia/nuxt'") && pkg.dependencies['nuxt']))
check('Tailwind plugin and design tokens preserved', () => assert.ok(config.includes('@tailwindcss/vite') && read('app/assets/css/main.css').includes('--color-campus-emerald')))
check('Stage 6 authentication store remains present', () => assert.ok(read('app/stores/auth.ts').includes("defineStore('auth'")))
check('Stage 5 cart remains an existing Pinia store', () => assert.ok(read('app/stores/cart.ts').includes("defineStore('cart'")))
check('Demo sessions do not expose password hash to customer', () => assert.ok(read('server/utils/mockAccounts.ts').includes('export function publicly')))
check('Admin server-side guard is defined', () => assert.ok(read('server/utils/mockAccounts.ts').includes('export function requireAdmin')))
check('Admin guard checks role ADMIN', () => assert.ok(read('server/utils/mockAccounts.ts').includes("account.role !== 'ADMIN'")))
const protectedPaths = [
  'server/api/v1/admin/dashboard/summary.get.ts',
  'server/api/v1/admin/products/index.get.ts',
  'server/api/v1/admin/products/index.post.ts',
  'server/api/v1/admin/products/[product_id].patch.ts',
  'server/api/v1/admin/categories/index.get.ts',
  'server/api/v1/admin/categories/index.post.ts',
  'server/api/v1/admin/categories/[category_id].patch.ts',
  'server/api/v1/admin/inventory/index.get.ts',
  'server/api/v1/admin/orders/index.get.ts',
  'server/api/v1/admin/payments/index.get.ts',
]
for (const p of protectedPaths) check(`Protected admin endpoint ${path.basename(p)}`, () => assert.ok(read(p).includes('requireAdmin(event)')))
check('Only existing mock catalog arrays are mutated', () => assert.ok(read('server/utils/adminCatalog.ts').includes('mockProducts.push') && read('server/utils/adminCatalog.ts').includes('mockCategories.push')))
check('Products retain ERD field names', () => assert.ok(['product_id','product_name','category_id','sku','description','price','stock_quantity','status'].every(k => read('server/utils/adminCatalog.ts').includes(k))))
check('Product SKU uniqueness checked', () => assert.ok(read('server/utils/adminCatalog.ts').includes('ensureSkuFree')))
check('Category name uniqueness checked', () => assert.ok(read('server/utils/adminCatalog.ts').includes('ensureCategoryNameFree')))
check('Price and stock server-side validation', () => assert.ok(read('server/utils/adminCatalog.ts').includes('nonnegativeStock') && read('server/utils/adminCatalog.ts').includes('function money')))
check('Edit does not change stock or status', () => assert.ok(read('server/utils/adminCatalog.ts').includes('stock_quantity, status, IDs and timestamps CANNOT')))
check('New products have temporary ACTIVE mock status only', () => assert.ok(read('server/utils/adminCatalog.ts').includes("status: 'ACTIVE'")))
check('Admin data API centralized service exists', () => assert.ok(read('app/services/admin.ts').includes('/api/v1/admin')))
for (const page of ['index.vue','products/index.vue','categories/index.vue','inventory/index.vue','orders/index.vue','payments/index.vue']) {
  check(`Admin page protected: ${page}`, () => assert.ok(read(`app/pages/admin/${page}`).match(/middleware:\s*'admin'/)))
}
check('Admin navigation has all specified routes', () => assert.ok(['/admin/products','/admin/categories','/admin/inventory','/admin/orders','/admin/payments'].every(s => read('app/layouts/admin.vue').includes(s))))
check('Dashboard avoids unapproved financial metrics', () => assert.ok(read('app/pages/admin/index.vue').includes('low_stock_products') && !read('server/api/v1/admin/dashboard/summary.get.ts').includes('sales_total')))
check('Product management supports create and edit', () => assert.ok(['adminCreateProduct','adminUpdateProduct'].every(s => read('app/pages/admin/products/index.vue').includes(s))))
check('Product management controls stock edits', () => assert.ok(read('app/pages/admin/products/index.vue').includes(':disabled="editingId !== null"')))
check('Category management supports create and edit', () => assert.ok(['adminCreateCategory','adminUpdateCategory'].every(s => read('app/pages/admin/categories/index.vue').includes(s))))
check('Inventory API provides approved order movements', () => assert.ok(read('server/api/v1/admin/inventory/index.get.ts').includes('listMovements()')))
check('Admin API returns actual demo order records', () => assert.ok(read('server/api/v1/admin/orders/index.get.ts').includes('listAllOrders()')))
check('Admin API returns actual demo payments', () => assert.ok(read('server/api/v1/admin/payments/index.get.ts').includes('listPayments()')))
check('Checkout uses existing cart and customer auth', () => assert.ok(read('app/pages/checkout.vue').includes('useCartStore') && read('app/pages/checkout.vue').match(/middleware:\s*'customer'/)))
check('Checkout refreshes authoritative product fields via catalog service', () => assert.ok(read('app/pages/checkout.vue').includes('fetchProductById')))
check('Checkout reuses existing address API', () => assert.ok(read('app/pages/checkout.vue').includes('getDemoAddresses')))
check('Checkout allows approved demo order placement', () => assert.ok(read('app/pages/checkout.vue').includes('placeDemoOrder') && read('app/pages/checkout.vue').includes('Cash on Pickup')))
check('Shipping and order totals use approved zero fee', () => assert.ok(read('app/pages/checkout.vue').includes('₱0.00') && read('app/pages/checkout.vue').includes('stockReady')))
check('Demo cart navigates to checkout', () => assert.ok(read('app/components/cart/CartSummary.vue').includes('Proceed to Checkout (Demo)')))
check('Demo order placement exists without real payment gateway', () => assert.ok(fs.existsSync(path.join(root,'server/api/v1/orders/index.post.ts')) && !fs.existsSync(path.join(root,'server/api/v1/payments/index.post.ts'))))
console.log(`\n${passed} Stage 7 structural and integration checks passed. Run Nuxt typecheck/build and browser tests separately.`)

```

## `server/api/v1/admin/dashboard/summary.get.ts`

```typescript
import { requireAdmin } from '../../../../utils/mockAccounts'
import { mockCategories, mockProducts } from '../../../../utils/mockCatalog'
import { orderStats } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  const stats=orderStats()
  return {success:true,data:{
    total_products:mockProducts.length,
    available_products:mockProducts.filter(p=>p.status==='ACTIVE'&&p.stock_quantity>0).length,
    total_stock_units:mockProducts.reduce((sum,p)=>sum+p.stock_quantity,0),
    total_categories:mockCategories.length,
    total_orders:stats.total,
    pending_orders:stats.pending,
    ready_orders:stats.ready,
    completed_orders:stats.completed,
    cancelled_orders:stats.cancelled,
    low_stock_products:stats.lowStock,
  },message:'Demo inventory and order summary'}
})

```

## `server/api/v1/admin/inventory/index.get.ts`

```typescript
import { requireAdmin } from '../../../../utils/mockAccounts'
import { mockProducts } from '../../../../utils/mockCatalog'
import { listMovements } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success:true,data: {
    products:mockProducts.map(({product_id,sku,product_name,stock_quantity})=>({product_id,sku,product_name,stock_quantity})),
    movements:listMovements(),
  },message:'Demo stock and movement history' }
})

```

## `server/api/v1/admin/orders/index.get.ts`

```typescript
import { requireAdmin } from '../../../../utils/mockAccounts'
import { listAllOrders } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success:true,data:listAllOrders(),message:'All demo orders' }
})

```

## `server/api/v1/admin/payments/index.get.ts`

```typescript
import { requireAdmin } from '../../../../utils/mockAccounts'
import { listPayments } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  requireAdmin(event)
  return { success:true,data:listPayments(),message:'Demo payment records (no gateway)' }
})

```

## `server/api/v1/me/orders/index.get.ts`

```typescript
import { requireCustomer } from '../../../../utils/mockAccounts'
import { listCustomerOrders } from '../../../../utils/mockOrders'
export default defineEventHandler(event => {
  const user=requireCustomer(event)
  return { success:true,data:listCustomerOrders(user.user_id),message:'Your demo orders' }
})

```
