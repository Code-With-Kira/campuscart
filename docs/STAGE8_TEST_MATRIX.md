# CampusCart Stage 8 — Manual Test Matrix and Evidence Log

**This document is a blank execution log, NOT a claim that any browser test has passed.** The user confirmed Stage 7 browser/build verification; Stage 8 screens and end-to-end checks should be rerun before submission.

Test metadata: Tester: **[INSERT]** · Date: **[INSERT]** · Commit SHA: **[INSERT]** · OS: **Windows [INSERT]** · Browsers: **[INSERT]** · Server URL: **http://localhost:3000**.

Fill each **Actual result / P-F / Evidence** cell after performing the test; `—` means not recorded. Test data should be fictitious.

| ID | Area | Procedure | Expected result | Actual result / P-F / Evidence |
|---|---|---|---|---|
| M01 | Home | Open `/` | Seven approved sections visible; category/product records from API | — |
| M02 | Home | Open DevTools Network, reload `/` | `/api/v1/products` and `/api/v1/categories` respond successfully | — |
| M03 | Layout | Open navigation at 390px, navigate to each category | All links work, menu closes, no sideways scroll | — |
| M04 | Catalog | Visit `/products` | Product cards, names, PHP prices, stock status render | — |
| M05 | Catalog | Search for mouse, then clear | Matching results followed by full results | — |
| M06 | Catalog | Filter Tech Accessories | Only matching category appears | — |
| M07 | Catalog | Set valid minimum/maximum price | Results obey range | — |
| M08 | Catalog | Enter invalid price/filter range | Clear validation feedback; no silent failure | — |
| M09 | Catalog | Sort low-to-high, high-to-low, newest | Sort order changes correctly | — |
| M10 | Catalog | Change pagination | Correct page and products shown | — |
| M11 | Catalog | Search nonexistent product | Helpful empty state, clear/reset path | — |
| M12 | Product | Open `/products/201` | Correct details and image | — |
| M13 | Product | Open `/products/204` | Out-of-stock action disabled | — |
| M14 | Product | Open an invalid ID | Useful not-found/error view | — |
| M15 | Cart | Add product to cart | Count and subtotal update | — |
| M16 | Cart | Set quantity greater than stock | Invalid change rejected with feedback | — |
| M17 | Cart | Remove item then Undo | Item restored | — |
| M18 | Cart | Clear cart (confirm/cancel) | Cancel preserves; confirm clears | — |
| M19 | Cart | Reload same browser tab | Session cart restores; no SSR hydration mismatch | — |
| M20 | Auth | Register fictional customer with valid inputs | Session created; customer role assigned | — |
| M21 | Auth | Submit incomplete/invalid registration | Field-level errors; registration blocked | — |
| M22 | Auth | Login with invalid password | Generic failure, no leaked user secrets | — |
| M23 | Auth | Logout; navigate to `/profile` | Guest redirected; protected API denies unauthenticated access | — |
| M24 | Profile | Edit demo name/email | Changes display correctly during server session | — |
| M25 | Addresses | Add/edit/remove saved contact; set default | Server validates; only owned addresses accessible | — |
| M26 | Checkout | With cart+address, open `/checkout` | Current stock/prices, pickup contact and ₱0 shipping | — |
| M27 | Checkout | Submit order twice quickly | No double order or double stock decrement | — |
| M28 | Checkout | Place valid demo order | PENDING, UNPAID, order items/address snapshots; purchased cart cleared | — |
| M29 | Orders | Open `/orders`, then order details | Own order and history, totals, simulated payment status | — |
| M30 | Security | Customer visits `/admin` and admin APIs | Denied without admin permissions | — |
| M31 | Admin | Use development-only Admin Preview | Admin panel loads, customer accounts cannot be granted admin via registration | — |
| M32 | Admin | Add/edit product and invalid SKU/price/stock | Valid data accepted; invalid data rejected | — |
| M33 | Admin | Add/edit category, duplicate name | Valid category accepted; duplicate validation shown | — |
| M34 | Admin | Mark order READY_FOR_PICKUP then COMPLETED | Status history appended, payment becomes PAID only at completion | — |
| M35 | Admin | Cancel a separate PENDING order | Stock restored once, order terminal | — |
| M36 | Admin | Inventory and payment lists | Linked movement/order/payment records visible | — |
| M37 | Design | Test viewport widths 320, 390, 768, 1024, 1440px | No clipping, overlap or unwanted horizontal scroll | — |
| M38 | Keyboard | Use Tab, Shift+Tab, Enter, Space on nav/forms/cart | Focus visible; all controls operable | — |
| M39 | Accessibility | Inspect labels, alt text, contrast, alert/status messages | Findings recorded and issues corrected or noted | — |
| M40 | Browser | Repeat core flow in Chrome + another installed browser | Results recorded separately; no assumed compatibility | — |
| M41 | Console | Repeat core flow with F12 Console open | No blocking errors; warnings documented | — |
| M42 | API | Execute `node scripts/smoke-stage8.mjs` in fresh dev server | Test outputs pass, restart to reset demo data | — |
| M43 | Build | Run `npx nuxt typecheck` and `npm run build` | Both finish successfully; logs saved | — |
| M44 | Git | Open GitHub repository and commit history | Commits from actual contributors visible | — |

## Issues and corrective actions

| Issue ID | Steps to reproduce | Severity | Owner | Resolution/Status | Retest evidence |
|---|---|---|---|---|---|
| BUG-01 | [INSERT ACTUAL ISSUE] | [INSERT] | [INSERT] | [INSERT] | [INSERT] |

## Screen evidence index

Capture browser screenshots yourself (do not substitute synthesized imagery for test evidence):

- `01-home-desktop.png`, `02-home-mobile.png`, `03-catalog.png`, `04-product-details.png`, `05-cart.png`, `06-login.png`, `07-register.png`, `08-profile.png`, `09-addresses.png`, `10-checkout.png`, `11-order-history.png`, `12-order-details.png`, `13-admin-dashboard.png`, `14-admin-products.png`, `15-admin-categories.png`, `16-admin-inventory.png`, `17-admin-orders.png`, `18-admin-payments.png`.
- `19-build-output.png`, `20-git-history.png` as separate verification evidence.

Store screenshots privately or in an approved documentation folder with no passwords, cookies, real contact information or sensitive browser content visible.
