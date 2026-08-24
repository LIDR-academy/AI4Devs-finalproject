## Why

Companies already exist in ADMIN and PEOPLE; EyeMaster must let an operator find one and "retrieve" it as a local mirror before it can be assigned a client, group, or distributor (`documentacion-funcional.md` §6.3). With the ERP Gateway providing company search/detail and clients already registrable, this is the next module on the critical path toward commercial-structure assignments.

## What Changes

- `Company` model: local mirror keyed by `(proyecto, id_externo)`, storing `app`, `razon_social`, `nombre_comercial`, `estado`, `ultima_sync`.
- `GET /api/empresas/buscar?proyecto=&query=`: real-time search against the ERP Gateway (no local persistence yet).
- `POST /api/empresas/recuperar`: creates (or refreshes) the local mirror for a chosen company, setting `ultima_sync`.
- `GET /api/empresas` (list mirrored companies) and `GET /api/empresas/{id}` (detail).
- Companies deregistered in the ERP (`estado=baja_erp`) block new assignments — enforced here as a guard other changes (`add-commercial-structure`) will call.
- Frontend: search screen (choose ERP, query, results) plus a detail view showing `ultima_sync`.

## Capabilities

### New Capabilities
- `companies`: Real-time ERP company search and local mirror retrieval, covering R-EMP-01..05 and HU-03 from `documentacion-funcional.md`.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/empresas/` (model, migration, serializer, view, urls), `frontend/src/pages/CompaniesPage.tsx`, `frontend/src/services/companiesService.ts`.
- **Dependencies:** consumes `services.erp.gateway.get_erp_gateway()` (`search_companies`, `get_company`). No new external dependency.
- **Downstream:** `add-commercial-structure` assigns client/group/distributor to `Company` records created here; `add-financial-cache` reads plans/payments for a `Company`'s `(proyecto, id_externo)`.
- **Docs:** implements Epic 03 (`TK-03-03`, `TK-03-04`; `TK-03-01`/`TK-03-02` already done in `add-erp-gateway`) and HU-03 from `documentacion-funcional.md` §9.3, §10.1.
