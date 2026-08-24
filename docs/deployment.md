# Deployment runbook — EyeMaster V2

Translates the planned infrastructure in `readme.md` §2.4 into concrete
steps. **No real accounts have been provisioned yet** for this project —
this document makes provisioning mechanical when they are.

## Target infrastructure

| Component | Provider (planned) | Notes |
|---|---|---|
| Frontend | Vercel or Netlify | Static build, no server runtime needed |
| Backend | Render or Railway | Docker image from `backend/Dockerfile` |
| Database | Managed PostgreSQL (same provider as backend) | |

## 1. Backend

1. Build and push the Docker image (`backend/Dockerfile`) via the platform's
   Git integration or CI.
2. Provision a managed PostgreSQL instance; note its connection string.
3. Set environment variables on the platform (see checklist below).
4. Run migrations as a release step: `python manage.py migrate`.
5. Run `python manage.py bootstrap_admin` once, with
   `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` set only for that
   invocation (do not leave them set permanently).

### Required environment variables

```
SECRET_KEY=<random, unique per environment>
DEBUG=false
ALLOWED_HOSTS=<backend public hostname>
DATABASE_URL=<managed Postgres connection string>
ERP_MODE=mock              # switch to "real" once ERP webservices exist
ADMIN_API_URL=
ADMIN_API_TOKEN=
PEOPLE_API_URL=
PEOPLE_API_TOKEN=
ERP_HTTP_TIMEOUT_SECONDS=5
ERP_HTTP_MAX_RETRIES=2
ERP_CIRCUIT_BREAKER_THRESHOLD=5
ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS=30
```

Never commit real values for these — they live only in the platform's
environment variable store.

## 2. Frontend

1. Set `VITE_API_URL` to the deployed backend's public URL.
2. Build: `npm run build` (produces `frontend/dist/`).
3. Deploy `dist/` as a static site (Vercel/Netlify auto-detect Vite).
4. Configure the platform to rewrite all routes to `index.html` (SPA
   client-side routing).

## 3. Post-deploy checklist

- [ ] `GET /api/health` on the backend returns `200`.
- [ ] Frontend loads and can reach the backend (check the browser network
      tab for CORS or URL misconfiguration).
- [ ] Login with the bootstrap administrator succeeds.
- [ ] `ERP_MODE` matches intent (`mock` for a demo environment, `real` once
      ADMIN/PEOPLE webservices and tokens are available).

## Known gaps (explicitly deferred, not silently dropped)

- **No CI/CD pipeline wired to auto-deploy** — `.github/workflows/ci.yml`
  runs lint/tests on push; deployment itself is manual until platform
  accounts exist.
- **No scheduled ERP sync job** (Celery beat or platform cron) — the
  financial cache syncs on-demand only (see `add-financial-cache`'s design
  notes and `documentacion-funcional.md` §11 open item PD-10).
- **No Playwright E2E suite** — covered instead by backend/frontend unit and
  integration tests; adding E2E requires downloading browser binaries not
  available in the development sandbox this project was built in.
