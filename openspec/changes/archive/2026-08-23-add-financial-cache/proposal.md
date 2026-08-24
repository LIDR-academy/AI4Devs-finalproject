## Why

Companies now have identity (`add-company-retrieval`) and commercial relationships (`add-commercial-structure`), but their financial data — plans, subscriptions, payments, billing cycles — still lives only in the ERPs. Querying it live on every request would be slow and would defeat the reporting engine planned later. `documentacion-funcional.md` §6.5/§6.6 documents a **local cache** synced from the ERP through the Gateway, always read-only toward the ERP, carrying `ultima_sync`.

## What Changes

- Cache models: `Plan`, `Complemento`, `EmpresaPlan` (subscription), `Pago` (payment), `CortePlan` (billing cycle) — mirroring the ERP's documented schema (R-PLN-01/02, R-PAG-01/03/05).
- `ERPFinanceService.sync_company(empresa)`: reads plans/payments/billing-cycles for one company from the ERP Gateway and upserts the cache, stamping `ultima_sync` on each row.
- Sync runs on-demand when a company's financial detail is requested (cache-aside), matching the documented error scenario: "ERP unavailable during sync → last cached version is served with visible `ultima_sync`."
- Endpoints: `GET /api/empresas/{id}/planes` (current + historical subscriptions), `GET /api/empresas/{id}/pagos` (payments), triggering a sync attempt first.
- Amounts stored itemized (`subtotal`, `importe_descuento`, `impuesto`, `total`) as `Decimal`, never recomputed from `float`.

## Capabilities

### New Capabilities
- `financial-cache`: Local, read-only cache of ERP plan and payment data per company, synced through the ERP Gateway, covering R-PLN-01/02/06/07/08 and R-PAG-01..07 from `documentacion-funcional.md`.

### Modified Capabilities
<!-- None. -->

## Impact

- **New code:** `backend/apps/financiero/` (`Plan`, `Complemento`, `EmpresaPlan`, `Pago`, `CortePlan` models + migration, `ERPFinanceService`, serializers, views, urls), `frontend/src/pages/CompanyDetailPage.tsx` extended with a financial profile section.
- **Dependencies:** consumes `services.erp.gateway.get_erp_gateway()` (`get_plans`, `get_payments`, `get_billing_cycles`) and `apps.empresas.models.Company`. No new external dependency.
- **Downstream:** `add-status-and-balance` (F8) derives operational status and outstanding balance from these cache tables; `add-reporting-engine` (F9) builds its star-model queries on top of them.
- **Docs:** implements Epic 07 (`TK-07-01` through `TK-07-05`) from `documentacion-funcional.md` §6.5, §6.6, §10.1. Status derivation (`EstatusPlanService`) and outstanding-balance aggregation (`AdeudoService`) are explicitly out of scope here — they are Epic 08, delivered by `add-status-and-balance`.
