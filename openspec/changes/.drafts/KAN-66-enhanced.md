## Original

**KAN-66** — [Audiencia 2/5] CRUD de audiencias en Settings (backend + frontend)

**Objective:** CRUD in Settings — view, add, and delete (no rename).

**Backend:** `GET /v1/audiences`, `POST /v1/audiences` (`{ name }`), `DELETE /v1/audiences/{id}` under JWT, scoped by `user_id`.

**Validation:** case-insensitive duplicates → 409; length 1–100 chars.

**Frontend:** new "Audiencia" section in Profile / Settings, same visual pattern as Genres (KAN-60).

**Depends on:** KAN-65.

## Enhanced

### Scope (KAN-66)

Expose user-scoped audience management API and Settings UI for **list, create, delete**. No rename (out of epic scope). Delete confirmation modal and affected-book count belong to **KAN-68** — this ticket may use immediate delete or omit delete button in UI if splitting; **include DELETE API** and a basic delete control in Settings (KAN-68 upgrades UX).

### Backend API

| Method | Path | Body | Success | Errors |
|--------|------|------|---------|--------|
| GET | `/v1/audiences` | — | `200` array of audience objects | 401 |
| POST | `/v1/audiences` | `{ name: string }` | `201` audience object | 400 validation, 401, 409 duplicate |
| DELETE | `/v1/audiences/{id}` | — | `204` | 401, 404 |

**Audience response:** `{ id, name, is_default, created_at, updated_at }` (snake_case).

**Create validation:**
- `name` trimmed, length 1–100 (`class-validator`)
- Duplicate check: `LOWER(name)` per user → `409` with `code: AUDIENCE_DUPLICATE`

**Delete:** owner-only; `ON DELETE SET NULL` on books (DB already configured).

### Frontend

- Replace Profile placeholder with `ProfilePage` containing Settings sections.
- **Audiencia** section: list current audiences (from GET), form to add name, delete per row (basic — no confirmation dialog; KAN-68 adds that).
- TanStack Query: `['audiences']` query + mutations invalidate on success.
- Error handling: show 409 duplicate message in Spanish.

### Files

| Layer | Path |
|-------|------|
| Backend | `audiences.controller.ts`, DTOs, extend `audiences.service.ts`, `audiences.module.ts`, `app.module.ts` |
| Tests | `audiences.service.spec.ts`, `backend/test/audiences.integration-spec.ts` |
| Frontend | `pages/ProfilePage.tsx`, `components/settings/AudienceSettingsSection.tsx`, `api/client.ts`, `api/types.ts` |
| Docs | `docs/api-spec.yml` |

### Definition of done

1. Integration tests pass for GET/POST/DELETE with JWT.
2. Unit tests for duplicate + length validation.
3. Settings UI lists seeded defaults and allows add; duplicate shows error.
4. `docs/api-spec.yml` documents endpoints.

### Out of scope

- Rename audiences
- Delete confirmation + book count (KAN-68)
- Book modal selector (KAN-67)
- Stats distribution (KAN-69)
