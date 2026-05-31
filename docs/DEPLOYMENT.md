# Deployment

This starter deploys as one Node.js service running Next.js and Payload together.

## Required Services

- Node.js 20 LTS or newer compatible runtime.
- pnpm.
- Postgres database.
- S3-compatible bucket for media.
- SMTP provider for transactional email.
- Reverse proxy with HTTPS.

## Server Build Flow

Run these commands from the project root:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm db:migrate
pnpm start
```

Run migrations after build and before the long-running app process starts. Do not use schema push against a real production database.

## Fresh Database Bootstrap

For an absolutely empty database on the first install, initialize the current schema once:

```bash
pnpm build
pnpm db:migrate:fresh
```

Use this only before real data exists. After the first launch, all future releases must use:

```bash
pnpm db:migrate
```

The project keeps `push: false` in Payload config so schema changes are explicit and migration-based.

This release baseline intentionally uses one schema migration, `20260518_000000_init_schema`, so new client databases do not need to replay historical development migrations.

## First Launch

1. Configure all required environment variables from `docs/ENVIRONMENT.md`.
2. Build the app.
3. Run `pnpm payload migrate`.
4. Start the app.
5. Open `/admin` and create the first admin user.
6. Configure header, footer, admin settings, delivery settings, and product catalog.

## Optional Demo Catalog

Only on a new or disposable database:

```bash
pnpm seed:demo-catalog
pnpm seed:demo-catalog:verify
```

To remove demo catalog records:

```bash
pnpm seed:demo-catalog:cleanup
```

Do not run destructive seed actions on a database with real customer/order data.

## Release Verification

Before building an image or deploying a release:

```bash
pnpm release:check
```

After the app is running:

```bash
SMOKE_BASE_URL=https://your-domain.com pnpm smoke:production
```

The smoke script checks:

- health endpoint;
- public home page;
- admin route;
- Payload REST API availability;
- production seed endpoint safety.

## Docker

Build the image. For a real domain, pass the public URL at build time:

```bash
docker build \
  --build-arg NEXT_PUBLIC_SERVER_URL=https://your-domain.com \
  --build-arg PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com \
  -t ecommerce-starter .
```

Run with an env file:

```bash
docker run --env-file .env -p 3000:3000 ecommerce-starter
```

For a simple server stack with Postgres:

```bash
docker compose up --build
```

Then run migrations inside the app container:

```bash
docker compose exec app pnpm db:migrate
```

## Coolify

Use the Dockerfile build mode.

Recommended settings:

- Port: `3000`
- Healthcheck path: `/next/health`
- Build command: handled by Dockerfile
- Build variables: set `NEXT_PUBLIC_SERVER_URL` and `PAYLOAD_PUBLIC_SERVER_URL` to the final HTTPS URL
- Start command: handled by Dockerfile
- Required env: copy from `.env.example`
- Attach managed Postgres or use the compose file
- Configure S3-compatible storage before production traffic

Deploy order:

1. Create Postgres database.
2. Create S3 bucket and SMTP credentials.
3. Add env variables.
4. Deploy the app.
5. For an empty first install, run `pnpm db:migrate:fresh` from the app shell. For existing databases, run `pnpm db:migrate`.
6. Restart the app.
7. Run `SMOKE_BASE_URL=https://your-domain.com pnpm smoke:production`.

## Reverse Proxy

Terminate HTTPS at the platform or proxy. Forward requests to app port `3000`.

Set both URL variables to the final HTTPS origin:

```env
NEXT_PUBLIC_SERVER_URL=https://your-domain.com
PAYLOAD_PUBLIC_SERVER_URL=https://your-domain.com
```

## Database Notes

Use managed Postgres when possible. Keep `DATABASE_SSL_REJECT_UNAUTHORIZED=true` unless the provider explicitly requires a self-signed override.

For Supabase or other managed Postgres providers, keep:

```env
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=true
```

For a local Docker Postgres used only during development:

```env
DATABASE_SSL=false
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

Back up the database before every release that includes migrations.
