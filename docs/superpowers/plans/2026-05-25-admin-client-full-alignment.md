# Admin And Client Full Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the ecommerce starter so client checkout, admin management, persisted order data, delivery integrations, roles, and operational UX work as one production-ready system.

**Architecture:** Keep provider-specific payment, production email, and bulk CSV/XLSX import/export in backlog. Finish the current production slice by making delivery, manual orders, role permissions, stock reservation, and audit data explicit in schema, admin, API, and checkout UI. Use small server helpers for data contracts and client components only for interaction.

**Tech Stack:** Payload CMS, Next.js App Router, React, TypeScript, Payload Ecommerce plugin, Postgres, Vitest, ESLint.

---

## Orchestration Model

Orchestrator: main Codex agent. Owns final decisions, conflict resolution, integration, verification, and final report.

Managing agent: splits work into bounded tasks, reviews subagent outputs, rejects incomplete implementations, and sends one consolidated recommendation to the orchestrator.

Worker subagents:

| Agent | Role | Write Scope |
| --- | --- | --- |
| Delivery Backend | Delivery schema, settings API, delivery service hardening | `src/delivery/**`, `src/app/(app)/next/delivery/**`, `src/globals/AdminSettings.ts`, tests |
| Checkout UX | Client delivery selector and checkout data submission | `src/components/checkout/**`, `src/i18n/**`, tests |
| Admin Orders | Admin/manual order fields, delivery details, order UX | `src/plugins/index.ts`, order-related helpers/tests |
| Access & Audit | Role matrix, API-level access tests, audit metadata | `src/access/**`, `src/collections/AuditLogs.ts`, tests |
| Migration & Types | Payload migrations and generated types | `src/migrations/**`, `src/payload-types.ts` |
| QA Skeptic | Full review and verification | read-only except docs updates if assigned |

## Missing Pieces

| Area | Missing | Required Result |
| --- | --- | --- |
| Checkout delivery UX | Checkout has address selection but no provider/city/warehouse selector. | Customer can choose pickup, Nova Poshta, or Ukrposhta; enabled methods come from admin settings; selected details are submitted with payment/order flow. |
| Delivery persistence | Orders only have `deliveryMethod`; city/warehouse/contact details are not stored structurally. | Order stores delivery provider, city id/name, warehouse id/name, address snapshot, price, and notes. |
| Admin delivery settings | Settings have toggles and simple pricing but no public normalized endpoint for checkout. | Checkout fetches `/next/delivery/settings` and respects disabled methods. |
| Manual order operations | Admin can edit base fields but manual order creation is not polished for delivery/payment/fulfillment. | Manager can create/update orders with delivery details and statuses; stock reserves on create and reconciles on item edits. |
| Customer order page | Customer order detail shows broad status/address data but not the full operational state. | Customer sees payment status, fulfillment status, delivery method, city/warehouse/pickup details, shipping price, and tracking number when available. |
| Role matrix | Utility tests exist, but Payload API-level role tests are missing. | Tests prove owner/admin/manager/contentEditor/customer can and cannot access real collections as expected. |
| Audit trail | Audit logs order status snapshot but lacks actor id, operation metadata, before/after diff. | Audit logs include actor id/email, operation, document id, before/after status/delivery/payment snapshot. |
| Migrations | New fields exist in config/types but final DB migrations are missing. | Migration creates order delivery fields, audit collection table, admin settings fields, role enum changes as needed. |
| UX labels | Delivery UI labels/statuses are incomplete in dictionary. | Ukrainian/Russian labels exist for delivery method, city, warehouse, pickup, search states, errors. |

## Task 1: Delivery Data Contract And Settings Endpoint

**Owner:** Delivery Backend subagent.

**Files:**
- Create: `src/delivery/settings.ts`
- Create: `src/app/(app)/next/delivery/settings/route.ts`
- Modify: `src/delivery/types.ts`
- Modify: `src/globals/AdminSettings.ts`
- Test: `tests/int/delivery-settings.int.spec.ts`

