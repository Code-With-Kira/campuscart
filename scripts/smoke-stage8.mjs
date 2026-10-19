/**
 * CampusCart Stage 8 live HTTP smoke tests, no external dependencies.
 * Start a fresh `npm run dev` server, then run `node scripts/smoke-stage8.mjs`.
 * IMPORTANT: Creates fictional demo contacts/orders and changes LOCAL in-memory stock.
 * Restart the dev server to reset. Never use against a public or production URL.
 */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'

const base = new URL(process.env.STAGE8_BASE_URL || 'http://localhost:3000')
if (!['localhost', '127.0.0.1'].includes(base.hostname) || base.protocol !== 'http:') {
  throw new Error('Stage 8 smoke tests run only against local HTTP development servers.')
}
const origin = base.origin
let passed = 0
let customerCookie = ''
let adminCookie = ''
const track = async (name, fn) => {
  await fn()
  console.log(`PASS ${String(++passed).padStart(2, '0')} ${name}`)
}
async function api(path, { method = 'GET', body, cookie } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (cookie) headers.Cookie = cookie
  const response = await fetch(`${origin}${path}`, {
    method, headers, redirect: 'manual',
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  })
  const raw = await response.text()
  let data
  try { data = JSON.parse(raw) } catch {
    throw new Error(`${path}: expected JSON, got HTTP ${response.status}: ${raw.slice(0, 150)}`)
  }
  return {
    status: response.status,
    data,
    setCookie: response.headers.get('set-cookie')?.split(';')[0] ?? '',
  }
}
function ok(result, status = 200) {
  assert.equal(result.status, status, JSON.stringify(result.data).slice(0, 250))
  assert.equal(result.data?.success, true)
  return result.data.data
}
const hasStatus = (result, expected) => assert.equal(result.status, expected, JSON.stringify(result.data).slice(0, 250))

