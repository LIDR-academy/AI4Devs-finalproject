## 1. Circuit breaker

- [x] 1.1 Add settings: `ERP_CIRCUIT_BREAKER_THRESHOLD` (default 5), `ERP_CIRCUIT_BREAKER_COOLDOWN_SECONDS` (default 30)
- [x] 1.2 `_BreakerState` per-ERP (consecutive failures, opened-at timestamp) held on `RestGateway`
- [x] 1.3 Breaker check before the retry loop in `_request`; raises `ERPUnavailableError` immediately when open
- [x] 1.4 Increment failure counter when retries are exhausted; reset to zero on success
- [x] 1.5 Breaker reopens for retry after cooldown elapses

## 2. Tests

- [x] 2.1 Breaker opens after N consecutive failures, short-circuits further calls (no network attempt)
- [x] 2.2 Breaker is scoped per ERP (ADMIN open does not affect PEOPLE)
- [x] 2.3 Breaker closes and allows a call through after cooldown elapses
- [x] 2.4 A successful call resets the failure counter
- [x] 2.5 Mock mode is unaffected (no breaker interaction)

## 3. Documentation

- [x] 3.1 `docs/getting-started.md`: prerequisites, `docker-compose up`, migrations, `bootstrap_admin`, frontend dev server, running both test suites
- [x] 3.2 `docs/deployment.md`: concrete runbook translating `readme.md` §2.4 into commands and an env-var checklist
- [x] 3.3 Link `docs/getting-started.md` and `docs/deployment.md` from the top of `readme.md`
- [x] 3.4 Note explicitly in `docs/plan-implementacion.md` that real infra provisioning and Playwright E2E are deferred, not silently dropped
