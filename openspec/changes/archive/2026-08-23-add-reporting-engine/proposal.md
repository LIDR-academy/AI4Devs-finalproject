## Why

Every prior module (commercial structure, financial cache, status/balance) exists to feed a single consolidated answer surface: the reporting engine. `documentacion-funcional.md` §6.7 and `readme.md` §4/Ticket 2 (`TK-09-04`) specify a flexible `measure × dimensions × filters × as_of_date` engine plus a predefined catalog, closing HU-11.

## What Changes

- `POST /api/reportes/consulta`: flexible query engine accepting `medida`, `dimensiones` (1+), `filtros`, and optional `a_fecha`.
- **Scoped measure set for this delivery**: `adeudo` and `pagado`, the two measures fully backed by existing services (`AdeudoService`, `Pago` cache). `ingreso_neto`, `conteo_planes`, `consumo`, `excedente` are **explicitly deferred** (documented as open items, not silently dropped — see Impact) since they need plan-catalog and consumption data this delivery's cache doesn't populate yet.
- **Dimensions**: `cliente`, `grupo`, `distribuidor`, `empresa`, `proyecto`, `app` — the ones resolvable from `add-commercial-structure`/`add-company-retrieval` today.
- **Filters**: `proyecto`, `app`, `adeudo_min` — reuses existing model fields, no new filter infrastructure.
- `a_fecha` reuses the exact assignment-resolution helper from `add-status-and-balance` (`_current_or_as_of`), guaranteeing R-REP-02 ("as of date" reconstructs historical assignment state) is implemented once, not twice.
- `GET /api/reportes/catalogo`: predefined catalog, each entry described as a fixed `medida`/`dimensiones`/`filtros` payload that the same engine executes — 4 of the 11 documented reports are delivered now (client/group/distributor → companies and balance; which companies owe me), matching the measures/dimensions in scope; the remaining 7 are listed as open items pending the deferred measures.
- Invalid measure×dimension combinations return `400`; empty results return `200` with `total=0`.
- Frontend: reporting page with catalog shortcuts, a custom-query builder (measure/dimensions/filters/date), and a results table.

## Capabilities

### New Capabilities
- `reporting`: Flexible measure × dimensions × filters × as-of-date query engine plus a predefined report catalog, covering R-REP-01/02/04 from `documentacion-funcional.md` for the in-scope measures/dimensions.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/reportes/` (query engine, catalog definitions, serializers, views, urls), `frontend/src/pages/ReportsPage.tsx`, `frontend/src/services/reportsService.ts`.
- **Dependencies:** consumes `apps.financiero.adeudo_service`, `apps.financiero.models.Pago`, `apps.comercial.models.Assignment`, `apps.empresas.models.Company`. No new external dependency.
- **Scope note (explicit, not silent):** measures `ingreso_neto`, `conteo_planes`, `consumo`, `excedente` and 7 of the 11 catalog reports are **out of scope** for this change — they require plan-catalog browsing and `consumo_plan`/`corte_plan` aggregation this delivery's financial cache doesn't fully populate. Tracked as a follow-up in `docs/plan-implementacion.md` open items, not dropped from the documented vision.
- **Docs:** implements the in-scope portion of Epic 09 (`TK-09-01` through `TK-09-04`) and HU-11 from `documentacion-funcional.md` §9.6, §10.1, and `readme.md` §4/Ticket 2.
