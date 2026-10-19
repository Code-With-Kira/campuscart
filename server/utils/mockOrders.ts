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
function err(statusCode: number, statusMessage: string): never { throw createError({ statusCode, statusMessage }) }
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
