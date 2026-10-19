# CampusCart — Midterm Presentation & Live Demo Runbook

Based on the instructor's Frontend Track instructions, the introduction is approximately **two minutes**; the full allotted demonstration time is not specified. Coordinate actual time limits with the instructor.

## Suggested presentation sequence

1. **Introduction (~2 minutes).** Project: CampusCart, a student-oriented storefront for school supplies, tech accessories and campus merchandise. State that it is an academic mock commerce system, not an official CSU service. Describe customer and admin roles and the problem of fragmented student shopping.
2. **UI/UX design.** Show the approved seven homepage sections. Explain emerald/green, gold/orange accents, Inter typography, component spacing, and the responsive navigation. Display actual wireframes/mockups or prototypes — these must be added by the group.
3. **Live desktop/mobile demo.** Home → Catalog → Details → Cart; demonstrate validation and empty/loading/error states; show responsive viewport via Chrome DevTools.
4. **Customer journey.** Development-only Demo Customer login → Saved Contact → Campus Pickup Checkout → Order History. Explicitly say Cash on Pickup is simulated, shipping is ₱0, and in-memory orders reset.
5. **Admin journey.** Development-only Admin Preview → Dashboard → Products/Categories → Orders. Mark the order READY_FOR_PICKUP then COMPLETED. Show simulated paid record, inventory stock change and order status history. Demonstrate cancelled order restocking using another order.
6. **Technical explanation.** Open `app/pages`, `app/components`, `app/stores/cart.ts`, `app/services`, and `server/api/v1`. Explain Nuxt file-based routing, Pinia cart state, API JSON retrieval, SSR/client behavior, form validation and mock authorization limits.
7. **Testing & version control.** Show your own terminal output from `npx nuxt typecheck`, `npm run build`, Stage 8 checks, and the actual GitHub commit history. Avoid reproducing confidential credentials.
8. **Progress and Final plan.** Explain features demonstrated versus still required for the Final: PostgreSQL-backed persistence, finalized enums and ERD relationships, production-quality authentication, accessibility/testing/performance refinements, real deployment.
9. **Q&A and contribution credits.** Both partners should be able to explain their actual code. **[INSERT actual division of work]**.

## Pre-demo reliability checklist

- Commit/backup the project, restart `npm run dev` so mock inventory and accounts start fresh.
- Preload local product images and confirm localhost is available.
- Use fictional account and contact details; do not show personal credentials.
- Check that a sample product is in stock, and have a second order ready for cancellation demo if time permits.
- Keep the instructor's required PDF/ERD, actual UI screenshots and GitHub page ready.
- Do not claim PostgreSQL, official CSU authorization, real payment, physical pickup location, or deployment.

## Likely questions

**Why Nuxt?** File-based routing, SSR-friendly data fetching, reusable Vue components, integrated server mock routes.

**Why Pinia?** Shared cart state and total calculations across product pages and cart/checkout, with temporary tab persistence.

**What is the API integration?** Nuxt's `/api/v1` endpoints serve realistic mock records; product cards consume a centralized service instead of a page-level hardcoded list.

**Where is the real database?** Not implemented; final ERD is the design reference, and the current server-memory records are temporary.

**How is checkout protected?** A demo server verifies session role, address ownership, current product price/stock, and idempotency token before writing a mock order. This is not production payment or distributed transaction security.

**How did you test?** Show recorded static/transactional regression logs, Nuxt typecheck/build output, local API smoke tests, and manual browser/responsive/accessibility evidence.
