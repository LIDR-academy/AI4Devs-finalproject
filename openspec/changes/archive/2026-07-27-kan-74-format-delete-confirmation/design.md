## Context

KAN-72 added formats CRUD; KAN-73 wired reading records to `format_id`. Deleting a format already cascades to `reading_records.format_id = NULL` via `ON DELETE SET NULL` (KAN-71 migration). KAN-74 adds user-visible impact preview and confirmation.

## Goals / Non-Goals

**Goals:**
- Expose affected reading count before delete.
- Confirm only when count > 0.
- Prove reading records are cleared after delete in integration tests.

**Non-goals:**
- Rename formats (out of epic).
- Block delete when readings are assigned (user may proceed after confirmation).
- Stats adaptation (KAN-75).

## Decisions

### 1. Dedicated preview endpoint

`GET /v1/formats/{id}/affected-readings` rather than embedding count in list response.

**Rationale:** Count is only needed on delete; avoids extra joins on every list call.

### 2. Reuse existing DELETE

No change to `DELETE /v1/formats/{id}` semantics; confirmation is client-side after preview.

### 3. Frontend modal

Use existing `ConfirmModal` from `frontend/src/components/ui`, mirroring `AudienceSettingsSection`.

## Risks / Trade-offs

- **Stale count** — readings may change between preview and delete; acceptable for MVP (count is advisory).
- **Extra round-trip** — one GET before delete when count > 0.

## Migration Plan

None — schema unchanged.
