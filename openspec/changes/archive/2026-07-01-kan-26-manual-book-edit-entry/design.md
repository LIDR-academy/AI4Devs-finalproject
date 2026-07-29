## Context

Book Tracker rows currently support inline edits for reading lifecycle fields and audience. Full metadata edit (title, authors, cover, etc.) needs a modal form per PRD / prompts.md («lápiz → modal»). Work is split across KAN-26 (entry), KAN-27 (backend), KAN-28 (form), KAN-29 (manual create from search).

## Goals / Non-Goals

**Goals:**
- Pencil control on each row; opens shared `BookFormModal` in edit mode.
- Accessible dialog (focus trap, Escape, labelled header).
- Placeholder body until KAN-28; disabled Save with clear next-step copy.

**Non-Goals:** PATCH expansion, form fields, create-from-search path.

## Decisions

1. **Reuse `ui/Modal`** — consistent with design system; avoid duplicating AddBookModal overlay markup.
2. **`BookFormModal` props:** `{ open, mode: 'create' | 'edit', book?: Book, onClose }` — create mode wired in KAN-29.
3. **Actions column last** — after rating column; icon-only button with `aria-label`.
4. **Save disabled** — `title` attribute / helper text references KAN-28; no API calls in this change.

## Risks / Trade-offs

- **[Thin slice]** Users cannot save from modal yet → Mitigation: explicit placeholder copy; inline edits still work.
- **[Duplicate modal patterns]** AddBookModal still custom → Accept for now; unify later if needed.

## Migration Plan

Frontend-only; no migration. Deploy with KAN-28/27 for functional edit save.
