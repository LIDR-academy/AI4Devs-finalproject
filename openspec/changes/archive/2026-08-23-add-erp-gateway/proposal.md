## Why

EyeMaster reads companies, plans, and payments from two external ERPs (ADMIN and PEOPLE), and registers clients in ADMIN's `catalogo_clientes`. The connectivity spec was redefined from direct database access to **REST/JSON webservices**, but those webservices do not exist yet. Nothing else in the product can be built until there is a single, stable way to reach the ERPs that also works **without** the real services. This change delivers that integration layer with a simulation mode, unblocking the client, company, and financial-cache work.

## What Changes

- Introduce a single **ERP Gateway** as the only entry point to the ERPs. All ERP calls go through it; no other module talks HTTP (or DB) to ADMIN/PEOPLE directly.
- Define the gateway **interface** (companies search/get, plans, payments, billing cycles, client search/create) decoupled from transport.
- Provide two interchangeable implementations selected by the `ERP_MODE` setting:
  - `mock` — returns local JSON **fixtures**, simulating request and response (default until real WS exist).
  - `real` — `httpx` REST client against `ADMIN_API_URL` / `PEOPLE_API_URL` with token auth, timeouts, and bounded retries.
- Normalize ERP responses to internal DTOs keyed by composite identity `(proyecto, id_externo)`.
- Define a **provisional REST contract** (request/response shapes) for the ERP webservices; the fixtures are derived from it.
- Add configuration and secrets handling: `ERP_MODE`, per-ERP base URLs and tokens (env vars, never in code).

## Capabilities

### New Capabilities
- `erp-integration`: How EyeMaster consumes the external ERP webservices — the gateway contract, the `mock`/`real` selection by `ERP_MODE`, response normalization to `(proyecto, id_externo)` identity, and error/timeout behavior.

### Modified Capabilities
<!-- None. Greenfield: no existing specs yet. -->

## Impact

- **New code:** `backend/services/erp/` (`gateway.py` interface, `rest.py`, `mock.py`, `fixtures/`), plus settings for `ERP_MODE` and ERP URLs/tokens.
- **Dependencies:** adds `httpx`. Removes any need for `zeep`/SOAP and for direct DB routers to the ERPs.
- **Downstream:** consumed by clients (Epic 02), company retrieval (Epic 03), and financial cache (Epic 07). Those modules depend on this contract being stable.
- **Ops:** with `ERP_MODE=mock` the app runs and demos with no organization-network connectivity; with `ERP_MODE=real` it requires reachable ERP webservices and valid tokens.
- **Docs:** aligns with `readme.md` §2 and `documentacion-funcional.md` §5.3.
