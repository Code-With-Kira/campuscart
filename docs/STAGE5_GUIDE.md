# CampusCart — Stage 5 Shopping Cart Refinement

## 1. Goal and scope

Extend the **verified Stage 4 Nuxt storefront**, not start over. Stage 5 makes the core Pinia shopping cart usable for a Midterm frontend demonstration while leaving payments, checkout, login, and PostgreSQL for later stages.

### What works

- Add products from the preserved homepage, Product Catalog and Product Details views, using the **same Pinia store**.
- Cart counter in the preserved responsive SiteHeader.
- Cart item thumbnails and links to product details using the existing `product_id` media map.
- Adjust quantities using plus/minus controls or a validated numeric entry and Update action.
- Guard against zero, fractional, nonnumeric, and over-stock quantities (no partial additions or silent clamping).
- Remove one product, undo the last removal, or clear the whole cart after confirmation.
- Line-item subtotals, number of different products, total quantity, and overall items subtotal in PHP.
- Restore temporary cart items across refresh/navigation **within the same browser-tab session**, using `sessionStorage`.
- Re-read current mock product information via the existing `/api/v1/products` endpoint when opening the cart; refresh name/price/stock, retain and flag any unavailable/over-limit items.
- Empty-cart, loading, API-error with Retry, invalid-quantity, stock-warning, and success-feedback states.
- Responsive desktop/mobile layout and accessible text labels/buttons.

### What is not implemented

No account-linked cart, server-side cart IDs, secure checkout, shipping calculation, order creation, database persistence, real payment processing, admin inventory deductions, or real stock reservation. Guest/demo cart access is **a reversible development-only assumption** because requiring login before adding items remains an unresolved business-rule decision.

## 2. Important ERD constraints

Approved database fields for cart entities remain:
- `carts`: `cart_id`, `user_id`, `created_at`, `updated_at`
- `cart_items`: `cart_item_id`, `cart_id`, `product_id`, `quantity`, `created_at`, `updated_at`
- `products`: `product_id`, `category_id`, `sku`, `product_name`, `description`, `price`, `stock_quantity`, `status`, `created_at`, `updated_at`

`DemoCartItem` is a **client-side view snapshot**, not a 13th database table and not a replacement for `cart_items`. Fields like `product_name`, `price`, `status`, and `stock_quantity` are copied from `products` only for display and validation. A real backend must revalidate prices, authorizations, inventory, address, and the complete order total.

`ACTIVE` and `INACTIVE` are provisional mock status values and **are not a confirmed production ENUM**.

## 3. Exactly how to merge Stage 5 into your existing VS Code project (recommended)

1. Save a clean Stage 4 Git commit or backup first.
2. Extract `CampusCart_Stage5.zip` **outside** your working repository (for example into Downloads).
3. Read `docs/STAGE5_CHANGELOG.md` to identify the exact files.
4. Copy only the Stage 5 new files and changed `app/stores/cart.ts`, `app/pages/cart.vue`, `README.md` as appropriate into the matching relative paths of your existing `C:\KIRA_WORKSPACE\01-Academic-Projects\ITE-18\campuscart`.
5. Keep your existing `.git`, `node_modules`, and `package-lock.json`. Stage 5 does **not** require a new `npm install` if your verified Stage 4 dependencies still exist.
6. **Pay particular attention to `package.json`:** Stage 4 ZIP contained an old direct Vue Router 4 dependency. The Stage 5 archive declares `vue-router: ^5.0.0` to retain your confirmed Vue Router 5 fix. If your *local* `package.json` already has Vue Router 5, preserve your local version and lockfile. Do **not** restore Vue Router 4 by overwriting it with an old manifest.
7. Do not replace files unrelated to Stage 5.

### Alternative: standalone extracted copy

If you want a separate test copy rather than merging, extract ZIP to an empty location and open its `campuscart` folder in VS Code:

```powershell
npm install
npm run dev
```

No `node_modules`, generated Nuxt cache, build output, `.git`, or lockfile is included in the ZIP. npm will generate a lockfile for a fresh standalone install.

## 4. Run and verify in VS Code

In the existing project root:

```powershell
cd "C:\KIRA_WORKSPACE\01-Academic-Projects\ITE-18\campuscart"
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
node --experimental-strip-types scripts/verify-stage5.mjs
npx nuxt prepare
npx nuxt typecheck
npm run build
npm run dev
```

On Node.js 24 the `--experimental-strip-types` flag is accepted, and recent Node versions can usually execute the `.ts` validation helper. If Node prints a **type-stripping experimental warning**, that is separate from test failures.

### Browser test cases (manual)

