# Reading Analytics Platform — Backend

NestJS 11 REST API for **Reading Analytics Platform** (`/v1`, JWT, TypeORM, PostgreSQL).

## Quick start

See the full guide: [`docs/development_guide.md`](../docs/development_guide.md).

```bash
# From repo root: start Postgres (port 5433)
docker compose up -d

cd backend
cp .env.example .env
npm install
npm run migration:run
npm run start:dev
```

API base: `http://localhost:3000/v1`

**Production API:** https://reading-analytics-api.onrender.com/v1 — see [`docs/deployment.md`](../docs/deployment.md).

**Dev login:** `POST /v1/auth/dev-login` with `{ "email": "you@example.com" }`.

## Modules

| Module | Responsibility |
|--------|----------------|
| `auth` | JWT, dev-login |
| `books` | Library, catalog (Open Library / Google Books), reading records |
| `lists` | Monthly TBR |
| `goals` | Annual reading goals |
| `stats` | KPIs and insights |
| `genres` / `formats` / `audiences` | User-configurable metadata |
| `import` | Goodreads CSV import jobs |
| `preferences` | Theme and profile preferences |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run start:dev` | Watch mode |
| `npm test` | Unit tests |
| `npm run test:integration` | API integration tests (needs Postgres) |
| `npm run migration:run` | Apply TypeORM migrations |

## Documentation

- [`docs/api-spec.yml`](../docs/api-spec.yml) — REST contracts
- [`docs/data-model.md`](../docs/data-model.md) — database schema
- [`docs/standards/backend-standards.md`](../docs/standards/backend-standards.md) — coding conventions
- [`README-KAN-9.md`](./README-KAN-9.md) — manual test notes for add-book flow
