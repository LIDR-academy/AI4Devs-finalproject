## Context

The ERP Gateway already exposes `get_plans`, `get_payments`, `get_billing_cycles` returning DTOs keyed by `(proyecto, id_externo)` (`add-erp-gateway`). Companies are mirrored locally with that same identity (`add-company-retrieval`). This change is the first to persist ERP *financial* data locally, setting up F8 (status/balance) and F9 (reporting) which read this cache rather than calling the ERP directly.

## Goals / Non-Goals

**Goals:**
- Cache-aside sync: reading a company's financial detail triggers a best-effort refresh, then serves whatever is in the cache (fresh or stale).
- Exact `Decimal` amounts, itemized, never recomputed.
- Clean separation from status derivation and balance aggregation (F8) — this change only caches and serves raw data.

**Non-Goals:**
- `EstatusPlanService` (current/expired/blocked derivation) — `add-status-and-balance`.
- `AdeudoService` (outstanding balance aggregation by client/group/distributor) — `add-status-and-balance`.
- Scheduled/periodic sync (Celery beat or similar) — deferred; PD-10 in `documentacion-funcional.md` §11 is an open item about sync periodicity. This change only does on-demand sync.

## Decisions

- **New `apps/financiero` app**, matching `readme.md` §2.3 (`apps/financiero/`).
- **`ERPFinanceService.sync_company(company)` upserts by ERP id**: `EmpresaPlan.objects.update_or_create(empresa=company, id_externo=dto.id_externo, defaults={...})`, same idempotent-upsert pattern as `add-company-retrieval`'s `Company` mirror. Same for `Pago` and `CortePlan`.
- **Sync failure is caught inside the service, not the view.** `sync_company` swallows `ERPUnavailableError` and returns whatever is already cached; it does NOT swallow `ERPValidationError` (a genuine ERP-side problem worth surfacing, not just staleness) — though in practice the read-only GET endpoints used here are not expected to return validation errors from a well-formed request.
- **`DecimalField(max_digits=12, decimal_places=2)` for every amount**, matching MXN precision; ERP DTO amounts arrive as strings and are converted via `Decimal(str(...))`, never `float(...)`.
- **`Plan` and `Complemento` are cached lazily too**, upserted the first time they're referenced by an `EmpresaPlan`/`CortePlan` sync, keyed by `(proyecto, id_externo)` like companies — avoids a separate "sync all plans" step for this delivery.
- **No new own-data model for `Company`'s "current plan pointer"** — "current plan" is a query (`EmpresaPlan.objects.filter(empresa=company).order_by("-fecha_inicio").first()` today; F8's `EstatusPlanService` refines "current" using the grace-period rules).

## Risks / Trade-offs

- **On-demand-only sync means data can be stale between visits** — accepted for this delivery; periodic sync is an explicit open item (PD-10), not silently dropped.
- **Lazy Plan/Complemento caching could create partial catalog data** (only plans that have ever been subscribed to are cached) — acceptable since nothing in this delivery needs a full plan catalog browse; if that need appears (e.g. reporting engine's plan dimension), a dedicated catalog sync can be added without changing this cache model.

## Migration Plan

Greenfield — new app, new tables. No rollback concerns.

## Open Questions

- Sync periodicity for a background job (PD-10) — explicitly deferred, not solved here.
- Whether `Plan`/`Complemento` will eventually need a dedicated full-catalog sync for reporting — revisit in `add-reporting-engine`.
