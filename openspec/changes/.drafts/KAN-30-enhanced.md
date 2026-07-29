# KAN-30 — Enhanced user story

## Original

**Formato de lectura seleccionable** — `read_format` must be user-chosen (NULL until selected), editable inline in Book Tracker and in completion modal. UC-04.

## Enhanced

### Scope

- **Book Tracker column** «Formato» with inline `ReadFormatSelect` (Físico / Ebook / Audio / empty).
- **Completion modal** uses same accessible selector (already has format; align with UI kit).
- **No auto-assignment** — verify create/status transitions leave `read_format` null (already true in backend).
- **PATCH** supports setting and clearing `read_format` (null).

### Files

- `frontend/src/components/ReadFormatSelect.tsx` (+ css)
- `frontend/src/components/BookTrackerRow.tsx`, `BookTrackerPage.tsx`
- `frontend/src/components/CompletionModal.tsx` — use ReadFormatSelect
- `backend/src/books/dto/patch-reading-record.dto.ts` — nullable clear
- `backend/test/books.integration-spec.ts`
- `docs/api-spec.yml` if needed

### Definition of done

- [ ] Format column editable per row; saves via PATCH
- [ ] Default empty until user selects
- [ ] Keyboard accessible; frontend build + integration tests pass
