# KAN-27 — Enhanced user story

## Original

**Backend — POST /books (manual) + PATCH /books/{id} con todos los campos**

Implementar `POST /v1/books` (alta manual con `data_source = manual`) y `PATCH /v1/books/{bookId}` para editar todos los campos de `books` (title, authors, cover_image_url, page_count, genre, series_name, publication_year, audience). Validaciones: título obligatorio, `page_count >= 0`, coherencia de fechas. Aislamiento por usuaria.

## Enhanced

### Scope (KAN-27 — backend only)

Extend existing book create/patch endpoints so manual add/edit (US-07) can persist full book metadata. **No frontend form changes** (KAN-28).

### API

| Method | Path | Behavior |
|--------|------|----------|
| POST | `/v1/books` | Already supports `data_source: manual` — verify full metadata + integration tests |
| PATCH | `/v1/books/{bookId}` | Partial update of **book** fields listed below |

**PATCH body fields (all optional, ≥1 required):**

- `title`, `authors`, `cover_image_url`, `page_count`, `genre`, `series_name`, `publication_year`, `audience`, `notes`

**Validation:**

- `title` / `authors`: if sent, non-empty string (same max lengths as create)
- `page_count`: integer ≥ 0 or null
- `publication_year`: 1000–2100 or null
- `cover_image_url`: valid URL or null
- Empty PATCH body → 400
- Date coherence (`finished_on >= started_on`) remains on `PATCH .../reading-record` (existing)

**Authorization:** JWT; book must belong to authenticated user → 404 otherwise.

### Files

| File | Change |
|------|--------|
| `backend/src/books/dto/patch-book.dto.ts` | All patchable book fields |
| `backend/src/books/books.service.ts` | `update()` applies partial fields |
| `backend/test/books.integration-spec.ts` | Manual create + full PATCH + validation + 404 |
| `docs/api-spec.yml` | Expand `PatchBookRequest` |
| `frontend/src/api/types.ts` | Align `PatchBookPayload` (types only) |

### Definition of done

- [ ] PATCH updates any combination of book metadata fields
- [ ] Integration tests pass (`npm run test:integration -- books.integration-spec`)
- [ ] `docs/api-spec.yml` synced
- [ ] OpenSpec tasks complete; frontend build still passes
