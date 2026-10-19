# CampusCart — Final frontend media and branding preparation

This is a **focused follow-up to the completed frontend**, not a new development stage. UI layout, routing, auth, Pinia and transaction rules remain unchanged.

## Files added

| File | Purpose |
| --- | --- |
| `app/config/storefront.ts` | One source for brand/logo/favicons, hero assets/text, footer notices, fallback menu labels and featured selection |
| `app/components/common/StoreBrand.vue` | Reusable image logo or original CampusCart text-wordmark fallback |
| `app/components/common/MediaImage.vue` | Shared image view with invalid/missing/failed URL fallback and fixed sizing |
| `docs/MEDIA_BRANDING_BACKEND_CONTRACT.md` | API image payloads, schema gaps, optional uploads, source-of-truth decision table |
| `docs/FRONTEND_MEDIA_BRANDING_CHANGELOG.md` | This exact scope and file list |
| `scripts/verify-media-handoff.mjs` | Dependency-free local image/configuration checks |

## Existing files modified

| File | Reason |
| --- | --- |
| `app/types/catalog.ts` | Optional API-enriched `images` and `image_url` metadata, explicitly not SQL columns |
| `app/utils/productMedia.ts` | Prefer API image metadata; retain all old product/category SVG fallbacks and original `productImage(id)` API |
| `app/components/product/ProductCard.vue` | Shared media view with local fallback |
| `app/pages/products/[product_id].vue` | Existing image plus conditional accessible thumbnail gallery when multiple API images are present |
| `app/components/cart/CartItem.vue` | Optionally show current product API media; store items unchanged |
| `app/pages/cart.vue` | Pass already-fetched product data to the existing cart item view |
| `app/pages/checkout.vue` | Reuse already-fetched product media and existing fallback |
| `app/pages/admin/products/index.vue` | Show API media in table; **no fake upload** |
| `app/components/home/CategoryGrid.vue` | Support optional category `image_url` from API |
| `app/components/home/HeroBanner.vue` | Move hero text and local artwork paths to centralized configuration |
| `app/components/layout/SiteHeader.vue` | Shared StoreBrand and API category labels with approved offline fallback |
| `app/components/layout/SiteFooter.vue` | Shared StoreBrand and configurable display copy (existing links preserved) |
| `app/components/layout/AnnouncementBar.vue` | Use centralized announcement copy; dismissal unchanged |
| `app/layouts/auth.vue` | Shared StoreBrand |
| `app/layouts/admin.vue` | Shared StoreBrand, including the Admin label |
| `app/pages/index.vue` | Featured product IDs now read from storefront configuration; New Arrivals unchanged |
| `nuxt.config.ts` | Read page title and favicon from common storefront config; API/runtime config unchanged |
| `README.md`, `FINAL_HANDOFF_CHECKLIST.md` | Linked media and branding handoff notes |

## Deliberately NOT implemented

No uploads or file storage, no image editing admin UI with fake persistence, no database migration, no new sample product rows, no CMS, no theme editor, no new frameworks, no real payment/checkout processing. Backend owns eventual image persistence and admin upload permissions.

## Verification

Run in `campuscart/`:

```powershell
node --experimental-strip-types scripts/verify-media-handoff.mjs
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
node --experimental-strip-types scripts/verify-stage5.mjs
node --experimental-strip-types scripts/verify-stage6.mjs
node scripts/verify-stage7.mjs
node scripts/verify-stage7-complete.mjs
node scripts/verify-stage7-transactions.mjs
node scripts/verify-stage8.mjs
node --experimental-strip-types scripts/verify-handoff.mjs
npx nuxt typecheck
npm run build
npm run dev
```

Run on desktop/tablet/mobile: original home, category links, catalog and details, image thumbnails (when API supports gallery), add-to-cart, checkout, admin list and basic keyboard navigation. `npm install --include=dev` only if this extracted copy has no installed dependencies. Never replace your verified `.git` and `package-lock.json` with an archive copy.
