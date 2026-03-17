# QA Tests (Playwright)

Playwright runs two kinds of tests from this directory:

- **API** – HTTP requests against the backend only (no browser). Live in `api/`.
- **E2E** – Full browser tests (UI + backend). Live in `e2e/`.

Global setup runs once before any project: it registers (or logs in) a test user, creates a trip and an expense, and writes `AUTH_TOKEN`, `TEST_TRIP_ID`, `TEST_EXPENSE_ID`, `TEST_USER_ID` to `e2e/.auth/seed.json`. API and E2E tests use this seed so you do not need to set these env vars manually.

## Requirements

- Backend running (e.g. `cd Backend && npm run start:dev`) so global-setup can call the API.
- Playwright browsers installed: from repo root `npm run test:e2e:install`, or from `qa/`: `npx playwright install`.

## Run

From repo root:

```bash
npm run test:e2e
```

From `qa/`:

```bash
npm run test:e2e
```

- API only: `npx playwright test --project=api`
- E2E only: `npx playwright test --project=e2e`
- UI mode: `npm run test:e2e:ui`

## Env (optional)

- `API_BASE_URL` – backend API root (default `http://localhost:3000/api`)
- `PLAYWRIGHT_BASE_URL` – frontend URL for E2E (default `http://localhost:5173`)
- `E2E_TEST_EMAIL` – email for the E2E test user (required for global-setup and E2E tests). Example: `e2e-test@travelsplit.local`
- `E2E_TEST_PASSWORD` – password for the E2E test user (required; must satisfy backend rules). Example: `E2eTest123`

If the backend is not reachable, global-setup writes an error into the seed file and API tests skip with a clear message. If `E2E_TEST_EMAIL` or `E2E_TEST_PASSWORD` is missing, global-setup writes an error and tests skip.
