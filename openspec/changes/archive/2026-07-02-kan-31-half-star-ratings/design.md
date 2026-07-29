## Context

KAN-12 delivered integer star ratings. Jira splits backend (KAN-32), frontend component (KAN-33), and stats (KAN-34) as subtasks; this change delivers the full parent story in one PR.

## Decisions

### Decision 1: `NUMERIC(2,1)` column

Store display values directly (`3.5`) rather than ×2 integers. Existing `1`–`5` rows migrate without transformation.

**CHECK:** `rating IS NULL OR (rating >= 0.5 AND rating <= 5 AND (rating * 2) = TRUNC(rating * 2))`

### Decision 2: TypeORM decimal as string on read

Entity uses `decimal(2,1)`; `books.service` normalizes to `number` in API DTOs (same pattern as `progress_percent`).

### Decision 3: StarRating interaction

Each of five stars exposes left/right click targets for `n-0.5` and `n`. Arrow keys step by `0.5`; Home = `0.5`, End = `5`. A visually hidden span announces the current value.

### Decision 4: Stats

No new chart in this change (KAN-41). `AVG(rr.rating)` and existing KPI formatter already support one decimal; add integration coverage for `3.5` averages.

## Risks

- **SQLite integration tests** use `synchronize: true` — entity type change must remain compatible.
- **Locale display** — use `toLocaleString` with up to one decimal when value is half-step.
