---
id: task-1
title: Migration — lessons.document_id FK, documents.generation_error_code, user_documents view
slice: 1
scenarios: [s1, s4, s17, s18, s19]
status: done
paths: [supabase/migrations/]
---

## Goal
One migration adding the schema the PDF list needs (spec decision #1/#2):
1. **`lessons.document_id`** — nullable `uuid references documents(id) on delete set null`; the
   forward 1:1 link from a lesson to its source doc, written by `generate-lesson` on success
   (task-6). Drives the "lesson ready" status + the Open-lesson target (@s4/@s7). `on delete set
   null` so deleting a (lesson-less) doc never breaks a lesson; lesson-linked docs aren't deletable
   from this UI anyway (@s11).
2. **`documents.generation_error_code text` (nullable)** — set server-side on a generation failure
   (task-6); drives the "generation failed" status (@s3). No `documents.status` enum change and
   **no legacy backfill** (the full-list model wants generated docs to appear — the round-1
   backfill-to-`generated` is obsolete).
3. **`user_documents` view (`security_invoker = on`)** — `documents` where `status = 'extracted'`,
   LEFT JOIN the newest linked `lessons` row (`lessons.document_id = documents.id`) to expose
   `lesson_id`, plus `generation_error_code`, `filename`, `page_count`, `created_at`; ordered newest
   first. Row status is derived in the DAO (task-3): `lesson_id` present → `generated`; else
   `generation_error_code` non-null → `failed`; else → `ready`. Existing `documents`/`lessons` RLS
   governs rows (@s17 excludes processing/failed extraction; @s18/@s19 isolation via `auth.uid()`).

## Done criteria
- [ ] Scenario(s) {s1, s4, s17, s18, s19} covered by a migration review note + DAO tests (task-3)
- [ ] View filters `status='extracted'` (@s17) and exposes `lesson_id` + `generation_error_code`
- [ ] Multiple lessons per doc (regenerate is out of scope) resolved to the newest link, not duplicate rows
- [ ] `security_invoker = on` so existing RLS governs; no client-supplied user-id filter
- [ ] `document_id` FK nullable + `on delete set null`; existing lessons remain valid (null link)
- [ ] View/table GRANTs match the R1 pattern so the Data API can reach the view
- [ ] `pnpm lint` + `pnpm check-types` green; no hardcoded magic numbers

## Notes
Follows `pdf_extraction.sql` conventions (RLS, GRANTs). No new bucket; no `status` enum change.
**Legacy limitation (risks R5):** pre-feature lessons carry no reconstructable `document_id`, so a
legacy generated doc has no link and shows "ready to generate" — benign (user can regenerate; new
generations link correctly). See spec decision #1.
