## 1. Backend: clientes app and model

- [x] 1.1 Create `apps/clientes` Django app
- [x] 1.2 `Client` model: `rfc` (unique), `razon_social`, `id_admin_catalogo_clientes` (nullable), `origen`, `estado_sync`
- [x] 1.3 Migration

## 2. Backend: registration service

- [x] 2.1 `register_or_link_client(rfc, razon_social, existing=None)` service: local uniqueness check, gateway search, gateway create-if-absent, persist
- [x] 2.2 Map `ERPUnavailableError` to `estado_sync=pendiente` / `202`
- [x] 2.3 Map `ERPValidationError` to `400` with ERP message, no record persisted

## 3. Backend: endpoints

- [x] 3.1 `POST /api/clientes` gated by `cliente.crear`
- [x] 3.2 `GET /api/clientes` and `GET /api/clientes/{id}` gated by `cliente.consultar`
- [x] 3.3 `POST /api/clientes/{id}/retry` gated by `cliente.crear`
- [x] 3.4 Emit audit event on successful registration and successful retry

## 4. Frontend

- [x] 4.1 `clientsService.ts` — `list()`, `register()`, `retry(id)`
- [x] 4.2 `ClientsPage.tsx` — registration form + list with `estado_sync` badge + retry action

## 5. Tests

- [x] 5.1 Duplicate RFC returns `409` without calling the gateway (mock/spy)
- [x] 5.2 RFC found in ADMIN → `201`, `origen=existente`
- [x] 5.3 RFC not found → `201`, `origen=creado`
- [x] 5.4 ERP unavailable → `202`, `estado_sync=pendiente`
- [x] 5.5 ERP validation error → `400`, no local record created
- [x] 5.6 Retry on a pending client succeeds when ERP responds
- [x] 5.7 Registration and retry emit an audit event
- [x] 5.8 Missing `cliente.crear` permission → `403`
