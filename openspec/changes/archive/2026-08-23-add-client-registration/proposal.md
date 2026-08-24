## Why

Companies need a billable client before commercial relationships (client/group/distributor) can be assigned to them. Today client registration is scattered and duplicated because each operator searches and captures independently (`documentacion-funcional.md` §6.2). With the ERP Gateway (search/create client in `catalogo_clientes`), authentication, and audit logging already in place, this change delivers the first real business module: validated client registration.

## What Changes

- `Client` model: unique RFC, `razon_social`, `id_admin_catalogo_clientes`, `origen` (`existente`/`creado`), `estado_sync` (`sincronizado`/`pendiente`/`error`).
- `POST /api/clientes`: searches ADMIN's `catalogo_clientes` by RFC via the ERP Gateway; links if found, creates if not, saves as `pendiente` if the webservice is unavailable.
- Local RFC uniqueness enforced before calling the gateway (avoids propagating duplicates).
- `GET /api/clientes` (list) and `GET /api/clientes/{id}` (detail).
- `POST /api/clientes/{id}/retry`: re-attempts synchronization for a `pendiente` client.
- Every successful registration and retry emits an audit event.
- Frontend: registration form with a status badge (`sincronizado`/`pendiente`/`error`).

## Capabilities

### New Capabilities
- `clients`: Validated client registration against the ADMIN client catalog, covering R-CLI-01..05 and HU-02/HU-07 from `documentacion-funcional.md`.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/clientes/` (model, migration, serializer, view, urls), `frontend/src/pages/ClientsPage.tsx`, `frontend/src/services/clientsService.ts`.
- **Dependencies:** consumes `services.erp.gateway.get_erp_gateway()` (`search_client`, `create_client`) and `apps.accounts.audit.emit_audit_event`. No new external dependency.
- **Downstream:** company retrieval (`add-company-retrieval`) and commercial structure (`add-commercial-structure`) will reference `Client` records once companies can be assigned to them.
- **Docs:** implements Epic 02 (`TK-02-01` through `TK-02-06`) and HU-02/HU-07 from `documentacion-funcional.md` §9.2, §10.1.
