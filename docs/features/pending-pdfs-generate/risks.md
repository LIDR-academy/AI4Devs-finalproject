# Risks — pending-pdfs-generate (PDF list)

## Technical
- **R1 — Cross-cutting edit to shipped `generate-lesson` (link + failure marker).** Adding
  `document_id` to the `lessons` insert and writing `documents.generation_error_code` on failure
  touches green R2/R5 code (JS source **and** the Deno `_shared` mirror). *Mitigation:* keep it
  additive + minimal (task-6); re-run existing generation/persist suites; the Deno function stays
  outside Stryker (documented R1/R2 boundary) — cover the JS persist source with Jest.
- **R2 — Delete purges storage AND rows across two systems (no DB→storage cascade).** A partial
  failure orphans storage or leaves list ghosts. *Mitigation:* DAO orders operations and throws on
  any step failure (task-3); images list-then-remove by `{uid}/{documentId}/` prefix; source path
  deterministic. Best-effort atomicity accepted for MVP (no Postgres+Storage transaction).
  Restricting delete to lesson-less rows (@s11) means a purge never breaks a produced lesson's
  images.
- **R3 — `user_documents` view isolation + status derivation.** A leak breaks @s18; a wrong
  LEFT-JOIN could duplicate rows for a doc with >1 lesson. *Mitigation:* `security_invoker = on` so
  base-table RLS governs; resolve to the newest linked lesson (regenerate is out of scope so ≤1
  expected); DAO tests cover all three derived statuses.
- **R4 — "Generation failed" only captures server-side failures after the doc is identified.**
  Client/transport + pre-doc errors won't mark the row (shows "ready to generate"). *Mitigation:*
  accepted for MVP — the doc is still listed and retryable; the label is a hint. Spec decision #2.
- **R6 — List refresh depends on screen-level `reloadToken` glue.** If `onExtracted`/`onGenerated`
  don't fire, the list goes stale until remount. *Mitigation:* both props additive + unit-tested
  (task-10/task-12); refetch idempotent (request-id guard in the hook).

## Product
- **R5 — Legacy generated docs show "ready to generate".** Pre-feature lessons carry no
  reconstructable `document_id`, so a legacy generated doc has no link and derives to `ready` rather
  than `generated` (no Open-lesson button; its lesson is still reachable from Home/R5). *Mitigation
  / rationale:* no data exists to backfill the link; the failure is benign (user can regenerate — a
  new lesson links correctly). No destructive backfill (the round-1 backfill-all-to-`generated` is
  obsolete in the full-list model). Documented in spec decision #1.
- **R7 — Two-then-three statuses imply the user understands each action.** *Mitigation:* per-status
  action label makes intent explicit (Generate / Retry / Open lesson); all copy localized (task-9).

## Dependencies (state)
- **R1 pdf-upload-extraction — done.** `documents`/`document_images`, `pdf-uploads`/`pdf-images`
  buckets, RLS by `auth.uid()`. This feature lists/deletes them.
- **R2 ai-lesson-generation — done.** `generate-lesson` Edge Function + upload-screen composition
  (`PdfUpload.onExtracted`, shared `LessonGeneration` panel, lifted `documentId`). Edited: persist
  writes `document_id` (task-6) + adds `onGenerated` (task-10).
- **R5 signup-and-lesson-persistence — done.** `lessons` table + RLS + `LessonList`/`SavedLessons`/
  `useLessons` — the 1:1 UI/data precedent this feature clones; adds `lessons.document_id`. Lesson
  delete stays R5/Home's concern.
- **tanstack-query — not installed.** Hook uses plain `useReducer` state (matches all precedents).
