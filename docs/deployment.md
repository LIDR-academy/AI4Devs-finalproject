# Deployment Guide

Production deployment for **Reading Analytics Platform** using **free tiers** (Neon + Render + Vercel). No paid services required for the master's project demo.

## Live URLs

| Layer | URL | Provider |
|-------|-----|----------|
| **Application (SPA)** | https://reading-analytics.vercel.app | Vercel |
| **REST API** (`/v1`) | https://reading-analytics-api.onrender.com/v1 | Render |
| **Database** | Neon PostgreSQL (connection string in Render secrets only) | Neon |

**How to try the app:** open https://reading-analytics.vercel.app → `/login` → use **dev-login** with any email → explore Book Tracker, Home, Lists, Stats, Goals.

> **Free-tier note:** the Render API **spins down after ~15 minutes of inactivity**. The first request after idle time may take **30–90 seconds** (cold start). Refresh or wait once; subsequent requests are fast.

---

## Architecture (production)

```text
Browser
   │
   ▼
Vercel CDN ── HTTPS ──► React SPA (static build from frontend/)
   │
   │  VITE_API_URL=https://reading-analytics-api.onrender.com/v1
   ▼
Render Web Service ──► NestJS 11 API (backend/)
   │
   │  DATABASE_URL (Neon, sslmode=require)
   ▼
Neon PostgreSQL
```

- **Auth (MVP):** `POST /v1/auth/dev-login` — JWT; no password in production demo.
- **CORS:** backend allows only `https://reading-analytics.vercel.app`.
- **Migrations:** applied on API startup via `TYPEORM_MIGRATIONS_RUN=true`.

---

## 1. Database — Neon

1. Create a project at [neon.tech](https://neon.tech) (region EU when possible).
2. Copy the **pooled** or **direct** connection string, e.g.:
   ```text
   postgresql://user:pass@ep-xxxx.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```
3. Store it as `DATABASE_URL` in Render (never commit to Git).

---

## 2. Backend — Render

**Service:** `reading-analytics-api`  
**Repository:** `CeliaMerino/AI4Devs-finalproject`  
**Branch:** `main`

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start:prod` (runs `node dist/src/main.js`) |
| **Instance type** | Free |

### Environment variables (Render)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon connection string (`?sslmode=require`) |
| `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
| `JWT_EXPIRES_IN` | `7d` |
| `TYPEORM_MIGRATIONS_RUN` | `true` |
| `CORS_ORIGIN` | `https://reading-analytics.vercel.app` |
| `NODE_VERSION` | `20` |
| `PORT` | `3000` (Render may override with `PORT` env) |
| `GOOGLE_BOOKS_API_KEY` | Optional — improves catalog fallback |

### Build / start fix

NestJS compiles to `dist/src/main.js`, not `dist/main.js`. The `start:prod` script in `backend/package.json` must be:

```json
"start:prod": "node dist/src/main.js"
```

If deploy fails with `Cannot find module '.../dist/main'`, update **Start Command** in Render to `node dist/src/main.js` or merge the `package.json` fix from `main`.

### GitHub access on Render

If the repo does not appear under **Settings → Build → Source**:

1. GitHub → **Settings → Applications → Render → Configure**
2. Grant access to `AI4Devs-finalproject` (or all repos)
3. Reconnect the service or create a new Web Service

---

## 3. Frontend — Vercel

**Project:** `reading-analytics`  
**Repository:** `CeliaMerino/AI4Devs-finalproject`  
**Branch:** `main`

| Setting | Value |
|---------|--------|
| **Framework** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (default) |
| **Output Directory** | `dist` |

### Environment variables (Vercel)

| Variable | Value |
|----------|--------|
| `VITE_API_URL` | `https://reading-analytics-api.onrender.com/v1` |

`VITE_*` variables are **baked in at build time**. After changing `VITE_API_URL`, trigger a **redeploy** on Vercel.

---

## 4. Deploy order

1. **Neon** — create DB, copy `DATABASE_URL`
2. **Render** — deploy API with env vars; wait for `Nest application successfully started` in logs
3. **Vercel** — deploy frontend with `VITE_API_URL` pointing to Render
4. **Render** — set `CORS_ORIGIN` to the final Vercel URL and redeploy if you used a placeholder first

---

## 5. Smoke test

```bash
# API cold start may take a minute
curl -s -X POST https://reading-analytics-api.onrender.com/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@reading-analytics.test"}'
```

Expected: JSON with `access_token`.

Then open https://reading-analytics.vercel.app/login and sign in with the same flow in the UI.

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| API very slow first time | Render free tier cold start — normal |
| CORS error in browser | `CORS_ORIGIN` must match Vercel URL exactly (no trailing slash) |
| Frontend calls `localhost` | Wrong/missing `VITE_API_URL`; redeploy Vercel after fix |
| `Cannot find module dist/main` | Use `node dist/src/main.js` as start command |
| DB connection errors | Check Neon string includes `sslmode=require`; migrations flag set |
| Repo not listed on Render | Re-authorize GitHub app for this repository |

---

## 7. Local vs production

| | Local | Production |
|---|--------|------------|
| Frontend | http://localhost:5173 | https://reading-analytics.vercel.app |
| API | http://localhost:3000/v1 | https://reading-analytics-api.onrender.com/v1 |
| Database | Docker Postgres `:5433` | Neon |

See [development_guide.md](./development_guide.md) for local setup.

---

## Related documentation

- [readme.md](../readme.md) §0.4 — delivery ficha (URLs)
- [readme.md](../readme.md) §2.4 — infrastructure proposal and CI/CD diagram
- [api-spec.yml](./api-spec.yml) — REST contracts
