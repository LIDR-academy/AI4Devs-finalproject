---
id: task-5
title: PdfExtractionService — validation + orchestration + typed result
slice: 1
scenarios: [s1, s4]
status: done
paths: [libs/services/src/services/pdf-extraction.service.ts, libs/services/src/services/index.ts]
---

## Goal
Create `PdfExtractionService` (abstract class, static methods): the business layer that orchestrates the happy-path upload+extract via `PdfUploadDao`, returning a typed `PdfExtractionResult`. This task wires the happy path only; client pre-validation and full error normalization land in Slice 2 (task-10, task-9).

## Done criteria
- [x] `PdfExtractionService.extract(input: PdfExtractionInput, userId)` generates the `documentId` (a dependency-free RFC4122-shaped v4 UUID — `crypto.randomUUID()` isn't universally available on Hermes/React Native), calls `PdfUploadDao` to upload + insert + invoke, and returns a typed `PdfExtractionResult` on success.
- [x] Calls DAOs only — never `fetch`/Supabase directly; no React (per `hooks-service-dao.mdc`).
- [x] Exported through `libs/services/src/services/index.ts`.
- [x] Scenarios @s1 (success result shape) / @s4 (client goes through service→DAO, no parsing) covered by `pdf-extraction.service.test.ts` mocking `PdfUploadDao`.
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green.
- [x] No hardcoded strings/colors/dimensions; limits/bucket names from single-source constants.

## Notes
- Mirror `libs/services/src/services/auth.service.ts` shape (static abstract class, typed returns).
- Keep the method signature stable so Slice 2 can add pre-validation + error normalization without changing the hook/UI contract.
