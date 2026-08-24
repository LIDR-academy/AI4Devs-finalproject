## Context

Second business module consuming the ERP Gateway. Unlike client registration (which writes to the ERP), this module is strictly read-only toward the ERP — it only ever creates/updates its own local mirror.

## Goals / Non-Goals

**Goals:**
- Search without persistence; retrieval with idempotent upsert by `(proyecto, id_externo)`.
- A reusable "is this company eligible for assignment" guard that `add-commercial-structure` can import directly, so the `baja_erp` rule is enforced once.

**Non-Goals:**
- Any assignment logic itself (client/group/distributor) — that's `add-commercial-structure`.
- Financial data (plans/payments) for a company — that's `add-financial-cache`.

## Decisions

- **New `apps/empresas` app**, matching `readme.md` §2.3.
- **Upsert via `Company.objects.update_or_create(proyecto=..., id_externo=..., defaults={...})`** keyed on a DB-level unique constraint on `(proyecto, id_externo)`, guaranteeing the "repeated retrieval refreshes, never duplicates" requirement at the engine level, not just in application code.
- **Search never touches the local table.** It's a pure passthrough to `gateway.search_companies(proyecto, query)`, returning ERP DTOs directly (serialized), so results are always fresh and never confused with mirror state.
- **`is_eligible_for_assignment(company)` helper function** exported from `apps.empresas.services`, returning `False` when `estado == "baja_erp"`. `add-commercial-structure` will import and call it rather than re-checking `estado` inline, keeping the rule in one place.

## Risks / Trade-offs

- **Search is always a live ERP call (or mock call)** — acceptable latency-wise for mock/dev; if the real webservice is slow, this is exactly the kind of case the documented "dependency on ERP availability" trade-off (readme.md §2.1) already calls out, mitigated later by the financial cache's own caching pattern, not by caching search results.
- **No pagination on search results yet** — fixtures and expected real result sets are small for this delivery; add pagination if/when it becomes a real problem.

## Migration Plan

Greenfield — new app, new table with a unique constraint on `(proyecto, id_externo)`. No rollback concerns.

## Open Questions

- None blocking; assignment eligibility rules beyond `baja_erp` (e.g. inactive companies) are deferred to `add-commercial-structure`'s own design.
