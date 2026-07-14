---
id: task-6
title: Cross-cutting generate-lesson — persist writes document_id (link); record generation_error_code on failure
slice: 1
scenarios: [s3, s4, s8, s9]
status: done
paths: [libs/supabase-services/src/services/lesson-generation.persist.ts, supabase/functions/generate-lesson/_shared/lesson-generation.persist.ts, supabase/functions/generate-lesson/index.ts, libs/supabase-services/src/services/lesson-generation.persist.test.ts]
---

## Goal
Small, additive cross-cutting change to the shipped `generate-lesson` so the PDF list is correct
end-to-end:
1. **Link on success** — the persist insert writes `document_id` alongside `{ id, title, slides }`,
   so a generated lesson points at its source document. This is what makes the row show "lesson
   ready" + an Open-lesson target (@s4/@s9). Thread `documentId` (already in scope in `index.ts`)
   into `persistLesson`.
2. **Mark on failure** — when a server-side generation attempt fails *after* the document is
   identified, the function updates `documents.generation_error_code` for that document (caller
   client, `documents_update_own` RLS) so the row shows "generation failed" (@s3) and stays
   retryable (@s8). Pre-document failures (unauthenticated, document_not_ready) do not mark.
Keep the Deno `_shared/lesson-generation.persist.ts` mirror in sync with the JS source (same
hand-mirror rule as R1/R2). No `documents.status` change (doc stays `'extracted'`; the lesson link
is what flips the row).

## Done criteria
- [ ] Scenario(s) {s3, s4, s8, s9} data-side covered by persist unit test + a failure-marker test
- [ ] `document_id` written on the `lessons` insert on success; no other persist behavior changes (R5 @s1 intact)
- [ ] JS source and Deno `_shared` mirror stay byte-for-byte behavior-equivalent
- [ ] `generation_error_code` written only after the document is identified server-side
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green; existing generation tests still pass

## Notes
Only edit to already-shipped feature code; minimal + additive (mirrors R2's additive `onExtracted`
precedent). Deno function stays outside the Jest/Stryker harness (documented R1/R2 boundary) — cover
the JS persist source with Jest.
