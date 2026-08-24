## Context

This is the capstone module: it reads from `apps.comercial` (assignments), `apps.empresas` (companies), and `apps.financiero` (payments, balances) without adding new source-of-truth data. `add-status-and-balance` already built the "as of date" assignment-resolution pattern (`_current_or_as_of`) and the per-entity balance functions — this change generalizes that into a small, table-driven query engine rather than duplicating the logic per report.

## Goals / Non-Goals

**Goals:**
- One flexible engine (`POST /api/reportes/consulta`) that both custom queries and the predefined catalog run through — no separate code path for "catalog reports".
- Correct reuse of the as-of-date resolution already proven in `add-status-and-balance`.
- Explicit, documented scope reduction rather than a half-built attempt at all 7 measures/11 catalog entries.

**Non-Goals:**
- `ingreso_neto`, `conteo_planes`, `consumo`, `excedente` measures (need plan-catalog browsing and `consumo_plan` data not modeled by `add-financial-cache`).
- Export functionality (PD-12 in `documentacion-funcional.md` §11 is explicitly an open item about export format).
- Full drag-and-drop dimension reordering in the UI — a simple ordered multi-select suffices for this delivery; TK-09-04's UX note is a future refinement, not a functional requirement.

## Decisions

- **Table-driven measure registry**: each measure (`adeudo`, `pagado`) is a small Python object declaring: supported dimensions, a function `rows_for(dimensions, filters, a_fecha) -> list[dict]`. The engine validates the requested dimensions against the measure's declared set (→ `400` on mismatch) and delegates execution to the measure's function. Adding `ingreso_neto` later is "register one more measure object", not "extend a growing if/elif chain".
- **`adeudo` measure implementation**: for dimensions `cliente`/`grupo`/`distribuidor`, reuses `apps.financiero.adeudo_service`'s per-entity functions grouped over the relevant entity ids (queried from `Assignment`/`Client`/`Group`/`Distributor`); for `empresa`, calls `adeudo_por_empresa` directly per company in the filtered set.
- **`pagado` measure implementation**: `Pago.objects.filter(estatus=Pago.ESTATUS_PAGADO, **filters).values(*dimension_fields).annotate(total=Sum("total"))` — a straight aggregate query, since `pagado` doesn't need assignment resolution the way `adeudo`'s aggregates do (payments already carry `empresa_id` directly).
- **Filters `proyecto`/`app` apply to the underlying `Company` queryset** (via `empresa__proyecto`, `empresa__app` where the fact table has an FK to `Company`); `adeudo_min` is applied as a post-aggregation filter on the computed measure value, since it constrains the result, not the source rows.
- **Catalog as data, not code**: `CATALOG = [{"key": ..., "label": ..., "medida": ..., "dimensiones": [...], "filtros": {...}}, ...]` — `GET /api/reportes/catalogo` returns this list (minus the actual query execution); running one is a normal `POST /api/reportes/consulta` call with that entry's fixed payload, satisfying "identical result" by construction (same code path).

## Risks / Trade-offs

- **Two different query strategies for `adeudo` vs `pagado`** (assignment-resolution vs direct aggregate) — accepted; they have genuinely different semantics (R-REP-01 requires assignment-based grouping for `adeudo`'s client/group/distributor dimensions, while `pagado` is a plain fact aggregate). Forcing one strategy would misrepresent one of the two measures.
- **Reduced measure/catalog scope vs. the full documented vision** → explicitly called out in the proposal's Impact section and here, not hidden; `docs/plan-implementacion.md` gets an open item for the deferred measures so the gap is tracked, matching the project's "no invented information, pending items recorded" principle already used throughout `documentacion-funcional.md` §11.

## Migration Plan

No new models — pure read logic. No migration.

## Open Questions

- When `ingreso_neto`/`conteo_planes`/`consumo`/`excedente` are prioritized, whether they need a `Plan` catalog sync beyond the lazy per-subscription caching `add-financial-cache` currently does.
