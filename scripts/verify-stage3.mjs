// Lightweight structural/data checks without installing dependencies.
// This is NOT a substitute for Nuxt typecheck, browser tests or npm run build.
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
const root = process.cwd()
let count = 0
function read(path) {
  const full = resolve(root, path)
  if (!existsSync(full)) throw new Error(`Missing: ${path}`)
  return readFileSync(full, 'utf8')
}
function check(condition, name) {
  if (!condition) throw new Error(`FAILED: ${name}`)
  count++
  console.log(`PASS ${String(count).padStart(2, '0')} ${name}`)
}
const pkg = JSON.parse(read('package.json'))
check(Boolean(pkg.dependencies.nuxt && pkg.dependencies['@pinia/nuxt'] && pkg.dependencies.pinia), 'Original Nuxt + Pinia dependencies remain declared')
check(Boolean(pkg.devDependencies.tailwindcss && pkg.devDependencies['@tailwindcss/vite']), 'Original Tailwind dependencies remain declared')
const app = read('app/pages/index.vue')
check(['HomeHeroBanner','HomeCategoryGrid','HomeProductSection','fetchHomepageCatalog','created_at'].every(k => app.includes(k)), 'Homepage composition, API load and new-arrivals sorting')
check(read('app/layouts/default.vue').includes('LayoutAnnouncementBar') && read('app/layouts/default.vue').includes('LayoutSiteFooter'), 'Existing announcement bar and footer preserved in default layout')
check(read('app/components/layout/SiteHeader.vue').includes('cart.totalQuantity'), 'Nav displays Pinia cart count')
check(read('app/components/product/ProductCard.vue').includes('cart.addProduct'), 'Reusable product card uses Pinia actions')
const fixture=read('server/utils/mockCatalog.ts')
const products=[...fixture.matchAll(/mk\(\s*(\d+)\s*,\s*(\d+)\s*,\s*'([A-Z]+-\d+)'/g)].map(m=>({id:+m[1],category:+m[2],sku:m[3]}))
check(products.length===12,'Mock dataset contains 12 products')
check(new Set(products.map(p=>p.id)).size===products.length,'Product IDs are unique')
check(products.every(p=>[1,2,3].includes(p.category)),'Product category IDs reference the three sample categories')
check(['School Supplies','Tech Accessories','Campus Merchandise'].every(k=>fixture.includes(`category_name: '${k}'`)), 'Three approved categories are present')
check(read('server/api/v1/products.get.ts').includes('mockProducts') && read('server/api/v1/categories.get.ts').includes('mockCategories'), 'Mock API endpoints exist and reference fixture data')
check(read('app/services/catalog.ts').includes('/api/v1/products') && read('app/services/catalog.ts').includes('/api/v1/categories'), 'Centralized service uses API v1 endpoints')
const media=read('app/utils/productMedia.ts')
const map=[...media.matchAll(/(\d+): '(\/images\/products\/[^']+)'/g)]
check(map.length===12 && map.every(m=>existsSync(resolve(root,'public'+m[2]))),'All 12 product IDs have local SVG assets')
check([1,2,3].every(id=>media.includes(`${id}: '/images/categories/`)),'Three category illustrations are mapped')
check(['information/about','information/contact','information/faq','information/policies'].every(k=>read('app/components/layout/SiteFooter.vue').includes(k)),'Footer links have information routes')
check(read('app/pages/cart.vue').includes('cart.subtotalCentavos') && read('app/pages/cart.vue').includes('cart.removeProduct'), 'Demo cart supports subtotal and item removal')
console.log(`\n${count} structural/data checks passed. Run npm run build and browser tests separately.`)
