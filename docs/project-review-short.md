# Короткий звіт рев'ю ecommerce starter

Дата: 2026-05-20  
Обсяг: 330 файлів у репозиторії, 285 файлів у `src`, додатково `tests`, `scripts`, configs, README, env приклади.  
Формат рев'ю: локальний огляд + 6 субагентів: архітектор, senior backend, senior frontend, senior engineer, senior skeptic, product/human reviewer.

## Вердикт

**No-go для продажу як production-ready ecommerce.**  
**Так, як agency/internal starter - придатний, але потребує hardening.**

Оцінка:

| Напрям | Бал |
|---|---:|
| Архітектура starter | 6/10 |
| Backend/CMS | 5/10 |
| Frontend/UX | 6/10 |
| Security/ops | 3/10 |
| Готовність для нетехнічного клієнта | 3.5/10 |
| Загальна production readiness | 5/10 |

## Найкритичніше

| Severity | Проблема | Де |
|---|---|---|
| Critical | Guest order `accessToken` постійний, у URL, ще й логиться повний email body | `src/components/forms/FindOrderForm/sendOrderAccessEmail.ts:40`, `:51`, `src/plugins/index.ts:156` |
| Critical | Відомий oversell inventory: тест прямо пропущений з коментарем, що checkout проходить при stock 0 | `tests/e2e/frontend.e2e.spec.ts:351` |
| Critical | Payment/order finalization занадто залежить від client-side `confirmOrder`, потрібен webhook-first/idempotent flow | `src/components/forms/CheckoutForm/index.tsx:67`, `src/components/checkout/ConfirmOrder.tsx:31` |
| High | Email не налаштований, хоча guest order, password reset і forms залежать від email | `src/payload.config.ts:91` |
| High | Env/security fail-open: empty DB/secret, DB TLS `rejectUnauthorized: false`, Stripe keys без startup validation | `src/payload.config.ts:49`, `:51`, `:117`, `src/plugins/index.ts:182` |
| High | Destructive seed endpoint змонтований у production app і може чистити дані адміном | `src/app/(app)/next/seed/route.ts:10`, `src/endpoints/seed/index.ts` |
| High | Public signup без видимого rate limit/email verification/password policy | `src/collections/Users/index.ts:16` |

## Що вже добре

- Payload CMS + ecommerce plugin, collections, admin UI, roles, pages, products, categories, product types, variants.
- Storefront має homepage/pages, catalog/shop, product detail, cart drawer, checkout, account, orders, guest order lookup.
- Є uk/ru локалізація, localized content, admin labels, page builder blocks.
- `pnpm exec tsc --noEmit` проходить.
- `pnpm lint` не має errors, але має 181 warnings.
- Є e2e coverage для базових cart/checkout/account/admin flows, хоча частина тестів застаріла.

## Скільки роботи лишилось

Орієнтир для команди з 1 senior full-stack + part-time QA/devops:

| Рівень готовності | Оцінка |
|---|---:|
| MVP для власного малого магазину після hardening | 4-6 тижнів |
| Starter для агентства, який можна кастомізувати під клієнта | 6-8 тижнів |
| Продукт, який можна продавати як production-ready клієнтам | 10-14 тижнів |

Перші роботи:

1. Прибрати token logging, переробити guest order access на short-lived hashed/signed tokens.
2. Зробити server-side atomic inventory reservation/decrement і розблокувати skipped inventory e2e.
3. Перенести order finalization на Stripe webhook source of truth з idempotency/reconciliation.
4. Додати production email adapter, branded localized transactional emails.
5. Додати env validation, secure DB TLS, S3/media requirement для production.
6. Прибрати/feature-flag destructive seed route.
7. Оновити README в product docs: deploy, env, Stripe, webhooks, email, S3, backups, admin guide.

## Перевірки

| Команда | Результат |
|---|---|
| `pnpm exec tsc --noEmit` | Passed |
| `pnpm lint` | Passed з 181 warnings |
| `pnpm test:int` | Failed: DB hostname Supabase не резолвиться в sandbox; 7 test files passed, DB-backed `api.int.spec.ts` failed |
| `pnpm build` | Failed: Turbopack internal error in sandbox while processing `@payloadcms/plugin-seo` CSS; root cause includes `creating new process` / `binding to a port` denied by sandbox |
