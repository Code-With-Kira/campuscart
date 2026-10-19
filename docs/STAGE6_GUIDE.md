# CampusCart Stage 6 — Demo Authentication and Customer Screens

> Based on the **Stage 5 ZIP plus verified cart-display fixes**. ITE 18 Midterm frontend / temporary mock API. This is NOT a launch-ready authentication or ordering service.

## Scope and design decisions

The existing Nuxt 4, Vue 3, TypeScript, Pinia, Tailwind 4, Inter, CSU-inspired tokens, Stage 3 homepage, Stage 4 catalog/product pages, and Stage 5 cart all remain in place. No new npm dependencies, database columns, or new backend framework are added.

Stage 6 adds interactive Login, Registration, Profile, Saved Addresses, Orders (honest empty state), a development-only Admin Preview, and route/API access checks. Existing Stage 5 fixes are included: explicit `CartItem`/`CartSummary` imports, the corrected Stage 5 verifier, and the single `DemoCartItem` type definition.

**ERD naming:** `users` (`user_id`, `first_name`, `last_name`, `email`, `password_hash`, `role`, `account_status`, `created_at`, `updated_at`); `addresses` (`address_id`, `user_id`, `address_label`, `recipient_name`, `phone_number`, `barangay`, `city`, `is_default`, `created_at`). `password_hash` is stored in server memory only and is NEVER sent to Vue. Registration confirmation is strictly a form-only field, not an ERD column. Roles (`CUSTOMER`, `ADMIN`) and status (`ACTIVE`) remain provisional example enum values until the group confirms actual SQL enums.

**No street field:** The approved ERD only defines label/recipient/phone/barangay/city. The address form deliberately does not introduce street, postal code, province, etc. Do not use real delivery information.

## Important limitations and safety

- Demo users, hashed passwords, session IDs and addresses live **in the local Nuxt server process memory**. They vanish when the server restarts. No PostgreSQL integration; no long-term accounts.
- Sessions use random opaque tokens in HTTP-only, SameSite=Strict cookies; server endpoints check session and address ownership. The client Pinia store keeps only public account fields. This is an instructional prototype; it lacks production account recovery, rate limiting, audit logging, hardened CSRF protection, scalable session persistence, email confirmation, full authorization and comprehensive security review.
- The `POST /api/v1/auth/demo` customer/admin shortcut **only works in `NODE_ENV=development`**. It is for previews; never enable such an endpoint on a public deployment.
- Registering always creates `CUSTOMER`; the browser cannot assign itself `ADMIN` through registration. Admin preview can be entered via the *explicitly insecure development-only* preview action.
- Customer page middleware improves navigation; protected server endpoints independently verify customer role and user ownership. Admin pages contain placeholders, not sensitive production data.
- **Cart remains independent and stored per browser tab**. Signing out does not transfer it to an account or delete it; checkout and payments are not implemented.
- The Orders API returns an empty array. No fake orders, payment references, or status history are manufactured. Order detail is informational until Final integrations.
- For testing, use invented addresses, emails and passwords. Do **not** share the demo server publicly or enter real sensitive information.

## Windows / VS Code — Update your existing verified Stage 5 project

1. Commit or back up your current working Stage 5 checkout **before merging**. Your laptop may include minor local edits not represented in the original ZIP.
2. Extract `CampusCart_Stage6.zip` to a **separate temporary folder**. The ZIP has one `campuscart/` root.
3. In VS Code, compare against `docs/STAGE6_CHANGELOG.md`. Merge its new/modified `app/`, `server/`, and `scripts/` files into your current CampusCart folder. Do **not** replace `.git`, `node_modules`, or your working `package-lock.json`.
4. The ZIP is also a standalone source snapshot. If opening it separately, run `npm install` in its `campuscart` root (dependencies are not bundled).
5. **No new dependencies** should be necessary for an already-working Stage 5 project.

Commands from the existing CampusCart project root:

```powershell
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
node --experimental-strip-types scripts/verify-stage5.mjs
node --experimental-strip-types scripts/verify-stage6.mjs
npx nuxt typecheck
npm run build
npm run dev
```

Expected source test totals: Stage 3 `16`, Stage 4 `21`, Stage 5 `34`, Stage 6 `54`. These do **not** substitute for the full Nuxt checks or browser testing. If `vue-tsc` reports a Vue Router plugin warning, inspect dependency versions rather than replacing working source. Preserve your established `vue-router@^5` and `@tailwindcss/vite` configuration.

## Browser verification — test in this order

