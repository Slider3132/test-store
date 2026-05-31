# Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the current Payload/Next ecommerce starter from demo-grade into a safer production baseline by removing known critical risks first, then hardening payments, inventory, auth, SEO, tests, and client operations.

**Architecture:** The implementation is split into small, reviewable tasks with clear file ownership. Immediate code tasks harden runtime behavior without changing external platform contracts; larger commerce-correctness tasks introduce server-side services and tests before replacing client-driven flows. Production-only safeguards must fail closed while preserving local development ergonomics.

**Tech Stack:** Next.js App Router, React 19, Payload CMS 3, Payload ecommerce plugin, Stripe, PostgreSQL, Vitest, Playwright, TypeScript.

---

## Phase 0: Immediate Production Risk Reduction

### Task 1: Production Environment Validation

**Files:**
- Create: `src/lib/env.ts`
- Modify: `src/payload.config.ts`
- Modify: `src/plugins/index.ts`
- Modify: `.env.example`
- Test: `tests/int/env.int.spec.ts`

- [ ] **Step 1: Add failing tests for production env validation**

Create `tests/int/env.int.spec.ts` with cases proving production rejects missing `DATABASE_URL`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, Stripe keys, and incomplete S3 config.

Run: `pnpm exec vitest run tests/int/env.int.spec.ts --config ./vitest.config.mts`

Expected: fails because `src/lib/env.ts` does not exist.

- [ ] **Step 2: Implement env helpers**

Create `src/lib/env.ts` with:

```ts
const production = process.env.NODE_ENV === 'production'

const requiredInProduction = (name: string) => {
  const value = process.env[name]

  if (production && (!value || value.trim().length === 0)) {
    throw new Error(`Missing required production environment variable: ${name}`)
  }

  return value
}

export const isProduction = production

export const env = {
  databaseURL: requiredInProduction('DATABASE_URL') || '',
  nextPublicStripePublishableKey: requiredInProduction('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY') || '',
  payloadSecret: requiredInProduction('PAYLOAD_SECRET') || '',
  previewSecret: requiredInProduction('PREVIEW_SECRET') || '',
  stripeSecretKey: requiredInProduction('STRIPE_SECRET_KEY') || '',
  stripeWebhooksSigningSecret: requiredInProduction('STRIPE_WEBHOOKS_SIGNING_SECRET') || '',
}

export const hasS3StorageEnv = Boolean(
  process.env.S3_BUCKET &&
    process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY,
)

export const assertProductionStorageConfigured = () => {
  if (production && !hasS3StorageEnv) {
    throw new Error('Production requires S3-compatible media storage environment variables.')
  }
}
```

- [ ] **Step 3: Wire config to fail closed**

Update `payload.config.ts` to import `env` and use `env.databaseURL`, `env.payloadSecret`, and production-safe SSL:

```ts
ssl: process.env.NODE_ENV === 'production' ? true : { rejectUnauthorized: false },
secret: env.payloadSecret,
```

Update `plugins/index.ts` to use `env.stripeSecretKey`, `env.nextPublicStripePublishableKey`, and `env.stripeWebhooksSigningSecret`. Call `assertProductionStorageConfigured()` before configuring plugins.

- [ ] **Step 4: Run verification**

Run:

```bash
pnpm exec vitest run tests/int/env.int.spec.ts --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: env tests pass and TypeScript passes.

### Task 2: Disable Destructive Seed Route in Production

**Files:**
- Modify: `src/app/(app)/next/seed/route.ts`
- Modify: `src/components/BeforeDashboard/SeedButton/index.tsx`
- Test: `tests/int/seed-route.int.spec.ts`

- [ ] **Step 1: Add failing test for production seed guard**

Create `tests/int/seed-route.int.spec.ts` to assert production requests return `404` or `403` before seeding when `ENABLE_SEED_ENDPOINT` is not set to `true`.

- [ ] **Step 2: Add explicit guard**

At the top of `POST()` in `src/app/(app)/next/seed/route.ts`, add:

```ts
if (process.env.NODE_ENV === 'production' && process.env.ENABLE_SEED_ENDPOINT !== 'true') {
  return new Response('Not found.', { status: 404 })
}
```

- [ ] **Step 3: Hide admin seed button outside local/dev**

In `src/components/BeforeDashboard/SeedButton/index.tsx`, return `null` when the environment is production and `NEXT_PUBLIC_ENABLE_SEED_BUTTON !== 'true'`.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec vitest run tests/int/seed-route.int.spec.ts --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: tests and TypeScript pass.

### Task 3: Remove Order Token Logging and Use Signed Find-Order Links

**Files:**
- Create: `src/lib/orderAccess.ts`
- Modify: `src/components/forms/FindOrderForm/sendOrderAccessEmail.ts`
- Modify: `src/app/(app)/(account)/orders/[id]/page.tsx`
- Test: `tests/int/order-access.int.spec.ts`

- [ ] **Step 1: Add failing tests**

Test that `createOrderAccessToken()` creates an expiring signed token, `verifyOrderAccessToken()` rejects wrong email/order, and the email helper never logs the token body.

- [ ] **Step 2: Implement signed token helper**

Create `src/lib/orderAccess.ts`:

```ts
import jwt from 'jsonwebtoken'

