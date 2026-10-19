# Remaining Work for the Final — not falsely marked complete at Midterm

The instructor's Frontend Track table distinguishes the Midterm (working core UI, state, initial API, preliminary testing, local demo) from Final requirements (feature completion, full integration, comprehensive validation, cross-device testing, performance and deployed app).

| Final deliverable | Current academic prototype | Next implementation task (needs team approval) |
|---|---|---|
| Database-backed operations | `server/utils` memory arrays and maps | Implement persistent backend APIs and PostgreSQL migrations according to approved ERD |
| Final data model | 12-table ERD; known connector, status INT/ENUM and missing product image gaps | Confirm exact constraints, enum values, product image storage and address fields |
| Full authenticated operations | Local HTTP-only demo cookie and preview personas | Production auth, CSRF protection, rate limiting, role policy, deployment secrets and account lifecycle |
| Order/payment integration | Mock cash on pickup, no real gateway | Confirm business approval; implement real-world fulfillment/payment handling only if actually required |
| Inventory reliability | Synchronous in-memory order flow | Durable transaction/locking and concurrency handling across processes |
| UI polish | Shared components and responsive breakpoints | Refine UI with real usability findings; ensure all features and states have documentation |
| Comprehensive tests | Static/transaction unit scripts + Stage 8 local API smoke/manual log | Add real unit/UI/E2E tests, accessibility tooling, cross-browser and performance checks |
| Deployment | Local Nuxt dev server and unverified production hosting | Production config, environment secrets, hosting domain/HTTPS, observability and backup policy |
| Final documentation | Midterm draft requiring screenshots/actual links | Final evaluation against objectives, measured results, conclusion and recommendations |

**No Final milestone above is claimed to be already implemented.** Target dates/owners should be determined by the team and instructor, not fabricated.
