# Розширений звіт рев'ю ecommerce starter

Дата: 2026-05-20  
Репозиторій: `/Users/iliyapotov/Projects/starters/ecommerce-starter`  
Мета: оцінити, чи можна продавати цей starter як production-ready інтернет-магазини та сайти, і скільки роботи лишилось.

## Метод

Огляд зроблено локально і через 6 субагентів:

| Роль | Фокус |
|---|---|
| Senior Architect | архітектура, межі модулів, Payload/Next інтеграція |
| Senior Backend | collections, access, auth, orders, payments, migrations, security |
| Senior Frontend | routes, UX, accessibility, SEO, cart/checkout/product UI |
| General Senior Engineer | code quality, scripts, tests, TypeScript, lint |
| Senior Skeptic | production blockers, unsafe claims, hidden risk |
| Senior Human/Product Reviewer | sellability, client/admin usability, operations, buyer expectations |

Обсяг:

| Scope | Кількість |
|---|---:|
| Усі файли repo без `node_modules` | 330 |
| Файли в `src` | 285 |
| Основні runtime зони | `src/app`, `src/components`, `src/collections`, `src/plugins`, `src/blocks`, `src/utilities`, `src/i18n`, `src/providers` |
| Supporting zones | `tests`, `scripts`, `migrations`, config files, README/env |

## Executive Verdict

**No-go для production-ready продажу.**  
Проєкт має сильну основу як Payload/Next ecommerce starter, але не готовий як продукт, який можна безпечно продавати клієнтам під реальні магазини.

Оцінки:

| Напрям | Оцінка | Коментар |
|---|---:|---|
| Starter architecture | 6/10 | структура зрозуміла, але commerce logic розкидана по routes/components |
| Payload/CMS foundation | 6/10 | collections/pages/blocks/i18n є, але catalog ops ще ручні |
| Backend production safety | 4/10 | inventory/payment/email/security мають blockers |
| Frontend production UX | 6/10 | usable storefront, але a11y/SEO/mobile/query locale gaps |
| Test confidence | 4/10 | є e2e, але skipped critical test і DB-залежні int tests |
| Client sellability | 3.5/10 | документація/ops/admin playbooks не продуктовані |
| Overall production readiness | 5/10 | придатний як база для доробки, не як готовий товар |

## Risk Register

