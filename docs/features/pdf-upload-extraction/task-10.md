---
id: task-10
title: Client pre-validation — file type + size reject before upload
slice: 2
scenarios: [s9, s10]
status: done
paths: [libs/supabase-services/src/services/pdf-extraction.service.ts]
---

## Goal
Reject bad files cheaply on the client before any network work: non-PDF files (`unsupported_file_type`) and over-size files (`file_too_large`). Validation lives in `PdfExtractionService` (business logic per `hooks-service-dao.mdc`), so the hook/UI just surface the typed error.

## Done criteria
- [ ] `PdfExtractionService` validates the picked file **before** calling `PdfUploadDao`: non-PDF (mime/extension) ⇒ reject with `unsupported_file_type`; size > `maxSizeBytes` ⇒ reject with `file_too_large`. No upload occurs on rejection.
- [ ] Both read from the single-source `PDF_EXTRACTION_LIMITS` (`maxSizeBytes` = 10 MB, spec decision #1) in `libs/supabase-services/src/services/pdf-extraction.constants.ts` and the accepted-type constant — no inline magic numbers.
- [ ] Scenarios @s9 (non-PDF) / @s10 (over size) covered by `pdf-extraction.service.test.ts` asserting the typed rejection and that no DAO upload is invoked.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings/colors/dimensions (limits from the constant; messages localized in UI).

## Notes
- Server keeps an authoritative size backstop (task-9) — client checks are UX, not the security boundary.
- Depends on task-5 (service) + task-9 (error union already in service). Keep the `extract()` signature stable.