1. `http://localhost:3000/` — homepage still has seven approved sections; product Add to Cart works.
2. `/products` and `/products/201` — Stage 4 catalog and product details still work.
3. `/cart` — verify rendered item row, `<CartItem />`, summary, quantity controls, undo, clear-confirmation, and tab-session cart persistence.
4. `/profile` while logged out — redirects to `/login?redirect=/profile` after client session check.
5. `/register` — submit blank fields (validation); submit mismatched password; register a **fictional** email with 12+ character password. The user should land on `/profile` automatically.
6. `/profile` — edit name and email, Save Changes, observe feedback. Password must not appear in client state or API response.
7. `/profile/addresses` — add a fictional address; verify it becomes the default if first; add a second and set default; edit; remove with confirmation; inspect default reassignment.
8. `/orders` — API-backed empty state, not fake orders. `/orders/999` is a deliberately informative unimplemented detail screen.
9. Sign out from Profile, then log in with the same temporary email/password **without restarting the dev server**. Refresh page to confirm HTTP-only cookie restores the session.
10. On `/login`, press Demo Customer and Admin Preview (development server only). Check `/admin` access for admin role; customer role should not access admin placeholder. Admin can exit via the Admin header.
11. Open Chrome DevTools Network: `GET /api/v1/auth/me` returns only public user fields, no `password_hash`; `GET /api/v1/me/addresses` returns `401` when logged out, `403` to admin, and only the current customer's records. Check responsive layout at 390, 768 and 1440 px.
12. Check no new errors in browser Console or VS Code terminal. Repeat `npx nuxt typecheck` and `npm run build` after changes.

## Added API contracts (proposed mock implementation)

All successful responses use the existing Stage 3/4 envelope:

```json
{"success":true,"data":{},"message":"..."}
```

On errors, Nuxt/H3 returns HTTP error statuses (e.g. `400`, `401`, `403`, `404`, `409`, `422`) via its standard error response. No actual production identity endpoints exist.

| Method | API endpoint | Purpose | Authentication |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Create temporary customer, set cookie | Public |
| POST | `/api/v1/auth/login` | Verify demo password hash, set cookie | Public |
| GET | `/api/v1/auth/me` | Current public demo account or `null` | Optional |
| POST | `/api/v1/auth/logout` | Remove demo cookie/session | Optional |
| POST | `/api/v1/auth/demo` | Dev-only customer/admin preview | Development only |
| PATCH | `/api/v1/me/profile` | Update own first/last/email | Customer |
| GET | `/api/v1/me/addresses` | List own saved addresses | Customer |
| POST | `/api/v1/me/addresses` | Create saved address | Customer |
| PATCH | `/api/v1/me/addresses/:address_id` | Update own address | Customer owner |
| DELETE | `/api/v1/me/addresses/:address_id` | Remove own address | Customer owner |
| PATCH | `/api/v1/me/addresses/:address_id/default` | Set default address | Customer owner |
| GET | `/api/v1/me/orders` | Empty until checkout is built | Customer |

Registration request (the role is NOT accepted as client input):

```json
{"first_name":"Alex","last_name":"Student","email":"alex.student@example.test","password":"temporaryDemoPass123"}
```

Login request:

```json
{"email":"alex.student@example.test","password":"temporaryDemoPass123"}
```

Address creation (uses exact ERD fields; server assigns `address_id` and `user_id`):

```json
{"address_label":"Dorm","recipient_name":"Alex Student","phone_number":"0912 000 0000","barangay":"Sample Barangay","city":"Demo City","is_default":true}
```

Profile update:

```json
{"first_name":"Alex","last_name":"Student","email":"alex.updated@example.test"}
```

Mock registration returns only public fields like `user_id`, `first_name`, `last_name`, `email`, `role`, `account_status`, `created_at`, `updated_at`. There is no client-visible `password_hash`.

## New/updated code responsibilities

- `app/stores/auth.ts`: Pinia public account state, login/register, profile save, logout, initial session check; no session token in client state.
- `app/plugins/auth-session.client.ts`: loads the temporary session after app mount.
- `app/middleware/customer.ts`, `admin.ts`: client navigation redirects; server endpoints enforce access independently.
- `app/services/account.ts`: single service for auth, profile, address and order API requests.
- `app/types/account.ts`: approved-ERD-aligned public user/address interfaces.
- `app/utils/accountValidation.ts`: shared UI validators for registration, profile and saved addresses.
- `server/utils/mockAccounts.ts`: in-memory identity data, scrypt demo password hashing, random sessions, address ownership, and server validation.
- `server/api/v1/auth/*` and `server/api/v1/me/*`: mock endpoint routes.
- `app/pages/login.vue`, `register.vue`, `profile/index.vue`, `profile/addresses.vue`, `orders/index.vue`, `orders/[order_id].vue`: the working screens.
- `app/components/layout/SiteHeader.vue`: displays public account name and routes to customer/admin account as appropriate.
- `app/layouts/admin.vue`: adds Exit Demo Admin.
- `app/pages/admin/*`: applies demo admin middleware.
- `app/pages/information/[slug].vue`: updates FAQ/privacy disclaimer for Stage 6.
- Stage 5 fixes: `app/pages/cart.vue`, `app/components/cart/CartItem.vue`, `app/stores/cart.ts`, `scripts/verify-stage5.mjs`.

## Before the Final

Confirm the ERD relationship lines, database one-to-one constraints, `order_status_history.status` type, real enums, complete delivery address fields and actual checkout/payment rules. Replace server-memory storage with audited transactional persistence and actual account authorization, tested password practices, account recovery and production security controls. Do not deploy the Stage 6 demo identity system on a public server.

## Suggested Git milestone

```powershell
git status
git add app server scripts docs README.md
git commit -m "feat: add Stage 6 demo authentication and customer screens"
```

Stage 7 will cover Checkout and Admin Screens **only after the user confirms Stage 6 works locally**.
