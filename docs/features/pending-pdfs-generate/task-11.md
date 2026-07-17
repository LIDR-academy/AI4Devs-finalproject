---
id: task-11
title: PdfDocuments wiring in @helsoft/study-buddy (hook + t/date → list; raises onGenerate/onOpenLesson/delete)
slice: 3
scenarios: [s5, s6, s7, s11, s12, s13]
status: done
paths: [libs/study-buddy/src/components/pdf-documents/pdf-documents.tsx, libs/study-buddy/src/components/pdf-documents/pdf-documents.types.ts, libs/study-buddy/src/components/pdf-documents/pdf-documents.helpers.ts, libs/study-buddy/src/components/pdf-documents/pdf-documents.test.tsx, libs/study-buddy/src/index.ts]
---

## Goal
Feature wiring, mirroring `SavedLessons`: calls `usePdfDocuments`, maps to `PdfDocumentList`
(formats status label via `t('pdfList.status.*')`, action label via `t('pdfList.action.*')`, created
date via `locale`, page-count via `t`). Raises:
- `onGenerate(documentId)` for `ready`/`failed` rows → the screen targets that doc in the shared
  `LessonGeneration` panel (@s5/@s6; wiring in task-12).
- `onOpenLesson(lessonId)` for `generated` rows → navigate to `/lesson/[id]` (@s7).
- delete via the list's confirm-delete → `usePdfDocuments().deleteDocument` (@s12/@s13); delete only
  surfaced for lesson-less rows (@s11, enforced by the molecule).
Receives a `reloadToken` prop and calls `refetch()` when it changes (screen bumps it on
extract/generate — @s10/@s9).

## Done criteria
- [x] Scenario(s) {s5, s6, s7, s11, s12, s13} covered by `pdf-documents.test.tsx`
- [x] Pre-formats all row copy via `t`/`locale`; passes `onGenerate`/`onOpenLesson`/`onDelete` through
- [x] `reloadToken` change triggers `refetch` (effect); delete delegates to the hook
- [x] Layering: wiring → hook → service (no DAO/Supabase here)
- [x] Barrel export from `@helsoft/study-buddy`
- [x] `pnpm lint` + `pnpm check-types` + `pnpm test` green; no hardcoded strings

## Notes
`SavedLessons` is the 1:1 precedent (list wiring + delete + date/label formatting). Status→action
maps: `{ ready: 'generate', failed: 'retry', generated: 'openLesson' }`.
