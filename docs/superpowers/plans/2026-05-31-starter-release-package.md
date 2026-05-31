# Starter Release Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the ecommerce starter ready to clone, configure with environment variables, deploy to a server, migrate, and seed with predictable operational steps.

**Architecture:** Keep runtime code changes minimal and focus on release assets: environment contract, deployment guide, operations runbook, Docker/Coolify files, and a production smoke script. The app remains a single Next.js + Payload service backed by Postgres and S3-compatible media storage.

**Tech Stack:** Next.js, Payload CMS, Postgres, pnpm, Docker, S3-compatible storage, SMTP via Nodemailer.

---

### Task 1: Document the Starter Contract

**Files:**
- Modify: `README.md`
- Create: `docs/ENVIRONMENT.md`
- Create: `docs/DEPLOYMENT.md`
- Create: `docs/OPERATIONS.md`
- Modify: `.env.example`

- [x] **Step 1: Replace generic template README with starter-specific quick start**

Write sections for local setup, production setup, env variables, migrations, seed modes, verification, and known backlog.

- [x] **Step 2: Add deployment documentation**

Document VPS/Coolify/Docker commands, migration order, and required persistent services.

- [x] **Step 3: Add operations runbook**

Document admin order flow, TTN entry, delivery pricing policy, backups, restores, and seed safety.

- [x] **Step 4: Tighten `.env.example` comments**

Group required production variables separately from optional integrations.

### Task 2: Add Release Tooling

**Files:**
- Modify: `package.json`
- Create: `scripts/smoke-production.ts`
- Create: `src/app/(app)/next/health/route.ts`

- [x] **Step 1: Add `typecheck`, `release:check`, and `smoke:production` scripts**

`release:check` runs lint, TypeScript, integration tests, and build.

- [x] **Step 2: Add a health endpoint**

Return a small JSON payload for Docker/Coolify healthchecks.

- [x] **Step 3: Add production smoke checks**

Check root, admin login, health endpoint, REST API availability, and disabled seed route safety.

### Task 3: Add Container Deployment Assets

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `docker-compose.yml`

- [x] **Step 1: Add a pnpm-based Dockerfile**

Install dependencies, build Next/Payload, and run `pnpm start`.

- [x] **Step 2: Add compose services**

Define app and Postgres services with a server-ready env contract.

- [x] **Step 3: Add Docker ignore rules**

Exclude local build output, secrets, git metadata, node modules, and test artifacts.

### Task 4: Verify the Release Package

**Files:**
- Read/verify all changed files

- [x] **Step 1: Run formatting-sensitive checks**

Run TypeScript, lint, integration tests, and build.

- [x] **Step 2: Run smoke script against local server if available**

Use `SMOKE_BASE_URL` or default `NEXT_PUBLIC_SERVER_URL`.

- [x] **Step 3: Summarize final deploy procedure**

Report exact files changed, commands run, and remaining intentional backlog.
