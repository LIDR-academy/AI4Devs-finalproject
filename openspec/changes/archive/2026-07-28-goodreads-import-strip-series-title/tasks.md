# Tasks — goodreads-import-strip-series-title

UC-08 Goodreads import: strip trailing series parentheses from `Title` and persist `series_name`.

## 0. Setup

- [x] 0.1 Create and switch to branch `feature/goodreads-import-strip-series-title`
- [x] 0.2 Confirm OpenSpec change artifacts under `openspec/changes/goodreads-import-strip-series-title/`

## 1. Backend (TDD)

- [x] 1.1 Add failing unit tests in `backend/src/import/goodreads/goodreads-row.mapper.spec.ts` for: series split (`The Raven Scholar (Eternal Path Trilogy, #1)`), plain title, empty-clean-title safety, Spanish-style series title
- [x] 1.2 Implement `parseGoodreadsTitle` (or equivalent) in `backend/src/import/goodreads/goodreads-row.mapper.ts`: strip trailing `(…)` groups; derive `series_name` without volume marker; empty-clean safety
- [x] 1.3 Extend `GoodreadsImportBookDraft` in `backend/src/import/goodreads/goodreads-import.types.ts` with `series_name: string | null`; wire mapper output
- [x] 1.4 Pass `series_name` in `catalogEditions.upsert` from `backend/src/import/goodreads/goodreads-import.processor.ts`; update processor unit test expectations if needed
- [x] 1.5 Review and update existing unit tests (MANDATORY): `goodreads-row.mapper.spec.ts`, `goodreads-import.processor.spec.ts`, fixtures that assert full titles

## 2. Verification (MANDATORY — AGENT MUST EXECUTE)

- [x] 2.1 Run unit tests and verify database state (MANDATORY — AGENT MUST EXECUTE): targeted `npm test -- goodreads-row.mapper` / processor specs, then broader import-related suite; write report to `openspec/changes/goodreads-import-strip-series-title/specs/goodreads-field-mapping/reports/YYYY-MM-DD-step-2.1-unit-test-and-db-verification.md`
- [x] 2.2 Manual endpoint testing with curl (MANDATORY — AGENT MUST EXECUTE): JWT + multipart `POST /v1/import/goodreads` (or preview) with a minimal CSV row titled `The Raven Scholar (Eternal Path Trilogy, #1)`; assert imported/mapped title is clean and `series_name` persisted; restore DB; document in `.../reports/YYYY-MM-DD-step-2.2-curl-manual.md`
- [x] 2.3 E2E with Playwright (N/A — no frontend changes for this change)
- [x] 2.4 Update technical documentation (MANDATORY): note title-normalization rule under Goodreads mapping if documented; keep `docs/data-model.md` consistent if `series_name` on import is mentioned; no API contract change expected in `docs/api-spec.yml` unless drafts are exposed
