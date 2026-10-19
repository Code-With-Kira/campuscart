/** Static integration handoff verification, without a Nuxt installation. */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveApiUrl } from '../app/utils/apiUrl.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = path => readFileSync(join(root, path), 'utf8')
let passed = 0
function test(label, action) { action(); console.log(`PASS ${String(++passed).padStart(2, '0')} ${label}`) }

test('Existing Nuxt, Pinia and Tailwind architecture preserved', () => {
  const config = read('nuxt.config.ts')
  assert.ok(config.includes("'@pinia/nuxt'"))
  assert.ok(config.includes('tailwindcss()'))
})
test('Public API base is configurable and defaults to existing mock routes', () => {
  const config = read('nuxt.config.ts')
  assert.ok(config.includes("apiBase: '/api/v1'"))
  assert.equal(resolveApiUrl('/api/v1', '/api/v1/products'), '/api/v1/products')
  assert.equal(resolveApiUrl('http://localhost:4000/api/v1/', '/api/v1/products/101'), 'http://localhost:4000/api/v1/products/101')
  assert.equal(resolveApiUrl('https://example.invalid/api/v1', '/api/v1/auth/me'), 'https://example.invalid/api/v1/auth/me')
})
test('All four existing API service modules use a shared URL router', () => {
  for (const name of ['account','admin','catalog','orders']) {
    const service = read(`app/services/${name}.ts`)
    assert.ok(service.includes("from '~/utils/apiUrl'"), name)
    assert.ok(service.includes('apiUrl('), name)
  }
})
test('Demo preview is disabled by default in UI and API', () => {
  assert.ok(read('nuxt.config.ts').includes('enableDemoPreview: false'))
  assert.ok(read('app/pages/login.vue').includes('public.enableDemoPreview'))
  assert.ok(read('server/api/v1/auth/demo.post.ts').includes('public.enableDemoPreview'))
  assert.ok(read('server/api/v1/auth/demo.post.ts').includes("process.env.NODE_ENV !== 'development'"))
})
test('Mock order, catalog and account handlers remain for offline fallback', () => {
  for (const file of ['server/utils/mockOrders.ts','server/utils/mockCatalog.ts','server/utils/mockAccounts.ts']) assert.ok(existsSync(join(root,file)), file)
})
test('Backend handoff and no-secret env example included', () => {
  assert.ok(existsSync(join(root,'.env.example')))
  assert.ok(!read('.env.example').match(/PASSWORD=|SECRET=|TOKEN=/i))
  assert.ok(existsSync(join(root,'docs/HANDOFF_API_CONTRACT.md')))
  assert.ok(existsSync(join(root,'docs/HANDOFF_BACKEND_CHECKLIST.md')))
})
test('Outdated checkout FAQ no longer claims mock checkout is missing', () => {
  const faq = read('app/pages/information/[slug].vue')
  assert.ok(faq.includes('simulated campus-pickup orders'))
  assert.ok(!faq.includes('checkout, payment, and delivery are not active yet'))
})
console.log(`\n${passed} handoff static checks passed.`)
