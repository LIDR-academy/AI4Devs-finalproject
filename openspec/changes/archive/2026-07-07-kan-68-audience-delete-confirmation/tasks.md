## 1. Backend

- [x] 1.1 Add `countAffectedBooks` and `GET /v1/audiences/{id}/affected-books`
- [x] 1.2 Update `docs/api-spec.yml`
- [x] 1.3 Unit + integration tests (count and delete clears `audience_id`)

## 2. Frontend

- [x] 2.1 Add API client for affected book count
- [x] 2.2 Confirmation modal in `AudienceSettingsSection` (skip when count is 0)
- [x] 2.3 Invalidate `['books']` after delete

## 3. Verification

- [x] 3.1 Run targeted backend tests
