# US-5.3: CI/CD & Deployment

**Part of:** US-5.3 — CI/CD & Deployment
**Epic:** EP-05 — Production Launch

## Tasks

- [ ] T-5.3.1: **Infrastructure** — Write Dockerfile for backend (Node.js 22 LTS, non-root user, health check endpoint, multi-stage build)
- [ ] T-5.3.2: **Infrastructure** — Create Docker Compose file with services: api (Node.js), db (PostgreSQL 16), frontend (Vite dev or static build)
- [ ] T-5.3.3: **Infrastructure** — Configure GitHub Actions workflow: lint (biome check) → typecheck (tsc --noEmit) → test (vitest run) → build → deploy
- [ ] T-5.3.4: **Infrastructure** — Set up production deployment on Render (or Railway/Fly.io): Web Service for API, managed PostgreSQL, static site for frontend build
- [ ] T-5.3.5: **Infrastructure** — Configure environment variable injection via deployment dashboard (never committed): JWT_SECRET, DATABASE_URL, GOOGLE_SERVICE_ACCOUNT_KEY, FCM_SERVER_KEY, etc.
- [ ] T-5.3.6: **Infrastructure** — Set up staging environment (separate Render service + DB), verify environment isolation
- [ ] T-5.3.7: **Infrastructure** — Verify health check endpoint returns 200 OK and Docker health check configuration

---

