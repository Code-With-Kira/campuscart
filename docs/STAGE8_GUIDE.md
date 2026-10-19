# CampusCart — Stage 8 Verification, Documentation & Midterm Handoff

**Status:** Stage 8 source and documentation package prepared. **Not automatically verified on your Windows laptop.** Based on the **Stage 7 Typecheck Fixed** ZIP (the version whose build/browser checks the user reported passing). Stage 8 does **not** redesign the UI, change approved mock checkout behavior, alter the ERD or require new npm dependencies.

## Stage 8 goals, matching the ITE 18 Frontend Track Midterm PDF

- Preliminary manual testing and debugging with reproducible evidence.
- Responsive, keyboard/accessibility, API, cart, authentication and customer/admin smoke checks.
- Midterm documentation Sections **I–V** in the **required order**, including the unnumbered Ethical and Professional Considerations heading.
- Screenshots, wireframes/mockups, actual Git commits and individual team contribution evidence added by your group.
- Presentation walkthrough and realistic Final roadmap; no invented PostgreSQL integration or payment gateway.

## How to merge safely with your verified project

1. Commit or back up your **actual locally verified Stage 7** project (which may have a different lockfile from this ZIP).
2. Extract `CampusCart_Stage8.zip` to a temporary folder, **not on top of your active project**.
3. Compare `docs/STAGE8_CHANGELOG.md`. Only `README.md`, `docs/STAGE8_*.md`, and `scripts/{verify-stage8,smoke-stage8}.mjs` were added/updated. All prior functional source files are preserved from the Stage 7 Typecheck Fixed archive.
4. Copy the new documents and scripts into your existing project. Keep your existing `package-lock.json`, `node_modules`, `.git`, and any locally verified dependency fixes.
5. Do not re-create Nuxt or replace existing app pages.

## Windows PowerShell commands

From `C:\KIRA_WORKSPACE\01-Academic-Projects\ITE-18\campuscart`:

```powershell
node scripts/verify-stage3.mjs
node scripts/verify-stage4.mjs
node --experimental-strip-types scripts/verify-stage5.mjs
node --experimental-strip-types scripts/verify-stage6.mjs
node scripts/verify-stage7.mjs
node scripts/verify-stage7-complete.mjs
node scripts/verify-stage7-transactions.mjs
node scripts/verify-stage8.mjs
npx nuxt typecheck
npm run build
```

**Do not interpret source-only test success as evidence that the app builds or works in the browser.** If package errors occur, use the versions from your verified Stage 7 machine; do not blindly install or remove Nuxt/Tailwind/Vue Router.

Now start the local demo server:

```powershell
npm run dev
```

In **a second terminal** (with the local dev server running), execute:

```powershell
node scripts/smoke-stage8.mjs
```

The smoke test is intentionally **not read-only**: it creates fictional accounts/addresses/orders and changes inventory in local server memory. It refuses non-local URLs. **Restart `npm run dev` to reset** the mock state before recording screenshots or making your presentation.

If your server uses a different port:

```powershell
$env:STAGE8_BASE_URL = 'http://localhost:3001'
node scripts/smoke-stage8.mjs
Remove-Item Env:STAGE8_BASE_URL
```

Capture the verification logs using PowerShell, if required for the Appendix:

```powershell
node scripts/verify-stage8.mjs 2>&1 | Tee-Object -FilePath stage8-static-results.txt
npx nuxt typecheck 2>&1 | Tee-Object -FilePath stage8-typecheck-results.txt
npm run build 2>&1 | Tee-Object -FilePath stage8-build-results.txt
```

Avoid committing any local logs containing real user information. `stage8-*-results.txt` are local testing artifacts, not necessary source files.

## Practical manual verification

Use `docs/STAGE8_TEST_MATRIX.md` as the formal log and fill **date, device/browser, actual result, pass/fail, screenshot filename, and tester** for each test. Important responsive widths: 320, 390, 768, 1024 and 1440px. Inspect Chrome DevTools **Console** and **Network** (not just the screen appearance). Use TAB, SHIFT+TAB, ENTER, SPACE to test keyboard focus and control activation. If you have accessibility software, include actual observations rather than checking a box based on CSS alone.

### Demo flow for the Midterm presentation

1. Homepage: seven sections, CSU-inspired visual identity, images and API-loading states.
2. Catalog: category and search filter, sorting, pagination, product details, out-of-stock example `/products/204`.
3. Cart: Add, quantity, remove/undo, subtotal, browser-tab restoration.
4. Demo Customer login: addresses/profile, checkout, ₱0.00 shipping and Cash on Pickup, order history.
5. Development-only Admin Preview: product/category management, order transition to READY_FOR_PICKUP then COMPLETED, simulated PAID; inventory and low stock.
6. Show `/api/v1/products` JSON, Pinia store, components folder, and actual GitHub commit history.
7. Explain demo limitations: in-memory records, no PostgreSQL, no real payment, no official CSU affiliation or pickup venue.

## Key limitations and remaining work

- Mock users, product edits, addresses, orders, payment records and stock state reset when the Nuxt server restarts; no database or persistent customer sessions.
- Demo account shortcut is available only in development. **Do not deploy demo authentication or public demo-admin access as a real commerce system.**
- `order_status_history.status` numeric mapping and inventory movement enum labels are mock-only, while SQL constraints/ERD connector accuracy still need review.
- Product artwork is presentation-only, mapped by `product_id`; the ERD contains no image column.
- Checkout has no real fulfillment address or pickup venue; it records only the approved contact snapshot.
- Security, runtime accessibility, cross-browser testing and performance claims require further independent checks. Stage 8 scripts are basic regression/smoke tests, not a security certification.

## Before final Midterm PDF submission

1. Read `docs/STAGE8_MIDTERM_REPORT_DRAFT.md` and fill all `[INSERT ...]` fields using **actual** evidence.
2. Insert real full-size screenshots and a UI design/wireframe of every main screen; no fake Figma link.
3. Confirm team-member contributions with both teammates; show actual GitHub URL, branch/commits and relevant evidence.
4. Export the completed document as PDF. The included PDF draft (when supplied) is **not submission-ready** until these are filled.
5. Consult your instructor if needed: the source PDF's cover shows Oct 21, 2026, while an interior line says Oct 16, 2026. Do not assume the later date takes priority.

## Repository quality and commit

```powershell
git status
git diff --stat
git add README.md docs/STAGE8_*.md scripts/verify-stage8.mjs scripts/smoke-stage8.mjs
git commit -m "test(docs): add Stage 8 regression checks and midterm evidence guides"
git log --oneline -10
```

Keep commit authorship truthful and ask teammates to commit their own actual contributions. Do not publish real account details, passwords or cookies in screenshots/logs.
