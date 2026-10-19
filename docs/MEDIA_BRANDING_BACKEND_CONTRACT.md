# CampusCart — Media, branding and configurable-content handoff

**Status:** frontend integration preparation only. The Stage 8 design, existing Nuxt/Pinia service layer, mock APIs, and approved ERD remain intact. This document proposes *optional, additive API response metadata*. No new database fields or schema changes have been approved or implemented here.

## 1. What exists now

- `GET /api/v1/products` and `GET /api/v1/products/:product_id` return products shaped by `app/types/catalog.ts`; mock products in `server/utils/mockCatalog.ts` still have **no media fields**.
- `GET /api/v1/categories` returns the existing category model; mock categories have **no `image_url` field**.
- `app/utils/productMedia.ts` maps the original 12 `product_id` values and three `category_id` values to local SVG illustrations under `public/images/`. This map is **presentation-only** and is retained as an offline fallback.
- A new shared `<CommonMediaImage>` component handles missing/invalid image paths and failed image loads without a broken-image icon. Image dimensions/aspect ratios stay controlled by the existing view CSS.
- Product cards, details, cart, checkout, and admin product table now resolve API imagery when present, and otherwise use existing local SVGs. Product Details shows **multiple-image thumbnails** only when the API returns multiple usable images; the original single-image view stays unchanged for mock products.
- Store display branding is defined in `app/config/storefront.ts`: wordmark/logo source, favicon, hero copy/tiles, announcement, navigation fallback labels, featured-product IDs, and footer display text. CSS color tokens remain in `app/assets/css/main.css`.

## 2. Proposed read-only media extensions (backend team approval required)

### Products

Add **optional** `images` to the **API response only**, not directly to `products` table:

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {
    "product_id": 201,
    "category_id": 2,
    "sku": "TEC-001",
    "product_name": "Wireless Study Mouse",
    "description": "Comfortable wireless mouse for laptop work.",
    "price": "499.00",
    "stock_quantity": 21,
    "status": "ACTIVE",
    "created_at": "2026-09-22T08:00:00+08:00",
    "updated_at": "2026-09-22T08:00:00+08:00",
    "images": [
      {
        "url": "https://media.example.invalid/products/201/main.webp",
        "alt": "Wireless mouse, top view",
        "is_primary": true,
        "sort_order": 0
      },
      {
        "url": "https://media.example.invalid/products/201/side.webp",
        "alt": "Wireless mouse, side view",
        "is_primary": false,
        "sort_order": 1
      }
    ]
  }
}
```

**Illustrative only:** the URLs above are not real assets. `images` may be absent or an empty array. `ProductImage` is defined in `app/types/catalog.ts`. `url` is required when the list is provided; `alt`, `is_primary`, `sort_order` are optional. When available, the first `is_primary: true` image takes precedence, then images are ordered by ascending `sort_order`; missing order defaults to zero. The backend must choose a deterministic canonical order and ideally enforce at most one primary image per product.

The same optional `images` field should be returned from **both** `/products` and `/products/:product_id` for consistent cards and detail pages. If the paginated list includes only the primary image for performance, return that primary record in `images` and document the intended distinction; the detail endpoint returns the full gallery. Cart and checkout use the existing product API for fresh media and stock, not a new cart image database field. **Amounts and availability remain server-authoritative.**

### Categories

The existing category response may include **optional** `image_url`:

```json
{
  "category_id": 1,
  "category_name": "School Supplies",
  "description": "Everyday tools for studying and staying organized.",
  "status": "ACTIVE",
  "created_at": "2026-09-22T08:00:00+08:00",
  "updated_at": "2026-09-22T08:00:00+08:00",
  "image_url": "https://media.example.invalid/categories/school.webp"
}
```

The category grid and shared navigation use API-provided category information when available. Existing names/images remain fallback presentation settings in offline mode.

### Compatibility rules

1. Preserve original column names (`product_id`, `category_id`, `sku`, `product_name`, `price`, `stock_quantity`, `status`, etc.) and the existing `success`, `data`, `message` envelope and pagination `meta`.
2. Continue sending PHP prices as decimal strings with two decimal places, as required by the current frontend contract.
3. Public media URLs should be usable by ordinary browser `<img>` elements. `http(s)://...` or safe root-relative paths are supported; avoid JavaScript/data/FTP schemes or protocol-relative URLs. Server-side validation is necessary for untrusted URLs.
4. Images must be served with valid MIME types, correct caching and access controls; use HTTPS in production, appropriate Content Security Policy rules, and stable public/signed URLs with adequate lifetime. Broken assets fall back in the UI, but the backend should still verify uploaded assets.
5. Preserve the **original mock API** for offline UI testing until integration is validated; no duplicate product fixtures were introduced.

