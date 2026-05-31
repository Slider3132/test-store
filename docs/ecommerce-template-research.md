# Research ecommerce templates/starters

Дата research: 2026-05-18.

## Executive Summary

Рекомендована основа: **офіційний Payload Ecommerce Template** з Payload monorepo. Його варто брати не як готовий production-магазин, а як найкращу офіційну базу, яку треба одразу перевірити на **Postgres/Supabase**, **Supabase Storage через S3-compatible adapter** і **uk/ru локалізацію**.

Чому саме він: це єдиний актуальний офіційний open-source варіант, де вже є Next.js storefront, Payload backend/API, admin, products/variants, categories, media, carts, checkout, customers/accounts, orders, Stripe payments і тести. Репозиторій Payload активний, MIT-licensed, template використовує сучасні Next/React версії. Головний caveat: Payload Ecommerce Plugin і template позначені як **Beta**, а docs прямо кажуть, що shipping, taxes і subscriptions не покриваються нативно.

Найкоротший шлях до production-ready single-seller магазину:

1. Взяти official Payload Ecommerce Template.
2. Зробити scratch spike: install/build, admin, storefront, product -> cart -> checkout -> order.
3. Замінити DB на `@payloadcms/db-postgres` і перевірити Supabase Postgres.
4. Підключити Supabase Storage через Payload S3 storage adapter.
5. Додати `/uk` і `/ru`, Payload localization і storefront UI translations.
6. Після spike harden: shipping/tax/payment edge cases, order lifecycle, emails, search/indexing, large catalog import.

## Requirements

- Single-seller ecommerce, не marketplace.
- Багато категорій і товарів.
- CMS/admin для каталогу, контенту, media, customers і orders.
- Next.js storefront.
- Backend/API.
- Products, categories, media, cart, checkout, customers/accounts, orders.
- Postgres, бажано Supabase-compatible.
- Local media mode для dev і remote storage для staging/production.
- Українська і російська локалізація.
- Production-ready структура: tests, migrations/deploy path, maintainable code.
- Безкоштовні/open-source або офіційні templates/starters; платні templates не є default.

## Candidates Reviewed

Score 1-5 враховує storefront readiness, admin/CMS readiness, cart/checkout readiness, product/category model, media support, i18n support, Supabase/Postgres compatibility, customization difficulty, production readiness, maintenance/activity, license suitability і fit for single-seller large catalog.

