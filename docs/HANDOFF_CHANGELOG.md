# CampusCart — Frontend Handoff Cleanup Changelog

**Starting source:** `CampusCart_Stage8.zip` (148 project files), with the Stage 7 TypeScript fix already included. Frontend team reports Stage 8 tested and complete.

No frontend modules, page routes, layout components, auth/cart stores, Nuxt mock handlers, mock fixture records, or ERD assets have been deleted or redesigned. The API mock stays available until a replacement backend exists.

## Modified application files

| Path | Reason |
|---|---|
| `nuxt.config.ts` | Added default public runtime API base (`/api/v1`) and an opt-in demo preview toggle (default OFF). Kept existing Nuxt/Pinia/Tailwind settings untouched. |
| `app/services/catalog.ts` | Routes existing product/category fetches through one URL helper; same arguments/responses. |
| `app/services/account.ts` | Routes existing auth/address/profile fetches through URL helper; retains existing API functions. |
| `app/services/orders.ts` | Routes order fetches through URL helper; retains idempotent checkout API body. |
| `app/services/admin.ts` | Routes admin calls through URL helper; retains server-only authorization. |
| `app/pages/login.vue` | Hides Customer/Admin demo persona buttons unless explicitly opted in locally; preserves email/password login. Error copy no longer suggests shortcuts by default. |
| `server/api/v1/auth/demo.post.ts` | Makes demo bypass endpoint return 404 unless BOTH development mode and an explicit opt-in are enabled; avoids only hiding the UI. Normal auth endpoints are unchanged. |
| `app/pages/information/[slug].vue` | Corrects obsolete FAQ that claimed checkout was not available; clarifies that Stage 7 only places simulated pickup orders. |
| `README.md` | Sets the current handoff entry point rather than implying the frontend still needs Stage 8 implementation. |

## Added files

| Path | Purpose |
|---|---|
| `.env.example` | Safe, non-secret public API base and demo preview settings. |
| `app/utils/apiUrl.ts` | Shared API base routing helper; default preserves `/api/v1`. |
| `scripts/verify-handoff.mjs` | Additional static assertions for URL handling, preview safety, documentation and intact architecture. |
| `docs/HANDOFF_API_CONTRACT.md` | Exact current frontend routes, models, request/response expectations, limitations, mismatches. |
| `docs/HANDOFF_BACKEND_CHECKLIST.md` | Receiving team responsibilities and acceptance gates. |
| `docs/HANDOFF_CHANGELOG.md` | This file. |
| `docs/HANDOFF_VERIFICATION.md` | Executed checks and any limitations. |

## Retained (not removed)

- Demo-only Nuxt API routes and the existing 12 sample products: removing them before backend data arrives would blank/break the product pages.
- Pinia demo cart and sessionStorage: functioning local state until an account-linked cart API is agreed.
- Existing server-memory login/register/orders/addresses and simulated payment: normal UI navigation remains demonstrable with fictional data; all responses explicitly describe simulation.
- Existing `app/types/*.ts` contracts and validation helpers.
- `public/images/products/*.svg` and `app/utils/productMedia.ts` maps: no image field in approved ERD.
- `POST /api/v1/auth/demo` and its helper **only for opt-in local QA**; default-off means not accessible in normal handoff use. It is expressly **not a backend deliverable**.
- Historical `docs/STAGE*.md` files as archival build/test context; current integration instructions are in this HANDOFF series.

## Not done (by design)

No PostgreSQL connection, ORM, real auth, payment gateway, new mock dataset, additional ecommerce module, new routes, color redesign or other Stage 9 work.
