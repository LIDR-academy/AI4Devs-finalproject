# Tasks — KAN-45 Goodreads field mapping

Jira: KAN-45 (US-13 / KAN-43)

## 0. Setup

- [x] 0.1 Branch `feature/KAN-45-goodreads-field-mapping`
- [x] 0.2 OpenSpec change `kan-45-goodreads-field-mapping`

## 1. Backend

- [x] 1.1 `goodreads-import.types.ts` + `goodreads-row.mapper.ts`
- [x] 1.2 Wire mapper in `ImportService`; extend parse response
- [x] 1.3 Unit tests (min fixture edge cases)
- [x] 1.4 Integration test + `docs/api-spec.yml`

## 2. Verification

- [x] 2.1 `npm test` mapper + `npm run test:integration -- import.integration-spec`
