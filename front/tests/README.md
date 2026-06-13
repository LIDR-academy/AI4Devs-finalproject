# Frontend Tests

Place unit and component tests for the React frontend in this folder.

## Playwright E2E (API-level)

TKT-004 coverage lives in `tests/e2e/expiration-confidence-flow.spec.ts`.

Prerequisites:
- Backend API running at `http://localhost:3000/api` (or set `E2E_API_BASE_URL`).

Run:
- `npm run test:e2e`
- `npm run test:e2e:headed`

## Playwright E2E (UI-level, visible browser)

TKT-004 UI coverage lives in `tests/e2e/expiration-confidence-flow.ui.spec.ts`.

Prerequisites:
- Frontend app running at `http://localhost:5173` (or set `E2E_FRONT_BASE_URL`).
- Backend API running at `http://localhost:3000/api` (or set `E2E_API_BASE_URL`).

Run:
- `npm run test:e2e:ui`
- `npm run test:e2e:ui:headed`
