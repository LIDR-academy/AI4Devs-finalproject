# Tasks — KAN-44 Goodreads CSV parser

Jira: KAN-44 (US-13 / KAN-43)

## 0. Setup

- [x] 0.1 Branch `feature/KAN-44-goodreads-csv-parser`
- [x] 0.2 OpenSpec change `kan-44-goodreads-csv-parser`
- [x] 0.3 Fixture `backend/test/fixtures/goodreads_library_export.csv`

## 1. Backend

- [x] 1.1 `goodreads-csv.parser.ts` — UTF-8, quoted fields, ISBN cleanup
- [x] 1.2 `ImportModule` + `POST /v1/import/goodreads` (multipart)
- [x] 1.3 Unit tests + integration tests
- [x] 1.4 `docs/api-spec.yml`

## 2. Verification

- [x] 2.1 `npm test` parser + `npm run test:integration -- import.integration-spec`
