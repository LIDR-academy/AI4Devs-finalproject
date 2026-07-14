---
id: task-12
title: upload.tsx composition — Generate targets that doc → shared panel; reload token on extract/generate
slice: 3
scenarios: [s1, s5, s6, s9, s10]
status: todo
paths: [apps/app-study-buddy/src/app/(app)/upload.tsx, libs/study-buddy/src/components/pdf-documents/pdf-documents.integration.test.tsx]
---

## Goal
Compose the PDF list onto the upload screen while keeping it a thin shell. `upload.tsx` already lifts
one `documentId` (`useState`, R2 decision #9); extend the composition minimally:
- Render `<PdfDocuments onGenerate={setDocumentId} onOpenLesson={openLesson} reloadToken={token} />`
  alongside the existing `PdfUpload` + `LessonGeneration` (all inside `ApiKeyGate`). A row's
  Generate/Retry calls `onGenerate(documentId)` → `setDocumentId` → the existing `LessonGeneration`
  panel (composition picker → Generate) targets that document (@s5/@s6, @s1 "still upload from same
  screen"). No re-upload; no navigation for Generate/Retry.
- A `reloadToken` (`useState<number>`) is incremented in `PdfUpload.onExtracted` (after threading
  `setDocumentId`) and in a new `LessonGeneration.onGenerated` handler, so the list refetches when a
  new doc extracts (@s10) or a generation resolves and the row flips (@s9).

## Done criteria
- [ ] Scenario(s) {s1, s5, s6, s9, s10} covered by an integration test (list + new-upload coexist; Generate targets doc; token bumps refetch)
- [ ] Screen stays a thin shell: only `useState` glue + composition, no business logic
- [ ] `onExtracted` still sets `documentId` AND bumps the token; `onGenerated` bumps the token
- [ ] Generate/Retry set the active `documentId` (feeds the shared panel), not a separate flow
- [ ] `pnpm lint` + `pnpm check-types` + `pnpm test` green

## Notes
Keeps R2's sibling-handoff (a lifted `useState`); the row's explicit Generate button replaces the
old row-select-as-default UX (human change #3). The token is pure composition glue, not business
logic.
