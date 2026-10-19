# Stage 8 — Exact Source Change Summary

**Base ZIP:** `CampusCart_Stage7_Typecheck_Fixed.zip` (the Stage 7 archive with the `mockOrders.ts` `function err(...): never` typecheck fix).

## Existing files modified

- `README.md` — Stage 8 navigation to testing and instructor-aligned documentation.

## New files

- `scripts/verify-stage8.mjs` — dependency-free source/config/route regression checks; no server required.
- `scripts/smoke-stage8.mjs` — local-only HTTP integration tests; makes demo address/order changes and validates role enforcement, stock, payments, idempotency and status transitions.
- `docs/STAGE8_GUIDE.md` — safe merge, exact Windows commands, limitations, evidence directions.
- `docs/STAGE8_TEST_MATRIX.md` — 44 manual tests with unfilled results/evidence fields.
- `docs/STAGE8_MIDTERM_REPORT_DRAFT.md` — instructor-aligned draft with explicit placeholders, no fabricated screenshots/commits.
- `docs/STAGE8_API_INVENTORY.md` — actually implemented API routes and source contract descriptions.
- `docs/STAGE8_PRESENTATION.md` — demo flow, questions, and contributor preparation.
- `docs/STAGE8_CHANGELOG.md` — this file.
- `docs/STAGE8_FINAL_ROADMAP.md` — future work vs Midterm boundary.

## Not modified

Every prior Stage 7 `app/`, `server/`, `public/`, `nuxt.config.ts`, `package.json`, `tsconfig.json`, and old verification script remains byte-for-byte identical to the **Stage 7 Typecheck Fixed archive**. The Stage 8 package does not contain `node_modules`, `.nuxt`, `.output`, Git history or a fabricated lockfile. Preserve your machine's verified `package-lock.json` and `.git`.

## Verification boundaries

`verify-stage8.mjs` and ZIP structural checks can run in this environment. The Nuxt dev server, production build and browser/manual tests require the user's laptop and actual dependencies. A submission-ready PDF requires screenshots, authentic test results, team division and real GitHub links from the user.
- `docs/STAGE8_VERIFICATION_RESULTS.md` — command-by-command evidence of executed checks versus pending runtime work.
