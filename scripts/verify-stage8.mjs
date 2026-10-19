// Stage 8 dependency-free source/documentation checks. No server required.
// This is NOT a replacement for Nuxt typecheck, build or browser testing.
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = file => readFileSync(join(root, file), 'utf8')
let pass = 0
function check(label, predicate) {
  try { predicate(); console.log(`PASS ${String(++pass).padStart(2, '0')} ${label}`) }
  catch (error) { console.error(`FAIL ${label}: ${error.message}`); process.exitCode = 1 }
}
const pkg = JSON.parse(read('package.json'))
const nuxt = read('nuxt.config.ts')
const config = read('app/assets/css/main.css')
const orders = read('server/utils/mockOrders.ts')
const account = read('server/utils/mockAccounts.ts')
const pages = [
  'app/pages/index.vue', 'app/pages/products/index.vue',
  'app/pages/products/[product_id].vue', 'app/pages/cart.vue',
  'app/pages/login.vue', 'app/pages/register.vue',
  'app/pages/profile/index.vue', 'app/pages/profile/addresses.vue',
  'app/pages/checkout.vue', 'app/pages/orders/index.vue',
  'app/pages/orders/[order_id].vue', 'app/pages/admin/index.vue',
  'app/pages/admin/products/index.vue', 'app/pages/admin/categories/index.vue',
  'app/pages/admin/inventory/index.vue', 'app/pages/admin/orders/index.vue',
  'app/pages/admin/payments/index.vue',
]
check('Nuxt / Vue / TypeScript / Pinia remain declared', () => {
  for (const p of ['nuxt', 'vue', 'pinia', '@pinia/nuxt']) assert.ok(pkg.dependencies[p], p)
  assert.ok(pkg.devDependencies.typescript)
})
check('Tailwind CSS Vite plugin and local Inter remain declared', () => {
  assert.ok(pkg.devDependencies['@tailwindcss/vite'])
  assert.ok(pkg.devDependencies.tailwindcss)
  assert.ok(pkg.dependencies['@fontsource-variable/inter'])
})
check('Nuxt config retains Pinia and Tailwind integration', () => {
  assert.match(nuxt, /@pinia\/nuxt/)
  assert.match(nuxt, /@tailwindcss\/vite/)
})
check('Approved CSU-inspired palette remains', () => {
  for (const token of ['#003300', '#009900', '#f9dc07', '#ff9900', '#f3f8f0']) assert.ok(config.toLowerCase().includes(token), token)
})
check('Customer, admin, and auth layouts exist', () => {
  for (const name of ['default', 'admin', 'auth']) assert.ok(existsSync(join(root, `app/layouts/${name}.vue`)))
})
check('All Stage 7 customer/admin routes remain present', () => pages.forEach(p => assert.ok(existsSync(join(root, p)), p)))
check('Seven-section homepage composition preserved', () => {
  const home = read('app/pages/index.vue')
  for (const part of ['HeroBanner', 'CategoryGrid', 'ProductSection']) assert.ok(home.includes(part))
  for (const file of ['AnnouncementBar.vue', 'SiteHeader.vue', 'SiteFooter.vue']) assert.ok(existsSync(join(root, 'app/components/layout', file)))
})
check('Catalog server API and product detail API present', () => {
  for (const file of ['server/api/v1/products.get.ts', 'server/api/v1/products/[product_id].get.ts', 'server/api/v1/categories.get.ts']) assert.ok(existsSync(join(root, file)))
})
check('Cart store keeps order-commit safety and stock rules', () => {
  const cart = read('app/stores/cart.ts')
  for (const part of ['finalizeDemoPurchase', 'reconcileWithProducts', 'undoRemove', 'setQuantity']) assert.ok(cart.includes(part))
})
check('API still runs against mock in-memory fixtures, not PostgreSQL', () => {
  assert.match(read('server/utils/mockCatalog.ts'), /DEMONSTRATION RECORDS/)
  assert.match(orders, /server-memory/)
  assert.equal(Boolean(pkg.dependencies['@prisma/client'] || pkg.dependencies.pg), false)
})
check('Stage 7 narrowed error helper remains fixed', () => assert.match(orders, /function err\(statusCode: number, statusMessage: string\): never/))
check('Approved mock payment method and zero shipping remain', () => {
  assert.match(orders, /CASH_ON_PICKUP/)
  assert.match(orders, /shipping_fee:'0\.00'/)
})
check('Approved order status mapping and transitions remain', () => {
  for (const status of ['PENDING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED']) assert.ok(orders.includes(status))
  assert.match(orders, /COMPLETED:\[\],CANCELLED:\[\]/)
})
check('Order placement keeps idempotent request check and stock snapshots', () => {
  for (const part of ['requests.get(key)', 'requests.set(key', 'stockMovement(', 'orderItems.push(', 'subtotal:asMoney']) assert.ok(orders.includes(part))
})
check('Customer and administrator APIs enforce roles', () => {
  const admin = [
    'server/api/v1/admin/dashboard/summary.get.ts',
    'server/api/v1/admin/products/index.post.ts',
    'server/api/v1/admin/orders/index.get.ts',
    'server/api/v1/admin/orders/[order_id]/status.patch.ts',
  ]
  for (const file of admin) assert.ok(read(file).includes('requireAdmin'), file)
  for (const file of ['server/api/v1/orders/index.post.ts', 'server/api/v1/me/orders/index.get.ts']) assert.ok(read(file).includes('requireCustomer'), file)
})
check('Demo registration does not grant administrator role', () => assert.match(account, /newUser\(fields\.first_name, fields\.last_name, fields\.email, 'CUSTOMER'/))
check('Sessions use HTTP-only cookies and random tokens', () => {
  assert.match(account, /httpOnly:\s*true/)
  assert.match(account, /randomBytes\(32\)/)
})
check('No generated or dependency directories included', () => {
  for (const folder of ['node_modules', '.nuxt', '.output', '.git']) assert.ok(!existsSync(join(root, folder)), folder)
})
check('All 12 sample products have local SVGs', () => {
  const data = read('server/utils/mockCatalog.ts')
  const ids = [...data.matchAll(/\bmk\((\d+),\s*[123],/g)].map(m => Number(m[1]))
  assert.equal(ids.length, 12)
  assert.equal(new Set(ids).size, 12)
  const media = read('app/utils/productMedia.ts')
  for (const id of ids) assert.ok(new RegExp(`\\b${id}\\b`).test(media), `Missing media map for ${id}`)
  const images = readdirSync(join(root, 'public/images/products')).filter(x => x.endsWith('.svg'))
  assert.ok(images.length >= 12)
})
check('Stage 8 documents and test matrix are present', () => {
  for (const file of ['docs/STAGE8_GUIDE.md', 'docs/STAGE8_TEST_MATRIX.md', 'docs/STAGE8_MIDTERM_REPORT_DRAFT.md', 'docs/STAGE8_PRESENTATION.md', 'docs/STAGE8_API_INVENTORY.md', 'docs/STAGE8_CHANGELOG.md']) assert.ok(existsSync(join(root, file)), file)
})
check('Stage 8 API smoke test uses localhost-only protection', () => {
  const smoke = read('scripts/smoke-stage8.mjs')
  assert.ok(smoke.includes("['localhost', '127.0.0.1'].includes(base.hostname)"))
})
console.log(`\n${pass} Stage 8 static checks passed. Run Nuxt typecheck/build and live browser tests separately.`)
