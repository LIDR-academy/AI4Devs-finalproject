## Context

EyeMaster is greenfield code. The connectivity spec was redefined (see `readme.md` §2 and `documentacion-funcional.md` §5.3): ERP access moves from direct PostgreSQL reads to REST/JSON webservices, but the real webservices do not exist yet. This change builds the integration layer first so every downstream module (clients, companies, financial cache) can be developed and demoed against simulated data. Constraints: no organization-network connectivity is available during development; the ERP webservice contract is not final; company identity can collide across the two ERPs.

## Goals / Non-Goals

**Goals:**
- One stable gateway contract that isolates the rest of the app from ERP transport and schema.
- Full local development and demo with `ERP_MODE=mock` (no network).
- A `real` client ready to switch on when the webservices exist, with token auth, timeouts, and bounded retries.
- Response normalization to `(proyecto, id_externo)` identity.

**Non-Goals:**
- Implementing the financial cache, sync scheduling, or business status derivation (Epics 07/08).
- Building the real ERP webservices themselves.
- Caching gateway responses (the local cache is a separate capability).

## Decisions

- **Single interface, two implementations (`gateway.py` + `rest.py` + `mock.py`).** A Python `Protocol`/ABC defines the contract; `RestGateway` and `MockGateway` implement it. A factory resolves the implementation from `ERP_MODE`. *Alternative considered:* one class with an `if mock` branch — rejected, it leaks transport concerns into business logic and is harder to test.
- **`httpx` for the real client.** Sync client with explicit timeouts and a small retry wrapper. *Alternative:* `requests` — rejected; `httpx` gives first-class timeouts and an easy async path later.
- **Fixtures as JSON files under `services/erp/fixtures/`, one set per ERP.** Loaded and filtered in-process by `MockGateway`. *Alternative:* a standalone stub server (WireMock/json-server) — rejected for now; an internal mock needs no extra process and keeps the demo self-contained. The gateway boundary means a stub server can be adopted later without touching callers.
- **DTOs decoupled from Django models.** The gateway returns plain dataclasses; mapping to cache models happens in the consuming module (Epic 07). Keeps the gateway free of persistence concerns.
- **Provisional REST contract documented alongside fixtures.** The assumed request/response shapes are written down so fixtures and the future real client agree; when the real contract lands, only `rest.py` and the contract doc change.
- **Typed errors.** `ERPUnavailableError` (timeout/connection/5xx after retries) vs `ERPValidationError` (4xx with ERP message). Lets the client-registration flow choose `pendiente` vs surfacing a `400`.

## Risks / Trade-offs

- **Provisional contract drifts from the real WS** → keep normalization and the contract doc in one place; contract tests run against both fixtures and recorded real responses so drift fails loudly.
- **Mock data too clean, hides real edge cases** → fixtures deliberately include id collisions across ERPs, both suites, and a not-found RFC.
- **Retries amplify load / mask latency** → cap retries, only on transient errors, never on 4xx; enforce a total timeout budget.
- **Consumers bypass the gateway** → enforced by the "single entry point" requirement and a lint/review check that no module imports `httpx` or ERP URLs outside `services/erp/`.

## Migration Plan

Greenfield — no data migration. Rollout: ship with `ERP_MODE=mock` in all environments. When the real webservices are available, set `ERP_MODE=real` plus `ADMIN_API_URL`/`PEOPLE_API_URL` and tokens in a single environment; validate contract tests against recorded responses; then promote. Rollback is flipping `ERP_MODE` back to `mock`.

## Open Questions

- Final ERP webservice contract (endpoints, pagination, auth scheme) — tracked as a blocking open item in `docs/plan-implementacion.md`.
- Exact timeout and retry values per ERP (need real latency data).
- Whether client search/create is exposed by the same ADMIN base URL or a separate one.
