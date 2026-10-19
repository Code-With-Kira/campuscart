# Stage 4 Verification

## In this packaging environment

- Stage 4 created from the exact existing `CampusCart_Stage3.zip`, without recreating the Nuxt project.
- Dependency installation attempted, but npm registry access returned `EAI_AGAIN` for `registry.npmjs.org`. Thus `npx nuxt typecheck`, `npm run build`, and live browser tests **cannot be claimed as passed here**.
- `node scripts/verify-stage4.mjs`: **21/21 structural/data checks passed**.
- `node scripts/verify-stage3.mjs`: **16/16 regression structural checks passed**.
- Independent TypeScript compiler parser inspection: **10/10 relevant `.ts` and Vue `<script setup>` sections parsed without syntax errors**. This checks syntax only, not Nuxt types.
- Mock server handler smoke tests, using TypeScript transpilation and stubbed event helpers: **passed** default list (12 records), category/stock filter, search, price bounds, pagination, sorting, single-product lookup, and expected 400/404 errors. This is not a real Nuxt HTTP server test.
- Stage 3 source integrity: compared original ZIP entries to the Stage 4 project, and changes listed in STAGE4_CHANGELOG.md.

## On your Windows laptop

1. Open the existing `campuscart` Nuxt project after copying only the Stage 4 modified/new files, or open the standalone ZIP folder.
2. Keep your existing Git repository, installed dependencies, and lockfile if merging.
3. Run `node scripts/verify-stage3.mjs` and `node scripts/verify-stage4.mjs`.
4. Run `npx nuxt typecheck` and `npm run build`.
5. Run `npm run dev` and open `/products` and `/products/101`.
6. Test category links from navbar and homepage, search, price and availability filters, sorting, clear filters, pagination, stock limits, Add to Cart, and existing homepage/cart/admin placeholders.
7. Test browser console and viewports 390px, 768px, and 1440px.
8. Test API endpoints listed in STAGE4_GUIDE.md.

Do not mark the Stage 4 build as verified until the local checks pass.
