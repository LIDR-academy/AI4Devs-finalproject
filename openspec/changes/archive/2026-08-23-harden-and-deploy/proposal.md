## Why

All nine functional modules (F1–F9) are built and tested, but the product isn't yet resilient to ERP degradation or documented for someone else to run it end to end. `documentacion-funcional.md` §12.1 explicitly proposes a "circuit breaker for the ERP webservices" as an improvement, and `readme.md` §2.4 documents a deployment plan that has never been written down as an actual runbook. This change closes both gaps.

## What Changes

- **Circuit breaker in the ERP Gateway**: after a configurable number of consecutive failures to a given ERP, the gateway short-circuits further calls to that ERP for a cooldown window, failing fast with `ERPUnavailableError` instead of waiting out a timeout+retries on every request — protecting the app under sustained ERP degradation, per the documented trade-off in `readme.md` §2.1.
- **Root `README.md`** (distinct from the delivery `readme.md`) with actual run instructions: prerequisites, `docker-compose up`, running migrations, `bootstrap_admin`, running the frontend dev server, running both test suites.
- **Deployment runbook** (`docs/deployment.md`) translating `readme.md` §2.4's planned process into concrete, repeatable steps for whoever provisions Render/Railway/Vercel — this change does not provision real infrastructure (no accounts/credentials exist for this project), it documents the exact steps so provisioning is mechanical when it happens.

## Capabilities

### Modified Capabilities
- `erp-integration`: adds circuit-breaker behavior to the existing `RestGateway`/`ERPGateway` contract — a genuine requirement change (new failure-mode behavior), not just an implementation detail.

### New Capabilities
<!-- None: circuit breaker extends the existing erp-integration capability; docs are not a spec-tracked capability. -->

## Impact

- **Changed code:** `backend/services/erp/rest.py` (circuit breaker wrapping the existing retry logic), `backend/core/settings.py` (breaker threshold/cooldown settings).
- **New docs:** root `README.md`, `docs/deployment.md`.
- **Explicit scope reduction (documented, not silent):** this change does **not** provision real cloud infrastructure (no Render/Railway/Vercel accounts exist for this project) and does **not** add Playwright E2E tests — both were in the original F10 sketch in `docs/plan-implementacion.md` but require external accounts/browser-binary downloads unavailable in this environment. They're recorded as open follow-ups, not dropped silently.
- **Docs:** closes the "circuit breaker" improvement from `documentacion-funcional.md` §12.1 and turns `readme.md` §2.4's plan into an actual runbook.
