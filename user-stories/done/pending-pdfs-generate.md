# PDF list — generate, retry, or open lessons from your uploaded PDFs

**As a** learner
**I want** a list on the upload screen of all my uploaded (extracted) PDFs, each showing its status and the action that fits it — generate a lesson, retry a failed generation, or open the lesson it already produced
**so that** I can manage my PDFs and finish, retry, or revisit lessons without re-uploading the file

## Context
- Extends the upload → extract → generate loop from **R1** (`pdf-upload-extraction`, done), **R2/R2.1** (`ai-lesson-generation`, done) and **R5** (`signup-and-lesson-persistence`, done). A successful extraction yields a `documents` row + source PDF; generation consumes that `documentId` and (R5) persists a `lessons` row.
- This is a **list of the learner's PDFs**, not only the ones without a lesson. Every successfully-extracted document appears, alongside the existing new-PDF upload control on the **upload screen** (same place, not a separate screen).
- Each row carries a **status** and a **state-dependent action button**:
  - **Ready to generate** (extracted, no lesson yet, no prior failure) → **Generate**
  - **Generation failed** (extracted, last generation attempt failed) → **Retry**
  - **Lesson ready** (a lesson was produced from this doc) → **Open lesson**
- **Generate / Retry** feed the **existing** generation flow for that document (composition picker → generate) using the already-extracted content — no re-upload, no second generation path.
- **Open lesson** opens the persisted lesson (R5) in the existing player/lesson flow.
- **Delete** removes a PDF and its stored upload/extraction data for that user (scope re: lesson-linked docs — see Notes).
- **Own documents only** — same RLS / `auth.uid()` isolation as R1/R5; a learner never sees another user's PDFs.

## Acceptance criteria
- **PDF list on upload** — Given I'm on the upload screen and I have one or more successfully-extracted documents, When the screen loads, Then I see them listed (filename + status + created date + page count per row, newest first), and I can still upload a new PDF from the same screen.
- **Generate a ready PDF** — Given a row whose status is "ready to generate", When I press Generate, Then I enter the existing generation flow (composition picker → generate) for that document, using the already-extracted content.
- **Retry a failed PDF** — Given a row whose status is "generation failed", When I press Retry, Then generation runs again for that document via the same existing flow.
- **Open a produced lesson** — Given a row whose document already produced a lesson, When I press Open lesson, Then the persisted lesson opens in the existing player/lesson flow.
- **Failure stays retryable** — Given generation fails for a document, When I return to / stay on the upload screen, Then that row shows "generation failed" and offers Retry.
- **Success flips the row** — Given generation succeeds for a document, When the list refreshes, Then that row now shows "lesson ready" and offers Open lesson (the row stays in the list).
- **New upload appears** — Given I upload a new PDF and it extracts successfully, When the list refreshes, Then the new document appears in the list.
- **Delete a PDF** — Given a PDF in the list, When I delete it (with confirmation), Then it disappears from the list and its stored upload/extraction data is removed for that user.
- **Empty state** — Given I have no extracted PDFs, When I open the upload screen, Then I see an empty state for the list (upload control for a new PDF still available).
- **Own documents only** — Given another user's PDFs exist, When I open the upload screen, Then I never see them.

## Notes
- Status labels can be refined in spec; the story requires a visible status + the fitting action per row.
- **Linkage** — opening the right lesson and showing "lesson ready" needs a document→lesson link (`lessons.document_id` or equivalent); an impl decision for `spec_partner`.
- **Resolved with the human:** no regenerate when a lesson exists (Open lesson only for MVP; regenerate is PRD P1); delete only rows **without** a lesson (keeps the lesson's images intact); Generate/Retry hand off into the existing shared generation panel on the same screen (targets that doc → composition picker → generate); list shows **only successfully-extracted** PDFs (failed/incomplete extraction excluded).
- No analytics events or feature flags requested for MVP.
- Folder/branch name stays `pending-pdfs-generate` (historical); product language is now "PDF list".
