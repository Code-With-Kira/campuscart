# CampusCart — Frontend Handoff Verification

Source base is the project files from the Stage 8 ZIP. The frontend team reported Stage 8 local build and browser testing as completed. The packaging environment is separate and cannot reuse their Windows `node_modules` or Git lockfile.

## Executed here

The result entries below will be filled with actually executed checks, not assumptions.

| Check | Result |
|---|---|
| Stage 3–8 regression scripts | **PASS: 16 + 21 + 34 + 54 + 46 + 39 + 13 + 21 = 244 checks** (executed locally with Node 22). |
| Additional handoff URL and preview gate tests | **PASS: 7/7** (`node --experimental-strip-types scripts/verify-handoff.mjs`). |
| JavaScript syntax | **PASS:** all `.mjs` scripts passed `node --check`. |
| Nuxt typecheck/build | Not executed: npm dependencies absent from uploaded ZIP and local registry access unavailable |
| Browser testing | Not executed in this environment; previously confirmed by frontend team for Stage 8, not freshly tested after cleanup |
| Live Stage 8 smoke test | Not executed; requires running local Nuxt server and explicit demo preview opt-in |
| npm dependency audit | Not executed here; prior local install reported 11 high-severity findings, current status unverified |

## Required receiving-team commands

```powershell
# Run from the existing CampusCart repository with its own working lockfile and dependencies
npm install --include=dev       # only if dependencies are not already present
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
node --experimental-strip-types scripts/verify-stage5.mjs
node --experimental-strip-types scripts/verify-stage6.mjs
node scripts/verify-stage7.mjs
node scripts/verify-stage7-complete.mjs
node scripts/verify-stage7-transactions.mjs
node scripts/verify-stage8.mjs
node --experimental-strip-types scripts/verify-handoff.mjs
npx nuxt typecheck
npm run build
npm run dev
```

Use a second terminal to inspect local `/`, `/products`, `/products/101`, `/cart`, `/login`, `/register`, `/checkout`, `/profile`, `/orders`, `/admin`, and `/information/faq`. Register a **fictional** customer; new demo admin preview shortcuts are not visible by default. Only if necessary for isolated admin QA: set `NUXT_PUBLIC_ENABLE_DEMO_PREVIEW=true` in a private `.env` and restart the dev server; never ship this setting enabled publicly.

`node scripts/smoke-stage8.mjs` **mutates the in-memory data**, tests admin preview and thus requires an explicitly enabled QA flag; run only on a local throwaway mock server and restart it afterward. It is not a real backend integration test.

## Important distinction

Static assertions confirm source shape and documented settings, not working browser behavior. Stage 8's previously reported success is not a fresh full-build result for this handoff package. Backend team should confirm a local build after merging, then repeat after switching API base URLs.