async function run() {
  console.log(`CampusCart Stage 8 LIVE smoke tests: ${origin}`)
  console.log('Creates demo records and changes mock stock in this local server session.\n')

  await track('Homepage HTML responds', async () => {
    const res = await fetch(origin)
    assert.equal(res.status, 200)
    assert.match(await res.text(), /CampusCart/i)
  })
  await track('Catalog returns 12 ERD-shaped mock products', async () => {
    const products = ok(await api('/api/v1/products'))
    assert.ok(Array.isArray(products) && products.length >= 12)
    for (const field of ['product_id', 'category_id', 'sku', 'product_name', 'price', 'stock_quantity', 'status']) assert.ok(field in products[0], field)
  })
  await track('Three approved categories are available', async () => {
    const categories = ok(await api('/api/v1/categories'))
    assert.ok(Array.isArray(categories) && categories.length >= 3)
  })
  await track('Catalog filtering and pagination return metadata', async () => {
    const result = await api('/api/v1/products?category_id=2&page=1&page_size=2&sort=price_asc')
    const products = ok(result)
    assert.equal(products.length, 2)
    assert.ok(products.every(p => p.category_id === 2))
    assert.equal(result.data.meta.page_size, 2)
  })
  await track('Invalid price filter is rejected', async () => {
    hasStatus(await api('/api/v1/products?min_price=abc'), 400)
  })
  await track('Invalid product returns 404', async () => {
    hasStatus(await api('/api/v1/products/99999999'), 404)
  })
  await track('Unauthenticated customer orders API rejects requests', async () => {
    hasStatus(await api('/api/v1/me/orders'), 401)
  })
  await track('Unauthenticated admin API rejects requests', async () => {
    hasStatus(await api('/api/v1/admin/orders'), 401)
  })
  await track('Development-only customer persona starts a cookie session', async () => {
    const response = await api('/api/v1/auth/demo', { method: 'POST', body: { role: 'CUSTOMER' } })
    const user = ok(response)
    assert.equal(user.role, 'CUSTOMER')
    assert.ok(!('password_hash' in user))
    assert.match(response.setCookie, /=/)
    customerCookie = response.setCookie
  })
  await track('Customer session resolves without password hashes', async () => {
    const user = ok(await api('/api/v1/auth/me', { cookie: customerCookie }))
    assert.equal(user.role, 'CUSTOMER')
    assert.ok(!('password_hash' in user))
  })
  await track('Customer cannot access admin dashboard API', async () => {
    hasStatus(await api('/api/v1/admin/dashboard/summary', { cookie: customerCookie }), 403)
  })
  await track('Development-only admin persona begins authorized session', async () => {
    const response = await api('/api/v1/auth/demo', { method: 'POST', body: { role: 'ADMIN' } })
    assert.equal(ok(response).role, 'ADMIN')
    adminCookie = response.setCookie
    assert.match(adminCookie, /=/)
  })
  await track('Administrator can view live dashboard stats', async () => {
    const summary = ok(await api('/api/v1/admin/dashboard/summary', { cookie: adminCookie }))
    assert.ok(Number.isInteger(summary.total_products))
    assert.ok(Number.isInteger(summary.total_orders))
  })
  await track('Administrator cannot access customer order list', async () => {
    hasStatus(await api('/api/v1/me/orders', { cookie: adminCookie }), 403)
  })
  let addressId
  await track('Customer creates a fictional campus-pickup contact', async () => {
    const address = ok(await api('/api/v1/me/addresses', {
      method: 'POST', cookie: customerCookie,
      body: { address_label: 'Stage 8 Test', recipient_name: 'Demo Student', phone_number: '09123456789', barangay: 'Ampayon', city: 'Butuan', is_default: true },
    }), 201)
    assert.ok(Number.isInteger(address.address_id))
    addressId = address.address_id
  })
  let firstStock
  await track('Product detail exposes stock before placing order', async () => {
    const product = ok(await api('/api/v1/products/101'))
    firstStock = product.stock_quantity
    assert.ok(firstStock >= 1, 'Test product 101 must have stock. Restart server to reset demo data.')
  })
  let orderId
  const key = `STAGE8-${randomUUID()}`
  const purchase = { address_id: addressId, payment_method: 'CASH_ON_PICKUP', request_id: key, items: [{ product_id: 101, quantity: 1 }] }
  await track('Checkout creates unpaid PENDING order with zero shipping', async () => {
    const result = ok(await api('/api/v1/orders', { method: 'POST', cookie: customerCookie, body: purchase }))
    assert.equal(result.order.order_status, 'PENDING')
    assert.equal(result.order.shipping_fee, '0.00')
    assert.equal(result.payment.payment_status, 'UNPAID')
    assert.equal(result.items[0].quantity, 1)
    assert.equal(result.order_address.recipient_name, 'Demo Student')
    orderId = result.order.order_id
  })
  await track('Duplicate request ID replays order without double stock deduction', async () => {
    const replay = ok(await api('/api/v1/orders', { method: 'POST', cookie: customerCookie, body: purchase }))
    assert.equal(replay.order.order_id, orderId)
    assert.equal(ok(await api('/api/v1/products/101')).stock_quantity, firstStock - 1)
  })
  await track('Customer sees created order in own history', async () => {
    const list = ok(await api('/api/v1/me/orders', { cookie: customerCookie }))
    assert.ok(list.some(x => x.order_id === orderId))
  })
  await track('Invalid payment method is rejected without creating an order', async () => {
    hasStatus(await api('/api/v1/orders', {
      method: 'POST', cookie: customerCookie,
      body: { ...purchase, request_id: `STAGE8-${randomUUID()}`, payment_method: 'CARD' },
    }), 422)
  })
  await track('Admin can transition order to READY_FOR_PICKUP', async () => {
    const detail = ok(await api(`/api/v1/admin/orders/${orderId}/status`, { method: 'PATCH', cookie: adminCookie, body: { order_status: 'READY_FOR_PICKUP' } }))
    assert.equal(detail.order.order_status, 'READY_FOR_PICKUP')
    assert.equal(detail.payment.payment_status, 'UNPAID')
  })
  await track('Admin completion simulates payment receipt', async () => {
    const detail = ok(await api(`/api/v1/admin/orders/${orderId}/status`, { method: 'PATCH', cookie: adminCookie, body: { order_status: 'COMPLETED' } }))
    assert.equal(detail.payment.payment_status, 'PAID')
    assert.equal(detail.order.order_status, 'COMPLETED')
  })
  await track('Terminal completed order cannot be cancelled', async () => {
    hasStatus(await api(`/api/v1/admin/orders/${orderId}/status`, { method: 'PATCH', cookie: adminCookie, body: { order_status: 'CANCELLED' } }), 409)
  })
  let cancelId
  const secondStock = ok(await api('/api/v1/products/102')).stock_quantity
  await track('Second demo order can be placed for cancellation test', async () => {
    const body = { ...purchase, request_id: `STAGE8-${randomUUID()}`, items: [{ product_id: 102, quantity: 1 }] }
    const result = ok(await api('/api/v1/orders', { method: 'POST', cookie: customerCookie, body }))
    cancelId = result.order.order_id
    assert.equal(ok(await api('/api/v1/products/102')).stock_quantity, secondStock - 1)
  })
  await track('Cancellation restores product stock exactly once', async () => {
    const detail = ok(await api(`/api/v1/admin/orders/${cancelId}/status`, { method: 'PATCH', cookie: adminCookie, body: { order_status: 'CANCELLED' } }))
    assert.equal(detail.order.order_status, 'CANCELLED')
    assert.equal(detail.payment.payment_status, 'UNPAID')
    assert.equal(ok(await api('/api/v1/products/102')).stock_quantity, secondStock)
  })
  await track('Admin payment records include paid and unpaid statuses', async () => {
    const records = ok(await api('/api/v1/admin/payments', { cookie: adminCookie }))
    assert.ok(records.some(x => x.order_id === orderId && x.payment_status === 'PAID'))
    assert.ok(records.some(x => x.order_id === cancelId && x.payment_status === 'UNPAID'))
  })
  await track('Admin inventory records include deductions and restoration', async () => {
    const inventory = ok(await api('/api/v1/admin/inventory', { cookie: adminCookie }))
    assert.ok(inventory.movements.some(x => x.order_id === cancelId && x.quantity_change < 0))
    assert.ok(inventory.movements.some(x => x.order_id === cancelId && x.quantity_change > 0))
  })
  console.log(`\n${passed} live Stage 8 smoke tests passed. Restart the development server to reset in-memory data.`)
}
run().catch(error => {
  console.error(`\nStage 8 smoke test stopped after ${passed} successful checks: ${error.message}`)
  console.error('Make sure `npm run dev` is running, and retry against a FRESH demo server. No production URLs are allowed.')
  process.exitCode = 1
})
