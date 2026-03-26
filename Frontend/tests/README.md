# Frontend Tests

Tests are organized under `tests/`:

- **unit/** – Component, hook, and utility tests (isolated, no real API).
- **integration/** – Flows that hit the API (mocked with MSW or real backend).
- **fixtures/** – Shared test data and API mock handlers (e.g. MSW).
- **helpers/** – Test utilities (e.g. custom `render` with Router/QueryClient).

## Commands

From Frontend root:

- `npm run test` – Run all tests.
- `npm run test:unit` – Run only unit tests.
- `npm run test:integration` – Run only integration tests.
- `npm run test:watch` – Watch mode.
- `npm run test:coverage` – Coverage report.

## Conventions

- Unit: `*.test.ts` / `*.test.tsx` under `tests/unit/`.
- Integration: `*.integration.test.ts` (or `*.integration.test.tsx`) under `tests/integration/`.
- Test names in English; use `should [expected behavior] when [condition]`.

## Integration strategy

- **MSW (recommended):** Mock API in tests; no backend required. Add handlers in `fixtures/api-handlers.ts` (or similar).
- **Real API:** Point to a test backend; requires backend running and seed data.

Start with unit tests and MSW-based integration; add real-API integration later if needed.
