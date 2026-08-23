# Local Setup Guide

Step-by-step instructions to run the Coacher platform on your local machine (backend, frontend, database, and Docker usage).

## Prerequisites

- **Node.js** 20+ (project targets Node 22 LTS — recommended)
- **Docker** with Docker Compose (used only for PostgreSQL)
- **npm** (comes with Node)

Verify your environment:

```bash
node --version
npm --version
docker --version
docker compose version
```

## Architecture overview (local)

| Component | How it runs | Port |
|---|---|---|
| PostgreSQL | Docker Compose (`db` service) | 5432 |
| Backend API | Natively via `tsx watch` | 3001 |
| Frontend (Vite) | Natively via `vite` | 5173 |

> **Note:** The Docker Compose `api` service is not wired for local use — its image omits dev dependencies (so `tsx` is unavailable) and has no build step. Run only the `db` service via Docker and run backend + frontend natively.

## 1. Start the database

From the repository root:

```bash
docker compose up -d db
```

Verify it is running and healthy:

```bash
docker ps
```

The container exposes PostgreSQL on `localhost:5432`:
- User: `postgres`
- Password: `postgres`
- Database: `coacher`

## 2. Prepare backend environment

The required environment file is `backend/.env`. It is gitignored — the template lives at `.env.example` (root) plus `backend/.env.example` (Google Calendar vars).

If `backend/.env` does not exist, create it from the root template:

```bash
cp .env.example backend/.env
```

Required variables (already present in the committed template):

- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/coacher`
- `JWT_SECRET` (min. 32 chars)
- `COACH_FINANCIAL_ENCRYPTION_KEY` (exactly 32 chars)
- Optional: `GOOGLE_CALENDAR_*` / `FIREBASE_SERVICE_ACCOUNT_PATH` — the API starts fine without them (Google Calendar provider degrades gracefully; push notifications are stubs when unset).

The Google Calendar service-account key is stored at `backend/secrets/coacher-calendar-sa-key.json` (gitignored).

## 3. Install dependencies (first time only)

```bash
cd backend
npm install

cd ../frontend
npm install
```

## 4. Apply migrations and seed data

```bash
cd ../backend

# Apply existing Prisma migrations
npm run db:migrate

# Create the 5 default levels
npm run db:seed

# Create the admin user
npx tsx prisma/seed-admin.ts
```

The seed command prints the admin credentials. Defaults:

- **Email:** `admin@coacher.com`
- **Password:** `Admin123!`

## 5. Run the backend

```bash
cd backend
npm run dev
```

The API starts on `http://localhost:3001` (all endpoints under `/api/v1`). Smoke test:

```bash
curl http://localhost:3001/api/v1/health
```

## 6. Run the frontend

```bash
cd frontend
npm run dev
```

The app is served at `http://localhost:5173`. Vite proxies `/api` requests to the backend on `localhost:3001`, so no frontend env file is needed.

## 7. Log in

Open `http://localhost:5173` and sign in with:

- **Email:** `admin@coacher.com`
- **Password:** `Admin123!`

## Troubleshooting

| Problem | Fix |
|---|---|
| `docker` / `docker compose` not found | Install Docker Desktop, then restart your terminal |
| `Environment validation failed: DATABASE_URL` | Make sure `backend/.env` exists (see step 2) |
| Backend cannot connect to Postgres (`ECONNREFUSED` 5432) | Start the db first: `docker compose up -d db` |
| Port 5432/3001/5173 already in use | Stop the conflicting process or change the `POSTGRES`/`PORT`/Vite config |
| `seed-admin.ts` already run | It is idempotent — it prints the same credentials and exits |

## Useful commands

```bash
# Watch the database schema (Prisma Studio)
cd backend && npm run db:studio

# Apply schema changes without a migration (dev quick-and-dirty)
cd backend && npm run db:push

# Lint / typecheck
cd backend && npm run lint && npm run typecheck
cd frontend && npm run lint && npm run typecheck

# Tests
cd backend && npm test
```

## Stop everything

```bash
# Stop the Postgres container
docker compose stop db
# Or remove it (deletes the volume)
docker compose down
```