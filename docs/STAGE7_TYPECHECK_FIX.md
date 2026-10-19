# Stage 7 TypeScript typecheck fix

## Problem
`npx nuxt typecheck` reported 18 errors in `server/utils/mockOrders.ts`.

## One-file solution
Changed `err` from a `const` arrow function to a named function declaration returning `never`, so strict TypeScript correctly narrows values after validation fails. The implementation logic and contracts are unchanged.

## Install only the patch (recommended for an existing verified project)
Copy `server/utils/mockOrders.ts` into your local `campuscart/server/utils/mockOrders.ts`, replacing **only that file**. Keep your own `package.json`, `package-lock.json`, `.git`, `node_modules` and other fixes.

Verify in PowerShell from project root:

```powershell
npx nuxt typecheck
npm run build
node scripts/verify-stage7-complete.mjs
node scripts/verify-stage7-transactions.mjs
```

Existing npm dependencies are sufficient; no new package installation is necessary.

The included full-project ZIP is optional and based on the previously supplied Stage 7 ZIP, **not a snapshot of your local changes**. Avoid overwriting your local working project with it.
