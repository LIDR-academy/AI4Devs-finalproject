## Why

The financial cache (`add-financial-cache`) stores raw `EmpresaPlan`/`Pago` rows, but nobody can yet answer the two questions that matter most operationally: *is this company current, expired, or blocked?* and *how much does it — or its client, group, or distributor — owe?* `documentacion-funcional.md` §6.5/§6.6 and `readme.md` Ticket 1 (`TK-08-02`) specify exactly these two services, verified against the real ERP billing code (`reglas_cobranza.md`).

## What Changes

- `EstatusPlanService.estado_derivado(empresa_plan)`: derives `vigente | vencido | bloqueado` from `estatus`, `fecha_final`, and grace periods (`plan.prorroga` + `empresa_plan.prorroga`), per R-PLN-03/04/05.
- `AdeudoService`: `adeudo_por_empresa(empresa_id)`, `adeudo_por_cliente(cliente_id)`, `adeudo_por_grupo(grupo_id)`, `adeudo_por_distribuidor(distribuidor_id)` — all as `Decimal`, rounded to 2 places, summing `pago.total WHERE estatus=2` over the relevant companies (current assignments from `add-commercial-structure`). Distributor balance includes direct companies **and** companies inherited via group.
- `a_fecha` optional parameter on every `AdeudoService` function: when given, uses assignments that were current **at that date** (querying `Assignment.fecha_inicio <= a_fecha AND (fecha_fin IS NULL OR fecha_fin > a_fecha)`) instead of the current ones.
- Endpoints: `GET /api/empresas/{id}/adeudo`, `GET /api/clientes/{id}/adeudo`, `GET /api/grupos/{id}/adeudo`, `GET /api/distribuidores/{id}/adeudo`, plus `GET /api/empresas/{id}/estado` for the derived plan status. All accept an optional `a_fecha` query parameter.
- Frontend: status badge and outstanding-balance display added to the company detail view.

## Capabilities

### New Capabilities
- `financial-status`: Operational status derivation and outstanding-balance aggregation (current and "as of date"), covering R-PLN-03/04/05 and R-PAG-04/08 from `documentacion-funcional.md`, matching `readme.md` Ticket 1 (`TK-08-02`) acceptance criteria.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/financiero/estatus_service.py`, `backend/apps/financiero/adeudo_service.py` (or a dedicated `apps/financiero` submodule), new endpoints in `apps/financiero/views.py` and `apps/empresas`/`apps/clientes`/`apps/comercial` as appropriate, `frontend` status badge + balance display.
- **Dependencies:** consumes `apps.financiero.models` (`EmpresaPlan`, `Pago`), `apps.comercial.services` / `apps.comercial.models.Assignment` (current and "as of date" relationships), `apps.clientes.models.Client`. No new external dependency.
- **Downstream:** `add-reporting-engine` (F9) reuses the same "as of date" assignment-resolution pattern and the same balance measures for its flexible query engine.
- **Docs:** implements Epic 08 (`TK-08-01` through `TK-08-04`) and Ticket 1 (`TK-08-02`) from `documentacion-funcional.md`/`readme.md` §10.1/§6.
