---
feature: pending-pdfs-generate
story: user-stories/in-progress/pending-pdfs-generate.md
status: spec_drafted
---

# Spec — pending-pdfs-generate (PDF list)
_Terse overview. ACs live in `gherkin-scenarios.md`; task/impl detail in `task-N.md`; risks in
`tmp/pending-pdfs-generate/risks.md`. Link, don't copy._

## Summary
On the upload screen, list **all** the learner's successfully-extracted PDFs. Each row shows a
status and the fitting action — **Generate** (ready), **Retry** (last generation failed), or **Open
lesson** (already produced one) — plus **Delete** for PDFs without a lesson. Lets a learner finish,
retry, or revisit lessons without re-uploading.

## User stories
- As a **learner**, I want the upload screen to list my uploaded PDFs with the action that fits each
  one (generate / retry / open lesson), so that I can manage them and finish/retry/revisit lessons
  without re-uploading.

## Acceptance criteria
→ **`gherkin-scenarios.md`** — each `@s` scenario is an acceptance criterion (Given/When/Then).

## UI states (PdfDocumentList organism)
| State | Trigger | Notes |
|---|---|---|
| Loading | Request in flight | Announced (@s15, @s21) |
| Content | ≥ 1 extracted doc | Row = filename + status + date + pages, newest first; per-status action + delete only when no lesson (@s1–@s7, @s11) |
| Empty | Zero extracted docs | Upload control still available (@s14) |
| Error | Request failed | Message + retry (@s16) |

## Analytics events
None — out of scope for MVP (per story).

## Feature flags
None.

## Out of scope / non-goals
- **Generation itself (R2, done)** — Generate/Retry only feed the existing shared panel; no 2nd path.
- **Regenerate when a lesson exists** — lesson-ready rows offer only Open lesson (regenerate = PRD P1).
- **Lesson delete / rename** — R5/Home's concern; this list deletes only lesson-less PDFs.
- **Extraction/re-upload (R1)** and **the player (R4)** — reused, not re-specified.
- Processing / extraction-failed documents (never listed — only `status='extracted'`, @s17).
- Pagination/search/sort (newest-first only); cross-system delete transactionality (best-effort).

## Open decisions (resolved, with rationale)
- **#1 List = extracted docs; row status derived from lesson link + `generation_error_code`** — a
  `security_invoker` `user_documents` view lists `documents` where `status='extracted'`, LEFT JOIN
  the newest linked lesson (`lessons.document_id`) → `lesson_id`. Derived: link → `generated` (Open
  lesson); else `generation_error_code` → `failed` (Retry); else → `ready` (Generate). Adds a
  nullable `lessons.document_id` FK (`on delete set null`), written on success (task-6). **Why:** the
  human wants every PDF listed; the FK powers Open lesson + the flip to "lesson ready"; the view
  keeps RLS free. **No `status='generated'` enum + no legacy backfill** (round-1 backfill obsolete —
  generated docs now belong in the list). **Limitation (risks R5):** legacy lessons have no
  reconstructable link → a legacy generated doc shows "ready" (benign; regenerate relinks).
- **#2 Failure signal via `documents.generation_error_code`** — nullable column set server-side on a
  generation failure after the doc is identified (doc stays `'extracted'`) → "generation failed" +
  Retry. **Why:** mirrors R1's `error_code`, no new table. *Limit (R4):* client/pre-doc failures
  aren't marked (row stays "ready"; label is a hint).
- **#3 Delete only for lesson-less PDFs; purges storage + rows via client DAO (RLS)** —
  ready/failed rows show Delete (Dialog confirm → remove `pdf-uploads`+`pdf-images` objects, then
  the `documents` row; cascade drops `document_images`); lesson-ready rows offer none. **Why:**
  purging a generated doc's images would degrade its lesson — restricting delete keeps it intact;
  owner RLS already allows the client purge. *Discarded:* delete-always with image degradation.
- **#4 Generate/Retry reuse the shared `LessonGeneration` panel** — a row button targets that doc
  (screen sets active `documentId`) → existing picker → Generate; no re-upload/navigation. Open
  lesson navigates to the player. **Why:** human change #3 — an explicit per-row action replaces the
  old row-select-as-default; reuses shipped R2 (decision #9's lifted `documentId`). Delete confirms
  via the shared `Dialog`.
- **#5 List refreshes via a `reloadToken`** — bumped on `PdfUpload.onExtracted` (@s10) and a new
  `LessonGeneration.onGenerated` (@s9). **Why:** the list is a screen sibling; a token keeps
  `upload.tsx` thin and refetch idempotent.
- **#6 Clone the R5 stack** — DAO/Service, `usePdfDocuments` hook (plain `useReducer`),
  `PdfDocumentList` organism + item molecule, `PdfDocuments` wiring, `PdfDocumentSummary` type
  (paths in task-N). **Why:** `LessonList`/`SavedLessons`/`useLessons` are the proven 1:1 precedent.
