# Operations Runbook

This file describes the day-to-day operations expected from a project built from this starter.

## Admin Roles

- `owner` / `admin`: full administrative access.
- `manager`: commerce operations, including orders, fulfillment, tracking number entry, and order status updates.
- `contentEditor`: content/catalog editing without owner-level settings access.
- `customer`: storefront account access only.

## Order Flow

1. Customer places an order or manager creates/updates an order manually.
2. Manager confirms payment method and payment status.
3. Manager confirms delivery method and delivery details.
4. Manager enters delivery price manually when needed.
5. Manager enters TTN/tracking number in the order field `deliveryDetails.trackingNumber`.
6. Manager updates fulfillment status.
7. Customer sees delivery and tracking information in their account/order page.

## Delivery Policy

The starter does not calculate real Nova Poshta or Ukrposhta tariffs. Use this customer-facing wording:

> Delivery price is charged according to the carrier tariffs.

If the business process needs a fixed delivery price or free shipping threshold, configure it in Admin Settings. If the final delivery cost is known only after confirmation, the manager should enter or communicate it manually.

## Tracking Sync

Automatic tracking synchronization with Nova Poshta/Ukrposhta is backlog. Current behavior is manual TTN entry in admin.

## Email

Email is sent through Payload's Nodemailer adapter. Configure SMTP in env before production:

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_SECURE=false
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=
```

Use a real provider such as Postmark, SendGrid, Mailgun, Amazon SES, Brevo, or a trusted SMTP relay.

## Seed Safety

Seed scripts are for new projects and demo data only.

Safe verification:

```bash
pnpm seed:demo-catalog:verify
```

Potentially destructive:

```bash
pnpm seed:demo-catalog
pnpm seed:demo-catalog:cleanup
```

Never run destructive seed commands against a live store with real data unless you have a fresh database backup and intentionally want to reset demo content.

## Backups

Back up before every release:

```bash
pg_dump "$DATABASE_URL" > backup-$(date +%Y%m%d-%H%M%S).sql
```

Also back up the S3-compatible media bucket using the provider's snapshot/export tool or an S3 sync command.

## Restore

1. Stop the app.
2. Restore the Postgres dump into an empty database.
3. Restore/sync the media bucket.
4. Confirm env points to the restored database and bucket.
5. Run `pnpm payload migrate`.
6. Start the app.
7. Run `SMOKE_BASE_URL=https://your-domain.com pnpm smoke:production`.

## Release Checklist

Before deploy:

```bash
pnpm release:check
```

On server:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pnpm start
```

After deploy:

```bash
SMOKE_BASE_URL=https://your-domain.com pnpm smoke:production
```

## Intentional Backlog

- Provider-specific LiqPay/WayForPay/Mono/Fondy adapters.
- Payment refund/cancel reconciliation for each selected provider.
- Automatic carrier tracking sync.
- CSV/XLSX import/export for large catalog onboarding.
- Full Playwright production checkout/account flows for a selected payment provider.
