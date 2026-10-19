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
