# CampusCart — Stage 4 Implementation & Verification Guide

**Course:** ITE 18 – Application Development and Emerging Technologies (Frontend Track)  
**Stage:** 4 — Product Catalog and Product Details  
**Framework:** Existing Nuxt 4 + Vue 3 + TypeScript + Pinia + Tailwind CSS 4  
**Starting point:** Original verified `CampusCart_Stage3.zip` (not a new project)

## 1. What this stage implements

Stage 4 replaces the existing `/products` placeholder with a real catalog that retrieves product records through the centralized service and the existing Nuxt mock API. It adds `/products/:product_id` pages, links from existing reusable product cards, and a reusable filter component. Pinia remains the same cart store, extended to support adding a validated quantity. The seven-section homepage, layouts, navigation, footer, existing images and existing admin/login/register placeholders remain present.

### Catalog features

- Real mock API retrieval, category selection, search by name/SKU/description
- Price range (PHP), in-stock-only selection, sorting (newest, name, price asc/desc)
- Pagination (8 per page) with URL query parameters; mobile expandable filters
- Loading skeleton, no-results message, API error and retry
- Reuses `ProductCard.vue` so Add to Cart still updates the existing Pinia cart

### Product Details features

- Dynamic route `/products/:product_id`, fetched via `/api/v1/products/:product_id`
- Local SVG image mapped via existing `product_id` mapping; no new DB column
- Product name, SKU, category, description, current price, stock level
- Quantity adjustment, stock-aware Add to Cart, return to products/cart
- Loading, 404/unavailable, and retry UI

## 2. Important boundaries

- Still a **Midterm mock implementation**: NOT PostgreSQL-backed; no real accounts, payments, orders, shipping or persistent inventory.
- `ACTIVE`/`INACTIVE` are unapproved sample enum labels, retained from Stage 3 fixture definitions. Update only after project agreement.
- `price` is a decimal *string* as in the planned API contract. Use shared `money.ts` to format it and do cents-based display arithmetic.
- `stock_quantity` is mock availability only. Backend must validate real stock again before order creation.
- All 12 original mock products and three categories remain unchanged.
- `min_price`, `max_price`, `q`, `sort`, `page`, and `page_size` are **API/query parameters**, not new ERD fields.
- The Stage 3 navbar's `category_name` query is supported by resolving the corresponding category ID from the category API. Category cards already supply canonical `category_id`.
- Authentication for saved carts and purchase flows is reserved for future work; Stage 4 Add to Cart is explicitly a local-only demonstration.

## 3. How to integrate into your already-working Stage 3 folder

**Safest choice:** do not delete your laptop project or overwrite its `.git`, lockfile or node_modules.

1. Make a backup or Git commit of your currently verified Stage 3 state.
2. Extract `CampusCart_Stage4.zip` to a **temporary directory**.
3. Open both projects in VS Code. Copy **only the new or changed source files** listed in `docs/STAGE4_CHANGELOG.md`, preserving directory paths. Do not copy the entire ZIP over your Git repository if doing so would discard newer local edits.
4. Copy the new Stage 4 documentation and `scripts/verify-stage4.mjs` as needed.
5. No new dependencies were added. Use the packages already installed for Stage 3.
6. If you prefer a standalone copy, extract the ZIP into its own folder and run `npm install` there (requires network access). Its folder includes everything except node_modules and build output.

### Terminal commands in your existing Windows project

```powershell
cd "C:\KIRA_WORKSPACE\01-Academic-Projects\ITE-18\campuscart"
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
npx nuxt typecheck
npm run build
npm run dev
```

Your known working local build produced Nuxt 4.6.2; this package does not change your existing package ranges.

## 4. Main routes to check

| URL | Expected behavior |
| --- | --- |
| `http://localhost:3000/` | Original seven-section homepage still works |
| `http://localhost:3000/products` | Product grid and controls |
| `http://localhost:3000/products?category_name=School%20Supplies` | Category from existing navbar filters correctly |
| `http://localhost:3000/products?category_id=2` | Tech Accessories products |
| `http://localhost:3000/products?q=mouse` | Search results |
| `http://localhost:3000/products?min_price=100&max_price=500` | Inclusive price filtering |
| `http://localhost:3000/products?in_stock=true` | Excludes zero-stock products |
| `http://localhost:3000/products?sort=price_asc` | Ascending price |
| `http://localhost:3000/products?page=2` | Second product page |
| `http://localhost:3000/products/201` | Wireless Study Mouse details |
| `http://localhost:3000/products/204` | Out-of-stock product; Add to Cart disabled |
| `http://localhost:3000/products/999` | Not-found error state |
| `http://localhost:3000/cart` | Existing Pinia cart continues to work |

## 5. Mock API contract

