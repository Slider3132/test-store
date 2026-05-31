# Admin Commerce Backlog

Date: 2026-05-25

## Current Decisions

| Area | Decision |
| --- | --- |
| Online payments | Backlog. The app works with `PAYMENT_PROVIDER=disabled` until a real provider is selected. |
| Payment providers | Real LiqPay/WayForPay/Mono/Fondy adapters are backlog items. Multiple providers are a future target. |
| Stock | Orders reserve stock even without online payment. Cancelled/refunded orders release reserved stock. |
| Email | Backlog until a real SMTP/email provider is chosen. |
| Orders | Admin/manual order operations are part of the core starter. |
| Delivery | Nova Poshta, Ukrposhta, and pickup are default methods that can be disabled in admin settings. Checkout uses `/next/delivery/settings` and provider autocomplete routes under `/next/delivery/*`; selected delivery details persist to orders. |
| Product model | Starter ships with default product types/attributes and allows adding new ones during implementation. |
| Bulk import/export | Backlog, useful for onboarding existing stores. |
| Catalog admin extras | Drag-and-drop category tree, advanced admin filters, and promo collections stay in backlog. |
| Audit log | Keep audit log for operational/admin changes. |

## Recommended Starter Product Templates

For a reusable ecommerce starter, keep product templates as default product types rather than hard-coded flows:

| Template | Why |
| --- | --- |
| Simple physical product | Most stores need this. |
| Variant product | Clothes, cosmetics shades, sizes, packs. |
| Digital product | Useful for future projects, but can stay disabled until downloads/licenses exist. |
| Service/order request | Useful for sites that sell consultations or custom work. |

The starter should seed sensible defaults, but keep the admin flexible enough to add new product types.

## Backlog

| Priority | Item |
| --- | --- |
| P1 | Real provider adapter for the chosen Ukrainian PSP. |
| P1 | Production email adapter once provider is chosen. |
| P1 | Bulk import/export CSV/XLSX. |
| P1 | Full Playwright checkout/account/admin order happy paths. |
| P1 | Admin operational runbook for migrations, backups, delivery provider env, and order handling. |
| P2 | Drag-and-drop category tree. |
| P2 | Advanced catalog filters in admin. |
| P2 | Promo collections: New, Hits, Sale. |
| P2 | Payment provider settings in admin with secret storage strategy. |
