## Why

Retrieved companies (`add-company-retrieval`) and registered clients (`add-client-registration`) exist in isolation until they can be linked. EyeMaster's core value is the commercial structure: which client is billed for a company, which group it belongs to, which distributor manages it — with full historical traceability (`documentacion-funcional.md` §6.4, HU-04/HU-05/HU-06). This is the highest-risk module on the critical path: it requires a database-enforced guarantee that only one *current* assignment of a given type exists per entity, even under concurrent requests.

## What Changes

- `Group` and `Distributor` models with basic CRUD.
- `Assignment` model (`Asignacion`): polymorphic time-bounded relationship (`empresa-cliente`, `empresa-grupo`, `empresa-dist`, `grupo-dist`), with a **partial unique index** in PostgreSQL guaranteeing only one row with `fecha_fin IS NULL` per `(origen_id, tipo)`, plus a CHECK constraint `fecha_fin IS NULL OR fecha_fin > fecha_inicio`.
- `AsignacionService`: assign/reassign client, group, distributor to a company; every reassignment closes the previous validity (`fecha_fin=now`) and opens a new one — no physical deletion, ever.
- Exclusivity rule: a company cannot have both a direct distributor and a group-inherited one (R-EST-04-style conflict → `409`).
- Distributor inheritance: assigning a company to a group with a current distributor automatically inherits that distributor for the company.
- Deregistered companies (`estado=baja_erp`, via `is_eligible_for_assignment` from `add-company-retrieval`) are blocked from new assignments.
- Endpoints: `PUT /api/empresas/{id}/cliente`, `PUT /api/empresas/{id}/grupo`, `PUT/DELETE /api/empresas/{id}/distribuidor`, plus `Group`/`Distributor` CRUD.
- Frontend: assignment UI on the company detail view with visible inheritance and conflict messaging.

## Capabilities

### New Capabilities
- `commercial-structure`: Client/group/distributor assignment to companies with time-bounded validity, exclusivity, and inheritance rules, covering R-EMP/R-EST/RI rules and HU-04/HU-05/HU-06 from `documentacion-funcional.md`.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/comercial/` (`Group`, `Distributor`, `Assignment` models + migration with the partial unique index, `AsignacionService`, serializers, views, urls), `frontend/src/pages/CompanyDetailPage.tsx` (or an assignment panel added to `CompaniesPage.tsx`).
- **Dependencies:** consumes `apps.empresas.services.is_eligible_for_assignment`, `apps.clientes.models.Client`, and `apps.accounts.audit.emit_audit_event`. No new external dependency.
- **Downstream:** `add-financial-cache` and `add-status-and-balance` aggregate by current client/group/distributor, reading the same `Assignment` history (including "as of date" queries in `add-reporting-engine`).
- **Docs:** implements Epics 04 and 05 (`TK-04-01..03`, `TK-05-01..04`) and HU-04/HU-05/HU-06 from `documentacion-funcional.md` §9.4, §10.1.
