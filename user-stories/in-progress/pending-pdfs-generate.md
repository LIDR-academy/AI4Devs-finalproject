# Pending PDFs — pick & generate (retry without re-upload)

**As a** learner
**I want** a list on the upload screen of PDFs that were extracted but never became a lesson, so I can pick one and run generation (or delete it)
**so that** I can finish or retry after a failed / abandoned generation without re-uploading the file

## Context
- Extends the upload → extract → generate loop from **R1** (`pdf-upload-extraction`, done) and **R2/R2.1** (`ai-lesson-generation`, done). Today a successful extraction yields a `documents` row + source PDF; generation consumes that `documentId`. If the learner leaves, fails generation, or never hits generate, the extracted document still exists but is easy to "lose" — they'd re-upload.
- **R5** (`signup-and-lesson-persistence`, done) lists *lessons* on Home. This story is about *documents with extraction OK and no linked lesson yet* — orthogonal to the lesson list.
- List lives on the **upload screen** alongside the existing new-PDF upload control (same place, not a separate screen). Selecting a row feeds the existing generate flow (composition picker → generate) with that document's id — do not invent a second generation path.
- "Pending" = extraction succeeded (`documents` ready for generation) **and** no lesson exists for that document. Failed generation keeps the document pending so retry works. Failed / incomplete extraction is **not** in this list.
- Delete removes the pending document (and its stored PDF / extraction artifacts as appropriate) so the learner can clean up files they no longer want.

## Acceptance criteria
- **Pending list on upload** — Given I'm on the upload screen and I have one or more documents with extraction OK and no lesson, When the screen loads, Then I see those documents listed (filename + status per row), and I can still upload a new PDF from the same screen.
- **Select → existing generate flow** — Given a pending document in the list, When I select it, Then I'm in the existing generation flow for that document (composition picker → generate), using the already-extracted content — no re-upload required.
- **Failed generation stays retryable** — Given generation fails for a selected pending document, When I return to / stay on the upload screen, Then that document remains in the pending list so I can select it and try again.
- **Delete pending PDF** — Given a pending document in the list, When I delete it (with confirmation), Then it disappears from the list and is no longer available for generation; its stored upload/extraction data is removed for that user.
- **Empty state** — Given I have no pending documents (extraction OK + no lesson), When I open the upload screen, Then I see an empty state for that list (upload control for a new PDF still available).
- **Own documents only** — Given another user's pending documents exist, When I open the upload screen, Then I never see them (same RLS / `auth.uid()` isolation as R1/R5).

## Notes
- Exact status label(s) for the row (e.g. "Ready to generate", "Generation failed") can be refined in spec; story only requires a visible status alongside filename.
- Whether a document is "pending" is defined by extraction success + absence of a lesson for that document — schema join / flag is an impl decision for `spec_partner`.
- No analytics events or feature flags requested for MVP.
- Ready for `/ticket-orchestrator pending-pdfs-generate`.
