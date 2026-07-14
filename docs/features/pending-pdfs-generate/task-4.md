---
id: task-4
title: PdfDocumentsService — validate + normalize failures
slice: 1
scenarios: [s1, s12]
status: todo
paths: [libs/supabase-services/src/services/pdf-documents.service.ts, libs/supabase-services/src/services/pdf-documents.service.test.ts, libs/supabase-services/src/index.ts]
---

## Goal
Business layer over `PdfDocumentsDao`, mirroring `LessonsService` (abstract class):
`getDocuments()` normalizes DAO failures into a single `Error`; `deleteDocument(id)` rejects an
empty/blank id, then delegates, normalizing failures. No React, no direct Supabase.

## Done criteria
- [ ] Scenario(s) {s1, s12} covered: happy path delegates to the DAO; failures normalized
- [ ] Empty/blank id rejected before any DAO call
- [ ] Calls the DAO, never `getSupabase()` directly (layering rule)
- [ ] Barrel export from `@helsoft/supabase-services`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
Copy the `LessonsService` normalization/validation shape verbatim (proven precedent).