## 3. Proposed upload and administration contract — Not implemented

**Not implemented:** product image upload, replacement, deletion, reordering, image persistence, upload progress, and administrator image-edit UI. The current admin product form still edits the **approved ERD fields only**. There is no false "Upload successful" action.

If the backend team approves admin-managed product imagery, coordinate these *proposed* routes (names are not established API contracts yet):

| Proposed route | Purpose | Notes |
| --- | --- | --- |
| `POST /api/v1/admin/products/:product_id/images` | Upload a photo via multipart/form-data (`file`, `alt`, optional `is_primary`) | Server handles validation/storage, returns durable image record |
| `PATCH /api/v1/admin/products/:product_id/images/:image_id` | Update alt/primary/order | Must validate product ownership and uniqueness of primary |
| `DELETE /api/v1/admin/products/:product_id/images/:image_id` | Remove an image safely | Policy for removing last/primary image is to be agreed |
| `GET /api/v1/products/:product_id` | Read image list | Already exists; optional `images` is a backward-compatible extension |

**Before implementing upload controls:** agree on maximum file size (e.g., 5 MiB is only a suggestion), allowed MIME types (JPEG/PNG/WebP recommended), image transformations, image count, storage quotas, lifecycle, CDN URL scheme, file scanning/security, alt text requirements, authorization, transaction behavior, and error format. The UI can then provide file selection, local preview, upload progress/error handling and confirmation only **after real upload success**. Do not claim persistence before the backend acknowledges it.

## 4. ERD coordination

The approved ERD has **no product image table, product image field, or category image field**. Neither this handoff nor its frontend types changes that design.

The backend/database team may propose a `product_images` relation with a stable primary key, `product_id` foreign key, storage identifier/URL, alt text, `sort_order`, and `is_primary`, subject to explicit schema approval. An `image_url`/media relation for categories is likewise an optional future design decision. A static branding asset does **not** require a database table; if administrators must manage storefront branding, agree a separate content/asset contract **before** building controls.

Other pre-existing ERD decisions still need coordination: inconsistent drawn connectors, order-status-history `status INT` versus order status enum, unique constraints for one-to-one relationships, address details, and enum labels. Those have not been modified.

## 5. Branding, banners and featured content

- **Current source of truth:** `app/config/storefront.ts`, including `brand.logoSrc` (empty = original wordmark), wordmark colors, `brand.favicon`, announcement text, hero wording/image tile paths, static fallback navigation, footer copy, and featured IDs. To change a logo, put the actual image in `public/images/branding/` and update `brand.logoSrc`, or use an approved publicly accessible URL. Do not overwrite the official university seal without authorization.
- **Theme:** Tailwind CSS 4 tokens in `app/assets/css/main.css`, intentionally unchanged.
- **Category names and images:** backend-managed optional metadata; fallback local SVG mapping until new API assets exist.
- **Featured items:** existing locally configured IDs in `storefront.featuredProductIds`. No `is_featured` database field has been assumed. If admins need featured controls, the teams must agree an actual backend API/query first.
- **New Arrivals:** derived from existing `products.created_at`. No promotion/discount table required.
- **Banners/hero:** centralized default copy and original three artwork tiles. A future CMS/banner endpoint would be new scope and is **not implemented**.
- **Store information/social links:** no invented emails or social accounts. Only approved links should be added.

## 6. Backend integration handoff

The previous `docs/HANDOFF_API_CONTRACT.md` remains authoritative for all existing endpoints. This document describes only *proposed additive image response fields* and potential (not implemented) admin upload endpoints. The base URL remains configurable through `.env.example` (`NUXT_PUBLIC_API_BASE`).

**Integration acceptance criteria:** verify media on homepage, catalog, product gallery, cart, checkout, admin table; verify 404/failure falls back without layout shift; verify keyboard access and alt text; verify large/small screens; verify order and cart behavior unchanged. Also run all existing regression scripts, Nuxt typecheck, production build, and end-to-end browser tests before marking backend integration complete.
