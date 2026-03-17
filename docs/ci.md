# CI/CD with GitHub Actions

This document describes the continuous integration and deployment pipeline for TravelSplit.

## Overview

- **CI** (`.github/workflows/ci.yml`): runs on every push and pull request. It runs lint, format checks, unit tests, and backend E2E tests.
- **CD** (`.github/workflows/cd.yml`): runs on push to `main` or on tags matching `v*`. It builds and pushes Docker images to GitHub Container Registry (GHCR).

## Required setup

### GitHub Secrets

For CI to pass, configure the following repository secrets in GitHub (Settings > Secrets and variables > Actions):

| Secret | Description |
|--------|-------------|
| `JWT_SECRET` | Used by the backend E2E job (migrations and tests). Must be at least 32 characters. Use a strong, random value (e.g. `openssl rand -base64 32`). |
| `E2E_POSTGRES_PASSWORD` | Password for the PostgreSQL service used in E2E Backend and E2E QA jobs. Use a dedicated test value (e.g. a random string); avoid reusing production credentials. |
| `E2E_TEST_EMAIL` | Email for the E2E test user (global-setup and Playwright). Example: `e2e-test@travelsplit.local`. |
| `E2E_TEST_PASSWORD` | Password for the E2E test user. Must satisfy backend password rules (e.g. min 8 chars, upper, lower, digit). Example: `E2eTest123`. |

Without these secrets, the **E2E Backend** and **E2E QA** jobs will fail when starting Postgres or running global-setup.

### CD (optional)

Pushing images to GHCR uses the built-in `GITHUB_TOKEN`; no extra secrets are required. For other registries (e.g. Docker Hub), add `REGISTRY_USERNAME` and `REGISTRY_PASSWORD` (or equivalent) and adjust the workflow accordingly.

## Running CI steps locally

You can run the same checks and tests that CI runs:

**Backend**

```bash
cd Backend
npm ci
npm run lint
npx prettier --check "src/**/*.ts" "test/**/*.ts"
npm run test
# E2E (requires PostgreSQL with DB travelsplit_test and env vars; see Backend/test/README.md)
npm run test:e2e
```

**Frontend**

```bash
cd Frontend
npm ci
npm run lint
npm run format:check
npm run test
```

**Backend E2E** requires a running PostgreSQL instance and a test database. See [Backend/test/README.md](../Backend/test/README.md) for database creation, migrations, and environment variables (including `JWT_SECRET`).

## Workflow details

### CI jobs

| Job            | Description |
|----------------|-------------|
| Lint Backend   | ESLint and Prettier check on Backend. |
| Lint Frontend  | ESLint and format check on Frontend. |
| Unit Backend   | Jest unit tests (no database). |
| Unit Frontend | Vitest unit tests. |
| E2E Backend   | Starts PostgreSQL 17 as a service, runs migrations, then Jest E2E tests. Requires `JWT_SECRET`. |
| E2E QA         | Runs Playwright API project against backend started via Docker Compose. Requires `E2E_POSTGRES_PASSWORD`, `JWT_SECRET`, `E2E_TEST_EMAIL`, `E2E_TEST_PASSWORD`. |

### CD jobs

| Job      | Description |
|----------|-------------|
| Build and Push Backend  | Builds `Backend/Dockerfile`, tags with commit SHA and (on `main`) `latest`, pushes to `ghcr.io/<owner>/<repo>/backend`. |
| Build and Push Frontend | Same for Frontend, pushes to `ghcr.io/<owner>/<repo>/frontend`. |
| Deploy (placeholder)   | Disabled. Add your deployment target (Render, Railway, ECS, etc.) when ready. |

## Caching

CI caches `node_modules` for Backend, Frontend, and (when E2E QA runs) qa, using the hash of the corresponding `package-lock.json`. This reduces install time on repeated runs.