- [ ] Define `DeliveryMethod`, `DeliverySelection`, and `DeliverySettings` in `src/delivery/types.ts`.
- [ ] Add admin settings fields for method labels, pickup instructions, fixed price, free shipping threshold, and per-method enable flags.
- [ ] Implement `getDeliverySettings(payload)` that reads `admin-settings`, merges defaults, and returns only client-safe settings.
- [ ] Add `/next/delivery/settings` route returning normalized JSON.
- [ ] Test that disabled methods are omitted and defaults are returned when settings do not exist.

Acceptance:
- Checkout can fetch one client-safe delivery settings payload.
- No secrets or provider API keys are exposed.
- `pnpm exec tsc --noEmit` passes.

## Task 2: Checkout Delivery Selector UI

**Owner:** Checkout UX subagent.

**Files:**
- Create: `src/components/checkout/DeliverySelector.tsx`
- Modify: `src/components/checkout/CheckoutPage.tsx`
- Modify: `src/i18n/dictionary.ts`
- Test: `tests/int/checkout-delivery-selector.int.spec.tsx`

- [ ] Build a controlled `DeliverySelector` component.
- [ ] Fetch `/next/delivery/settings` on mount.
- [ ] Show enabled delivery methods only.
- [ ] For Nova Poshta and Ukrposhta, search city after 2+ chars, then search warehouses after city selection.
- [ ] For pickup, show pickup instructions and no warehouse search.
- [ ] Disable payment button until delivery selection is valid.
- [ ] Pass `deliverySelection` inside `additionalData` when initiating payment.

Acceptance:
- Customer cannot proceed with incomplete delivery data.
- Disabled methods are not selectable.
- Empty/error/loading states are clear and compact.
- Existing address flow remains intact.

## Task 3: Persist Delivery Selection Into Orders And Transactions

**Owner:** Admin Orders subagent.

**Files:**
- Modify: `src/payments/externalRedirectAdapter.ts`
- Modify: `src/payments/orderFinalization.ts`
- Modify: `src/plugins/index.ts`
- Test: `tests/int/order-delivery-persistence.int.spec.ts`

- [ ] Store `deliverySelection` on pending transactions.
- [ ] Copy delivery selection from transaction to order on webhook finalization.
- [ ] Add order fields: `deliveryDetails.provider`, `deliveryDetails.cityID`, `deliveryDetails.cityLabel`, `deliveryDetails.warehouseID`, `deliveryDetails.warehouseLabel`, `deliveryDetails.price`, `deliveryDetails.notes`.
- [ ] Keep `deliveryMethod` as a quick sidebar/status field synchronized from `deliveryDetails.provider`.
- [ ] Ensure manual orders can fill delivery details from admin.

Acceptance:
- Order detail in admin shows the selected delivery data without opening raw JSON.
- External redirect flow preserves delivery data from checkout to transaction to order.
- Manual order create/update preserves stock reservation behavior.

## Task 4: Manual Order Admin UX Polish

**Owner:** Admin Orders subagent.

**Files:**
- Modify: `src/plugins/index.ts`
- Optional create: `src/components/Admin/OrderDeliverySummary.tsx`
- Test: `tests/int/manual-order-admin.int.spec.ts`

- [ ] Group order admin fields into clear sections: payment, fulfillment, delivery, stock.
- [ ] Add admin descriptions for status transitions and stock reservation side effects.
- [ ] Keep destructive delete owner/admin-only.
- [ ] Make stock reservation status read-only.
- [ ] Ensure `manager` can create/read/update orders but not delete or edit global settings.

Acceptance:
- A manager can create a manual order from admin with customer email, items, statuses, and delivery details.
- Order list columns are useful for operations.

## Task 4.5: Customer Order Detail UX

**Owner:** Checkout UX subagent after Admin Orders stabilizes order fields.

**Files:**
- Modify: `src/app/(app)/(account)/orders/[id]/page.tsx`
- Modify: `src/components/OrderStatus/index.tsx`
- Modify: `src/i18n/dictionary.ts`
- Test: `tests/int/customer-order-detail.int.spec.tsx`

- [ ] Show `paymentStatus`, `fulfillmentStatus`, `deliveryMethod`, `deliveryDetails`, and `trackingNumber` when present.
- [ ] Keep signed guest order-token access working.
- [ ] Avoid exposing transaction internals or admin-only audit data.
- [ ] Use the same labels as admin/order operations.