| Candidate | URL | Stack | License | Актуальність | Що є | Що бракує / ризик | Score | Verdict |
|---|---|---|---|---|---|---|---:|---|
| Payload Ecommerce Template | https://github.com/payloadcms/payload/tree/main/templates/ecommerce | Next 16.2.6, React 19.2.6, Payload, `@payloadcms/plugin-ecommerce`, Stripe, Tailwind 4 | MIT | Payload repo active 2026-05-18; package versions checked | Storefront, admin/API, auth/access control, media, categories, products/variants, carts, guest checkout, accounts, addresses, orders, transactions, Stripe, currencies, SEO, search, tests | Template/plugin Beta; default package uses MongoDB adapter; shipping/taxes/subscriptions not native; Postgres/Supabase треба перевірити spike-ом | 4.3 | use |
| Mandala Payload Ecommerce Template | https://github.com/Mandala-Software-House/payload-ecommerce-template | Next 15, React 19, Payload 3.68, MongoDB, Stripe, `next-intl`, Tailwind | MIT | 162 stars, 426 commits, release v1.0.3 2025-12-15, active in 2026 | Storefront, Payload admin, products/variants, categories, media, cart, checkout, accounts, orders, reviews, multilingual routing, payments/shipping claims | MongoDB default; менший проєкт; shipping/payment assumptions треба audit; більше custom-коду | 3.9 | maybe |
| ShopNex | https://github.com/shopnex-ai/shopnex | Next 15, Payload 3, SQLite in simple shop, Stripe, monorepo | MIT | 317 stars, release v0.7.0 2025-08-18, pushed 2026-02-27 | Storefront(s), Payload admin/API, products, collections, cart, checkout, orders, accounts, addresses, Stripe, gift cards, analytics/import-export claims | Platform-like scope; SQLite default; roadmap показує, що частина order/shipping features ще не complete | 3.7 | maybe |
| Amerta | https://github.com/n-for-all/amerta | Next 16, React 19, Payload 3.75, MongoDB, Stripe, Tailwind, i18n packages | MIT | Latest commit 2026-03-16, no release found | Rich custom commerce model: products, media, cart rules, coupons, orders, payment methods, shipping, tax, wishlist, emails, localization | Маленька community; багато custom abstractions; Postgres support claimed, not default | 3.4 | maybe |
| Vercel Commerce | https://github.com/vercel/commerce | Next App Router, React 19, Shopify provider | MIT | 14k stars, pushed 2026-02-02; Shopify version actively maintained | Excellent storefront architecture, RSC/server actions, Shopify product/cart integration | Shopify-only active path; немає self-owned backend/admin/CMS; checkout delegated to Shopify | 2.8 | reference |
| Epic Next.js Ecommerce Starter | https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter | Next 16.2.3, React 19.2.4, Tailwind 4, shadcn, Zustand, `next-intl` | No license detected | Very new, low-star; site says open source | Polished storefront/catalog UI, categories, product cards, i18n dependency | Немає admin/CMS/backend/orders/real checkout; no detected license | 2.1 | avoid as base |
| Next Prisma Tailwind Ecommerce | https://github.com/slowfound/next-prisma-tailwind-ecommerce | Next 14, Prisma, PostgreSQL, shadcn/Radix, separate admin/storefront apps | MIT | 370 stars, release v0.2.0 2024-10-13, pushed 2025-01-01 | Storefront, admin panel, products, orders, payments dashboard, uploads, auth, blog, i18n | Stale; not Payload; two-app deployment; checkout/payment depth needs audit | 3.0 | reference |
| Medusa | https://github.com/medusajs/medusa | Node/TypeScript commerce backend, admin, Postgres/Redis, Next starter via `create-medusa-app` | MIT | Active 2026-05-18; releases active in 2026 | Mature commerce backend/admin, products, cart, checkout, orders, workflows, Next storefront path | More ops: backend/admin, storefront, Postgres, Redis, workers; Payload becomes extra CMS or unnecessary | 4.0 | maybe |
| Saleor | https://github.com/saleor/saleor and https://github.com/saleor/storefront | Python/Django GraphQL commerce core, dashboard, Next storefront | Core BSD-3-Clause; storefront FSL-1.1-ALv2 | Active 2026-05-18; active releases | Strong API, dashboard, products, channels, checkout, i18n model, media docs | GraphQL/app architecture complexity; storefront license needs legal review; Payload overlap | 3.7 | maybe |
| Spree + Spree Storefront | https://github.com/spree/spree and https://github.com/spree/storefront | Rails commerce backend/admin/API + Next 16 storefront | BSD-3-Clause core, MIT storefront | Active 2026-05-18; Spree v5.4.2 2026-04-27 | Mature admin/API, products, cart, checkout, orders, payments, shipping, Next storefront, multi-region | Rails stack; not Payload; separate backend | 4.1 | maybe |
| Shopify Hydrogen | https://github.com/Shopify/hydrogen | Shopify SaaS backend/admin/checkout + Hydrogen storefront | MIT for Hydrogen | Active 2026-05-14; npm active in 2026 | Production Shopify admin/checkout/media, custom React storefront | Not open-source backend; no Postgres/Supabase ownership; Shopify lock-in | 2.6 | avoid unless Shopify accepted |
| Openfront | https://github.com/openshiporg/openfront | Next + Keystone + Prisma + Stripe | MIT | 80 stars, 173 commits, active in 2026 | All-in-one ecommerce platform with admin dashboard, storefront, checkout, inventory, fulfillment claims | Keystone, not Payload; small ecosystem; no releases shown | 3.2 | reference |

## Payload Ecommerce Findings

Payload Ecommerce docs кажуть, що `@payloadcms/plugin-ecommerce` зараз **Beta** і може мати breaking changes. Plugin дає products with variants, Payload-tracked carts, orders and transactions, customer addresses, payment adapter pattern, Stripe support, multiple currencies і React UI utilities. Він не покриває нативно shipping, taxes або subscriptions. Source: https://payloadcms.com/docs/ecommerce/overview.

Офіційний template: https://github.com/payloadcms/payload/tree/main/templates/ecommerce. Старий repo https://github.com/payloadcms/template-ecommerce-nextjs archived, його не треба брати.

Що дає official template:

- One Next.js application with Payload embedded.
- Payload admin and API.
- Auth/access control.
- Media collection.
- Categories.
- Products and variants.
- Carts.
- Guest checkout.
- Orders and transactions.
- User accounts and addresses.
- Stripe payments.
- Currencies.
- SEO, search, layout builder, draft/live preview, revalidation, automated tests.

Що треба доробити:

