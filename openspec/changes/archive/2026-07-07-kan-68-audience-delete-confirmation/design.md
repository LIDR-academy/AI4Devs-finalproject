## Context

KAN-66 added audiences CRUD; KAN-67 wired books to `audience_id`. Deleting an audience already cascades to `books.audience_id = NULL` via `ON DELETE SET NULL` (KAN-65 migration). KAN-68 adds user-visible impact preview and confirmation.

## Goals / Non-Goals

**Goals:**
- Expose affected book count before delete.
- Confirm only when count > 0.
- Prove books are cleared after delete in integration tests.

**Non-goals:**
- Rename audiences (out of epic).
- Block delete when books are assigned (user may proceed after confirmation).
- Genre delete (KAN-62) — parallel pattern only.

## Decisions

### 1. Dedicated preview endpoint

`GET /v1/audiences/{id}/affected-books` rather than embedding count in list response.

**Rationale:** Count is only needed on delete; avoids extra joins on every list call.

### 2. Reuse existing DELETE

No change to `DELETE /v1/audiences/{id}` semantics; confirmation is client-side after preview.

### 3. Frontend modal

Use existing `ConfirmModal` from `frontend/src/components/ui/Modal.tsx`.

## Risks / Trade-offs

- **Stale count** — books may change between preview and delete; acceptable for MVP (count is advisory).
- **Extra round-trip** — one GET before delete when count > 0; direct delete skips GET when user confirms from cached count (fetch on click always).

## Migration Plan

None — schema unchanged.