Acceptance:
- Customer can understand whether the order is unpaid/paid, processing/shipped/completed, and where it will be delivered.
- Guest order access remains token-protected.

## Task 5: Role Matrix API-Level Tests

**Owner:** Access & Audit subagent.

**Files:**
- Create: `tests/int/access-matrix-api.int.spec.ts`
- Modify only if needed: `src/access/**`, `src/collections/**`, `src/plugins/index.ts`

- [ ] Create role fixtures for owner, admin, manager, contentEditor, customer.
- [ ] Test admin panel access predicate for each role.
- [ ] Test orders read/create/update/delete access for manager vs contentEditor/customer.
- [ ] Test pages/products/media/categories create/update access for contentEditor vs manager/customer.
- [ ] Test admin settings and audit logs remain owner/admin-only.

Acceptance:
- Tests fail if a future change accidentally gives manager settings access or contentEditor order access.
- Tests use real access functions or Payload local API where practical.

## Task 6: Audit Log Hardening

**Owner:** Access & Audit subagent.

**Files:**
- Modify: `src/collections/AuditLogs.ts`
- Modify: `src/plugins/index.ts`
- Test: `tests/int/audit-log.int.spec.ts`

- [ ] Add fields `actorID`, `operation`, `before`, `after`, `requestID`.
- [ ] In order `afterChange`, store before/after snapshots for status, payment, fulfillment, delivery, reservation.
- [ ] Keep audit collection append-only: create/update/delete denied through normal access, hooks use `overrideAccess`.
- [ ] Add tests proving normal users cannot create/delete audit logs.

Acceptance:
- Audit entries are useful for support and incident review.
- Audit trail cannot be manually edited from admin.

## Task 7: Migrations And Generated Types

**Owner:** Migration & Types subagent.

**Files:**
- Create: `src/migrations/<timestamp>_admin_client_alignment.ts`
- Modify: `src/payload-types.ts`

- [ ] Generate or write migration for new order delivery fields and audit fields.
- [ ] Ensure migration is reversible where practical.
- [ ] Regenerate Payload types.
- [ ] Run TypeScript and build.

Acceptance:
- Fresh deployment has the schema required by code.
- Existing records get safe defaults or nullable fields.

## Task 8: Final Integration Review

**Owner:** QA Skeptic subagent, then Orchestrator.

**Files:** read-only unless fixing review findings.

- [ ] Verify checkout can complete with pickup when payment is disabled or with external redirect when configured.
- [ ] Verify Nova Poshta/Ukrposhta autocomplete endpoints stay disabled without env keys/tokens.
- [ ] Verify manager/contentEditor role boundaries.
- [ ] Verify order stock reservation create/update/cancel flow.
- [ ] Verify docs reflect what is implemented and what remains backlog.

Required commands:

```bash
pnpm exec tsc --noEmit
pnpm run test:int
pnpm lint
DATABASE_SSL_REJECT_UNAUTHORIZED=false pnpm build
```

Acceptance:
- All required commands pass.
- Final report names remaining backlog only: concrete payment provider adapter, production email adapter, CSV/XLSX import/export, advanced catalog extras.

## Subagent Dispatch Order

1. Managing agent validates this plan and may split tasks smaller.
2. Delivery Backend implements Task 1.
3. Checkout UX implements Task 2 after Task 1 interfaces are stable.
4. Admin Orders implements Tasks 3 and 4.
5. Checkout UX implements Task 4.5 after order delivery fields are stable.
6. Access & Audit implements Tasks 5 and 6 in parallel with Admin Orders if write scopes do not overlap; otherwise Task 5 first.
7. Migration & Types runs after schema fields are stable.
8. QA Skeptic reviews everything.
9. Orchestrator integrates, resolves conflicts, runs verification, updates reports.

## Explicit Backlog

These are intentionally not part of this plan:

- Real LiqPay/WayForPay/Mono/Fondy payment adapter.
- Production email adapter.
- Bulk import/export CSV/XLSX.
- Drag-and-drop category tree.
- Advanced admin catalog filters.
- Promo collections.