- Замінити MongoDB default на Postgres/Supabase через `@payloadcms/db-postgres`.
- Перевірити SQL migrations для ecommerce plugin collections.
- Додати uk/ru content localization і storefront UI localization.
- Додати production storage adapter.
- Harden shipping, tax, payment, refunds, order lifecycle, email, inventory і search/indexing для large catalog.

Відповідь на питання "Чи достатньо Payload Ecommerce Template?": **так як база, ні як готовий production магазин**.

## Next.js Starter Findings

Generic Next.js ecommerce starters корисні переважно як **storefront/UI references**, а не як primary base.

- Vercel Commerce якісний, але actively maintained path прив'язаний до Shopify; немає self-owned CMS/admin/backend. Source: https://github.com/vercel/commerce.
- Epic Next.js Ecommerce Starter сучасний і візуально корисний, але немає admin/CMS/backend/orders/real checkout і не було detected license. Sources: https://nextjsecommercestarter.com, https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter.
- Next Prisma Tailwind Ecommerce ближче до full-stack з admin і PostgreSQL, але stale і не Payload-based. Source: https://github.com/slowfound/next-prisma-tailwind-ecommerce.
- Supabase/Stripe SaaS starters корисні для auth, subscriptions, webhooks, billing references, але не є catalog ecommerce bases.
- Openfront цікавий Keystone-based all-in-one варіант, але це відхід від Payload.

Висновок: **не варто стартувати з generic Next.js storefront і додавати Payload окремо**, якщо ми не хочемо вручну відтворити commerce model, admin schema, orders, customer access control, cart persistence, checkout records, media relations і localization contracts.

## Commerce Engine Comparison

### Medusa

Medusa варто брати, якщо потрібні TypeScript commerce backend customization, workflows, modules і dedicated commerce admin. MIT, активний, має official install/storefront path.

Не default для цього проєкту, якщо Payload CMS є hard requirement: Medusa додає окремий commerce backend/admin, PostgreSQL, Redis, workers і Next storefront. Payload тоді або redundant, або окремий content CMS. Sources: https://docs.medusajs.com/learn/installation, https://github.com/medusajs/medusa.

### Saleor

Saleor варто брати для GraphQL-first commerce, channels, localization, composable apps і enterprise-style API contracts.

Ризики: self-hosting complexity, Python/Django/GraphQL stack, app architecture overhead і license review для storefront, бо він FSL-1.1-ALv2. Sources: https://docs.saleor.io, https://github.com/saleor/saleor, https://github.com/saleor/storefront.

### Spree

Spree варто брати, якщо Rails acceptable і пріоритетом є mature open-source commerce engine з admin, API, checkout, orders, payments, shipping і official Next storefront. Це найсильніший non-Payload open-source engine для large catalog, якщо Payload перестає бути обов'язковим.

Ризики: Rails stack, separate backend, Payload не буде primary admin/CMS. Sources: https://spreecommerce.org/docs/developer/core-concepts/architecture, https://github.com/spree/spree, https://github.com/spree/storefront.

### Shopify Hydrogen

Hydrogen релевантний тільки якщо приймаємо Shopify як commerce backend. Shopify вирішує admin/checkout/media operationally, але не відповідає self-owned Postgres/Supabase requirement і дає platform lock-in. Sources: https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started, https://github.com/Shopify/hydrogen.

## i18n Findings

Рекомендований підхід:

- Locale prefixes для обох мов: `/uk/...` і `/ru/...`.
- `uk` як default business locale, але теж prefixed для SEO consistency і простішого routing.
- Next.js App Router internationalization pattern: `app/[lang]/...` і middleware/proxy locale detection. Exclude `/admin`, `/api`, `/_next`, media/static routes. Source: https://nextjs.org/docs/app/guides/internationalization.
- Payload localization для content fields: product title, product description, category name, SEO title/description, page blocks, banners, header/footer globals. Payload localization is field-level, not document-level. Source: https://payloadcms.com/docs/configuration/localization.
- Payload i18n/admin labels окремо від content localization. Collection labels, field labels, admin groups, descriptions, placeholders можуть бути localized label objects і `@payloadcms/translations`. Source: https://payloadcms.com/docs/configuration/i18n.
- `next-intl` або dictionaries для static storefront UI strings: cart labels, checkout steps, errors, buttons, account UI.

Ризики:

- Locale middleware може зачепити Payload admin/API/media routes.
- Payload content localization і Payload admin UI i18n - різні системи.
- Localized slugs потребують рішення: shared slug або localized slugs з uniqueness rules і redirects.
- SKU, stock, price, currency і inventory fields зазвичай не треба localize.

## Media Storage Findings

Рекомендований підхід:

