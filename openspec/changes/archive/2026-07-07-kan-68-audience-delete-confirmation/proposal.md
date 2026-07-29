## Why

Deleting a público objetivo that is assigned to books has data impact: those books lose their audience label. Users need to see how many books are affected before confirming, matching the genre-delete pattern (KAN-62).

## What Changes

- Add `GET /v1/audiences/{id}/affected-books` returning `{ affected_book_count }` for owned audiences.
- Settings delete flow: fetch count on click; show confirmation modal when count > 0; direct delete when count is 0.
- Invalidate books cache after delete so tracker rows reflect cleared `audience_id`.

## Capabilities

### New Capabilities

- `audience-delete-confirmation`: Affected-book count preview and Settings confirmation UX before delete.

### Modified Capabilities

- `audiences-settings-api`: Extend delete flow requirements with affected-book count endpoint and confirmation behavior.

## Impact

- `backend/src/audiences/` (service, controller, module, DTO, tests)
- `frontend/src/components/settings/AudienceSettingsSection.tsx`, `frontend/src/api/client.ts`
- `docs/api-spec.yml`
