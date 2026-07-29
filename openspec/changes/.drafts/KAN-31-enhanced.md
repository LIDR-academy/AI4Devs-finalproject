## Original

**KAN-31 — US-09 · Half-star ratings (0.5 steps)**

As a reader, I want to rate with half stars (3.5, 4.5…), so I can rate my reads more precisely.

**Context:** Improvement #8. Contradicts current spec (`rating SMALLINT CHECK 1–5`); requires data migration.

**Acceptance criteria:**
- When rating inline or in completion modal with half star, value saves and displays with halves (e.g. 3.5).
- Allowed values: 0.5 → 5.0 in 0.5 steps.
- Rating chart and average rating in Reading Stats reflect halves.
- Accessible star component (keyboard + screen readers, textual value).

**Technical notes:**
- Migrate `rating` to `NUMERIC(2,1)` with half-step CHECK (or SMALLINT 1–10 ×2).
- Update `PATCH /v1/books/{bookId}/reading-record` validation.
- Extend `StarRating` (KAN-18) for half-star input and display.

## Enhanced

### Problem

`reading_records.rating` is `SMALLINT 1–5` and `StarRating` only supports whole stars. US-09 requires 0.5-step ratings end-to-end.

### Scope (KAN-31 + subtasks KAN-32/33/34)

**In scope**
- DB migration: `rating` → `NUMERIC(2,1)` with CHECK for 0.5–5.0 half steps; existing integers remain valid.
- Backend: entity, DTO validation (`0.5`…`5` in `0.5` steps), API responses as JSON number.
- Frontend: `StarRating` half-star input (click halves) and display; keyboard steps of `0.5`; textual `aria` value.
- Wire in Book Tracker inline, `CompletionModal`, `BookFormModal`.
- Stats: `average_rating` already uses `AVG`; add half-star integration test; KPI formats one decimal when needed.
- Docs: `docs/data-model.md`, `docs/api-spec.yml`.
- Delta specs: `reading-record-patch`, `shared-ui-components`, `monthly-stats-api`.

**Out of scope**
- Rating distribution pie chart (KAN-41) — chart does not exist yet.
- Clearing rating to null via UI (unchanged behaviour).

### API

`PATCH` body `rating`: `number`, minimum `0.5`, maximum `5`, multiple of `0.5`.

### Files

| Layer | Path |
|-------|------|
| Migration | `backend/src/migrations/1752000000000-HalfStepReadingRecordRating.ts` |
| Validator | `backend/src/books/validators/half-step-rating.validator.ts` |
| Entity/DTO | `reading-record.entity.ts`, `patch-reading-record.dto.ts` |
| Service | `books.service.ts` — normalize decimal rating on read |
| Frontend | `ui/StarRating.tsx`, `ui/StarRating.css`, `lib/rating.ts` |
| Tests | `books.integration-spec.ts`, `stats.integration-spec.ts`, `half-step-rating.validator.spec.ts` |
| Docs | `docs/data-model.md`, `docs/api-spec.yml` |

### Definition of done

1. `PATCH` accepts `3.5`, rejects `3.3` and `0`.
2. List and PATCH responses return `rating: 3.5`.
3. Star UI selects and shows half values in tracker + completion modal.
4. Stats average includes half-star ratings correctly.
5. Backend unit + integration tests pass; frontend build passes.
