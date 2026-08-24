## Why

`add-auth-rbac` already calls `emit_audit_event(...)` at login, user creation, and role edits, but that function is currently a log-only stub — nothing is persisted or queryable. EyeMaster handles sensitive commercial and financial data, and the documented security model requires an **append-only** record of sensitive actions (R-SEG-04, RI in `documentacion-funcional.md` §6.8). This change gives the stub a real, immutable backing store before any more sensitive actions (client registration, assignments) are added in later changes.

## What Changes

- `Bitacora` model: append-only (no `UPDATE`/`DELETE` allowed at the application layer) recording `usuario`, `accion`, `entidad`, `entidad_id`, `detalle`, `ip`, `fecha`.
- Replace the `emit_audit_event` stub body (from `add-auth-rbac`) to persist a `Bitacora` row instead of just logging.
- `GET /api/auditoria` endpoint to query the log, gated by the `auditoria.consultar` permission (already seeded).
- Minimal frontend screen listing audit entries (read-only table).

## Capabilities

### New Capabilities
- `audit`: Append-only recording and querying of sensitive actions across the system.

### Modified Capabilities
<!-- None: emit_audit_event's call sites don't change, only its implementation. -->

## Impact

- **New code:** `backend/apps/auditoria/` (model, migration, serializer, view), `frontend/src/pages/AuditLogPage.tsx`.
- **Changed code:** `apps/accounts/audit.py` — `emit_audit_event` now writes to `Bitacora` instead of just logging.
- **Downstream:** every later change that performs a sensitive action (client registration, company retrieval, assignments) calls the same `emit_audit_event` function — no call-site changes needed once this lands.
- **Docs:** implements §6.8 and Epic 06 (`TK-06-01`, `TK-06-02`, `TK-06-03`) of `documentacion-funcional.md`.
