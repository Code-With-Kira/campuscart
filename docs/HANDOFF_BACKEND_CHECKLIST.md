# CampusCart — Backend Integration Handoff Checklist

This is a **frontend handoff**, not a new implementation stage. Stage 8 is complete per the frontend team. The Nuxt mock routes remain available to keep the existing UI usable until the backend provides matching APIs and agreed sample data.

## Handoff acceptance gates

- [ ] Confirm receiving team has the tested source and matching Node/npm lockfile from the frontend team's Windows repository. The ZIP intentionally excludes `node_modules`, `.nuxt`, `.output` and `.git`.
- [ ] Compare every endpoint in `docs/HANDOFF_API_CONTRACT.md` with planned backend controllers; record contract deviations before rewriting UI.
- [ ] Agree exact backend base URL (`/api/v1` prefix) and same-origin proxy or credentialed cross-origin cookie/CORS strategy. Set `NUXT_PUBLIC_API_BASE` only after this is confirmed.
- [ ] Implement server-owned authentication/session lifecycle and true role-based authorization. No frontend role or cookie value is trusted for admin access.
- [ ] Provide product/category data in ERD names and `DECIMAL(12,2)` string format. Do not assume a product image DB field; settle asset mapping separately.
- [ ] Agree whether `GET /products` default page returns all homepage items or only a page; clarify Featured Product sourcing and New Arrivals sorting.
- [ ] Agree cart API endpoints and state merge rules (currently only tab-storage Pinia cart exists). The cart's price/stock snapshot is never authoritative.
- [ ] Implement checkout with server-authoritative prices/stock, customer-owned pickup contact, idempotent `request_id`, transactional stock reservation/deduction, and one-time cancellation restoration.
- [ ] Implement `orders`, `order_items`, `order_addresses`, `payments`, `order_status_history`, `inventory_movements` with ERD/FK constraints and approved status transitions.
- [ ] Agree how mock-only `order_status_history.status` integer mapping relates to SQL order ENUM representation.
- [ ] Keep payment strictly **simulated** until a separate approved payment design exists. Do not mark an unpaid order paid on the frontend alone.
- [ ] Provide admin product/category CRUD, inventory overview, customer/order ownership checks and admin order statuses exactly as documented.
- [ ] Agree complete error contract (current H3/Nitro `statusCode/statusMessage/message`), validation field feedback, HTTP codes, and pagination.
- [ ] Retire or isolate `server/api/v1` mock handlers before deploying a live backend to the public; avoid exposing two mutually inconsistent `/api/v1` implementations.
- [ ] Disable `NUXT_PUBLIC_ENABLE_DEMO_PREVIEW` in any shared/public environment. The legacy auth preview is OFF by default for this handoff.
- [ ] Re-run `npm audit` and review high-severity dependency findings before any public deployment (an earlier local install reported 11 high-severity findings; their current remediation status is unverified). Do not blindly run `npm audit fix --force`.
- [ ] Add contract tests against real backend responses and run `npx nuxt typecheck`, `npm run build`, browser/regression/accessibility checks after integration.
- [ ] Review `.env.example` (contains public settings only); never commit passwords, DB connection strings or tokens to `NUXT_PUBLIC_*`.

## What the frontend team retains

- Source UI/components, three layout types, page routes and accessibility behavior.
- `app/services/{catalog,account,orders,admin}.ts` and the central `app/utils/apiUrl.ts` path adapter.
- Pinia auth/cart stores and tested local cart persistence until cart API agreement.
- TS types in `app/types/*.ts`, validation/utilities, loading/empty/error messages.
- Local SVG product artwork and ID mapping fallback as **presentation only**.
- Legacy Nuxt mock handlers and fixture records for offline QA **only**.

## Explicitly not delivered

- A persistent database or schema migration; no Prisma/ORM.
- An actual backend implementation, auth provider, persistent orders, email/SMS, campus pickup logistics, or real payment gateway.
- A complete list of back-end sample records beyond the existing Stage 8 mock fixtures.
- Evidence of a new production Nuxt build in the handoff authoring environment (the frontend team separately confirmed Stage 8 worked on its laptop).

## Suggested backend integration sequence (for the receiving team)

1. Configure local backend base URL and validate one public catalog GET; compare exact response envelopes.
2. Coordinate session/cookie policy and validate login/register/me/logout with both customer and admin roles.
3. Connect customer profile and addresses with strict ownership checks.
4. Agree and implement persistent cart API; keep current Pinia interactions stable.
5. Connect order placement/idempotency, snapshots, stock movement and status history.
6. Connect admin catalog, inventory/order/payment read models and test forbidden accesses.
7. Run end-to-end contract tests and only then disable mock routes for actual deployments.

## Decisions that require both teams

- Final SQL enum values and history status storage; FK diagrams and unique constraints.
- Pickup contact vs a future delivery address schema; actual pickup site policy.
- Production account/session provider and CSRF/CORS/cookie strategy.
- Product image storage, newly-created product art, homepage featured configuration.
- Catalog pagination beyond the initial 12 mock products.
- Cart merge/persistence design and inventory/concurrency guarantees.
- Real payment integration is a **separate future approval**, not this handoff.