| Severity | Ризик | Evidence | Production impact | Рекомендація |
|---|---|---|---|---|
| Critical | Guest order access token постійний, у query params і логиться | `sendOrderAccessEmail.ts:40`, `:51`; `plugins/index.ts:156` | витік PII/order details через logs/history/referrers/screenshots | short-lived hashed token, no logs, exchange to HttpOnly session, expiry/rotation |
| Critical | Inventory oversell відомо зламаний | `tests/e2e/frontend.e2e.spec.ts:351` skipped: “it should not let you checkout but it does” | paid order for out-of-stock item | atomic reservation/decrement server-side, race tests |
| Critical | Payment/order finalization client-dependent | `CheckoutForm/index.tsx:67`, `ConfirmOrder.tsx:31` | payment succeeded без гарантованого order creation | webhook-first idempotent order creation + reconciliation |
| High | Email adapter не налаштований | `payload.config.ts:91` commented `email` | guest order lookup/password reset/forms unreliable | configure Nodemailer/ESP, test transactional flows |
| High | Env/security fail-open | `payload.config.ts:49`, `:51`, `:117`; `plugins/index.ts:182` | empty secrets, weak TLS, late payment failures | startup env validation, verified DB TLS, prod/dev split |
| High | Destructive seed endpoint in app | `src/app/(app)/next/seed/route.ts:10`, `src/endpoints/seed/index.ts` | compromised admin can wipe demo/prod data | remove from production or feature flag with extra confirmation |
| High | Auth hardening starter-level | `Users/index.ts:16`, `auth.tokenExpiration: 1209600` | spam accounts, weak account security | email verification, rate limits, password policy, admin MFA/session policy |
| High | Local media fallback | S3 only enabled when env exists in `plugins/index.ts` | uploaded media lost on serverless/redeploy/multi-instance | require S3/R2/Supabase storage in production |
| High | Product/catalog model not scalable enough | `Products/index.ts:291`, `:361`; `ProductTypes.ts:37` | manual attribute errors, demo reviews, weak facets | normalize attributes/reviews/SKUs, validate product type schema |
| Medium | Sort/filter params are not whitelisted server-side | `shop/page.tsx:96`, `catalog/[slug]/page.tsx:121` | bad queries, unexpected DB load, fragile UX | whitelist sort and filters before Payload query |
| Medium | Cache/revalidation incomplete | pages/globals only; product/category changes lack equivalent clear policy | stale product/category/catalog pages | revalidation matrix for products, categories, filters, locales |
| Medium | SEO incomplete/starter-branded | `layout.tsx` metadata commented, `mergeOpenGraph.ts`, no sitemap route found | poor rich results/canonical/hreflang | add sitemap, canonical, alternates, branded OG defaults |
| Medium | Mobile nav misses non-catalog links | `Header/index.client.tsx`, `MobileMenu.tsx` exists but not mounted | mobile users cannot access CMS nav links | mount complete mobile menu |
| Medium | Checkout lacks shipping/tax/promo/legal | checkout components | not real commercial checkout | shipping rates, tax/VAT, coupons, terms consent |
| Medium | Lint is advisory only | 181 warnings; `eslint.config.mjs` downgrades core rules | risky regressions pass CI | promote high-signal warnings to errors |
| Medium | Tests not isolated from DB/env | `vitest.setup.ts`, `test.env`, `api.int.spec.ts` | CI/local unreliable | dedicated test DB container/env |

## Backend/CMS Review

### Collections and Data Model

| Area | Status | Notes |
|---|---|---|
| `Users` | Starter-grade | public create, admin/customer roles, no visible email verification/MFA/rate limit |
| `Pages` | Good CMS base | page builder, drafts, preview, revalidation hook |
| `Categories` | Good start | hierarchy, image, featured products, product type link |
| `ProductTypes` | Promising | variant axes/attributes exist, but not enforced enough downstream |
| `Products` | Usable but manual | localized title/description/gallery/layout, price fields, variants; attributes/reviews embedded arrays |
| ecommerce plugin collections | Good base | carts/orders/transactions/addresses from Payload plugin |
| Media | Needs prod storage policy | S3 optional, local fallback risky for production |

Key problems:

- `Products/index.ts` has `attributeValues` as free-form rows; product type attributes do not generate/validate product fields.
- Reviews are explicitly demo-oriented and embedded; real reviews need collection, moderation, ownership, anti-spam.
- Order guest access token is permanent UUID stored on order and transported in URL.
- Address validation and order snapshots need stricter server-side requirements.

### Access Control and Auth

Good:

- Admin-only helpers are simple and readable.
- `adminOrPublishedStatus`, `adminOrSelf`, `isDocumentOwner` patterns are reasonable.
- Form submissions are admin-only.

Gaps:

- Public user creation is allowed without visible abuse controls.
- No visible email verification, login throttling, account lockout, MFA/admin hardening.
- GraphQL playground route exists; production decision/rate limiting needed.
- Guest order access relies on token + email query params; this is too weak for long-lived PII access.

### Payment, Inventory, Orders

Blockers:

- A skipped e2e proves checkout can complete after inventory drops to zero.
- Checkout confirms payment client-side and calls `confirmOrder` client-side.
- Webhook script exists, but repo lacks proof that webhook is authoritative/idempotent/reconciled.
- No real fulfillment/refund/cancellation/shipping tracking workflow.

Required production model:

