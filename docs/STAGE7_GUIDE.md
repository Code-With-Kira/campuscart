# CampusCart — Stage 7 Final Implementation Guide

**Scope:** The existing Stage 7 partial project has been extended to implement the user-approved **academic demo checkout and order workflow**. This is not a real store, officially CSU-affiliated service, payment gateway, or PostgreSQL application. No new framework, ORM, or dependency is required beyond the current working Stage 6/7 environment.

## Approved demo business rules

| Topic | Implemented rule |
|---|---|
| Fulfillment | Campus pickup **only**. There is **no pickup venue** defined; none is invented. |
| Shipping | Always `0.00` Philippine pesos. |
| Payment | `CASH_ON_PICKUP` **simulated**; never processes/collects real money. |
| Order status | `PENDING`, `READY_FOR_PICKUP`, `COMPLETED`, `CANCELLED`. |
| Payment status | `UNPAID` at checkout, `PAID` when admin sets `COMPLETED` (simulated cash handover). Cancellation leaves `UNPAID`. |
| Stock | Deduct at placement, restore exactly once on cancellation. Stock validation and calculation always occur on the server. |
| Low stock | `stock_quantity <= 5`, including out-of-stock products. |
| History | Order status history and inventory movements are recorded in the mock server's memory. |
| Status transitions | Conservative mock-only workflow: `PENDING → READY_FOR_PICKUP → COMPLETED`; `PENDING` or `READY_FOR_PICKUP → CANCELLED`; completed/cancelled are terminal. |

**ERD clarification:** `order_status_history.status` is `INT`, while `orders.order_status` is an enum. For this mock only, numeric history codes are `1=PENDING`, `2=READY_FOR_PICKUP`, `3=COMPLETED`, `4=CANCELLED`. This mapping is **provisional** and does not silently change the ERD. `ORDER_DEDUCTION` and `ORDER_RESTORATION` are likewise provisional mock `inventory_movements.movement_type` values, not approved final SQL enum definitions.

**Pickup contact:** Checkout uses a previously saved `addresses.address_id` to select the contact. A new `order_addresses` snapshot copies only the already defined `recipient_name`, `phone_number`, `barangay`, and `city`. This is contact information, **not a delivery destination or pickup location**. Existing user ID and account roles are validated by the server.

## Installation in VS Code (Windows PowerShell)

1. Back up/commit your locally verified Stage 6 + Stage 7 partial version.
2. Extract the final ZIP **to a temporary folder**, not directly onto your live repository.
3. In the extracted `campuscart/docs/STAGE7_CHANGELOG.md`, review which files changed compared to the Stage 7 partial ZIP. Copy **only the listed new and modified files** into your existing CampusCart project. Keep `.git`, `node_modules`, and your verified `package-lock.json`.
4. The ZIP can alternatively run as a **standalone project**; enter its `campuscart` folder, then use `npm install --include=dev` if dependencies are not already installed. No new dependencies were introduced by this checkout update.
5. Start from your existing `C:\KIRA_WORKSPACE\01-Academic-Projects\ITE-18\campuscart` folder.

```powershell
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
node --experimental-strip-types scripts/verify-stage5.mjs
node --experimental-strip-types scripts/verify-stage6.mjs
node scripts/verify-stage7.mjs
node scripts/verify-stage7-complete.mjs
node scripts/verify-stage7-transactions.mjs
npx nuxt prepare
npx nuxt typecheck
npm run build
npm run dev
```

If Nuxt's dependencies are missing, run `npm install --include=dev` **once in the project directory**. Do not blindly run `npm audit fix --force`; inspect npm audit output separately. On your laptop, keep the compatible Vue Router 5 and `@tailwindcss/vite` dependencies you previously repaired.

## Screens and routes

| User | Frontend route | What it does |
|---|---|---|
| Customer | `/cart` | Stage 5 cart with quantities and updated checkout link |
| Customer | `/checkout` | Review, select saved pickup contact, place demo order |
| Customer | `/orders` | List orders belonging only to current customer |
| Customer | `/orders/:order_id` | Order items, contact snapshot, cash status, history |
| Admin | `/admin` | Product/stock counts, low-stock and order status counts |
| Admin | `/admin/orders` | List all demo orders |
| Admin | `/admin/orders/:order_id` | Inspect order; confirm valid status transition |
| Admin | `/admin/payments` | Read-only status of simulated payment records |
| Admin | `/admin/inventory` | Current stock and debit/restoration movement history |
| Admin | `/admin/products`, `/admin/categories` | Existing Stage 7 management, unchanged |

## Mock APIs

All endpoints use the existing `{success, data, message}` envelope and existing role guards. Authorization is verified on the server; frontend middleware alone is insufficient.

