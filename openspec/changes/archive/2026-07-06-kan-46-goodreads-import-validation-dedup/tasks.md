# Tasks — KAN-46 Goodreads validation + dedup

Jira: KAN-46 (US-13 / KAN-43)

## 0. Setup

- [x] 0.1 Branch `feature/KAN-46-goodreads-import-validation-dedup`
- [x] 0.2 OpenSpec change `kan-46-goodreads-import-validation-dedup`

## 1. Backend

- [x] 1.1 `goodreads-dedup.util.ts` — dedup key normalization
- [x] 1.2 `goodreads-import.processor.ts` — validate, dedupe, persist
- [x] 1.3 Wire processor in `ImportService` + module TypeORM
- [x] 1.4 Unit + integration tests
- [x] 1.5 `docs/api-spec.yml`

## 2. Verification

- [x] 2.1 `npm test -- goodreads` + `npm run test:integration -- import.integration-spec`
