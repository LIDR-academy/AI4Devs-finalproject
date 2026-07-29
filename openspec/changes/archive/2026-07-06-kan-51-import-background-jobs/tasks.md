# Tasks — KAN-51 Import background jobs

Jira: KAN-51 (US-14 / KAN-48)

## 0. Setup

- [x] 0.1 Branch `feature/KAN-51-import-background-jobs`
- [x] 0.2 OpenSpec change `kan-51-import-background-jobs`

## 1. Backend

- [x] 1.1 `import_jobs` entity + migration
- [x] 1.2 Job runner + rate limiter + catalog retry
- [x] 1.3 POST 202 + GET job status endpoints
- [x] 1.4 Unit + integration tests, api-spec, data-model

## 2. Verification

- [x] 2.1 `npm test` import job + processor specs
