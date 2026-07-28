# Development Guide

Step-by-step setup for **Reading Analytics Platform** local development and testing.

## Prerequisites

- **Node.js** 20+ (OpenSpec recommends 20.19+)
- **npm** 9+
- **Docker** and **Docker Compose** (PostgreSQL)
- **Git**

## 1. Clone and install

```bash
git clone https://github.com/CeliaMerino/AI4devs-finalproject.git
cd AI4Devs-finalproject
```

Install dependencies in both apps:

```bash
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 2. Environment configuration

### Backend (`backend/.env`)

Copy from `backend/.env.example`:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/reading_analytics
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=7d
GOOGLE_BOOKS_API_KEY=
CORS_ORIGIN=http://localhost:5173
```

- Use port **5433** when running Postgres via this repo’s `docker-compose.yml` (host maps `5433:5432`).
- Use port **5432** if you run Postgres locally on the default port and create database `reading_analytics`.

Optional TypeORM flags (development only):

```env
TYPEORM_MIGRATIONS_RUN=true
# TYPEORM_SYNCHRONIZE=true   # avoid in shared/prod DBs; prefer migrations
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:3000/v1
```

## 3. Database (Docker)

From the project root:

```bash
docker compose up -d
docker compose ps
```

| Setting    | Value (docker-compose)   |
|-----------|---------------------------|
| Host      | `localhost`               |
| Port      | `5433`                    |
| Database  | `reading_analytics`       |
| User      | `postgres`                |
| Password  | `postgres`                |

## 4. Backend

```bash
cd backend

# Run TypeORM migrations
npm run migration:run

# Development (watch)
npm run start:dev
```

API base: `http://localhost:3000/v1`

**Dev login:** `POST /v1/auth/dev-login` with `{ "email": "you@example.com" }` — returns JWT; use as `Authorization: Bearer <token>`.

### Backend scripts

| Script | Purpose |
|--------|---------|
| `npm run start:dev` | Nest watch mode |
| `npm run build` | Compile to `dist/` |
| `npm test` | Unit tests (`*.spec.ts`) |
| `npm run test:integration` | Integration tests (`backend/test/`) |
| `npm run test:e2e` | E2E (`test/app.e2e-spec.ts`) |
| `npm run migration:run` | Apply TypeORM migrations |

## 5. Frontend

```bash
cd frontend
npm run dev
```

App URL: `http://localhost:5173` (Vite default).

Flow: open `/login` → dev login → redirect to `/book-tracker`.

### Frontend scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b` + production build |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint |

## 6. Testing

### Backend

```bash
cd backend
npm test
npm run test:integration
npm run test:cov
```

Integration tests may require Postgres; use the same `DATABASE_URL` as development.

### Frontend

Unit/E2E tooling is not wired in `package.json` yet; add Vitest or Playwright when tasks require it. Until then, follow manual test notes in feature READMEs (e.g. `backend/README-KAN-9.md`).

## 7. OpenSpec workflow

```bash
npm install -g @fission-ai/openspec@latest   # if not installed
openspec init   # once per machine/project
```

Project context: `openspec/config.yaml`. Active changes live under `openspec/changes/`. See `ai-specs/specboot-instructions.md`.

## 8. Troubleshooting

| Issue | Check |
|-------|--------|
| DB connection refused | Docker running; `DATABASE_URL` host/port matches compose (5433) |
| CORS errors | `CORS_ORIGIN` includes frontend origin (`http://localhost:5173`) |
| 401 on `/v1/books` | Valid JWT from dev-login; `Authorization` header set |
| Empty catalog search | Network; optional `GOOGLE_BOOKS_API_KEY` for fallback |
| Migration errors | DB empty or backup before re-run; use `migration:run` not ad-hoc DDL |

## Related documentation

- `docs/api-spec.yml` — REST contracts
- `docs/data-model.md` — entities and relationships
- `docs/standards/backend-standards.md` / `docs/standards/frontend-standards.md` — coding conventions
- `docs/deployment.md` — production URLs and hosting setup
- `README.md` — product overview and palette