const EXPIRY = '15m'

type Payload = {
  email: string
  orderID: string
}

const getSecret = () => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('PAYLOAD_SECRET is required for order access tokens.')
  return secret
}

export const createOrderAccessToken = ({ email, orderID }: Payload) =>
  jwt.sign({ email, orderID }, getSecret(), { expiresIn: EXPIRY })

export const verifyOrderAccessToken = ({
  email,
  orderID,
  token,
}: Payload & { token: string }) => {
  const decoded = jwt.verify(token, getSecret())

  if (!decoded || typeof decoded !== 'object') return false

  return decoded.email === email && decoded.orderID === orderID
}
```

- [ ] **Step 3: Update find-order email**

Replace permanent `accessToken` URL generation with `orderToken` from `createOrderAccessToken()`. Remove `console.log('[sendOrderAccessEmail] Email body:', emailBody)`.

- [ ] **Step 4: Update order page access**

Read `orderToken` from search params. For guests, allow access when `verifyOrderAccessToken({ email, orderID: id, token: orderToken })` passes. Keep legacy `accessToken` temporarily only for direct post-checkout redirect until Task 8 replaces client finalization.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm exec vitest run tests/int/order-access.int.spec.ts --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: tests and TypeScript pass.

### Task 4: Safe Redirects for Auth Forms

**Files:**
- Create: `src/utilities/safeRedirect.ts`
- Modify: `src/components/forms/LoginForm/index.tsx`
- Modify: `src/components/forms/CreateAccountForm/index.tsx`
- Test: `tests/int/safe-redirect.int.spec.ts`

- [ ] **Step 1: Add failing tests**

Test that `/checkout` is allowed, `/ru/checkout` is allowed, `https://evil.example` is rejected, `//evil.example` is rejected, and `/admin` is rejected.

- [ ] **Step 2: Implement utility**

Create `src/utilities/safeRedirect.ts`:

```ts
export const getSafeRedirect = (value: string | null | undefined, fallback: string) => {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.startsWith('/admin') || value.startsWith('/api') || value.startsWith('/next')) {
    return fallback
  }
  return value
}
```

- [ ] **Step 3: Use utility in auth forms**

Use `getSafeRedirect(searchParams.get('redirect'), localizePath('/account', locale))` in both login and create-account forms. Keep localized account fallback.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec vitest run tests/int/safe-redirect.int.spec.ts --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: tests and TypeScript pass.

### Task 5: Whitelist Product Sort Parameters

**Files:**
- Create: `src/utilities/sanitizeProductSort.ts`
- Modify: `src/app/(app)/shop/page.tsx`
- Modify: `src/app/(app)/catalog/[slug]/page.tsx`
- Test: `tests/int/product-sort.int.spec.ts`

- [ ] **Step 1: Add failing tests**

Test that only known sorting values from `src/lib/constants.ts` are allowed and unknown values fall back to `title`.

- [ ] **Step 2: Implement utility**

Create `src/utilities/sanitizeProductSort.ts`:

```ts
import { sorting } from '@/lib/constants'

const allowed = new Set(sorting.map((item) => item.slug))

export const sanitizeProductSort = (value: string | string[] | undefined) => {
  const selected = Array.isArray(value) ? value[0] : value
  return selected && allowed.has(selected) ? selected : 'title'
}
```

- [ ] **Step 3: Use it in shop/category routes**

Replace direct `selectedSort` handling with `sanitizeProductSort(sort)` in both route files.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm exec vitest run tests/int/product-sort.int.spec.ts --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: tests and TypeScript pass.

### Task 6: Fix Checkout Address Selection for Users With No Saved Addresses

