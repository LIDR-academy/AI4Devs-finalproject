---
id: task-3
title: PdfDocumentsDao — list from view (derive status); delete purges storage + row
slice: 1
scenarios: [s1, s4, s12, s17, s18, s19]
status: done
paths: [libs/supabase-services/src/dao/pdf-documents.dao.ts, libs/supabase-services/src/dao/pdf-documents.dao.test.ts, libs/supabase-services/src/index.ts]
---

## Goal
Raw Supabase data access, mirroring `LessonsDao` (abstract class, static methods, RLS-scoped, never
filters by a client-supplied user id):
- `getDocuments(): Promise<PdfDocumentSummary[]>` — `select` from the `user_documents` view ordered
  `created_at` desc; map each row → `PdfDocumentSummary`, deriving `status`: `lesson_id` present →
  `'generated'` (carry `lessonId`); else `generation_error_code` non-null → `'failed'`; else →
  `'ready'` (`lessonId: null`).
- `deleteDocument(documentId)` — **purge storage + row** for the owner (@s12): list + remove objects
  under `pdf-images/{uid}/{documentId}/`, remove `pdf-uploads/{uid}/{documentId}/` objects
  (incl. `source.pdf`), then delete the `documents` row (cascade drops `document_images` rows).
  `{uid}` from the active session; storage RLS + `documents_delete_own` enforce ownership (@s19). DB
  cascade does **not** touch storage — hence explicit object removal.

## Done criteria
- [ ] Scenario(s) {s1, s4, s12, s17, s18, s19} covered by DAO tests with a mocked Supabase client
- [ ] Status derivation covered for all three variants (generated/failed/ready) incl. `lessonId` mapping
- [ ] List reads the view (RLS/`security_invoker` gives @s17/@s18); no join built client-side
- [ ] Delete removes both buckets' objects for the doc AND the `documents` row; throws on any step failure
- [ ] Never filters/deletes by a client-supplied user id (RLS only)
- [ ] Barrel export from `@helsoft/supabase-services`
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
Storage paths follow R1's scheme `{user_id}/{document_id}/…`. Image object names are variable →
list-then-remove; source is deterministic. Delete is only ever invoked for lesson-less docs (the UI
hides it otherwise, @s11) — no need to guard lesson integrity here.
