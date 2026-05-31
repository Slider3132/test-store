# Production Hardening Implementation Report

Date: 2026-05-25

## Short Report

Phase 0 production hardening has been implemented and verified. The changes reduce the highest immediate risks in the ecommerce starter: production env misconfiguration, destructive seed access, order-token leakage, unsafe auth redirects, untrusted product sorting, checkout address selection regressions, and incorrect JSON-LD pricing.

The project is safer as a production baseline. Online payments are disabled by default through env and real Ukrainian provider adapters are moved to backlog. Admin/manual order operations now have payment, fulfillment, delivery, stock reservation, role matrix, and audit foundations. Nova Poshta and Ukrposhta server autocomplete/API routes are implemented and connected to checkout delivery UI. Delivery details persist from checkout into transactions/orders and are visible in admin and customer order details. The remaining production work is provider-specific LiqPay/WayForPay/Mono/Fondy adapters when online payment is selected, email adapter configuration, CSV/XLSX import/export, operational runbooks, and broader end-to-end coverage.

## Implemented Scope

| Area | Status | Result |
| --- | --- | --- |
| Production env validation | Done | Production now fails closed for missing required secrets, Stripe keys, database URL, and S3 media storage settings. |
| Database SSL configuration | Done | Production keeps strict SSL by default; local/self-signed environments can explicitly set `DATABASE_SSL_REJECT_UNAUTHORIZED=false`. |
| Seed route hardening | Done | `/next/seed` returns 404 in production unless `ENABLE_SEED_ENDPOINT=true`. Admin seed button is hidden in production unless explicitly enabled. |
| Order access links | Done | Find-order links now use short-lived signed JWT tokens. Token email body logging was removed. Legacy checkout tokens are temporarily preserved for migration. |
| Auth redirects | Done | Login and create-account redirects now reject external URLs and internal admin/API/next targets. |
| Product sorting | Done | Shop and catalog sort params are whitelisted against known sort values. |
| Checkout address UX | Done | Newly created checkout addresses are selected through the existing callback flow. |
| Product JSON-LD | Done | Structured data now emits price in storefront currency units instead of base units. |
| Locale switch | Done | Header locale switching preserves the current query string. |
| Integration test config | Done | Vitest now includes `.tsx` integration specs. |
| Provider-agnostic payments | Done | Stripe is optional. `external_redirect` supports hosted checkout providers through signed webhooks. |
| Webhook-first order finalization | Partial | Generic external providers create orders from signed webhooks. Stripe remains legacy client-confirm flow until a custom Stripe webhook adapter replaces the bundled adapter. |
| Online payment default | Done | `.env.example` defaults to `PAYMENT_PROVIDER=disabled`. |
| Admin order operations | Done | Orders now expose payment status, fulfillment status, delivery method, and expanded order statuses. |
| Stock reservation | Done | Manual/admin orders reserve stock atomically; cancelled/refunded orders release reserved stock. |
| Stock reservation delta | Done | Editing items on an already reserved order reconciles inventory deltas instead of silently drifting. |
| Delivery settings | Done | Admin settings include Nova Poshta, Ukrposhta, pickup, free shipping threshold, and fixed delivery price toggles. |
| Delivery settings endpoint | Done | `/next/delivery/settings` returns client-safe enabled delivery methods from admin settings plus env gates without leaking secrets. |
| Nova Poshta API | Done | Added disabled-by-default env configuration and city/warehouse autocomplete routes under `/next/delivery/nova-poshta/*`. |
| Ukrposhta API | Done | Added disabled-by-default env configuration and city/warehouse autocomplete routes under `/next/delivery/ukrposhta/*`. |
| Checkout delivery UX | Done | Checkout now requires a valid pickup/Nova Poshta/Ukrposhta delivery selection before payment and submits delivery details with checkout. |
| Delivery persistence | Done | External redirect transactions store delivery details and webhook finalization copies them into order fields. |
| Customer order detail UX | Done | Customer order detail now shows payment status, fulfillment status, delivery details, and tracking when available. |
| Role matrix | Done | Added owner/admin/manager/contentEditor/customer roles. Manager can operate orders; content editor can operate content collections; owner/admin keep settings/destructive authority. |
| Audit log | Done | Added append-only audit log collection with actor metadata and before/after order snapshots. |
| Migrations and types | Done | Added admin/client alignment migration and regenerated `payload-types.ts`. |

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `pnpm run test:int` | Passed | 22 files, 83 tests. |
| `pnpm exec tsc --noEmit` | Passed | TypeScript clean. |
| `pnpm lint` | Passed | 0 errors, existing warning debt remains. |
| `DATABASE_SSL_REJECT_UNAUTHORIZED=false pnpm build` | Passed | Required for this local DB because its certificate chain is self-signed. |
| `pnpm build` | Fails locally | Expected with current local DB cert while strict SSL default is active. Use a trusted CA or explicit local override. |

## Remaining Production Work

| Priority | Work | Why It Matters |
| --- | --- | --- |
| P1 | Provider-specific Ukrainian adapters | Backlog until online payment is enabled for a concrete project. Implement official signature/status verification for the chosen PSP. |
| P1 | Real production email adapter | Backlog until a concrete email provider is selected. Current warning says email can fall back to console output without an adapter. |
| P1 | CSV/XLSX bulk import/export | Backlog for onboarding existing stores. |
| P1 | Payment failure/refund/cancel flows | Required for operational correctness after failed or reversed payments. |
| P1 | Admin operational runbooks | Needed for deploys, seed safety, migrations, backups, and incident recovery. |
| P1 | Full Playwright checkout/account flows | Covers regressions that unit/integration tests cannot fully catch. |
| P2 | SEO/a11y/performance pass | Required before selling polished client sites at scale. |

## Subagent Review Summary

| Role | Output |
| --- | --- |
| Planner | Broke production hardening into immediate Phase 0 and larger commerce-correctness phases. |
| Env/Seed worker | Implemented production env validation and seed protections. |
| Order worker | Implemented signed guest order tokens and removed token logging. |
| Redirect/Sort worker | Implemented safe redirects and product sort whitelisting. |
| Frontend worker | Fixed checkout address selection, JSON-LD price, and locale query preservation. |
| Managing agent | Split the full admin/client alignment work into delivery runtime, checkout UX, order persistence, access/audit, migrations, and QA tasks. |
| Delivery API worker | Implemented delivery settings/runtime contract, client-safe settings endpoint, and stable provider route responses. |
| Checkout UX worker | Implemented checkout delivery selector, delivery validation, customer order delivery/status display, and component tests. |
| Access/Audit worker | Added role/access tests, owner parity fixes, and audit envelope tests. |
| Orchestrator | Integrated order delivery persistence, admin order fields, audit before/after snapshots, migration, generated types, and full verification. |
| Spec reviewer | Requested fixes for seed button opt-in and legacy checkout token migration; both were applied. |
| Code reviewer | Requested fixes for DB SSL configurability, stale tests, and whitespace env handling; all were applied. |

## Decision Log

- Production DB SSL remains strict by default.
- Local/self-signed DB verification uses `DATABASE_SSL_REJECT_UNAUTHORIZED=false` explicitly.
- Legacy `accessToken` order access is retained only to avoid breaking existing checkout redirects during the migration to signed `orderToken` links.
- Seed behavior is fail-closed in production, with explicit opt-in flags for exceptional use.
