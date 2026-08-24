## 1. Configuration and dependencies

- [x] 1.1 Add `httpx` to backend dependencies
- [x] 1.2 Add settings: `ERP_MODE` (default `mock`), `ADMIN_API_URL`, `PEOPLE_API_URL`, per-ERP tokens, timeout and max-retries
- [x] 1.3 Fail fast at startup when `ERP_MODE=real` and any required URL/token is missing
- [x] 1.4 Document env vars in `.env.example` (with `ERP_MODE=mock` as default)

## 2. Contract and DTOs

- [x] 2.1 Write the provisional ERP REST contract (endpoints, request/response shapes) under `services/erp/CONTRACT.md`
- [x] 2.2 Define DTO dataclasses (company, plan, payment, billing cycle, client) keyed by `(proyecto, id_externo)`
- [x] 2.3 Define typed errors `ERPUnavailableError` and `ERPValidationError`

## 3. Gateway interface

- [x] 3.1 Define `ERPGateway` interface in `services/erp/gateway.py` (company search/get, plans, payments, cortes, client search, client create)
- [x] 3.2 Implement a factory that resolves the implementation from `ERP_MODE`

## 4. Mock implementation

- [x] 4.1 Create `services/erp/fixtures/` with JSON for ADMIN and PEOPLE (companies, plans, payments)
- [x] 4.2 Include fixtures for both suites (`SUITE_A`, `SUITE_B`) and an `id_externo` collision across ERPs
- [x] 4.3 Include client fixtures: an existing RFC and a not-found RFC
- [x] 4.4 Implement `MockGateway` in `services/erp/mock.py` (load + filter fixtures, no network)

## 5. Real implementation

- [x] 5.1 Implement `RestGateway` in `services/erp/rest.py` with `httpx`, token in `Authorization`, per-ERP base URL
- [x] 5.2 Enforce request timeout
- [x] 5.3 Implement bounded retries on 5xx/connection errors; never retry 4xx
- [x] 5.4 Map transport/ERP errors to `ERPUnavailableError` / `ERPValidationError`
- [x] 5.5 Normalize responses to the shared DTOs, identical to mock output

## 6. Tests

- [x] 6.1 Contract tests asserting mock and real produce identical DTO shapes
- [x] 6.2 Test id-collision across ERPs stays distinct by `proyecto`
- [x] 6.3 Test timeout raises `ERPUnavailableError`
- [x] 6.4 Test retry stops on 4xx and surfaces `ERPValidationError`
- [x] 6.5 Test factory selection by `ERP_MODE` and fail-fast on missing real config
- [x] 6.6 Test client search-or-create (found, created, unavailable)

## 7. Guardrails and docs

- [x] 7.1 Add a check (lint/review) that no module outside `services/erp/` imports `httpx` or references ERP URLs
- [x] 7.2 Confirm the layer matches `readme.md` §2.2 file structure and update if needed
