# Provider-Agnostic Payments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Stripe-only checkout assumptions with a provider-agnostic payment foundation that supports redirect/webhook Ukrainian payment providers and keeps Stripe optional.

**Architecture:** Payment business logic is server-owned. Checkout initiates a provider transaction, redirect-based providers send the customer to an external checkout URL, and orders are created only through server-side confirmation/webhook logic. Provider adapters are selected through environment configuration so LiqPay, WayForPay, Mono, Fondy, Stripe, or custom providers can be added without changing checkout core.

**Tech Stack:** Next.js App Router, React 19, Payload CMS ecommerce plugin, Payload local API, PostgreSQL, Vitest, TypeScript.

---

## Task 1: Payment Provider Configuration

**Files:**
- Modify: `src/lib/env.ts`
- Create: `src/payments/config.ts`
- Modify: `.env.example`
- Test: `tests/int/payment-config.int.spec.ts`

- [x] Add provider env parsing for `PAYMENT_PROVIDER` and `NEXT_PUBLIC_PAYMENT_PROVIDER`.
- [x] Support `stripe`, `external_redirect`, and `disabled`.
- [x] Keep Stripe credentials required only when Stripe is selected.
- [x] Require external provider env only when `external_redirect` is selected in production.

## Task 2: External Redirect Payment Adapter

**Files:**
- Create: `src/payments/externalRedirectAdapter.ts`
- Create: `src/payments/orderFinalization.ts`
- Modify: `src/plugins/index.ts`
- Test: `tests/int/external-payment-adapter.int.spec.ts`

- [x] Create pending transactions with a provider reference.
- [x] Return a provider checkout URL instead of a Stripe client secret.
- [x] Add a webhook endpoint that verifies HMAC signatures before creating orders.
- [x] Make order creation idempotent by reusing an existing transaction order.
- [x] Revalidate inventory before final order creation.

## Task 3: Checkout UI Without Stripe Lock-In

**Files:**
- Modify: `src/providers/index.tsx`
- Modify: `src/components/checkout/CheckoutPage.tsx`
- Modify: `src/components/forms/CheckoutForm/index.tsx`
- Modify: `src/components/checkout/ConfirmOrder.tsx`
- Modify: `src/app/(app)/checkout/page.tsx`
- Test: `tests/int/checkout-payment-flow.int.spec.tsx`

- [x] Select active provider from public env.
- [x] Redirect immediately when initiation returns `redirectUrl`.
- [x] Render Stripe Elements only for `clientSecret` payments.
- [x] Remove Stripe-specific setup warning from the checkout page.

## Task 4: Documentation and Production Status

**Files:**
- Modify: `docs/production-hardening-implementation-report.md`
- Create: `docs/payments-integration.md`

- [x] Document provider env flags.
- [x] Document webhook contract for generic redirect providers.
- [x] Document how to add a real LiqPay/WayForPay/Mono/Fondy adapter.
