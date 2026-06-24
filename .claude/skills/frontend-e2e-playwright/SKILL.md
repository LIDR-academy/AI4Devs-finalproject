---
name: frontend-e2e-playwright
description: Use when adding or changing a StayHub user journey that must be covered by the Playwright browser E2E. Encodes how the E2E stack runs (docker-compose.e2e.yml), where specs live, the stub-payment / no-map / host-API conventions, selector strategy, and how to run it locally and in CI.
---

# StayHub E2E (Playwright) Skill

## When
Any new or changed cross-page **user journey**. Per the flow-testing strategy, journeys are covered HERE (one thin browser test), not chained in backend integration tests (those stay per-endpoint).

## Stack & where things live
- Specs: `frontend/tests/e2e/*.spec.ts`; config: `frontend/playwright.config.ts` (no `webServer` — it targets an already-running stack at `http://localhost:3000`).
- Full stack: `docker compose -f docker-compose.yml -f docker-compose.e2e.yml up --build -d` brings up frontend :3000, backend :8080, Postgres/PostGIS, MailHog.
- Run locally: bring the stack up, then `cd frontend && npx playwright install chromium` (first time) and `npx playwright test`.

## Conventions (must follow)
- **Selectors:** use `data-testid` via `page.getByTestId(...)`. If a journey element lacks one, ADD a `data-testid` to the component (small, allowed) rather than relying on text/CSS. (Date inputs use `#check-in` / `#check-out` ids.)
- **No map dependency:** the Mapbox token is a dummy — navigate via the **results list** (`[data-testid="property-grid"] [data-property-id]`), never the map.
- **Payments:** the frontend image is built with `NEXT_PUBLIC_E2E=true`, so `PaymentForm` renders a stub `pay-button` that completes via the backend `StubPaymentAdapter` — no real Stripe. Keep `pay-button` / `payment-form-wrapper` testids identical across modes.
- **Dates:** compute relative to `new Date()` inside the seeded availability window (`CURRENT_DATE..+89`) and CLEAR of the seed bookings (`+10-14`, `+20-23`, `+40-45`) — e.g. ~24-35 days out. Don't hardcode absolute dates (they go stale). Provide them to the property page via the `?check_in&check_out` query params (enables Reserve) rather than clicking absolute calendar days.
- **Client-side API:** `NEXT_PUBLIC_API_URL` is inlined at BUILD time and must be the **host-reachable** backend URL (`http://localhost:8080`) because calls happen in the browser; CORS on the backend allows `localhost:3000`.
- **No arbitrary sleeps:** use web-first assertions (`expect(locator).toBeVisible()`), `getByTestId`, `waitFor` — Playwright auto-waits.
- Keep the suite **thin** — top journeys only.

## CI
The `e2e` job in `.github/workflows/test.yml` builds the stack, waits for health, runs Playwright, uploads the HTML report. It is **non-blocking** (`continue-on-error: true`) until the suite proves stable, then promote it to a required check by removing that flag.

## Gotchas (learned building this)
- The frontend production build runs `next build` which **type-checks + lints**; CI's vitest gate does NOT. Run `npx next build --no-lint` to catch type errors (the E2E image uses `--no-lint`; lint errors live in test files).
- Local re-runs against a persistent stack reuse the DB, so a booking created by a prior run can cause a `409` on the same dates — the per-run date offset mitigates this; in CI the DB is fresh (`down -v`).
- Compose project-name clashes: if a dev `stayhub-postgres` is already running under another project, recreate only the app containers (`--no-deps`) or `down` the dev stack first.
