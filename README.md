<<<<<<< HEAD
# CampusCart — Completed Frontend / Backend Team Handoff

This is the **finished Stage 8 CampusCart frontend** for ITE 18, prepared for integration. It uses **Nuxt 4, Vue 3, TypeScript, Pinia, and Tailwind CSS 4** with the approved CSU-inspired UI. This handoff does **not** add a new development stage or implement a real backend.

**Start here:**

0. `FINAL_HANDOFF_CHECKLIST.md` — final frontend-to-backend transfer and receiving-team sign-off checklist.
1. `docs/HANDOFF_CHANGELOG.md` — exactly what changed during this focused cleanup.
2. `docs/HANDOFF_API_CONTRACT.md` — existing API paths, schemas and backend obligations.
3. `docs/HANDOFF_BACKEND_CHECKLIST.md` — tasks and decisions for the receiving team.
4. `docs/HANDOFF_VERIFICATION.md` — verification results, caveats and repeatable checks.
5. `.env.example` — public environment configuration (no secrets).

Existing application files, Nuxt mock routes, SVG assets and prior Stage 2–8 documentation are preserved. **The in-process API is a temporary simulation, not a production service or database.** Mock sessions, purchases and inventory updates are not persistent.

## Setup (Windows PowerShell)

Merge this package into the working, already-tested CampusCart Git repository, preserving `.git`, its installed dependencies and its existing `package-lock.json` (the ZIP does not contain these). If starting from the ZIP alone, install dependencies first:

```powershell
npm install --include=dev
npx nuxt typecheck
npm run build
npm run dev
```

By default, the frontend continues to use the existing mock API at `/api/v1`; no new dataset or backend is required to view the UI. To point it at an **agreed compatible backend**, set in your uncommitted `.env`:

```dotenv
NUXT_PUBLIC_API_BASE=http://localhost:4000/api/v1
```

The example port is not a claim that a real backend exists. Coordinate cookie-based authentication, same-origin proxy/CORS, pagination, and errors before switching. **No real credentials belong in `NUXT_PUBLIC_*` variables.**

### Legacy mock Admin Preview

The old Customer/Admin persona buttons and server-side shortcut are **OFF by default**. For disposable localhost-only QA, set `NUXT_PUBLIC_ENABLE_DEMO_PREVIEW=true` in a private `.env` while running `npm run dev`. Never enable preview on a public server. Normal demo registration/login still works for fictional customers; the backend team must supply genuine admin accounts/auth for production.

### Test and release notes

Run `node --experimental-strip-types scripts/verify-handoff.mjs` and the original scripts, then perform the local Nuxt build and browser checks. Stage 8 was confirmed by the frontend team on its laptop; the handoff modifications need independent local re-verification. `scripts/smoke-stage8.mjs` deliberately changes mock state and requires the explicit local QA preview opt-in. Do not run it against external systems.

The backend team is responsible for PostgreSQL data persistence, security, mock/sample records for its phase, API implementations, and the final production migration. Do not publicly deploy the temporary `server/api/v1` mock handlers as a real commerce service.


## Media and branding handoff (frontend enhancement)

The completed interface remains unchanged by default. For optional product-gallery URLs and category images, update the backend response contract described in [`docs/MEDIA_BRANDING_BACKEND_CONTRACT.md`](docs/MEDIA_BRANDING_BACKEND_CONTRACT.md). Store logo, favicon, hero artwork and shared display copy are centralized in `app/config/storefront.ts`. The local SVG media map stays as an offline fallback; no image database columns, upload endpoints or backend sample data were added. See [`docs/FRONTEND_MEDIA_BRANDING_CHANGELOG.md`](docs/FRONTEND_MEDIA_BRANDING_CHANGELOG.md) and test with `node --experimental-strip-types scripts/verify-media-handoff.mjs`.
=======
# campuscart
>>>>>>> origin/main
