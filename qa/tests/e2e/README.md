# E2E tests (browser)

This folder contains **browser E2E** specs and shared setup:

- `global-setup.ts` – Registers/logs in a test user, creates a trip and expense, writes seed to `.auth/seed.json`.
- `bundle-loader.ts` – Loads `data/2026-03-16-expenses.json` and seed; used by both API and E2E specs.
- `expenses-bundle-e2e.spec.ts` – Bundle-driven UI tests.

**API** specs live in `../api/` and use the same seed and bundle-loader.

See **`../README.md`** for how to run all tests (API and E2E), install browsers, and env options.
