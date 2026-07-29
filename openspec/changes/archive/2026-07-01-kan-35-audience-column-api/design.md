## Context

Books table lacks audience. Tracker and stats specs require YA / New Adult / Adult per book.

## Goals / Non-Goals

**Goals:** Persist nullable enum; expose via REST; capture on add; show/edit in tracker.

**Non-goals:** Stats pie chart; bulk import mapping.

## Decisions

1. **Enum values:** `young_adult` | `new_adult` | `adult` (snake_case API, labels in UI).
2. **PATCH book endpoint** — partial update DTO with optional `audience` only for now (extensible for KAN-26).
3. **Inline tracker edit** — `PATCH /v1/books/{id}` from audience column select.

## Risks / Trade-offs

- **[Risk] PATCH overlaps KAN-26** → Mitigation: minimal DTO; KAN-26 extends same endpoint.

## Migration Plan

Run `npm run migration:run` in backend before deploy.

## Open Questions

- None.
