# Backend Integration Tests (E2E)

Integration tests exercise the full HTTP stack (Controller + Service + Database) using NestJS `Test.createTestingModule`, Supertest, and a **dedicated test database**.

## Requirements

- Node.js (same as Backend)
- PostgreSQL test database (e.g. `travelsplit_test`)
- Environment variables (see below)

## Environment

Use a separate database for tests. Options:

1. **`.env.test`** in Backend root with at least:
   - `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME=travelsplit_test`
   - `JWT_SECRET` (required by AuthModule)

2. Or set before running:
   - `DB_NAME=travelsplit_test` (or another test DB name)
   - Other `DB_*` and `JWT_SECRET` as in development

Do **not** run integration tests against development or production database.

**GitHub Actions CI**: The E2E Backend job requires the repository secret `JWT_SECRET` (see [docs/ci.md](../../docs/ci.md)).

## Database schema

1. **Create the test database** (one-time). If Postgres runs in Docker (e.g. `travelsplit-postgres`):
   ```bash
   docker exec travelsplit-postgres psql -U postgres -c "CREATE DATABASE travelsplit_test;"
   ```
2. **Run migrations** against the test DB (from Backend root):
   ```bash
   DB_NAME=travelsplit_test npm run migration:run
   ```
   On Windows PowerShell: `$env:DB_NAME="travelsplit_test"; npm run migration:run`

## Run

From Backend root:

```bash
npm run test:e2e
```

Or with explicit env:

```bash
NODE_ENV=test DB_NAME=travelsplit_test npm run test:e2e
```

## Structure

- **`integration/`** – E2E specs per domain: auth, users, trips, expenses, balances, health.
- **`fixtures/`** – Reusable test data (DTO-like objects), no HTTP or DB calls.
- **`helpers/`** – `app.helper` (create Nest app with global prefix/pipes/filters), `auth.helper` (register/login, return token), `db.helper` (truncate/cleanup).

## Conventions

- File naming: `*.e2e-spec.ts`.
- Test names: `should [expected behavior] when [condition]` (English).
- Use Arrange–Act–Assert; clean up in `afterEach`/`afterAll` (see `db.helper`).
- See `.cursor/rules/testing/integration-tests.mdc` for full standards.