The existing API contract is preserved: `{ success, data, message }`. The product list response **adds** `meta` for pagination. No existing route was duplicated.

### GET `/api/v1/products`

Parameters: `q` (up to 100 characters), `category_id` (positive ID), `min_price`/`max_price` (nonnegative decimal up to 2 places), `in_stock=true|false`, `sort=newest|name_asc|price_asc|price_desc`, `page` (positive integer), `page_size` (1–24, default 12).

Returns HTTP 200:

```json
{
  "success": true,
  "data": [{
    "product_id": 201,
    "category_id": 2,
    "sku": "TEC-001",
    "product_name": "Wireless Study Mouse",
    "description": "Comfortable wireless mouse for laptop work.",
    "price": "499.00",
    "stock_quantity": 21,
    "status": "ACTIVE",
    "created_at": "2026-09-22T08:00:00+08:00",
    "updated_at": "2026-09-22T08:00:00+08:00"
  }],
  "meta": { "page": 1, "page_size": 8, "total_items": 3, "total_pages": 1 },
  "message": "Demo products retrieved successfully"
}
```

**The `data` item shown is illustrative.** When calling the endpoint with filters, `data` contains all matching records for the requested page and `meta` contains the actual counts.

**Backward compatibility:** Homepage `fetchProducts()` calls the same endpoint without filters, so the default 12-item page returns all original active products and remains usable by Stage 3 components.

### GET `/api/v1/products/:product_id`

Returns a single product in `data` using exactly the same ERD-mapped fields; invalid/inactive/missing product IDs return HTTP 404.

### GET `/api/v1/categories`

Unchanged Stage 3 endpoint and response structure.

### Error behavior

Bad filters return HTTP 400. Missing products return HTTP 404. UI offers safe retry. Errors do not expose backend internals. There are no real backend authentication checks in this mock phase.

## 6. Components and file ownership

| File | Purpose |
| --- | --- |
| `app/pages/products/index.vue` | Catalog page, URL filters, pagination, query validation, loading/empty/error |
| `app/pages/products/[product_id].vue` | Product detail, stock/quantity controls, cart action |
| `app/components/catalog/CatalogFilters.vue` | Accessible filter form shared between desktop and mobile |
| `app/components/product/ProductCard.vue` | Previously existing shared card; now links to detail route |
| `app/services/catalog.ts` | Centralized mock API calls for home/catalog/detail |
| `app/types/catalog.ts` | Existing ERD record types plus API metadata and UI filter shape |
| `server/api/v1/products.get.ts` | Existing product-list route extended with validated query filtering |
| `server/api/v1/products/[product_id].get.ts` | New single-product read endpoint |
| `app/stores/cart.ts` | Existing store with backward-compatible optional quantity argument |
| `app/utils/productMedia.ts` | Existing local media mapping, unchanged |
| `server/utils/mockCatalog.ts` | Existing fixtures, unchanged |

## 7. Manual browser testing

1. Search `mouse`; verify only matching products display. Clear filters.
2. Select each of the three categories using both homepage cards and navbar links.
3. Filter a valid price range, then intentionally enter min > max: expect a helpful error.
4. Select in-stock-only; verify the laptop stand (stock 0) disappears.
5. Sort price low-to-high and high-to-low, then reset.
6. Open `/products?page=2` and use Previous/Next.
7. Click a product image/name on homepage or catalog; detail must open the correct ID.
8. For product 201, add quantity 2 to cart; navbar counter should increase by 2, cart subtotal should update. Try adding more than remaining stock; cart must not partially change.
9. Open product 204 (zero stock); Add to Cart must be disabled.
10. Open `/products/999`; see a safe unavailable/not-found UI.
11. Navigate to login/register/admin placeholders and return to homepage; Stage 3 routes must still work.
12. Test Chrome DevTools widths 390px, 768px, 1440px; check hamburger/menu, filters, no horizontal scrolling, keyboard tab focus and visible field labels.
13. Review browser console for errors.

## 8. What verification means

`node scripts/verify-stage3.mjs` and `node scripts/verify-stage4.mjs` perform **structural/data** checks only. They cannot certify a successful Nuxt production build or browser behavior. In this tool environment, `npm install` failed with `EAI_AGAIN`, so the production build was **not** run here. Your own `npx nuxt typecheck`, `npm run build`, and browser results determine when Stage 4 is verified.

The Vue Router/Volar package export warning seen in your earlier Stage 3 TypeScript log may recur; do not replace working Nuxt dependencies blindly. If TypeScript or build reports a new error, share the full output.

## 9. Git milestone

After verifying locally:

```powershell
git status
git add app server scripts docs README.md
git commit -m "feat: implement CampusCart product catalog and product details"
```

No checkout, authentication, order creation or Stage 5 work should start before you verify Stage 4.
