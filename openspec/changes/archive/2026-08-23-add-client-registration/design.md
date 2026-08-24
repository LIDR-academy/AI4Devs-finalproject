## Context

First business module consuming the ERP Gateway (`add-erp-gateway`), auth/RBAC (`add-auth-rbac`), and audit (`add-audit-log`). Runs entirely against `ERP_MODE=mock` fixtures for now (`admin_clients.json` already has a found-RFC and any other RFC is not-found).

## Goals / Non-Goals

**Goals:**
- Search-then-create flow exactly as documented in `documentacion-funcional.md` §6.2, with graceful degradation to `pendiente`.
- Local RFC uniqueness checked before touching the ERP.
- Retry path for previously-pending clients.

**Non-Goals:**
- Company retrieval or assignment (separate changes, `add-company-retrieval` / `add-commercial-structure`).
- Any UI polish beyond a functional form + status badge.

## Decisions

- **New `apps/clientes` app**, matching `readme.md` §2.3 file layout.
- **Gateway errors mapped directly at the view/service layer**: `ERPUnavailableError` → save `pendiente`, respond `202`; `ERPValidationError` → respond `400` with the ERP message, no local record persisted (nothing to roll back — the record is only created after the gateway call succeeds or is confirmed unavailable). *Alternative:* always create a local row first in `pendiente` state then update — rejected for the validation-error path since the spec explicitly says "no local client record is created" on ERP validation failure (the RFC was rejected outright, not merely delayed).
- **A single service function `register_or_link_client(rfc, razon_social)`** encapsulates the local-uniqueness-check → gateway-search → gateway-create-if-absent → persist flow, reused identically by both the create endpoint and the retry endpoint (retry just re-runs the same function against an existing pending record).
- **Retry does not require re-submitting `razon_social`** — it's already stored on the pending record from the original request.

## Risks / Trade-offs

- **Retry storms if many clients are pending and a script hits `/retry` repeatedly** → out of scope for this delivery (no rate limiting yet); acceptable for an internal tool at this stage.
- **RFC format validation is minimal** (documented as "standard length and pattern" but not pinned down) → use a permissive non-empty check now; tighten when the exact RFC pattern is confirmed (open item in `documentacion-funcional.md` §11).

## Migration Plan

Greenfield — new app, new table. No rollback concerns beyond dropping the app.

## Open Questions

- Exact RFC validation pattern (length/checksum) — open item, not blocking this delivery.
