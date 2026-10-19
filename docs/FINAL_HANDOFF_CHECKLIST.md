# CampusCart — Final Frontend-to-Backend Handoff Checklist

**Project:** CampusCart — ITE 18 e-commerce project  
**Handoff scope:** Completed Nuxt 4 / Vue 3 / TypeScript / Pinia / Tailwind CSS 4 frontend.  
**Recipient:** Backend integration team.  
**Status:** Frontend team reported Stage 8 testing and the final local production build passed; the backend is **not** integrated or production-ready.

> This is a handoff acceptance checklist, not a new development stage. Preserve the tested frontend. The backend team is responsible for real persistence, authentication, server business logic, and integration with agreed sample data.

## A. Verify the package and open the correct project root

- [ ] Extract the entire ZIP, including hidden/dot-prefixed files. **Open the nested `campuscart/` folder**, not the outer ZIP/extraction folder.
- [ ] Verify `package.json`, `nuxt.config.ts`, `app/`, `server/`, `scripts/`, `docs/`, and `public/` exist under `campuscart/`.
- [ ] Verify `campuscart/.env.example` is present. On Windows PowerShell: `Test-Path .\.env.example` should return `True` when run from `campuscart/`.
- [ ] Verify `docs/reference/Final_ERD_CampusCart.png` is available.
- [ ] Preserve the **original frontend team's Git repository/history and its tested `package-lock.json`**. The distributed ZIP intentionally excludes `.git`, `node_modules`, `.nuxt`, `.output`, and **does not include `package-lock.json`**; obtain the tested lockfile from the existing repo for a reproducible setup.
- [ ] Keep the tested frontend design, layout, routes, Pinia stores, reusable components, local SVG assets, and existing loading/error states intact.

## B. Frontend acceptance — run locally

From the **`campuscart/`** project root, in PowerShell:

```powershell
npm install --include=dev
node --experimental-strip-types scripts/verify-handoff.mjs
npx nuxt typecheck
npm run build
npm run dev
```

- [ ] Handoff verification passes (7 source/config checks).
- [ ] Typecheck passes with no blocking errors.
- [ ] Production build passes.
- [ ] Browser check passes for `/`, `/products`, a product detail, `/cart`, `/login`, `/register`, `/profile`, `/profile/addresses`, `/checkout`, `/orders`, and admin pages with a valid local test session.
- [ ] Confirm desktop/tablet/mobile navigation, keyboard focus, form errors, loading/empty states, and cart interactions still behave correctly.
- [ ] Confirm the local Nuxt mock API remains available for offline QA before a backend replaces it; **mock actions are simulations, not real purchases or payment processing**.

**Evidence:** The frontend team confirmed final build/browser tests on its laptop. A recipient should independently run the above checks after extracting/merging the handoff. Packaging validation is not a substitute for a browser build.

## C. Documents and integration entry points

- [ ] Read `README.md` (project setup and limitations).
- [ ] Read `docs/HANDOFF_API_CONTRACT.md` (existing routes, methods, bodies, response shapes, errors, ownership rules, and gaps).
- [ ] Read `docs/HANDOFF_BACKEND_CHECKLIST.md` (detailed backend responsibilities and decisions).
- [ ] Read `docs/HANDOFF_CHANGELOG.md` and `docs/HANDOFF_VERIFICATION.md` (focused cleanup and checked limitations).
- [ ] Review `app/services/catalog.ts`, `account.ts`, `orders.ts`, `admin.ts` and `app/utils/apiUrl.ts` (the frontend API integration seam).
- [ ] Review `app/types/*.ts` and compare them to `docs/reference/Final_ERD_CampusCart.png` before changing the contract.
- [ ] Use `.env.example` to prepare a private `.env`. By default, `NUXT_PUBLIC_API_BASE=/api/v1` uses the bundled local Nuxt mock routes. Do not point it at an unverified backend endpoint.
- [ ] Keep `NUXT_PUBLIC_ENABLE_DEMO_PREVIEW=false` outside deliberate disposable localhost tests. **Never publish a demo-admin bypass.**
- [ ] Do not put secrets, credentials, private keys, or database URLs in `NUXT_PUBLIC_*` environment variables or in Git.

## D. Backend team deliverables