- Development: local Payload uploads.
- Staging/production: Supabase Storage через Payload official S3 storage adapter, бо Supabase Storage S3-compatible. Sources: https://payloadcms.com/docs/upload/storage-adapters, https://supabase.com/docs/guides/storage/s3/compatibility.

Payload storage adapters включають S3, Vercel Blob, Azure, GCS, Uploadthing і R2. S3 adapter можна спрямувати на S3-compatible providers. Payload storage docs також попереджають: direct public object URLs bypass Payload access control; protected files краще лишати через Payload access-control/proxy або signed URL logic. Source: https://payloadcms.com/docs/upload/storage-adapters.

Supabase Storage підтримує S3-compatible access, REST і TUS resumable uploads. Source: https://supabase.com/docs/guides/storage.

Env requirements:

```env
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
NEXT_PUBLIC_SERVER_URL=https://...

S3_BUCKET=media
S3_REGION=<supabase-region-or-s3-region>
S3_ENDPOINT=https://<project-ref>.storage.supabase.co/storage/v1/s3
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
```

Ризики:

- Local uploads не production-safe на ephemeral/serverless hosts.
- Supabase S3 compatibility не реалізує всі S3 features і не підтримує S3 versioning.
- Public Supabase URLs нормальні для public catalog media, але protected files потребують Payload access control або signed URLs.
- Large catalog media потребує перевірки cache headers, image sizes, responsive variants і CDN behavior.

## Recommended Architecture

Frontend:

- Next.js App Router storefront з official Payload Ecommerce Template.
- Locale-prefixed routes `/uk` і `/ru`.
- Product/category pages з Payload data.

CMS/Admin:

- Payload CMS embedded in Next.js app.
- Payload admin для products, categories, media, pages, header/footer, customers, orders, transactions.
- Localized admin labels для українських/російських editors.

Database:

- Supabase Postgres через `@payloadcms/db-postgres`.
- Migrations required; не використовувати dev auto-push проти production.
- Prefer direct/session connection для runtime і migrations; Supavisor перевірити окремо.

Storage:

- Local uploads in development.
- Supabase Storage in staging/production через `@payloadcms/storage-s3` або `@payloadcms/plugin-cloud-storage` + S3 adapter.

Cart:

- Стартувати з Payload ecommerce plugin cart model.
- Перевірити guest cart, authenticated cart, cart merge/login behavior і abandoned cart cleanup.

Checkout:

- Стартувати зі Stripe adapter з Payload ecommerce template.
- Додати потрібні українські payment/shipping/tax flows після template spike.
- Orders мають жити в Payload; payment webhooks не мають бути єдиним source of truth.

Localization:

- Payload localization для content.
- `next-intl` або dictionaries для storefront UI.
- Localized SEO metadata.
- Shared vs localized slugs вирішити до catalog import.

Deployment:

- Next.js/Payload app як Node server або compatible platform.
- Supabase для Postgres і storage.
- External email provider для transactional emails.
- Observability, backups, migration pipeline і webhook verification до production.

## Implementation Plan

### Phase 1: bootstrap template

- Створити scratch app з official Payload Ecommerce Template.
- Install і local run.
- Перевірити admin, storefront, seed/admin creation, tests/build baseline.

### Phase 2: Supabase/Postgres setup

- Замінити MongoDB adapter на `@payloadcms/db-postgres`.
- Підключити local Postgres first, потім Supabase staging.
- Generate/run migrations.
- Verify product, variant, category, cart, order, transaction CRUD.

### Phase 3: media modes

- Local upload mode для development.
- Supabase Storage через S3 adapter для staging/production.
- Verify upload, image sizes, delete behavior, public/private URL behavior і CDN/cache headers.

### Phase 4: i18n

- Додати `/uk` і `/ru` route structure.
- Configure Payload localization with default `uk`.
- Додати localized admin labels і storefront dictionaries.
- Verify localized product/category/page rendering і SEO.

### Phase 5: catalog/admin polish

- Audit product/category model для large catalog: attributes, filters, search, sorting, related products, inventory, SKU uniqueness, bulk import/export.
- Додати merchant-friendly admin fields і validation.
- Вирішити search/indexing strategy.

### Phase 6: verification/deploy

- Run build, lint, integration tests, checkout webhook tests.
- Test staging deployment з Supabase Postgres і Supabase Storage.
- Verify backup/restore, migrations, media cleanup, order/payment failure paths.

## Risks and Open Questions

