## Context

This is the highest-risk module on the critical path (per `docs/plan-implementacion.md` F6): it must guarantee, even under concurrency, that only one current assignment of a given type exists per entity — a guarantee that must live in the database, not just application code. It builds on `Client` (`add-client-registration`), `Company`/`is_eligible_for_assignment` (`add-company-retrieval`), RBAC (`add-auth-rbac`), and audit (`add-audit-log`).

## Goals / Non-Goals

**Goals:**
- Partial unique index enforced by PostgreSQL, verified by an actual concurrency test (two transactions racing for the same current assignment).
- Correct close-then-open semantics with an accurate audit trail.
- Distributor inheritance and the group-vs-direct-distributor conflict exactly as documented (R-EST-04).

**Non-Goals:**
- Financial cache or status/balance aggregation by client/group/distributor — that's `add-financial-cache`/`add-status-and-balance`, which will read this module's `Assignment` table but isn't built here.
- "As of date" historical queries — `add-reporting-engine` builds that on top of the same `Assignment` rows; this change only guarantees the rows are correct.

## Decisions

- **New `apps/comercial` app**, matching `readme.md` §2.3.
- **`Assignment.origen_id` / `destino_id` are plain UUID/int fields, not FKs** — polymorphic by `tipo` (`empresa-cliente`, `empresa-grupo`, `empresa-dist`, `grupo-dist`), exactly as documented in `documentacion-funcional.md` §7.2/TK-04-01 technical notes: "no direct FK to source/target entities (polymorphic per tipo)... trade-off: simplifies the model at the cost of no referential integrity in DB... Integrity is guaranteed by the service." The service (`AsignacionService`) validates existence via each module's own manager before writing.
- **Partial unique index via Django's `UniqueConstraint(condition=Q(fecha_fin__isnull=True))`** (Django 4.2+, confirmed available in this project's Django 6.1) — translates directly to `CREATE UNIQUE INDEX ... WHERE fecha_fin IS NULL`. A `CheckConstraint` enforces `fecha_fin IS NULL OR fecha_fin > fecha_inicio`.
- **`AsignacionService.asignar(tipo, origen_id, destino_id, usuario)` is the single write path.** It: (1) checks `is_eligible_for_assignment` for company-origin types, (2) validates the target entity exists, (3) for `empresa-dist` checks the company has no current group (R-EST-04), (4) closes the current assignment for `(origen_id, tipo)` if any, (5) creates the new one inside a transaction, relying on the partial unique index as the final safety net against races, (6) emits the audit event.
- **`Company.grupo_actual` / `.distribuidor_efectivo` computed via a read helper**, not denormalized columns — avoids a second source of truth; readme.md's `Empresa.cliente_id/grupo_id/distribuidor_id` "current pointers" are implemented as **queries over `Assignment`** (latest row with `fecha_fin IS NULL` for that `(origen_id, tipo)`), not literal FK columns on `Company`, keeping the single source of truth in `Assignment`. *Alternative considered:* denormalized current-pointer columns on `Company` as the doc's ER diagram suggests — rejected for this delivery to avoid dual-write consistency bugs; can be added later purely as a read-performance cache if querying `Assignment` proves slow.
- **Distributor inheritance is computed, not stored**: a company's *effective* distributor is its direct current `empresa-dist` assignment if one exists, else its group's current `grupo-dist` assignment. No separate write happens when a company joins a group — inheritance is a read-time computation over two `Assignment` lookups.

## Risks / Trade-offs

- **No FK integrity on `origen_id`/`destino_id`** → accepted, matches the documented trade-off; mitigated by service-level existence checks before every write.
- **Computed current-pointers mean every read does 1-2 extra queries per company** → acceptable at this scale; `add-financial-cache`/`add-status-and-balance` can introduce read-optimized aggregation later if needed, without changing the write path here.
- **Concurrency test requires two real overlapping transactions** → use Django's `transaction.atomic()` plus a second DB connection/thread in the test to genuinely race two inserts, not just call the service twice sequentially (which wouldn't exercise the DB-level guarantee).

## Migration Plan

Greenfield — new app, new tables. The partial unique index migration is the one piece worth double-checking after `makemigrations`: verify the generated SQL contains `WHERE "fecha_fin" IS NULL` before applying in any shared environment.

## Open Questions

- Whether `Company` should eventually get denormalized current-pointer columns for read performance — deferred until `add-reporting-engine` or `add-status-and-balance` show it's needed.
