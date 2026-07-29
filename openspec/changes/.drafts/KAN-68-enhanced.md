## Original

**KAN-68**: Delete audience with confirmation and affected book count.

**Goal:** Confirmation with affected book count when deleting an audience, same pattern as KAN-62 (genre).

**Technical tasks:**
- Backend: `DELETE /v1/audiences/{id}` — count `books` with that `audience_id` before confirm.
- Frontend: confirmation modal *"Este público objetivo está asignado a N libros. Si lo borras, esos libros se quedarán sin público objetivo. ¿Continuar?"*; direct delete when no books assigned.
- Clearing relies on `ON DELETE SET NULL` (KAN-65).

**Acceptance (BDD):**
1. Given an audience with assigned books, when user clicks delete, then they see affected book count before confirming.
2. Given user confirms delete, when complete, then those books have blank audience.

**Tests:** Unit for affected book count; integration for DELETE with assigned books → `audience_id = NULL`.

**Depends on:** KAN-65, KAN-66, KAN-67. **Pattern:** KAN-62 (genre).

## Enhanced

### Scope

Add a **delete-impact preview** endpoint and Settings UI confirmation before deleting a público objetivo that is assigned to books. Reuse existing `DELETE /v1/audiences/{id}` (KAN-66); no schema changes (`ON DELETE SET NULL` already in migration).

### Backend

| Endpoint | Behavior |
|----------|----------|
| `GET /v1/audiences/{id}/affected-books` | Returns `{ affected_book_count: number }` for owned audience; 404 if not found / not owned |
| `DELETE /v1/audiences/{id}` | Unchanged — removes audience; DB sets `books.audience_id` to NULL |

**Files:**
- `backend/src/audiences/audiences.service.ts` — `countAffectedBooks(userId, audienceId)`
- `backend/src/audiences/audiences.controller.ts` — GET handler
- `backend/src/audiences/audiences.module.ts` — import `Book` entity
- `backend/src/audiences/dto/affected-books-response.dto.ts` (new)
- `docs/api-spec.yml` — document new endpoint
- `backend/src/audiences/audiences.service.spec.ts` — unit test for count
- `backend/test/audiences.integration-spec.ts` — count + delete clears `audience_id`

### Frontend

**Files:**
- `frontend/src/api/types.ts` — `AudienceAffectedBooksResponse`
- `frontend/src/api/client.ts` — `getAudienceAffectedBookCount(id)`
- `frontend/src/components/settings/AudienceSettingsSection.tsx` — on delete: fetch count; if `> 0` show `ConfirmModal`; else delete immediately
- `frontend/src/components/settings/AudienceSettingsSection.css` — modal spacing if needed

**UX copy (Spanish):**
- Title: `Eliminar público objetivo`
- Body (N > 0): `Este público objetivo está asignado a N libros. Si lo borras, esos libros se quedarán sin público objetivo. ¿Continuar?`
- Confirm: `Eliminar` / Cancel: `Cancelar`

Invalidate `['audiences']` and `['books']` after successful delete.

### Definition of done

- [ ] GET affected-books count for owned audiences
- [ ] Confirmation modal when count > 0; direct delete when 0
- [ ] Integration test proves `audience_id` cleared on books after delete
- [ ] api-spec updated
- [ ] OpenSpec change archived after merge
