# Ecommerce Starter

Payload + Next.js ecommerce starter for Ukrainian/Russian storefront projects.

The starter is intended to be cloned, configured with environment variables, deployed to a server, migrated, and then filled from the Payload admin panel or demo seed scripts.

## What Is Included

- Payload CMS 3 admin panel.
- Next.js storefront.
- Postgres database adapter.
- S3-compatible media storage support.
- SMTP email via `@payloadcms/email-nodemailer`.
- Ukrainian and Russian localization.
- Products, categories, product types, variants, carts, orders, transactions, addresses.
- Manager/admin order operations, fulfillment statuses, delivery details, and manual TTN entry.
- Nova Poshta/Ukrposhta autocomplete routes, disabled until credentials are configured.
- Provider-agnostic payment mode with payments disabled by default.
- Demo catalog seed scripts.
- Integration test suite and release checks.

## Current Intentional Limits

- Real Nova Poshta/Ukrposhta tariff calculation is not implemented. Delivery price should be shown as carrier tariff-based or entered manually by a manager.
- Automatic carrier tracking sync is backlog.
- Provider-specific LiqPay/WayForPay/Mono/Fondy adapters are backlog until a real project chooses a provider.
- CSV/XLSX import/export is backlog.

## Requirements

- Node.js 20 LTS or compatible version from `package.json`.
- pnpm.
- Postgres.
- S3-compatible media storage for production.
- SMTP provider for production email.

## Local Development

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Open:

- Storefront: `http://localhost:3000`
- Admin: `http://localhost:3000/admin`

For local development, configure `DATABASE_URL` in `.env`. Use `DATABASE_SSL=false` for local Docker Postgres.

## Environment

Start from `.env.example`.

Detailed environment documentation is in [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md).

Production requires:

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `PREVIEW_SECRET`
- `NEXT_PUBLIC_SERVER_URL`
- `PAYLOAD_PUBLIC_SERVER_URL`
- SMTP variables
- S3 variables

Keep these disabled unless intentionally configured:

```env
PAYMENT_PROVIDER=disabled
NEXT_PUBLIC_PAYMENT_PROVIDER=disabled
ENABLE_SEED_ENDPOINT=false
NEXT_PUBLIC_ENABLE_SEED_BUTTON=false
NOVA_POSHTA_ENABLED=false
UKRPOSHTA_ENABLED=false
```

## Database And Migrations

Payload schema push is disabled. Use migrations.

For the first install on an absolutely empty database:

```bash
pnpm build
pnpm db:migrate:fresh
```

Use this only before real data exists.

The starter ships with a single baseline schema migration: `20260518_000000_init_schema`.

For normal deploys and all future releases after the first bootstrap:

```bash
pnpm db:migrate
```

Useful commands:

```bash
pnpm db:migrate:status
pnpm db:migrate:create
```

## Production Deploy

Minimal server flow:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pnpm start
```

For a fresh empty database, run `pnpm db:migrate:fresh` once instead of `pnpm db:migrate`.

Detailed deployment documentation is in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Docker

Build. For a real domain, pass the public URL at build time:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://your-domain.com \
  --build-arg PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com \
  -t ecommerce-starter .
```

Run:

```bash
docker run --env-file .env -p 3000:3000 ecommerce-starter
```

Or use compose:

```bash
docker compose up --build
```

Then run migrations from the app container:

```bash
docker compose exec app pnpm db:migrate
```

For an empty first install:

```bash
docker compose exec app pnpm db:migrate:fresh
```

## Seeding

Demo catalog seed is for new or disposable databases.

```bash
pnpm seed:demo-catalog
pnpm seed:demo-catalog:verify
```

Cleanup demo catalog records:

```bash
pnpm seed:demo-catalog:cleanup
```

Do not run destructive seed commands on a live store with real orders or customers.

## Release Check

Before deploying:

```bash
pnpm release:check
```

After the app is running:

```bash
SMOKE_BASE_URL=https://your-domain.com pnpm smoke:production
```

## Admin Operations

Operations runbook:

[`docs/OPERATIONS.md`](docs/OPERATIONS.md)

Key points:

- Admin/manager can update orders in Payload admin.
- TTN/tracking number is entered manually in `deliveryDetails.trackingNumber`.
- Delivery tariff is carrier-based or manually entered by manager.
- Tracking sync with carriers is backlog.

## Documentation

- [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md)
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- [`docs/OPERATIONS.md`](docs/OPERATIONS.md)
- [`docs/production-hardening-implementation-report.md`](docs/production-hardening-implementation-report.md)

## Verification Commands

```bash
pnpm lint
pnpm exec tsc --noEmit --pretty false
pnpm run test:int
pnpm build
pnpm smoke:production
```
