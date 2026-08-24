## Context

`add-auth-rbac` introduced `apps.accounts.audit.emit_audit_event(user, action, **details)` as a log-only placeholder specifically so call sites (login, user CRUD, role CRUD) wouldn't need to change once real persistence existed. This change delivers that persistence.

## Goals / Non-Goals

**Goals:**
- Durable, append-only record of sensitive actions.
- Zero change to existing call sites of `emit_audit_event`.
- A simple read endpoint + screen so an administrator can actually see the log (closing TK-06-03).

**Non-Goals:**
- Structured per-entity audit views (e.g. "history of this company") — the generic list is enough for this delivery; richer filtering can follow when a real need appears.
- Enforcing immutability at the database level (e.g. revoking UPDATE/DELETE grants) — enforced at the application layer (no serializer/view exposes those operations) for now; a DB-level guarantee is a hardening item for `harden-and-deploy`.

## Decisions

- **New `apps/auditoria` app** owning the `Bitacora` model, matching the documented file layout (`readme.md` §2.3 `apps/auditoria/`).
- **`emit_audit_event` moves its persistence logic behind a thin service call** (`apps.auditoria.services.record_event`) that `apps.accounts.audit.emit_audit_event` now delegates to, wrapped in a broad `try/except` that logs on failure rather than raising — matching the "never blocks the primary action" requirement. *Alternative considered:* making the audit write part of the same DB transaction as the action, failing the action if audit fails — rejected; over-couples an observability concern to business transactions for a documentation-phase v1.
- **`entidad_id` is a plain string/int, not a FK** — mirrors `Asignacion.origen_id` polymorphism decision documented in `documentacion-funcional.md` §7.3: the audited entity type varies (`Usuario`, `Cliente`, `Empresa`, ...), so a formal FK per entity type would be premature.
- **IP capture** taken from `request.META.get("REMOTE_ADDR")` where a request is available (views), `None` for background/system-triggered actions.

## Risks / Trade-offs

- **No DB-level immutability yet** → acceptable for now since only this codebase writes to Postgres; revisit before production hardening.
- **Broad exception swallowing on audit failure** → mitigated by logging at `ERROR` level so failures are visible in ops without blocking users.

## Migration Plan

Greenfield — new app, new table, no data migration needed beyond `migrate`. Rollback: drop the app/table; `emit_audit_event` callers are unaffected since the function signature doesn't change.

## Open Questions

- Whether the audit list needs pagination/filtering before the reporting engine (F9) ships — likely yes, revisit if the table grows large during later phases.