| Method | Endpoint | Audience | Request/return |
|---|---|---|---|
| POST | `/api/v1/orders` | Customer | `address_id`, `payment_method`, `items`, `request_id` → complete `OrderDetail` |
| GET | `/api/v1/me/orders` | Customer | Own list of `DemoOrder` |
| GET | `/api/v1/me/orders/:order_id` | Customer | Own order detail or 404 |
| GET | `/api/v1/admin/orders` | Admin | All demo orders |
| GET | `/api/v1/admin/orders/:order_id` | Admin | Order detail |
| PATCH | `/api/v1/admin/orders/:order_id/status` | Admin | `{ "order_status": "READY_FOR_PICKUP" }` or other valid next state |
| GET | `/api/v1/admin/payments` | Admin | Simulated payment records |
| GET | `/api/v1/admin/inventory` | Admin | Current product stock and movement records |
| GET | `/api/v1/admin/dashboard/summary` | Admin | Catalog and order counts / low-stock count |

### Example demo order request

```json
{
  "address_id": 3001,
  "payment_method": "CASH_ON_PICKUP",
  "items": [{ "product_id": 101, "quantity": 2 }],
  "request_id": "f019b5a0-328b-4c86-a121-ccb85e7be903"
}
```

`address_id` is an example only; a saved address **owned by the logged-in customer** must actually exist. `request_id` is an ephemeral transport idempotency key (not an ERD field). Prices, stock, subtotal, shipping and total are **ignored if sent by the client**; the server recomputes them from the current mock catalog. Repeating the same request ID and body for the same account returns the existing order instead of deducting stock twice; reuse with changed payload returns `409`.

## Transaction workflow

1. Customer registers/logs in, saves a contact address, and adds products to the existing cart.
2. Checkout fetches current mock product prices/stock. Submit is disabled while loading, processing, missing a saved contact, or when products are unavailable.
3. `POST /api/v1/orders` checks the authenticated customer, owned address, unique positive integer cart items, acceptable stock, and supported payment method.
4. The synchronous Node mock handler calculates integer-centavo totals; creates order, order item snapshots, pickup-contact snapshot, UNPAID simulated payment, initial numeric status history; and deducts units with signed inventory movements.
5. Only after successful order creation does the Pinia cart remove the purchased quantities **without enabling Undo**. The customer is redirected to a details page showing the order number and unpaid status.
6. Admin moves `PENDING → READY_FOR_PICKUP → COMPLETED`, or cancels while pending/ready. Cancellation restores stock once; completion changes payment to simulated `PAID` and stores a demo reference.
7. Customer history, admin orders/payments, inventory, dashboard reflect the current in-memory state. Server restart resets it.

## Manual acceptance checklist

- [ ] Register a fictional customer or use the dev-only Demo Customer shortcut.
- [ ] Add a saved address using `Profile → Addresses`.
- [ ] Add multiple products; ensure price and stock are visible in `/checkout`.
- [ ] Confirm shipping is ₱0.00 and Cash on Pickup (simulated) is the only payment option.
- [ ] Place an order. Confirm the cart removes purchased quantities; `/orders` shows a `PENDING`, `UNPAID` order.
- [ ] On a second tab or an Admin Preview session, verify the new order in `/admin/orders`. NOTE: logging into a new role in the **same browser profile** replaces the session; use another browser profile or log in sequentially.
- [ ] Advance to READY_FOR_PICKUP; verify history and payment remains UNPAID.
- [ ] Advance to COMPLETED; verify simulated payment becomes PAID; inventory is not restored.
- [ ] Place a **new** demo order and cancel it; verify stock restoration is exactly the originally purchased quantity, history records it, and payment remains UNPAID.
- [ ] Verify cancelled/completed orders do not offer any further transition.
- [ ] Verify low-stock counts reflect ≤5 units and movement list shows debits/credits.
- [ ] Attempt invalid/missing contact, invalid quantity, and excessive stock; order must fail without partial deduction.
- [ ] Verify an unlogged visitor cannot access protected API routes; a customer cannot read another customer's order or edit admin records.
- [ ] Refresh homepage, product catalog, cart, profile and address screens to ensure Stage 3–6 features still work.
- [ ] Verify responsive layouts (390px, 768px, 1440px) and browser console, and run Nuxt typecheck and build locally.

## Known limitations / future Final work

- No actual pickup counter, service hours, identity verification on pickup, booking or shipping/delivery. Do not advertise real fulfillment.
- Mock session accounts, orders, payments, and inventory movements only live in the current Nuxt Node server process; records reset on restart/hot reload and are unsuitable for multi-process or deployed hosting.
- Checkout is server-calculated and single-process validate-then-commit, **not a PostgreSQL transaction**. Persistent stock locks, concurrent database writes, and real exactly-once guarantees remain for the Final.
- Demo shopping cart continues to use per-tab browser sessionStorage, not an account-bound database cart. The checkout API enforces the authenticated account even though the frontend cart remains temporary.
- `status_history.status INT` mapping and movement type enum values need formal schema approval before PostgreSQL integration.
- Product images continue to be mapped to local illustration assets without adding an image field to your ERD.
- Product/category admin editing from the partial Stage 7 package remains available; manual stock adjustment, refunds, gateway settlement, promo pricing and destructive product deletion are not implemented.
- **No Nuxt build is claimed here** if the package cannot be installed in the authoring environment. Execute `npx nuxt typecheck` and `npm run build` on your laptop and report failures verbatim.
