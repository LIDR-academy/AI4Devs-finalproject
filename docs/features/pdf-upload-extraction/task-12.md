---
id: task-12
title: Hook error/retry + wiring error handling + error-path integration
slice: 2
scenarios: [s13, s14]
status: done
paths: [libs/hooks/src/hooks/use-pdf-extraction.ts, libs/study-buddy/src/components/pdf-upload/]
---

## Goal
Complete the error/retry flow end-to-end: `usePdfExtraction` exposes the typed error + a retry that re-runs the last upload, and handles client transport failures as `network_error`; the `PdfUpload` wiring maps error codes → localized messages and passes the retry callback to `PdfUploadPanel`. Add the slice-2 error-path integration test.

## Done criteria
- [ ] `usePdfExtraction`: `stage: 'error'` with a typed `error: PdfExtractionErrorCode`; `retry()` re-invokes the last extraction; transport failure surfaces `network_error`. *(→ @s13)*
- [ ] `PdfUpload` wiring: maps each `PdfExtractionErrorCode` → its `t('upload.error.*')` message and wires `retry`/choose-another into `PdfUploadPanel`; @s14 unauthenticated surfaced as a clear signed-in-required error.
- [ ] Scenarios @s13 (network error → retry → success) / @s14 (unauthenticated denial surfaced) covered by `use-pdf-extraction.test.ts` + wiring test + a slice-2 integration test (error then successful retry, mocked Supabase/invoke).
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded user-facing strings (all via `t()`).

## Notes
- Retry re-runs the same upload+invoke; ensure no duplicate orphaned rows (reuse the `documentId` or clean up — coordinate with task-9's failure cleanup).
- Depends on task-6 (hook), task-9/10 (error contract), task-11 (Error/Empty UI).
