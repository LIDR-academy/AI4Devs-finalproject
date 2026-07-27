## Why

Deleting a formato that is assigned to reading records has data impact: those readings lose their format label. Users need to see how many readings are affected before confirming, matching the audience-delete pattern (KAN-68).

## What Changes

- Add `GET /v1/formats/{id}/affected-readings` returning `{ affected_reading_count }` for owned formats.
- Settings delete flow: fetch count on click; show confirmation modal when count > 0; direct delete when count is 0.
- Invalidate books cache after delete so tracker rows reflect cleared `format_id`.

## Capabilities

### New Capabilities

- `format-delete-confirmation`: Affected-reading count preview and Settings confirmation UX before delete.

### Modified Capabilities

- `formats-settings-api`: Extend delete flow requirements with affected-reading count endpoint and confirmation behavior.

## Impact

- `backend/src/formats/` (service, controller, module, DTO, tests)
- `frontend/src/components/settings/FormatSettingsSection.tsx`, `frontend/src/api/client.ts`
- `docs/api-spec.yml`
