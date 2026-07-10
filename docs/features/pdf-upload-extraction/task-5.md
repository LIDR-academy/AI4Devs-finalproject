---
id: task-5
title: PdfExtractionService — validation + orchestration + typed result
slice: 1
scenarios: [s1, s4]
status: todo
paths: [libs/services/src/services/pdf-extraction.service.ts, libs/services/src/services/index.ts]
---

## Goal
Create `PdfExtractionService` (abstract class, static methods): the business layer that orchestrates the happy-path upload+extract via `PdfUploadDao`, returning a typed `PdfExtractionResult`. This task wires the happy path only; client pre-validation and full error normalization land in Slice 2 (task-10, task-9).

## Done criteria
- [ ] `PdfExtractionService.extract(file, userId)` (or similar) generates the `documentId`, calls `PdfUploadDao` to upload + insert + invoke, and returns a typed `PdfExtractionResult` on success.
- [ ] Calls DAOs only — never `fetch`/Supabase directly; no React (per `hooks-service-dao.mdc`).
- [ ] Exported through `libs/services/src/services/index.ts`.
- [ ] Scenarios @s1 (success result shape) / @s4 (client goes through service→DAO, no parsing) covered by `pdf-extraction.service.test.ts` mocking `PdfUploadDao`.
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [ ] No hardcoded strings/colors/dimensions; limits/bucket names from single-source constants.

## Notes
- Mirror `libs/services/src/services/auth.service.ts` shape (static abstract class, typed returns).
- Keep the method signature stable so Slice 2 can add pre-validation + error normalization without changing the hook/UI contract.
