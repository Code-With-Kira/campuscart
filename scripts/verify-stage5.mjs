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
