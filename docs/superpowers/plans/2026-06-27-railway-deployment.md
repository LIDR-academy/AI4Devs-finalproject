# Railway Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy StayHub (Next.js frontend + Spring Boot backend + PostGIS Postgres) to Railway so it's publicly accessible with seed data pre-loaded.

**Architecture:** Three Railway services — backend (Spring Boot Docker), frontend (Next.js Docker), and a Railway Postgres plugin. Flyway migrations (including V7/V11/V12 seed data) run automatically on backend startup, populating the database. Backend deploys first; frontend build arg `NEXT_PUBLIC_API_URL` is set to the backend Railway URL before the frontend is built.

**Tech Stack:** Railway, Docker, Spring Boot 3 + Kotlin, Next.js 15, PostgreSQL 16 + PostGIS

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `backend/Dockerfile` | Modify | Add JVM memory flags to stay within 512 MB Railway limit |
| `backend/railway.toml` | Create | Tell Railway how to build/deploy the backend service |
| `frontend/railway.toml` | Create | Tell Railway how to build/deploy the frontend service |
| `docs/railway-deploy.md` | Create | Step-by-step deployment guide + env var reference |

---

### Task 1: Tune backend JVM memory for Railway 512 MB limit

**Files:**
- Modify: `backend/Dockerfile` (last line — the `ENTRYPOINT`)

Railway's free plan allows 0.5 GB RAM per service. The JVM needs to be capped explicitly or it will over-allocate and get OOM-killed.

- [ ] **Step 1: Open the file and find the ENTRYPOINT**

Read `backend/Dockerfile`. The current last line is:
```dockerfile
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

- [ ] **Step 2: Replace ENTRYPOINT with memory-capped version**

Replace the last `ENTRYPOINT` line:
```dockerfile
ENTRYPOINT ["java", \
  "-Xmx384m", \
  "-Xss512k", \
  "-XX:+UseSerialGC", \
  "-XX:MaxMetaspaceSize=128m", \
  "-jar", "/app/app.jar"]
```

Budget: heap 384 MB + metaspace 128 MB + stack headroom ≈ ~480 MB total, under the 512 MB cap.

- [ ] **Step 3: Verify the image builds**

```bash
docker build -t stayhub-backend-test ./backend
```
Expected: `BUILD SUCCESS` — image layers complete, no error in the build stage or copy stage.

- [ ] **Step 4: Commit**

```bash
git add backend/Dockerfile
git commit -m "chore(deploy): tune JVM memory flags for Railway 512 MB limit"
```

---

### Task 2: Add Railway config for backend

**Files:**
- Create: `backend/railway.toml`

Railway reads this file to know which Dockerfile to use and how to health-check the service.

- [ ] **Step 1: Create `backend/railway.toml`**

```toml
[build]
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/actuator/health"
healthcheckTimeout = 120
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

Notes:
- `healthcheckPath` hits the Spring Actuator endpoint already exposed by the app (`management.endpoints.web.exposure.include = health,info`)
- `healthcheckTimeout = 120` gives the JVM and Flyway migrations time to complete on cold start

- [ ] **Step 2: Commit**

```bash
git add backend/railway.toml
git commit -m "chore(deploy): add Railway config for backend service"
```

---

### Task 3: Add Railway config for frontend

**Files:**
- Create: `frontend/railway.toml`

- [ ] **Step 1: Create `frontend/railway.toml`**

```toml
[build]
dockerfilePath = "Dockerfile"

[deploy]
healthcheckPath = "/"
healthcheckTimeout = 60
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

- [ ] **Step 2: Commit**

```bash
git add frontend/railway.toml
git commit -m "chore(deploy): add Railway config for frontend service"
```

---

### Task 4: Write the deployment guide

**Files:**
- Create: `docs/railway-deploy.md`

- [ ] **Step 1: Create `docs/railway-deploy.md`** with the full content below

```markdown
# StayHub — Railway Deployment Guide

## Prerequisites

