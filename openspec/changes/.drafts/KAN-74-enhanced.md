## Original

**KAN-74**: [Formato 4/5] Borrado de formato con confirmación y recuento de lecturas afectadas

**Goal:** Confirmation with affected reading count when deleting a format, same pattern as KAN-62/KAN-68.

**Technical tasks:**
- Backend: `DELETE /v1/formats/{id}` — count `reading_records` with that `format_id` before confirm.
- Frontend: confirmation modal "Este formato está asignado a N lecturas. Si lo borras, se quedarán sin formato. ¿Continuar?"; direct delete when no readings assigned.
- Clearing relies on `ON DELETE SET NULL` (KAN-71).

**BDD:**
1. Given a format with assigned readings, when user clicks delete, then they see affected reading count before confirming.
2. Given user confirms delete, when complete, then those readings have blank format.

**Tests:** Unit for affected reading count; integration for DELETE with assigned readings → `format_id = NULL`.

**References:** Parent KAN-70; depends on KAN-71; same pattern as KAN-62, KAN-68.

## Enhanced

Add a **delete-impact preview** endpoint and Settings UI confirmation before deleting a formato that is assigned to reading records. Reuse existing `DELETE /v1/formats/{id}` (KAN-72); no schema changes (`ON DELETE SET NULL` already in KAN-71 migration).

### API

| Endpoint | Behavior |
|----------|----------|
| `GET /v1/formats/{id}/affected-readings` | Returns `{ affected_reading_count: number }` for owned format; 404 if not found / not owned |
| `DELETE /v1/formats/{id}` | Unchanged — removes format; DB sets `reading_records.format_id` to NULL |

### Backend files

- `backend/src/formats/formats.service.ts` — `countAffectedReadings(userId, formatId)`; inject `ReadingRecord` repository
- `backend/src/formats/formats.controller.ts` — `GET :id/affected-readings` (before `:id` delete route ordering)
- `backend/src/formats/dto/affected-readings-response.dto.ts` (new)
- `backend/src/formats/formats.module.ts` — register `ReadingRecord` in `TypeOrmModule.forFeature`
- `backend/src/formats/formats.service.spec.ts` — unit test for count
- `backend/test/formats.integration-spec.ts` — GET count + existing DELETE clears `format_id`

### Frontend files

- `frontend/src/api/types.ts` — `FormatAffectedReadingsResponse`
- `frontend/src/api/client.ts` — `getFormatAffectedReadingCount(id)`
- `frontend/src/components/settings/FormatSettingsSection.tsx` — mirror `AudienceSettingsSection` delete preview + `ConfirmModal`

### Docs

- `docs/api-spec.yml` — document `GET /formats/{id}/affected-readings`

### Definition of done

- [ ] GET affected-readings count for owned formats (404 for foreign/missing)
- [ ] Settings delete shows confirmation when count > 0; immediate delete when 0
- [ ] After confirmed delete, `books` cache invalidated (already in place)
- [ ] Unit + integration tests pass
- [ ] OpenSpec delta specs for `formats-settings-api` and new `format-delete-confirmation`
