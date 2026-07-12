# StayHub — Railway Deployment Guide

## Prerequisites

- [Railway account](https://railway.app) (free plan is enough — no credit card required)
- The GitHub repo accessible to Railway

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
2. Railway provisions a Postgres instance and injects connection variables into the project.
3. PostGIS is enabled automatically: `V1__create_extensions.sql` runs as the first Flyway
   migration and executes `CREATE EXTENSION IF NOT EXISTS postgis;`. Railway Postgres grants
   superuser access so this succeeds.

> **Seed data:** Flyway migrations V7, V11, and V12 insert 120+ properties across Barcelona,
> Madrid, Lisbon, and Sevilla with real photos. They run automatically on the first backend
> boot — no manual SQL needed.

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
| `JWT_SECRET` | generate a 64-char random string | `openssl rand -hex 32` |
| `JWT_ISSUER` | `stayhub` | default is fine |
| `CORS_ALLOWED_ORIGINS` | `https://<frontend-url>.up.railway.app` | set after frontend deploys |
| `MAPBOX_API_KEY` | your Mapbox token | from [mapbox.com](https://mapbox.com) free tier |
| `MAIL_HOST` | `localhost` | email delivery is optional; app starts fine without it |
| `MAIL_PORT` | `1025` | ignored when MAIL_HOST is unreachable |

Deploy the backend. Once the deployment is healthy (check the **Deployments** tab → green
health check), copy the public URL shown under **Settings → Domains**
(e.g. `https://stayhub-backend-production.up.railway.app`).

---

## 4. Frontend service

1. **+ New** → **GitHub Repo** → same repo → **Root Directory**: `frontend`
2. Railway detects `frontend/railway.toml` and uses `frontend/Dockerfile`.

### Frontend environment variables (build-time)

`NEXT_PUBLIC_*` variables are baked into the Next.js bundle at Docker build time. Railway
passes them as Docker build args automatically when they are set as service environment
variables.

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://<backend-url>.up.railway.app` | backend public URL from step 3 |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | your Mapbox public token | from [mapbox.com](https://mapbox.com) free tier |
| `NEXT_PUBLIC_STRIPE_KEY` | `pk_test_...` | Stripe publishable key (test mode) |

> **Important:** if the backend URL ever changes, redeploy the frontend so the new URL is
> baked into the bundle.

---

## 5. Update CORS on the backend

Once the frontend is deployed and has a public URL:

1. Backend service → **Variables** tab
2. Update `CORS_ALLOWED_ORIGINS` to the frontend public URL
3. Railway auto-redeploys on variable change — wait for the health check to go green again

---

## Connecting to the database

To browse or edit data after deployment:

1. Railway dashboard → Postgres service → **Connect** tab → copy the connection string
2. Connect with any Postgres client:
   ```bash
   psql "postgresql://user:pass@host:port/dbname"
   ```
   GUI options: [TablePlus](https://tableplus.com), [DBeaver](https://dbeaver.io), [pgAdmin](https://pgadmin.org)

3. To check which migrations have run:
   ```sql
   SELECT version, description, installed_on FROM flyway_schema_history ORDER BY installed_rank;
   ```

---

## Verify the deployment

1. Open `https://<frontend-url>.up.railway.app` in a browser
2. Search for properties in Barcelona — should return results with photos
3. Select a property, check the availability calendar, complete a test booking
4. Check backend logs in Railway dashboard for any errors

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend OOM-killed | JVM exceeded 512 MB | Dockerfile already caps at `-Xmx384m`; check Railway metrics tab |
| `Connection refused` on frontend | Wrong `NEXT_PUBLIC_API_URL` | Redeploy frontend after correcting the variable |
| `postgis extension not found` | V1 migration failed | Check Postgres logs; Railway Postgres supports PostGIS |
| CORS errors in browser console | `CORS_ALLOWED_ORIGINS` not updated | Set it to the frontend Railway URL and redeploy backend |
| Emails not sending | No SMTP configured | Expected for a demo — non-critical feature |