- [Railway account](https://railway.app) (free plan is enough)
- Railway CLI: `npm install -g @railway/cli` then `railway login`
- The GitHub repo linked to Railway

---

## Order of deployment

1. Create Railway project
2. Add Postgres plugin → migrations + seed data run automatically on first backend boot
3. Deploy backend → note the public URL
4. Deploy frontend with `NEXT_PUBLIC_API_URL` set to the backend URL
5. Set `CORS_ALLOWED_ORIGINS` on the backend to the frontend URL → redeploy backend

---

## 1. Create the Railway project

Go to [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo** → select this repo.

---

## 2. Add Postgres (with PostGIS)

In the Railway project dashboard:
1. **+ New** → **Database** → **PostgreSQL**
2. Railway provisions a Postgres 15/16 instance and injects connection variables.
3. PostGIS is enabled automatically: `V1__create_extensions.sql` runs as the first
   Flyway migration and executes `CREATE EXTENSION IF NOT EXISTS postgis;`.
   Railway Postgres grants superuser access so this succeeds.

---

## 3. Backend service

In the Railway project dashboard:
1. **+ New** → **GitHub Repo** → select this repo → set **Root Directory** to `backend`
2. Railway detects `backend/railway.toml` and uses `backend/Dockerfile`.

### Backend environment variables

Set these in the service's **Variables** tab:

| Variable | Value | Notes |
|---|---|---|
| `POSTGRES_HOST` | `${{Postgres.PGHOST}}` | Railway reference variable — auto-resolves |
| `POSTGRES_PORT` | `${{Postgres.PGPORT}}` | Railway reference variable |
| `POSTGRES_DB` | `${{Postgres.PGDATABASE}}` | Railway reference variable |
| `POSTGRES_USER` | `${{Postgres.PGUSER}}` | Railway reference variable |
| `POSTGRES_PASSWORD` | `${{Postgres.PGPASSWORD}}` | Railway reference variable |
| `JWT_SECRET` | generate a 64-char random string | e.g. `openssl rand -hex 32` |
| `JWT_ISSUER` | `stayhub` | default is fine |
| `CORS_ALLOWED_ORIGINS` | `https://<frontend-url>.up.railway.app` | set after frontend deploys |
| `MAPBOX_API_KEY` | your Mapbox token | from mapbox.com (free tier) |
| `MAIL_HOST` | `localhost` | email delivery is optional; app works without it |
| `MAIL_PORT` | `1025` | ignored when MAIL_HOST is unreachable |

> **Seed data:** Flyway migrations V7, V11, and V12 insert 120+ properties across
> Barcelona, Madrid, Lisbon, and Sevilla. They run automatically on first boot — no
> manual SQL needed.

Deploy the backend. Once healthy (check the **Deployments** tab), copy the public URL
(e.g. `https://stayhub-backend-production.up.railway.app`).

---

## 4. Frontend service

1. **+ New** → **GitHub Repo** → same repo → **Root Directory**: `frontend`
2. Railway detects `frontend/railway.toml` and uses `frontend/Dockerfile`.

### Frontend environment variables (build-time)

These are baked into the Next.js bundle at build time. Railway passes them as Docker
build args automatically.

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<backend-url>.up.railway.app` | backend public URL from step 3 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | your Mapbox public token | from mapbox.com (free tier) |
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_...` | Stripe publishable key (test mode) |

> **Important:** `NEXT_PUBLIC_*` variables are baked at build time. If the backend URL
> ever changes, redeploy the frontend.

---

## 5. Update CORS on the backend

Once the frontend is deployed and has a public URL:
1. Go to the backend service → **Variables**
2. Update `CORS_ALLOWED_ORIGINS` to the frontend public URL
3. Railway auto-redeploys on variable change

---

## Connecting to the database

To browse or edit data after deployment:

1. In Railway dashboard → Postgres service → **Connect** tab → copy the connection string
2. Connect with any Postgres client:
   ```bash
   psql "postgresql://user:pass@host:port/dbname"
   ```
   Or use [TablePlus](https://tableplus.com), [DBeaver](https://dbeaver.io), or [pgAdmin](https://pgadmin.org) with the same credentials.
3. To re-run seed data (if needed):
   ```sql
   -- Check what migrations have run
   SELECT version, description, installed_on FROM flyway_schema_history ORDER BY installed_rank;
   ```

---

## Verify the deployment

1. Open `https://<frontend-url>.up.railway.app` in a browser
2. Search for properties in Barcelona — should return results with photos
3. Select a property, check availability calendar, complete a test booking
4. Check backend logs in Railway dashboard for any errors

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend OOM-killed | JVM over 512 MB | Already tuned with `-Xmx384m`; check Railway metrics |
| `Connection refused` on frontend | Wrong `NEXT_PUBLIC_API_URL` | Redeploy frontend with correct URL |
| `postgis extension not found` | V1 migration failed | Check Postgres logs; Railway Postgres has PostGIS available |
| CORS errors in browser | `CORS_ALLOWED_ORIGINS` not set | Update backend var to frontend URL |
| Emails not sending | No SMTP configured | Expected — non-critical for demo |
```

- [ ] **Step 2: Commit**

```bash
git add docs/railway-deploy.md
git commit -m "docs: add Railway deployment guide with env var reference"
```

---

### Task 5: Open PR

- [ ] **Step 1: Push the feature branch**

```bash
git push origin <branch-name>
```

- [ ] **Step 2: Create PR**

```bash
gh pr create \
  --title "chore(deploy): Railway deployment config + guide" \
  --body "Adds railway.toml for backend and frontend, JVM memory tuning for 512 MB limit, and a deployment guide with full env var reference.

Closes #<issue-number>"
```

- [ ] **Step 3: Wait for CI to pass**

Backend (Gradle) and Frontend (Vitest) checks must be green before merging.

---

### Task 6: Manual Railway setup (after PR merged)

These are one-time operational steps in the Railway dashboard, not code changes.

- [ ] Go to [railway.app/new](https://railway.app/new) → Deploy from GitHub repo
- [ ] Add Postgres plugin
- [ ] Add backend service → root dir: `backend` → set env vars from the guide
- [ ] Deploy backend → wait for health check to pass (Flyway runs migrations + seed)
- [ ] Note backend public URL
- [ ] Add frontend service → root dir: `frontend` → set `NEXT_PUBLIC_API_URL` + other vars
- [ ] Deploy frontend → wait for health check
- [ ] Update backend `CORS_ALLOWED_ORIGINS` with frontend URL → Railway auto-redeploys
- [ ] Verify end-to-end in browser

---

## Self-Review

**Spec coverage:**
- JVM tuning → Task 1 ✓
- railway.toml backend → Task 2 ✓
- railway.toml frontend → Task 3 ✓
- Env var documentation → Task 4 ✓
- Seed data → handled by existing V7/V11/V12 Flyway migrations, no new code needed ✓
- Manual deployment steps → Task 6 ✓

**PostGIS note:** Railway Postgres supports PostGIS via `CREATE EXTENSION`. V1 migration runs this automatically. No custom Docker image for Postgres needed.

**Email note:** `MAIL_HOST=localhost` on Railway means email delivery silently fails. Spring Mail connects lazily so the app starts fine. Booking confirmation emails are non-critical for a demo.
