// Dependency-free verification of Stage 4 source and mock dataset.
// Not a substitute for `npx nuxt typecheck`, `npm run build`, or browser testing.
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
const root = process.cwd()
const file = rel => {
  const path = resolve(root, rel)
  if (!existsSync(path)) throw new Error(`Missing file: ${rel}`)
  return readFileSync(path, 'utf8')
}
let passed = 0
function check(condition, label) {
  if (!condition) throw new Error(`FAIL: ${label}`)
  passed++
  console.log(`PASS ${String(passed).padStart(2, '0')} ${label}`)
}
const pkg = JSON.parse(file('package.json'))
check(Boolean(pkg.dependencies.nuxt && pkg.dependencies['@pinia/nuxt'] && pkg.dependencies.pinia), 'Existing Nuxt/Pinia configuration remains present')
check(Boolean(pkg.devDependencies.tailwindcss && pkg.devDependencies['@tailwindcss/vite']), 'Existing Tailwind tooling remains declared')
check(file('app/assets/css/main.css').includes('--color-campus-emerald'), 'Existing CSU-inspired design tokens preserved')
check(file('app/pages/index.vue').includes('HomeHeroBanner') && file('app/pages/index.vue').includes('HomeProductSection'), 'Existing seven-section homepage preserved')
check(file('app/layouts/default.vue').includes('LayoutSiteFooter'), 'Customer layout and footer retained')
check(file('app/components/product/ProductCard.vue').includes('`/products/${product.product_id}`'), 'Reusable product card links to product details')
check(file('app/pages/products/index.vue').includes('<CatalogFilters'), 'Catalog screen uses reusable filter controls')
check(file('app/pages/products/index.vue').includes('fetchCatalogPage'), 'Catalog fetches data via centralized service')
check(file('app/pages/products/index.vue').includes('goToPage'), 'Catalog pagination connected to navigation')
check(file('app/pages/products/index.vue').includes('No products found'), 'Catalog empty state implemented')
check(file('app/pages/products/index.vue').includes('refresh()'), 'Catalog retry action implemented')
check(file('app/pages/products/[product_id].vue').includes('fetchProductById'), 'Product detail uses central API service')
check(file('app/pages/products/[product_id].vue').includes('cart.addProduct'), 'Product detail uses existing Pinia cart')
check(file('app/stores/cart.ts').includes('existing.quantity + quantity > product.stock_quantity'), 'Pinia add-product action guards total requested quantity')
const listHandler = file('server/api/v1/products.get.ts')
check(listHandler.includes('mockProducts') && listHandler.includes('meta: {'), 'Original mock endpoint extended with pagination')
check(['category_id','min_price','max_price','in_stock','sort','page','page_size','q'].every(v => listHandler.includes(v)), 'Catalog filters present in mock endpoint')
check(file('server/api/v1/products/[product_id].get.ts').includes('getRouterParam'), 'Single-product mock endpoint present')
check(file('app/services/catalog.ts').includes('fetchHomepageCatalog') && file('app/services/catalog.ts').includes('fetchProductById'), 'Homepage service preserved and detail service added')
const fixture = file('server/utils/mockCatalog.ts')
const ids = [...fixture.matchAll(/mk\(\s*(\d+)\s*,\s*(\d+)\s*,\s*'([A-Z]+-\d+)'/g)].map(match => [Number(match[1]), Number(match[2]), match[3]])
check(ids.length === 12 && new Set(ids.map(x => x[0])).size === 12, '12 unique mock products retained')
check(ids.every(x => [1,2,3].includes(x[1])), 'Mock products map only to the three approved categories')
const media = file('app/utils/productMedia.ts')
check(ids.every(([id]) => new RegExp(`\\b${id}: '/images/products/`).test(media)), 'All products use existing media map, without new ERD image fields')
console.log(`\n${passed} structural/data checks passed. Run Nuxt typecheck and build separately.`)