- Payload ecommerce plugin і official template Beta.
- Official template default DB path треба перевірити з Postgres/Supabase до повної імплементації.
- Shipping, taxes, refunds, order state transitions і українські payment/shipping providers не вирішені template-ом.
- Localization complexity зросте, якщо потрібні localized slugs.
- Media adapter behavior з Supabase S3 треба перевірити під chosen deployment platform.
- Admin customization може бути потрібна для catalog managers.
- Large catalog search/filtering може потребувати Meilisearch/Typesense/Algolia або dedicated Postgres search strategy.
- Migration complexity може зрости, якщо стартувати з MongoDB-oriented examples.
- Saleor storefront license needs legal review.
- No-license repositories не використовувати як base.

## Final Recommendation

Брати: **official Payload Ecommerce Template**.

Не брати як primary base:

- Generic Next.js/shadcn ecommerce UI templates: немає CMS/admin/backend/order model.
- Vercel Commerce: тільки якщо переходимо на Shopify backend.
- No-license starters.
- Archived/old Payload ecommerce templates.

Розглядати як alternatives:

- **Mandala Payload Ecommerce Template**, якщо multilingual storefront і practical shipping/payment UI важливіші за official plugin alignment.
- **ShopNex**, якщо ціль зсувається до ширшої Shopify-like platform.
- **Spree**, якщо Payload перестає бути mandatory і потрібен найбільш complete open-source commerce engine.
- **Medusa**, якщо TypeScript commerce backend customization важливіша за Payload CMS.
- **Saleor**, якщо GraphQL/channels/composable commerce стають explicit requirements.

Перед production implementation перевірити:

1. Official Payload Ecommerce Template install/build/tests.
2. Postgres/Supabase adapter compatibility для ecommerce plugin collections.
3. Supabase Storage через S3 adapter.
4. uk/ru localization для product/category/content fields і storefront UI.
5. Checkout/payment/shipping/tax requirements для target market.

Наступний крок: small scratch spike з official Payload Ecommerce Template, switch to Supabase Postgres, minimal Supabase Storage config, prove product -> cart -> checkout -> order before production UX.

## Sources

- Payload Ecommerce Overview: https://payloadcms.com/docs/ecommerce/overview
- Payload Ecommerce Template: https://github.com/payloadcms/payload/tree/main/templates/ecommerce
- Payload Ecommerce Template package: https://raw.githubusercontent.com/payloadcms/payload/3.x/templates/ecommerce/package.json
- Payload Postgres Adapter: https://payloadcms.com/docs/database/postgres
- Payload Storage Adapters: https://payloadcms.com/docs/upload/storage-adapters
- Payload Localization: https://payloadcms.com/docs/configuration/localization
- Payload i18n: https://payloadcms.com/docs/configuration/i18n
- Payload Supabase guide: https://payloadcms.com/posts/guides/setting-up-payload-with-supabase-for-your-nextjs-app-a-step-by-step-guide
- Payload archived old ecommerce template: https://github.com/payloadcms/template-ecommerce-nextjs
- Mandala Payload Ecommerce Template: https://github.com/Mandala-Software-House/payload-ecommerce-template
- ShopNex: https://github.com/shopnex-ai/shopnex
- Amerta: https://github.com/n-for-all/amerta
- Vercel Commerce: https://github.com/vercel/commerce
- Epic Next.js Ecommerce Starter: https://nextjsecommercestarter.com and https://github.com/Epic-Design-Labs/nextjs-ecommerce-starter
- Next Prisma Tailwind Ecommerce: https://github.com/slowfound/next-prisma-tailwind-ecommerce
- Medusa docs: https://docs.medusajs.com/learn/installation
- Medusa GitHub: https://github.com/medusajs/medusa
- Medusa Next.js starter: https://github.com/medusajs/nextjs-starter-medusa
- Saleor docs: https://docs.saleor.io
- Saleor GitHub: https://github.com/saleor/saleor
- Saleor Storefront: https://github.com/saleor/storefront
- Spree architecture docs: https://spreecommerce.org/docs/developer/core-concepts/architecture
- Spree GitHub: https://github.com/spree/spree
- Spree Next.js Storefront: https://github.com/spree/storefront
- Shopify Hydrogen docs: https://shopify.dev/docs/storefronts/headless/hydrogen/getting-started
- Shopify Hydrogen GitHub: https://github.com/Shopify/hydrogen
- Openfront: https://github.com/openshiporg/openfront
- Next.js App Router internationalization: https://nextjs.org/docs/app/guides/internationalization
- Supabase Storage overview: https://supabase.com/docs/guides/storage
- Supabase S3 compatibility: https://supabase.com/docs/guides/storage/s3/compatibility
- Supabase Postgres connection strings: https://supabase.com/docs/reference/postgres/connection-strings
