---
feature: pending-pdfs-generate
phase: pr_ready
review_round: 2
---

# Tasks — pending-pdfs-generate (PDF list)
Index only. **Each `task-N.md` owns its `slice`, `scenarios`, `status`, `paths`** — do **not**
duplicate them here. `orchestrator_lead` owns `phase`; `implementer` flips each task's `status`.

## Slice 1 — Data + schema foundation (list = extracted docs; status derived from lesson link + error; delete purges)
| Task | Title |
|---|---|
| task-1 | Migration: `lessons.document_id` FK, `documents.generation_error_code`, `user_documents` view |
| task-2 | Types: `PdfDocumentSummary` + `PdfDocumentStatus` in `@helsoft/types` |
| task-3 | `PdfDocumentsDao` — list from view (derive status); delete = purge storage + row (RLS) |
| task-4 | `PdfDocumentsService` — validate + normalize failures |
| task-5 | `usePdfDocuments` hook — reducer state, `refetch`, `deleteDocument` |
| task-6 | Cross-cutting `generate-lesson`: on success write `lessons.document_id`; on failure record `generation_error_code` |

## Slice 2 — Presentational UI (list organism + item molecule, per-status action, 4 states, i18n, a11y)
| Task | Title |
|---|---|
| task-7 | `PdfDocumentListItem` molecule (filename/status/date/pages + Generate/Retry/Open action + conditional delete) |
| task-8 | `PdfDocumentList` organism (Loading/Content/Empty/Error, FlatList, Dialog confirm) |
| task-9 | i18n `pdfList.*` keys (en/es/pt/de) + coverage test |

## Slice 3 — Wiring + integration (feed existing generate flow; open lesson; refresh on events)
| Task | Title |
|---|---|
| task-10 | `LessonGeneration` additive `onGenerated?` prop (fires on generation success) |
| task-11 | `PdfDocuments` wiring in `@helsoft/study-buddy` (hook + t/date → list; raises `onGenerate`/`onOpenLesson`/delete) |
| task-12 | `upload.tsx` composition: Generate targets that doc → shared panel; reload token on extract/generate |
