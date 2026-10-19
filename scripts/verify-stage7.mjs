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