**Files:**
- Modify: `src/components/checkout/CheckoutAddresses.tsx`
- Test: `tests/int/checkout-addresses.int.spec.tsx`

- [ ] **Step 1: Add failing component test**

Render `CheckoutAddresses` with mocked `useAddresses()` returning `[]`; verify the create-address modal callback calls `setAddress`.

- [ ] **Step 2: Pass callback**

Change empty-state and modal footer `CreateAddressModal` calls to:

```tsx
<CreateAddressModal
  callback={(address) => {
    setAddress(address)
  }}
/>
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm exec vitest run tests/int/checkout-addresses.int.spec.tsx --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: tests and TypeScript pass.

### Task 7: Correct Product JSON-LD Price Units

**Files:**
- Modify: `src/app/(app)/products/[slug]/page.tsx`
- Test: `tests/int/product-jsonld.int.spec.ts`

- [ ] **Step 1: Add failing unit test for price conversion**

Extract or test a helper that converts base currency amount `123456` to JSON-LD price `1234.56`.

- [ ] **Step 2: Use `fromBaseCurrencyAmount()`**

Import `fromBaseCurrencyAmount` from `src/lib/currency.ts` and set:

```ts
price: fromBaseCurrencyAmount(price),
```

- [ ] **Step 3: Verify**

Run:

```bash
pnpm exec vitest run tests/int/product-jsonld.int.spec.ts --config ./vitest.config.mts
pnpm exec tsc --noEmit
```

Expected: tests and TypeScript pass.

## Phase 1: Commerce Correctness

### Task 8: Server-Side Inventory Validation and Reservation

**Files:**
- Create: `src/lib/commerce/inventory.ts`
- Modify: payment initiation/finalization integration after confirming Payload ecommerce plugin extension points
- Test: `tests/int/inventory.int.spec.ts`
- Test: unskip/update `tests/e2e/frontend.e2e.spec.ts:351`

- [ ] **Step 1:** Add integration tests proving cart checkout fails when product or variant inventory is zero at payment initiation.
- [ ] **Step 2:** Add server-side inventory query helper that reads current product/variant quantities with `overrideAccess: true`.
- [ ] **Step 3:** Call validation before payment intent creation.
- [ ] **Step 4:** Add atomic decrement/reservation in the same transaction used to create/finalize an order.
- [ ] **Step 5:** Unskip the e2e inventory race test.

### Task 9: Webhook-First Order Finalization

**Files:**
- Create: `src/lib/commerce/orders.ts`
- Create: `tests/int/stripe-webhook.int.spec.ts`
- Modify: checkout confirmation flow only after webhook service exists

- [ ] **Step 1:** Add tests for idempotent order creation from duplicate Stripe events.
- [ ] **Step 2:** Add reconciliation for succeeded payment intent without client redirect.
- [ ] **Step 3:** Change client confirmation pages to poll/display order status rather than create orders.
- [ ] **Step 4:** Add failure recovery and logging.

## Phase 2: Client-Safe Productization

### Task 10: Production Docs and Runbooks

**Files:**
- Replace: `README.md`
- Create: `docs/production-launch-checklist.md`
- Create: `docs/admin-handbook.md`
- Create: `docs/operations-runbook.md`

- [ ] **Step 1:** Document required env vars, email, S3, Stripe webhooks, migrations, backups.
- [ ] **Step 2:** Document catalog/product type/variant workflows.
- [ ] **Step 3:** Document order/fulfillment/refund/support workflows.

### Task 11: SEO, Sitemap, Hreflang, Mobile Nav, Accessibility

**Files:**
- Modify: `src/app/(app)/layout.tsx`
- Create: `src/app/(app)/sitemap.ts`
- Modify: `src/components/Header/index.client.tsx`
- Modify: `src/components/Header/HeaderSearch.tsx`
- Modify: `src/components/product/Gallery.tsx`

- [ ] **Step 1:** Restore branded root metadata.
- [ ] **Step 2:** Add sitemap route.
- [ ] **Step 3:** Add canonical/hreflang alternates where route data permits.
- [ ] **Step 4:** Mount full mobile nav.
- [ ] **Step 5:** Make search and gallery keyboard/screen-reader accessible.

## Orchestration Rules

- Implement tasks sequentially unless write scopes are disjoint.
- Each worker gets one task and owns only listed files.
- After each worker returns, run spec review and code quality review.
- Do not mark a task complete without fresh verification.
- Do not claim production readiness until Phase 0, Phase 1, Phase 2, and production-mode e2e all pass.