- [ ] Agree exact API path/prefix, expected response envelopes, errors, paging, and same-origin proxy versus authenticated CORS/cookie strategy with the frontend team.
- [ ] Supply PostgreSQL schema/constraints and backend migrations consistent with the approved ERD; coordinate any necessary schema correction before implementation.
- [ ] Implement secure, persistent login/register/logout/me and role-based API authorization; customer users may only see their own addresses, cart, and orders.
- [ ] Provide catalog and category APIs with approved fields, money as decimal strings, and agreed image handling. The frontend's local illustrations are **not** a product-image DB field.
- [ ] Supply/own final mockup and sample records; avoid duplicating the frontend's temporary fixture data unnecessarily.
- [ ] Agree and implement persistent cart endpoints/merge behavior. Pinia UI state must not be treated as authoritative stock or pricing.
- [ ] Implement server-calculated checkout, stock validation, pickup-address/order snapshots, idempotency, and transactional inventory deduction/restoration.
- [ ] Preserve the approved **demo-only** pickup flow as the documented starting contract: campus pickup, ₱0 fee, simulated Cash on Pickup, `PENDING` → `READY_FOR_PICKUP` → `COMPLETED`, optional `CANCELLED`, and `UNPAID`/`PAID`. Real payment acceptance requires separate approval and backend work.
- [ ] Build order, order-item, order-address, payment, order-status-history, and inventory-movement persistence with correct ownership and status changes.
- [ ] Provide admin product/category APIs, inventory readings, order status operations, and payment status views protected on the **server**, not just in frontend middleware.
- [ ] Replace or isolate `server/api/v1` mock handlers when the real API is ready; avoid two inconsistent sources of truth at the same `/api/v1` path.
- [ ] Run contract tests and end-to-end browser tests after backend connection; verify no simulated success messages falsely imply actual payment or persisted orders.

## E. Coordinate these ERD/contract questions before changing schema

- [ ] `order_status_history.status` is shown as `INT` in the ERD, while `orders.order_status` is an enum; agree the stored mapping/value policy.
- [ ] Confirm the final enum values for users, products/categories, orders, payments, and inventory movements against the backend implementation.
- [ ] Confirm foreign-key connectors and uniqueness constraints (including user cart, order-address snapshot, payment relationships) in the approved ERD.
- [ ] Confirm pickup contact/address behavior: ERD `addresses` stores recipient, phone, barangay and city, but no detailed street/building address fields.
- [ ] Define product-image storage and handling for backend-created products; the frontend currently maps temporary local images by `product_id`.
- [ ] Agree how Featured Products and New Arrivals will be provided after replacing the 12-product fixture catalog.
- [ ] Agree server-side inventory concurrency, low-stock threshold (5 in approved demo flow), cancellations, and inventory movement types.
- [ ] Review the prior report of high-severity npm audit findings and resolve any applicable vulnerabilities before public deployment. **Do not blindly run `npm audit fix --force`.**

## F. Sign-off record (complete during team transfer)

| Field | Enter verified information |
| --- | --- |
| Frontend repository / branch / commit | __________________________ |
| Tested Node and npm versions | __________________________ |
| Frontend representative | __________________________ |
| Backend representative | __________________________ |
| Transfer date | __________________________ |
| Backend API origin and prefix (once agreed) | __________________________ |
| Remaining contract/schema decisions | __________________________ |
| Receiving team's build/browser result | __________________________ |

**Acceptance boundary:** This package hands off a working **frontend with temporary mock services**, not a production ecommerce platform. Integration and new backend/sample data remain with the receiving team.


## Additional media/branding integration checklist

- [ ] Review `docs/MEDIA_BRANDING_BACKEND_CONTRACT.md` and decide whether product image metadata (`images`) and category `image_url` should be supported by the API.
- [ ] Do not treat the optional frontend media fields as changes to the approved ERD. Agree on storage/media schema separately.
- [ ] Confirm public image URLs, image order/primary policy, size/type limits and file permissions before implementing uploads.
- [ ] Keep mock SVG mappings available until the backend serves real images.
- [ ] Decide whether the centralized storefront logo, favicon, hero and footer copy are code-managed or backend-managed; no branding admin editor is implemented.
- [ ] Verify gallery, fallback, cart/checkout images, new category images, mobile layout and keyboard accessibility in the integrated application.
- [ ] Run `node --experimental-strip-types scripts/verify-media-handoff.mjs`, Nuxt typecheck, build, and browser regression checks.
