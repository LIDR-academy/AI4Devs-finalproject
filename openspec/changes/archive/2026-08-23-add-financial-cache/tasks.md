## 1. Backend: financiero app and cache models

- [x] 1.1 Create `apps/financiero` Django app
- [x] 1.2 `Plan` model: `proyecto`, `id_externo`, `nombre`, unique `(proyecto, id_externo)`
- [x] 1.3 `Complemento` model: `clave`, `nombre`
- [x] 1.4 `EmpresaPlan` model: `empresa` FK, `id_externo`, `plan` FK, `tipo_contrato`, `estatus`, `fecha_inicio`, `fecha_final`, `prorroga`, `precio_unitario` (Decimal), `ultima_sync`; unique `(empresa, id_externo)`
- [x] 1.5 `Pago` model: `empresa` FK, `empresa_plan` FK, `id_externo`, `estatus`, `subtotal`/`importe_descuento`/`impuesto`/`total` (Decimal), `fecha`, `ultima_sync`; unique `(empresa, id_externo)`
- [x] 1.6 `CortePlan` model: `empresa_plan` FK, `id_externo`, `complemento` FK, `cantidad`/`excedente` (Decimal), `periodo_inicio`, `periodo_final`
- [x] 1.7 Migration

## 2. Backend: ERPFinanceService

- [x] 2.1 `sync_company(company)`: get_plans/get_payments/get_billing_cycles via Gateway, upsert `Plan`/`Complemento` lazily, upsert `EmpresaPlan`/`Pago`/`CortePlan`, stamp `ultima_sync`
- [x] 2.2 Swallow `ERPUnavailableError`, serve existing cache
- [x] 2.3 Convert all ERP amount strings via `Decimal(str(...))`, never `float`

## 3. Backend: endpoints

- [x] 3.1 `GET /api/empresas/{id}/planes` gated by `financiero.consultar`, triggers sync then returns cached `EmpresaPlan` rows
- [x] 3.2 `GET /api/empresas/{id}/pagos` gated by `financiero.consultar`, triggers sync then returns cached `Pago` rows
- [x] 3.3 Empty list (not error) when no subscription/payments exist

## 4. Frontend

- [x] 4.1 `financialService.ts` — `getPlans(empresaId)`, `getPayments(empresaId)`
- [x] 4.2 Financial profile section on `CompanyDetailPage.tsx`: current/historical plans, payments list, visible `ultima_sync`

## 5. Tests

- [x] 5.1 Sync creates `EmpresaPlan`/`Pago`/`CortePlan` rows with correct `Decimal` amounts from mock fixtures
- [x] 5.2 Sync only calls read methods on the ERP Gateway (spy/assert no write methods called)
- [x] 5.3 Repeated sync updates existing rows, does not duplicate
- [x] 5.4 ERP unavailable during sync → existing cached data still served, no error
- [x] 5.5 `tipo_contrato` preserved for freemium subscriptions
- [x] 5.6 Company with no subscriptions → `200` with empty list
- [x] 5.7 Missing `financiero.consultar` permission → `403`
