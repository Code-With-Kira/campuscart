# Stage 5 — Change Log

This Stage 5 project is a **targeted extension of the supplied Stage 4 ZIP**. The Stage 4 homepage, catalog, Product Details route, mock API endpoints, product SVGs, original Nuxt layouts and CSU-inspired Tailwind tokens are intact.

## Existing files changed

| File | Change |
|---|---|
| `app/stores/cart.ts` | Expanded the **existing** Pinia cart with input validation, per-line quantities, undo/remove/clear actions, cart totals, availability checks, and safe session restoration; existing `addProduct` and `setQuantity` continue to work. |
| `app/pages/cart.vue` | Replaced the minimal Stage 3/4 cart view with responsive Stage 5 cart page, empty/loading/error states, API stock refresh, item removal, undo and Clear Cart confirmation. |
| `package.json` | Updated direct `vue-router` dependency from `^4.5.0` to `^5.0.0` to **preserve the Vue Router 5 fix** the user already verified in Stage 4. No other dependencies added. **Do not overwrite an existing laptop package.json/lockfile blindly if it already contains the working fix.** |
| `README.md` | Added current Stage 5 handoff and setup section; previous project information retained. |

## New files

| File | Purpose |
|---|---|
| `app/components/cart/CartItem.vue` | Reusable accessible cart row, quantity entry, minus/plus, Remove, stock warnings, and line subtotal. |
| `app/components/cart/CartSummary.vue` | Reusable subtotal summary that explicitly does not invent checkout or shipping. |
| `app/plugins/cart-persistence.client.ts` | Client-only, post-hydration browser-tab `sessionStorage` persistence. |
| `app/utils/cartValidation.ts` | Shared input and stored-snapshot validation (testable without Nuxt). |
| `scripts/verify-stage5.mjs` | Dependency-free source regression and executable cart-rule checks. |
| `docs/STAGE5_GUIDE.md` | Implementation rationale, setup, tests, limitations, and handoff. |
| `docs/STAGE5_CHANGELOG.md` | This change list. |
| `docs/STAGE5_FULL_SOURCE.md` | Complete code for each new/modified app file. |
| `docs/STAGE5_VERIFICATION.md` | Record of executed checks and required laptop checks. |

## Unchanged architecture and deferred functionality

- Nuxt 4 + Vue 3 + TypeScript + Pinia + Tailwind 4 + Inter remain in place.
- No extra database fields, new API endpoints, authentication logic, actual order placement, payments, or checkout were implemented.
- `cart_id`, `cart_item_id`, and other backend-owned IDs are **not invented**. They will come from the real database/API in a later stage.
- Cart persistence is browser-session only and cannot substitute for an authenticated server cart.
- Mock `ACTIVE`/`INACTIVE` product statuses remain provisional while the approved ERD ENUM details are unresolved.
- Product prices are illustrative PHP decimal strings; shipping and final order total will be calculated by a future trusted backend.
