## 1. Backend: empresas app and model

- [x] 1.1 Create `apps/empresas` Django app
- [x] 1.2 `Company` model: `proyecto`, `id_externo`, `app`, `razon_social`, `nombre_comercial`, `estado`, `ultima_sync`; unique constraint on `(proyecto, id_externo)`
- [x] 1.3 Migration

## 2. Backend: services

- [x] 2.1 `search_companies(proyecto, query)` passthrough to the ERP Gateway (no persistence)
- [x] 2.2 `retrieve_company(proyecto, id_externo)`: gateway `get_company`, `update_or_create` local mirror, set `ultima_sync`
- [x] 2.3 `is_eligible_for_assignment(company)` guard (False when `estado == "baja_erp"`)

## 3. Backend: endpoints

- [x] 3.1 `GET /api/empresas/buscar?proyecto=&query=` gated by `empresa.recuperar`
- [x] 3.2 `POST /api/empresas/recuperar` (`proyecto`, `id_externo`) gated by `empresa.recuperar`
- [x] 3.3 `GET /api/empresas` and `GET /api/empresas/{id}` gated by `empresa.recuperar`

## 4. Frontend

- [x] 4.1 `companiesService.ts` — `search()`, `retrieve()`, `list()`, `get(id)`
- [x] 4.2 `CompaniesPage.tsx` — ERP selector + search + results + retrieve action + mirrored list with `ultima_sync`

## 5. Tests

- [x] 5.1 Search returns ERP results without creating local records
- [x] 5.2 First retrieval creates a mirror with correct identity and `ultima_sync`
- [x] 5.3 Repeated retrieval updates the same record (no duplicate), refreshed fields
- [x] 5.4 Same `id_externo` across ADMIN and PEOPLE produces two distinct records
- [x] 5.5 Retrieval of a company later reported `baja_erp` updates local `estado`
- [x] 5.6 `is_eligible_for_assignment` returns `False` for `baja_erp`, `True` otherwise
- [x] 5.7 Missing `empresa.recuperar` permission → `403` on search and retrieval
