# Environment

This starter is designed to run with one Next.js/Payload app process, one Postgres database, SMTP for transactional email, and S3-compatible storage for media.

Copy `.env.example` to `.env` locally or configure the same keys in your hosting panel.

## Required In Production

| Variable | Purpose |
| --- | --- |
| `NODE_ENV=production` | Enables production checks and strict runtime behavior. |
| `DATABASE_URL` | Postgres connection string used by Payload. |
| `DATABASE_POOL_MAX` | Maximum Postgres connections per app instance. Defaults to `1` in production and `5` locally. Use `1` on Vercel/serverless. |
| `DATABASE_SSL` | Use `true` for Supabase/managed Postgres. Use `false` for local Docker Postgres. |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | Keep `true` for managed Postgres with valid certificates. Use `false` only for a known self-signed chain. |
| `PAYLOAD_SECRET` | Long random secret for Payload auth/session encryption. |
| `PREVIEW_SECRET` | Long random secret for draft preview links. |
| `NEXT_PUBLIC_SERVER_URL` | Public site URL, for example `https://shop.example.com`. |
| `PAYLOAD_PUBLIC_SERVER_URL` | Public Payload/site URL. Usually the same as `NEXT_PUBLIC_SERVER_URL`. |
| `EMAIL_FROM_ADDRESS` | Sender address for order/account emails. |
| `EMAIL_FROM_NAME` | Sender display name. |
| `SMTP_HOST` | SMTP host from the email provider. |
| `SMTP_PORT` | SMTP port, usually `587` or `465`. |
| `SMTP_USER` | SMTP username. |
| `SMTP_PASS` | SMTP password or provider token. |
| `SMTP_SECURE` | `true` for implicit TLS on port `465`, otherwise `false`. |
| `S3_BUCKET` | Media bucket name. |
| `S3_REGION` | S3 region. Use `auto` for providers that require it. |
| `S3_ENDPOINT` | S3-compatible endpoint URL. |
| `S3_ACCESS_KEY_ID` | S3 access key. |
| `S3_SECRET_ACCESS_KEY` | S3 secret key. |

Production intentionally fails fast if required database, secret, email, or S3 values are missing.

For Supabase and Vercel, use the Supabase **Transaction pooler** connection string for `DATABASE_URL`, not Direct connection or Session pooler. Also set:

```env
DATABASE_POOL_MAX=1
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

The Transaction pooler is required for serverless deployments because every Vercel function instance can create its own Postgres pool. Direct/session connections can quickly hit Supabase's `max clients reached` limit.

`NEXT_PUBLIC_SERVER_URL` is also used at build time for browser-visible URLs and image configuration. When building a Docker image for a real domain, pass the final HTTPS URL as a build argument or configure it as a build variable in the hosting platform.

## Payment Mode

The starter ships with checkout disabled by default:

```env
PAYMENT_PROVIDER=disabled
NEXT_PUBLIC_PAYMENT_PROVIDER=disabled
```

Use this for catalog/manual-order projects or before a real provider is selected.

Supported runtime values:

| Value | Status |
| --- | --- |
| `disabled` | Default. Checkout page displays a setup notice. |
| `external_redirect` | Generic hosted checkout/webhook adapter for a project-specific provider. |
| `stripe` | Legacy Stripe path. Configure Stripe keys before enabling. |

Provider-specific Ukrainian payment adapters are intentionally backlog until a real provider is chosen.

## Delivery Mode

Delivery API integrations are disabled unless credentials are configured:

```env
NOVA_POSHTA_ENABLED=false
UKRPOSHTA_ENABLED=false
```

The storefront does not calculate real Nova Poshta/Ukrposhta tariffs. The customer-facing policy is: delivery price is charged by the carrier tariffs, or entered manually by a manager after order confirmation.

## Seed Safety

Keep destructive seed endpoints disabled in production:

```env
ENABLE_SEED_ENDPOINT=false
NEXT_PUBLIC_ENABLE_SEED_BUTTON=false
```

Use seed scripts only on a new or disposable database.

## Local Development Defaults

For local development:

```env
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/ecommerce-starter
DATABASE_POOL_MAX=5
DATABASE_SSL=false
DATABASE_SSL_REJECT_UNAUTHORIZED=false
PAYLOAD_SECRET=local-dev-secret
PREVIEW_SECRET=local-preview-secret
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

Local media can work without S3, but production requires S3-compatible storage so uploaded media survives deploys.
