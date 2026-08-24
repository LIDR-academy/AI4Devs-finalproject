## Context

This change closes the loop between the financial cache (`add-financial-cache`) and the commercial structure (`add-commercial-structure`): it is the first module to aggregate across both. `readme.md` Ticket 1 (`TK-08-02`) specifies `AdeudoService`'s exact interface and performance target (distributor with 1000 companies < 500ms), which this design targets directly.

## Goals / Non-Goals

**Goals:**
- Status derivation exactly matching the ERP-verified rules in `reglas_cobranza.md` (R-PLN-03/04/05).
- Balance aggregation functions with the exact signatures from `readme.md` Ticket 1: `adeudo_por_empresa`, `adeudo_por_cliente`, `adeudo_por_grupo`, `adeudo_por_distribuidor`, each with an `a_fecha` variant.
- Correct distributor aggregation: direct companies + companies inherited via group (mirroring `distribuidor_efectivo`'s inheritance logic from `add-commercial-structure`, but for a *set* of companies rather than one).

**Non-Goals:**
- The reporting engine's flexible `measure × dimensions × filters` query language — `add-reporting-engine` (F9) builds on top of these functions but this change only delivers the underlying services and simple per-entity endpoints.
- Scheduled recalculation or caching of balances — computed on read, matching the current scale.

## Decisions

- **`EstatusPlanService` as a pure function module**, not a class with state: `estado_derivado(empresa_plan: EmpresaPlan) -> str`. Takes the cached `EmpresaPlan` (with its related `Plan` for `plan.prorroga`) and today's date (injectable for testability), returns one of `vigente|vencido|bloqueado`. No new field is written back to `EmpresaPlan` — the cached `estatus` integer stays the ERP's raw value; `estado_derivado` is always computed, keeping a single source of truth (mirrors the `add-commercial-structure` decision to compute rather than denormalize).
- **`AdeudoService.adeudo_por_empresa(empresa_id, a_fecha=None)`**: `Pago.objects.filter(empresa_id=empresa_id, estatus=2).aggregate(Sum("total"))`, defaulting to `Decimal("0.00")`. Payments themselves aren't assignment-scoped (`Pago.empresa` is a direct FK), so `a_fecha` doesn't affect this one function — it exists on the signature for interface consistency with the aggregate functions, but per-company balance is always "as it is now" in the cache (payments aren't retroactively reassigned to different companies).
- **Client/group/distributor aggregation resolves "current companies" via `Assignment`.** For `a_fecha=None`, use `Assignment.objects.filter(destino_id=X, tipo=Y, fecha_fin__isnull=True)`. For a given `a_fecha`, use `fecha_inicio__lte=a_fecha, Q(fecha_fin__isnull=True) | Q(fecha_fin__gt=a_fecha)` — same pattern for both, parameterized by date, so there's exactly one query shape to test and reuse in `add-reporting-engine`.
- **Distributor aggregation = direct `empresa-dist` assignments to X, plus companies whose current `empresa-grupo` assignment targets a group that has (as of the same `a_fecha`) a `grupo-dist` assignment to X.** Implemented as two queries unioned by company id, then a single `Pago` aggregate over that id set — one query for the sum, not N+1 per company, to hit the documented performance target.
- **Rounding**: `Decimal` result quantized to 2 places with `ROUND_HALF_UP` at the end of each aggregation, not per payment (payments are already stored at 2 places from `add-financial-cache`).

## Risks / Trade-offs

- **"As of date" correctness depends entirely on `Assignment` history being complete and correctly closed** — already guaranteed by `add-commercial-structure`'s partial unique index and close-then-open discipline; this change adds no new integrity requirement, just reads.
- **1000-company distributor performance target** → mitigated by aggregating with a single `Sum` over a company-id `IN (...)` query rather than looping in Python; verified with a test creating ~1000 payments and asserting sub-second execution (500ms target from `readme.md` is a production/Postgres figure — the test asserts the query shape is O(1) roundtrips, not a hard wall-clock number under SQLite in CI).
- **`Pago.empresa` being a direct FK (not assignment-derived)** means a payment "belongs" to whichever company it was billed to at the time, which is correct per R-PAG-02 (billing is always at the company level) — no retroactive reassignment risk.

## Migration Plan

No new models — this change adds pure-function services and read endpoints only. No migration.

## Open Questions

- Whether `adeudo_por_empresa`'s `a_fecha` parameter should eventually filter payments by `fecha <= a_fecha` (i.e. "balance as it stood on that date") rather than being a no-op — left as a no-op for now since the documented rule only ties `a_fecha` to *assignment* history, not payment history; revisit if reporting needs point-in-time company balances too.
