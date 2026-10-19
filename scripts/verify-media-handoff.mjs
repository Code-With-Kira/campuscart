/** Offline tests for media/branding handoff. Does NOT replace Nuxt typecheck or browser testing. */
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { storefront } from '../app/config/storefront.ts'
import { categoryImage, productImage, productImagesFor, safeImageUrl } from '../app/utils/productMedia.ts'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = file => readFileSync(join(root,file), 'utf8')
let count = 0
function test(label, fn) { fn(); console.log(`PASS ${String(++count).padStart(2,'0')} ${label}`) }

test('Stable storefront brand and hero are configured in one file', () => {
  assert.equal(storefront.name, 'CampusCart')
  assert.equal(storefront.brand.favicon, '/favicon.svg')
  assert.ok(storefront.hero.tiles.notebook.image.startsWith('/images/'))
})
test('Local product illustrations continue to resolve without API media', () => {
  for (const id of [101,102,103,104,201,202,203,204,301,302,303,304]) {
    const url = productImage(id)
    assert.ok(existsSync(join(root,'public',url)), url)
    assert.equal(productImagesFor({product_id:id})[0].url, url)
  }
})
test('API primary product image overrides local fallback', () => {
  const p = {product_id:201,images:[
    {url:'https://cdn.example.invalid/side.webp',sort_order:2},
    {url:'https://cdn.example.invalid/front.webp',is_primary:true,sort_order:8},
  ]}
  assert.equal(productImage(p), 'https://cdn.example.invalid/front.webp')
  assert.equal(productImagesFor(p).length, 2)
})
test('API gallery order is deterministic', () => {
  const p={product_id:101,images:[
    {url:'/images/products/pen-set.svg',sort_order:3},
    {url:'/images/products/notebook.svg',sort_order:1},
  ]}
  assert.equal(productImagesFor(p)[0].url, '/images/products/notebook.svg')
})
test('Missing, malformed and unsafe product image URLs use existing fallback', () => {
  for (const candidate of [null, '', 'javascript:alert(1)', 'data:image/png;base64,xx', '//bad.example/img', 'ftp://evil.test/i']) {
    assert.equal(safeImageUrl(candidate), null)
  }
  assert.equal(productImage({product_id:201,images:[{url:'javascript:alert(1)'}]}), productImage(201))
})
test('New products without known media have generic placeholder', () => {
  assert.equal(productImage(1009), '/images/products/placeholder.svg')
})
test('API-provided category image overrides local image map', () => {
  assert.equal(categoryImage({category_id:1,image_url:'https://cdn.example.invalid/school.webp'}), 'https://cdn.example.invalid/school.webp')
  assert.equal(categoryImage({category_id:1}), '/images/categories/school.svg')
})
test('Product cards, details, cart, checkout, and admin use shared media view', () => {
  for (const file of [
    'app/components/product/ProductCard.vue', 'app/pages/products/[product_id].vue',
    'app/components/cart/CartItem.vue', 'app/pages/checkout.vue',
    'app/pages/admin/products/index.vue', 'app/components/home/CategoryGrid.vue',
  ]) assert.ok(read(file).includes('CommonMediaImage'), file)
})
test('Shared brand is used in header, auth, footer and admin', () => {
  for (const file of ['app/components/layout/SiteHeader.vue','app/layouts/auth.vue','app/components/layout/SiteFooter.vue','app/layouts/admin.vue']) {
    assert.ok(read(file).includes('CommonStoreBrand'),file)
  }
})
test('Product and category API media fields are optional, mock records unchanged', () => {
  assert.ok(read('app/types/catalog.ts').includes('images?: ProductImage[]'))
  assert.ok(read('app/types/catalog.ts').includes('image_url?: string | null'))
  assert.ok(!read('server/utils/mockCatalog.ts').includes('images:'))
  assert.ok(!read('server/utils/mockCatalog.ts').includes('image_url:'))
})
test('Upload is not falsely claimed as working', () => {
  assert.ok(!existsSync(join(root,'server/api/v1/admin/products/[product_id]/images.post.ts')))
  assert.ok(read('docs/MEDIA_BRANDING_BACKEND_CONTRACT.md').includes('Not implemented'))
})
console.log(`\n${count} configurable-media/branding checks passed. Run Nuxt typecheck/build and browser regression tests on your laptop.`)