1. Open `http://localhost:3000`, add a Featured Product, and verify the SiteHeader cart count.
2. Open `/products/201`, add quantity 2, and verify the existing quantity is incremented **atomically**.
3. Open `/cart`; each item should display name, local illustration, current price, stock, quantity controls, line subtotal, and Remove.
4. Press `+` and `−`, then enter a valid quantity and press **Update**. Confirm header count, line subtotal, and summary all change together.
5. Enter `0`, `1.5`, letters, and a number greater than the displayed stock. Check validation and verify the cart quantity did **not** change.
6. Attempt to exceed stock using Product Details and the product card; no partial addition should occur.
7. Remove an item and press **Undo Remove**; the original quantity should be restored. Remove and choose not to undo; verify the removed item disappears.
8. Press **Clear Cart**, then **Cancel**; cart should remain unchanged. Press **Clear Cart**, then **Yes, Clear Cart**; verify empty state.
9. Add another product and refresh the browser in the **same tab**. Its quantity should restore. Open a completely separate tab or close the tab session; persistence is intentionally not guaranteed across sessions.
10. Visit `/api/v1/products`; the same mock response contract used in Stage 3/4 should remain valid.
11. Temporarily make `/api/v1/products` fail in a **local throwaway test**, verify the retry warning, then immediately restore the handler. Do not commit temporary failures.
12. Change a mock product's `stock_quantity` below its existing cart quantity in a local test, reload the cart, and check the warning. Restore the mock fixture afterwards.
13. Test 1440px, 768px, 390px and 320px viewports; no horizontal overflow or inaccessible controls.
14. Check `/`, `/products`, `/products/201`, `/login`, `/register`, `/admin`, `/admin/products` still load; no regressions.
15. Open Chrome DevTools Console and verify no blocking runtime or hydration errors.

Expected product data examples: `201` Wireless Study Mouse (sample PHP 499.00), `204` Foldable Laptop Stand (sample stock 0). This is mock data, not actual campus inventory.

## 5. New/modified files and why

| File | Purpose |
|---|---|
| `app/stores/cart.ts` | Single Pinia source of truth; adds restore/undo/clear/reconcile and validates quantities. |
| `app/utils/cartValidation.ts` | Testable validation for browser-session snapshots and quantities. |
| `app/plugins/cart-persistence.client.ts` | Restore/save in `sessionStorage` after Nuxt app mounts, preventing SSR/client HTML mismatches. |
| `app/components/cart/CartItem.vue` | Reusable accessible item/quantity UI. |
| `app/components/cart/CartSummary.vue` | Central summary that does not imply checkout works. |
| `app/pages/cart.vue` | Displays the shopping cart, API availability refresh, confirmation and errors. |
| `package.json` | Captures your already-confirmed Vue Router 5 fix. |
| `scripts/verify-stage5.mjs` | Standalone rule and source checks. |
| `docs/STAGE5_FULL_SOURCE.md` | Complete code listing for each app change. |

### Architectural notes

- The store remains `useCartStore`, and existing `cart.addProduct(product, quantity)` usages still work.
- **No new API endpoints:** cart inventory reconciliation uses `fetchProducts()` from the pre-existing `app/services/catalog.ts`, which calls `GET /api/v1/products`.
- Cart quantities are integer values. The display subtotal uses `pesosToCentavos` and `formatCentavos` from Stage 3, avoiding most common floating-point errors for the small demo dataset.
- `sessionStorage` is temporary, untrusted, and designed for this browser-tab demo only. It is **not** proof of real persistent carts. Cart data is validated on restoration and refreshed against the available mock API items on visiting `/cart`.
- The storage key is `campuscart-demo-cart-v1` (versioned). No login token, user identity, hashed password, or payment information is stored.
- Clearing the cart does not create orders or change the mock inventory.

## 6. Common troubleshooting

**`Cannot find module '@tailwindcss/vite'`**: First check that you're in the right project folder, then `npm ls @tailwindcss/vite`. If truly missing, run `npm install -D tailwindcss @tailwindcss/vite` without recreating Nuxt.

**`vue-router/volar/sfc-route-blocks`**: Your Stage 4 working project used Vue Router 5. Ensure your local `package.json` and lockfile preserve the installed major version and `npm ls vue-router` does not show an old direct Vue Router 4 dependency.

**Cart is empty after a refresh**: Check that browser JavaScript and tab storage are permitted. The `.client.ts` plugin runs only after Nuxt has mounted. Test from a normal tab (not private-window storage restrictions). Check DevTools Console for errors.

**Cart appears to display old prices**: Visit `/cart` while the mock product API is available; the page refreshes the snapshots from `/api/v1/products`. Reload if you edited a mock fixture while developing.

**`CartCartItem` unknown component**: Check the path `app/components/cart/CartItem.vue`. Nuxt auto-imports this as `<CartCartItem />` because of the folder prefix. Restart Nuxt if files were created while the dev server was running.

## 7. Git commit after laptop verification

```powershell
git status
git add app/stores/cart.ts app/pages/cart.vue app/components/cart app/plugins/cart-persistence.client.ts app/utils/cartValidation.ts scripts/verify-stage5.mjs docs README.md package.json
git commit -m "feat: refine CampusCart demo cart with validation and session storage"
```

Review your local `package-lock.json`; if you intentionally updated the Vue Router version, include the lockfile in the commit. Avoid including `node_modules` or build output.

## 8. Deferred next stage

**Stage 6 — Authentication and Customer Screens** is not started. Before that stage, decide whether a guest may add items or login is required, and how future demo credentials/sessions should work. The instructor's Midterm calls for form validation and ethical handling of user data, but not a production-ready authentication backend.

**Stage 5 is not complete on your laptop until the typecheck, build, and browser checklist pass.**