1. Reserve inventory server-side before/at payment intent creation.
2. Finalize orders from verified Stripe webhook.
3. Use idempotency keys and reconciliation for duplicate/retry events.
4. Store immutable order line snapshots.
5. Expose order state machine: pending, paid, processing, shipped, delivered, canceled, refunded.

## Frontend/UX Review

Strengths:

- Clear routes: home/page builder, catalog, category, shop, product, cart, checkout, account, orders, auth.
- Product listing supports search, sort, pagination, view density, categories, price and attribute filters.
- Cart drawer and variants are functional.
- Localization helper and dictionaries cover many flows.

Findings:

| Severity | Finding | Evidence |
|---|---|---|
| Critical | Inventory race not enforced at checkout | skipped test in `frontend.e2e.spec.ts:351` |
| High | JSON-LD price likely emits minor units, not display units | `products/[slug]/page.tsx` uses `product[priceField]` |
| High | Mobile nav loses non-catalog header links | desktop links `md:flex`, mobile catalog-only |
| High | Logged-in user with no address can get stuck until refetch/refresh | `CheckoutAddresses` create flow lacks selection callback |
| Medium | Header search not a full accessible combobox | no `aria-expanded`, listbox/options, Escape handling |
| Medium | Gallery thumbnails are clickable non-buttons | `Gallery.tsx` click handlers on carousel item |
| Medium | Locale switch drops query params | language switch uses pathname only |
| Medium | Root metadata commented, no sitemap route found, missing hreflang/canonical | `layout.tsx`, `robots.ts` |
| Low | E2E tests stale against `/shop`, UAH, localized copy | tests still mention `/search`, English, `priceInUSD` |

## Product/Sellability Review

Current state:

- Strong base for an agency developer.
- Not safe to sell as “client can run this” product.

Client-facing gaps:

| Gap | Why it matters |
|---|---|
| README still upstream/starter branded | buyers need product docs, not template docs |
| No admin handbook | non-technical content/catalog managers need workflows |
| No launch checklist | Stripe, webhooks, email, storage, DB, backups, domains, analytics |
| No operations playbook | orders, fulfillment, refunds, returns, support |
| No import/export guide | real stores need bulk catalog workflows |
| No branded transactional emails | guest orders and reset flows are core customer trust |
| No tax/shipping/promo/legal flows | checkout is not commercially complete |

## Code Quality and Maintainability

Verification:

| Command | Result |
|---|---|
| `pnpm exec tsc --noEmit` | Passed |
| `pnpm lint` | Passed with 181 warnings |
| `pnpm test:int` | Failed on DB DNS; 27 tests passed, 1 skipped, 1 DB suite failed |
| `pnpm build` | Failed: Turbopack internal error in sandbox while processing `@payloadcms/plugin-seo` CSS; root cause includes `creating new process` / `binding to a port` denied by sandbox |

Quality notes:

- Strict TypeScript is enabled and compile passes.
- Many runtime/commerce areas use `any`, `@ts-ignore`, `@ts-nocheck`, swallowed errors, unused imports.
- Lint warnings include React hook dependency issues in checkout/header/forms.
- Business logic for product search/filtering is duplicated in route components; should move to services/query builders.
- Seed scripts are large and loosely typed.

## Architecture Recommendations

### Add commerce domain layer

Create server-side services:

| Service | Responsibility |
|---|---|
| `productSearchService` | shared validated product/category/filter/sort queries |
| `checkoutService` | payment intent creation, address validation, inventory reservation |
| `orderService` | idempotent order finalization, state transitions, snapshots |
| `guestOrderAccessService` | short-lived token creation/verification/exchange |
| `catalogSchemaService` | product type attribute/variant validation |

### Harden production config

Required:

