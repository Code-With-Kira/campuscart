# CampusCart — Implemented Stage 7 API & Route Inventory (Stage 8 Reference)

All routes are derived from files in `server/api/v1`. HTTP methods follow Nuxt filename suffixes (`.get.ts`, `.post.ts`, `.patch.ts`, `.delete.ts`). Response convention is generally `{ success: true, data, message }`; catalog list additionally includes `meta` pagination. This is in-process **demo memory**, not PostgreSQL.

## Public read endpoints

| Method | Endpoint | Current purpose |
|---|---|---|
| GET | `/api/v1/products` | Active product list; query `q,category_id,min_price,max_price,in_stock,sort,page,page_size` |
| GET | `/api/v1/products/:product_id` | Single product |
| GET | `/api/v1/categories` | Active categories |

## Demo authentication/customer

| Method | Endpoint | Authorization / purpose |
|---|---|---|
| POST | `/api/v1/auth/register` | Guest; register demo customer only |
| POST | `/api/v1/auth/login` | Guest; demo login |
| POST | `/api/v1/auth/demo` | **Development only** customer/admin preview session |
| GET | `/api/v1/auth/me` | Returns account or null based on demo cookie |
| POST | `/api/v1/auth/logout` | Ends current session |
| PATCH | `/api/v1/me/profile` | Customer profile update |
| GET/POST | `/api/v1/me/addresses` | Customer owned addresses |
| PATCH/DELETE | `/api/v1/me/addresses/:address_id` | Edit/delete owned address |
| PATCH | `/api/v1/me/addresses/:address_id/default` | Choose customer default |
| GET | `/api/v1/me/orders` | Customer order list |
| GET | `/api/v1/me/orders/:order_id` | Owned order detail |
| POST | `/api/v1/orders` | Place demo campus-pickup order; customer only |

## Admin-only

| Method | Endpoint | Current purpose |
|---|---|---|
| GET | `/api/v1/admin/dashboard/summary` | Mock product/stock/order counts |
| GET/POST | `/api/v1/admin/products` | List and create product |
| PATCH | `/api/v1/admin/products/:product_id` | Edit product |
| GET/POST | `/api/v1/admin/categories` | List/create category |
| PATCH | `/api/v1/admin/categories/:category_id` | Edit category |
| GET | `/api/v1/admin/inventory` | Read stock and order movement log |
| GET | `/api/v1/admin/orders` | List all orders |
| GET | `/api/v1/admin/orders/:order_id` | Read order snapshot |
| PATCH | `/api/v1/admin/orders/:order_id/status` | Status transitions, mock history and payment |
| GET | `/api/v1/admin/payments` | Read simulated payment records |

All new admin endpoints require server-side administrator permission; customer endpoints require server-side customer permission. Frontend route middleware alone is not treated as production security.

## Request/response examples — DEMONSTRATION ONLY

```json
{
  "address_id": 1,
  "payment_method": "CASH_ON_PICKUP",
  "items": [{"product_id": 101, "quantity": 2}],
  "request_id": "e0f16971-5b30-4b18-a1c7-1ac6e531ff21"
}
```

`request_id` is a **transport-only idempotency token**, not an ERD column. On success the API returns an order-detail snapshot containing `order`, `items`, `order_address`, `payment`, and `history`. Actual IDs/timestamps/totals depend on current mock state and must not be copied as real user records.

Mock status transitions: `PENDING → READY_FOR_PICKUP → COMPLETED`; PENDING and READY_FOR_PICKUP can be `CANCELLED`. Payment starts `UNPAID`, becomes simulated `PAID` only upon COMPLETED. Inventory is deducted at creation and restored on cancellation. Product prices and stock are checked on the server rather than trusted from request bodies.

## Main Nuxt routes

| Customer/public pages | Admin pages |
|---|---|
| `/`, `/products`, `/products/:product_id` | `/admin` |
| `/cart`, `/checkout` | `/admin/products` |
| `/login`, `/register` | `/admin/categories` |
| `/profile`, `/profile/addresses` | `/admin/inventory` |
| `/orders`, `/orders/:order_id` | `/admin/orders`, `/admin/orders/:order_id` |
| `/information/:slug` | `/admin/payments` |

**Current limitation:** No REST cart persistence API, no real payment gateway, no production durable order storage. Cart state is frontend Pinia/tab-session-based. Product artwork lives in `public/images/` with a UI-only `product_id` mapping.
