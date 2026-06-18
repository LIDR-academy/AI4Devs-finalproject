# MecaTrack API

NestJS REST API for MecaTrack workshop management (US-001: authentication).

## Prerequisites

- Node.js 20+
- Docker (PostgreSQL 16)

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing (reserved) |
| `JWT_ACCESS_TTL` | Access token TTL (default `15m`) |
| `JWT_REFRESH_TTL` | Refresh token TTL (default `7d`) |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:3000`) |
| `NODE_ENV` | `development` or `production` |

## Local setup

From repository root:

```bash
docker compose up -d
```

From `apps/api`:

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API base URL: `http://localhost:4000/api`

## Seed users (development only)

| Email | Password | Role |
|-------|----------|------|
| `admin@taller.com` | `AdminPass123` | ADMIN |
| `mechanic@taller.com` | `MechanicPass123` | MECHANIC |
| `inactive@taller.com` | `InactivePass123` | MECHANIC (inactive) |

## Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login; returns `accessToken` + sets `refreshToken` httpOnly cookie |
| `POST` | `/api/auth/refresh` | New access token from refresh cookie |
| `POST` | `/api/auth/logout` | Revoke refresh token (Bearer required) |
| `GET` | `/api/auth/me` | Current user profile (Bearer required) |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with watch mode |
| `npm run build` | Compile TypeScript |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests (requires PostgreSQL) |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed database |

## Database port

Docker maps PostgreSQL to host port **5434** (to avoid conflicts with local PostgreSQL on 5432/5433).