- Validate `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, Stripe keys, email credentials, public URLs at boot.
- Disable `rejectUnauthorized: false` in production.
- Require S3-compatible storage in production.
- Disable GraphQL playground or gate by environment.
- Remove seed endpoint from production.
- Add rate limiting/WAF for auth, search, find-order, preview, API.

### Fix ecommerce correctness

Required:

- Atomic inventory reservation/decrement.
- Webhook-first order creation.
- Idempotency and retries.
- Refund/cancel/fulfillment states.
- Shipping/tax/promo/legal consent.
- Immutable order snapshots.
- Variant-aware stock and availability filters.

### Productize docs

Replace README with:

1. Local setup.
2. Production deploy checklist.
3. Env matrix with required/optional/dev-only.
4. Stripe setup and webhook checklist.
5. Email provider setup.
6. Media storage setup.
7. Migrations and backups.
8. Admin user guide.
9. Catalog import/export guide.
10. Launch QA checklist.

## Remaining Work Estimate

| Workstream | Estimate |
|---|---:|
| Security hotfixes: token logging, seed gating, env validation | 3-5 days |
| Inventory/payment/order hardening | 2-3 weeks |
| Email + transactional templates | 3-5 days |
| Shipping/tax/promo/legal checkout | 1-2 weeks |
| Catalog model/client-safe admin workflows | 2-3 weeks |
| SEO/a11y/mobile/locale UX | 1-2 weeks |
| Test/CI hardening | 1-2 weeks |
| Product docs/admin handbooks | 1 week |

Practical totals:

| Target | Estimate |
|---|---:|
| Internal demo/starter cleanup | 1-2 weeks |
| Modest real store MVP | 4-6 weeks |
| Sellable agency starter | 6-8 weeks |
| Production-ready productized ecommerce starter | 10-14 weeks |

## File/Zone Inventory

This is the review map used for “every component/file” coverage. Individual files were assessed by category and risk rather than patched.

| Zone | Files | Review result |
|---|---:|---|
| Root config | `package.json`, `tsconfig`, `eslint`, `vitest`, `playwright`, `next`, `tailwind`, `.env.example` | works as starter; prod env/test isolation/docs need work |
| `src/payload.config.ts` | 1 | central config; email disabled, env fail-open, DB TLS weak |
| `src/plugins` | 1 | ecommerce/SEO/forms/S3; payment and token design need hardening |
| `src/collections` | 9+ | good CMS base; product/order/auth gaps |
| `src/access` | 10 | simple/readable; auth/rate limits not covered |
| `src/app/(app)` | customer routes | complete route surface, but checkout/order/security/SEO gaps |
| `src/app/(payload)` | admin/API routes | Payload routes OK; GraphQL playground decision needed |
| `src/components/Cart` | 6 | usable cart UI; inventory enforcement cannot be UI-only |
| `src/components/checkout` + forms checkout | 4 | functional Stripe flow; missing webhook-first, tax/shipping/legal |
| `src/components/product` | 3 | good base; a11y/JSON-LD/variant stock gaps |
| `src/components/Header` | 4 | mega menu/search useful; mobile nav/a11y/query preservation gaps |
| `src/components/Admin` | admin custom UI | useful category/tree/translation helpers; client docs needed |
| `src/blocks` | page builder blocks | broad CMS block coverage; type warnings and previews need polish |
| `src/i18n` | 8 | uk/ru support good; emails/metadata/docs not fully localized |
| `src/utilities` | 20+ | useful helpers; `deepMerge` ts-nocheck and query builders need hardening |
| `src/endpoints/seed` + `scripts` | demo/catalog tooling | useful for demos; destructive/prod risk |
| `src/migrations` | 10 | present; some fragile without guards |
| `tests` | 12 | meaningful e2e/int base; critical skipped test and DB dependency |

## Bottom Line

The project is a strong customized Payload ecommerce starter. It is not yet a production ecommerce product. The highest-priority path is: secure order access, fix inventory/payment correctness, configure email/storage/env hardening, remove destructive production affordances, then productize docs/admin operations and close frontend SEO/a11y/mobile gaps.
