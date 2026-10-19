# CampusCart — Frontend API Contract for Backend Team

**Source:** completed Stage 8 Nuxt source, `app/services/*.ts`, `app/types/*.ts`, and `server/api/v1/`. This describes the **currently implemented mock API**, not an existing production backend. No PostgreSQL, ORM, or live payment gateway is included.

## Base URL and integration strategy

- Existing services call canonical routes under `/api/v1`; all calls now pass through `app/utils/apiUrl.ts`.
- Default: `NUXT_PUBLIC_API_BASE=/api/v1`, which uses the Nuxt mock handlers **unchanged**.
- To connect an agreed API: `NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1` (illustration; the backend's actual origin/port must be confirmed). No frontend page rewrite is required **if the response contract is kept compatible**.
- Prefer a same-origin reverse proxy for auth cookies and SSR. If a cross-origin backend is selected, backend and frontend must agree on credentials, CORS `Access-Control-Allow-Credentials`, cookie domain/SameSite/Secure and CSRF defenses **before integration**. Merely switching the base URL does not solve those issues.
- `server/api/v1` mock handlers remain bundled as a local fallback. Before any public deployment, disable/remove/mock-isolate them; do not expose simulated order or admin operations as a real service.

## Envelopes, errors and common representations

On success, current mock endpoints return:

```json
{ "success": true, "data": {}, "message": "Human-readable result" }
```

Product-list endpoint additionally provides pagination metadata:

```json
{
  "success": true,
  "data": [],
  "message": "Products retrieved",
  "meta": { "page": 1, "page_size": 12, "total_items": 0, "total_pages": 1 }
}
```

The current mock handlers throw H3/Nitro HTTP errors, commonly serialized with `statusCode`, `statusMessage`, and `message`; this is **not** a standardized `{success:false,error:{...}}` error contract. Frontend forms currently read `error.data.statusMessage` in some places and a generic failure in others. Backend team must agree to retain this error shape or jointly implement a compatibility adapter, preserving status codes and validation feedback. Common observed intended statuses include `400` invalid ID/query, `401` unauthenticated, `403` wrong role, `404` not found, `409` duplicate/stock/conflicting order state, `422` invalid form/request; exact statuses per handler must be confirmed in API integration tests.

- IDs: positive integers, using exactly ERD names (`product_id`, `category_id`, `order_id`, `user_id`, `address_id`).
- `DECIMAL(12,2)` amounts travel as strings, e.g. `"99.00"`; user interface formats these as Philippine pesos. Do not send binary floating point prices.
- Dates: ISO-8601 timestamp strings in API responses, although ERD columns are `DATETIME`.
- Roles/statuses listed below are approved only for the **current mock behavior**, not automatically for SQL ENUM definitions.
- All authenticated endpoints require server-side session and ownership/role checks. Never return `password_hash`.

## Public catalog

| Method + route | Query/body | Response `data` | Existing frontend caller |
|---|---|---|---|
| `GET /api/v1/products` | Optional `q` (≤100), `category_id`, `min_price`, `max_price`, `in_stock=true/false`, `sort=newest/name_asc/price_asc/price_desc`, `page`, `page_size` (mock max 24). | `Product[]` plus `meta` pagination. The default mock returns 12 items. | `fetchProducts`, `fetchCatalogPage` |
| `GET /api/v1/products/:product_id` | Positive integer path ID | `Product` | `fetchProductById` |
| `GET /api/v1/categories` | None | `Category[]` (currently active only) | `fetchCategories` |

**Product** = `{ product_id:number, category_id:number, sku:string, product_name:string, description:string, price:string, stock_quantity:number, status:'ACTIVE'|'INACTIVE', created_at:string, updated_at:string }`.

**Category** = `{ category_id:number, category_name:string, description:string, status:'ACTIVE'|'INACTIVE', created_at:string, updated_at:string }`.

The approved ERD has **no product image column**. `app/utils/productMedia.ts` maps known demo `product_id` values to static SVG paths, with a fallback for future IDs. This is intentionally temporary; the backend team must jointly propose an image ownership/asset strategy (do not silently add a database column).

Homepage Featured Products are chosen via hardcoded editorial IDs `[201,101,301,202]`; New Arrivals uses `products.created_at`. A larger backend catalog may require the agreed selection/pagination policy, but do not invent discount or featured fields.

## Authentication and customer profile

| Method + route | Request JSON | Response `data` | Access |
|---|---|---|---|
| `POST /api/v1/auth/register` | `{first_name,last_name,email,password}` (password currently 12–128 chars) | `PublicAccount`; 201 | Guest; customer role assigned on server |
| `POST /api/v1/auth/login` | `{email,password}` | `PublicAccount` | Guest |
| `GET /api/v1/auth/me` | None | `PublicAccount` or `null` | Session optional |
| `POST /api/v1/auth/logout` | None | `null` | Session |
| `PATCH /api/v1/me/profile` | `{first_name,last_name,email}` | `PublicAccount` | Customer |
| `GET /api/v1/me/addresses` | None | `CampusAddress[]` | Customer/owner |
| `POST /api/v1/me/addresses` | `AddressDraft` | `CampusAddress` (201) | Customer |
| `PATCH /api/v1/me/addresses/:address_id` | `AddressDraft` | `CampusAddress` | Customer/owner |
| `DELETE /api/v1/me/addresses/:address_id` | None | `null` | Customer/owner |
| `PATCH /api/v1/me/addresses/:address_id/default` | None | `CampusAddress` | Customer/owner |
| `POST /api/v1/auth/demo` | `{role:'CUSTOMER'|'ADMIN'}` | `PublicAccount` | **Legacy local QA only**, disabled by default, unavailable outside dev mode; not for backend implementation |

**PublicAccount** = `{user_id,first_name,last_name,email,role,account_status,created_at,updated_at}`. No password hash, no client-supplied role. Mock values: role `CUSTOMER`/`ADMIN`, account_status `ACTIVE`.

**CampusAddress** = `{address_id,user_id,address_label,recipient_name,phone_number,barangay,city,is_default,created_at}`. `AddressDraft` contains only `address_label`, `recipient_name`, `phone_number`, `barangay`, `city`, `is_default`; required fields are validated, phone accepts basic number formats. ERD deliberately does not have street, province or postcode. Backend should not assume these fields exist.

The current Nuxt mock sets an HTTP-only `campuscart_demo_sid` cookie; session data is entirely in server memory. The backend must own session lifecycle, persistent identities, expiry, cookie security, CSRF defense, and audit behavior. Pinia holds only the public user profile.

## Customer checkout and orders

| Method + route | Request JSON | Response `data` | Access |
|---|---|---|---|
| `POST /api/v1/orders` | `PlaceOrderBody` below | `OrderDetail` | Customer; must enforce ownership/stock/idempotency |
| `GET /api/v1/me/orders` | None | `DemoOrder[]` | Customer (own orders only) |
| `GET /api/v1/me/orders/:order_id` | None | `OrderDetail` | Customer/owner |

Request schema (`request_id` is a transport-only idempotency token, **not an ERD column**):

```json
{
  "address_id": 3001,
  "payment_method": "CASH_ON_PICKUP",
  "items": [{ "product_id": 101, "quantity": 2 }],
  "request_id": "d3bc7c50-4020-43af-9d81-d5873542c96f"
}
```

No price, subtotal, shipping or user ID is accepted as authoritative from the client. Server recalculates total, validates stock and address ownership, deducts inventory at placement, restores exactly once on cancellation, records snapshots/history/payment and handles duplicate requests. These guarantees are **only simulated atomically within a single Node process**; backend must implement genuine transactional persistence/concurrency handling.

**OrderDetail** = `{order:DemoOrder,items:DemoOrderItem[],order_address:DemoOrderAddress,payment:DemoPayment,history:DemoStatusHistory[]}`. Exact fields:

- `DemoOrder`: `order_id,user_id,order_number,subtotal,shipping_fee,total_amount,order_status,placed_at,created_at,updated_at`.
- `DemoOrderItem`: `order_item_id,order_id,product_id,product_name,quantity,unit_price,subtotal` (historical price/name snapshots).
- `DemoOrderAddress`: `order_address_id,order_id,recipient_name,phone_number,barangay,city` (snapshot).
- `DemoPayment`: `payment_id,order_id,payment_method,payment_status,amount,payment_reference,paid_at,created_at`.
- `DemoStatusHistory`: `status_history_id,order_id,changed_by,status:number,remarks,created_at`.

Approved **demo-only** workflow: campus pickup, shipping `"0.00"`, payment `CASH_ON_PICKUP`, order statuses `PENDING → READY_FOR_PICKUP → COMPLETED`, with `CANCELLED` from either nonterminal status. `payment_status` is `UNPAID` until mock completion, then `PAID`; cancellation restores inventory. No real payment processing, pickup location or fulfillment service exists.

## Admin API (requires a server-enforced ADMIN role)

| Method + route | Request JSON | Response `data` |
|---|---|---|
| `GET /api/v1/admin/dashboard/summary` | — | `DemoSummary` |
| `GET /api/v1/admin/products` | — | `Product[]` |
| `POST /api/v1/admin/products` | `NewProductDraft` = `{sku,product_name,category_id,price,description,stock_quantity}` | `Product` (201) |
| `PATCH /api/v1/admin/products/:product_id` | `ProductDraft` = `{sku,product_name,category_id,price,description}` | `Product` |
| `GET /api/v1/admin/categories` | — | `Category[]` |
| `POST /api/v1/admin/categories` | `CategoryDraft` = `{category_name,description}` | `Category` (201) |
| `PATCH /api/v1/admin/categories/:category_id` | `CategoryDraft` | `Category` |
| `GET /api/v1/admin/inventory` | — | `{products:DemoInventoryRow[],movements:DemoInventoryMovement[]}` |
| `GET /api/v1/admin/orders` | — | `DemoOrder[]` |
| `GET /api/v1/admin/orders/:order_id` | — | `OrderDetail` |
| `PATCH /api/v1/admin/orders/:order_id/status` | `{order_status:'READY_FOR_PICKUP'|'COMPLETED'|'CANCELLED'}` (per permitted transition) | `OrderDetail` |
| `GET /api/v1/admin/payments` | — | `DemoPayment[]` |

**DemoSummary fields:** `total_products,available_products,total_stock_units,total_categories,total_orders,pending_orders,ready_orders,completed_orders,cancelled_orders,low_stock_products`. The low-stock threshold is the approved mock value **5 units**. No revenue/sales total is provided.

**DemoInventoryRow** = `{product_id,sku,product_name,stock_quantity}`. **DemoInventoryMovement** = `{movement_id,product_id,order_id,created_by,movement_type,quantity_change,notes,created_at}`. Mock movement labels `ORDER_DEDUCTION` and `ORDER_RESTORATION` are *not finalized database ENUM definitions*. No manual stock-adjustment API or real payment-write API currently exists; don't infer one from the admin UI.

## Cart contract gap (requires joint decision)

The current Pinia store owns **browser-tab session cart state**, with snapshot items `{product_id,product_name,price,stock_quantity,status,quantity}`. The ERD defines `carts` (`cart_id,user_id,created_at,updated_at`) and `cart_items` (`cart_item_id,cart_id,product_id,quantity,created_at,updated_at`), but **there is no server cart REST API yet**. The backend team needs to agree how login merges/migrates a tab cart, whether cart reads/writes are account-owned, and how UI snapshots are refreshed. Do not trust stored browser prices/stock.

Proposed `/api/v1/me/cart` routes from the earlier UI blueprint are **not implemented endpoints**. Integrate only after agreeing on request/response shapes and server ownership.

## Known integration mismatches and sign-off questions

1. `order_status_history.status` is `INT` while `orders.order_status` is `ENUM`. The mock maps `1=PENDING`, `2=READY_FOR_PICKUP`, `3=COMPLETED`, `4=CANCELLED`; backend/DB team must approve the final representation.
2. Existing ERD drawing has some connector mismatches versus FK columns; validate FK relationships before SQL migration. Also review uniqueness/cardinality for `carts.user_id`, `order_addresses.order_id`, and `payments.order_id`.
3. Existing `addresses` and `order_addresses` lack complete delivery address fields; current use is only campus-pickup contact snapshots, not delivery destinations.
4. Product images, product featured flag, promotion/discount, pickup venue and payment gateway fields are absent. Keep artwork mapping/fallback for now, then agree an asset solution without inventing columns.
5. SQL role/account/product/category/payment/inventory ENUM values are not all approved; only the mock order workflow is authorized.
6. Mock admin product editing intentionally cannot change stock/status and category editing cannot change status; there is no admin manual inventory adjustment API.
7. Default catalog page size 12 supports the existing mock dataset. For a larger backend dataset, homepage Featured IDs and `fetchProducts()` pagination need a jointly agreed strategy.
8. No backend pagination for customer/admin order lists is defined in the current code; discuss scalability without changing finished UI ahead of a contract.
9. Production authorization must be server-enforced even if client middleware blocks routes. Ensure no mock admin shortcut remains accessible once deployed.
10. Client `$fetch` errors are inconsistently surfaced: maintain mock H3 error properties or agree one adapter as part of backend integration.

**Change control:** This handoff does not add SQL entities, new sample data, a payment gateway, or a backend. Any deviations from the currently encoded API contract should be reviewed jointly by the frontend and backend teams.
