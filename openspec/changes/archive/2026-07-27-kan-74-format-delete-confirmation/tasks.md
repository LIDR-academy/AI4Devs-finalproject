## 1. Backend

- [x] 1.1 Add `countAffectedReadings` and `GET /v1/formats/{id}/affected-readings`
- [x] 1.2 Update `docs/api-spec.yml`
- [x] 1.3 Unit + integration tests (count and delete clears `format_id`)

## 2. Frontend

- [x] 2.1 Add API client for affected reading count
- [x] 2.2 Confirmation modal in `FormatSettingsSection` (skip when count is 0)
- [x] 2.3 Invalidate `['books']` after delete (verify existing behavior)

## 3. Verification

- [x] 3.1 Run targeted backend tests
