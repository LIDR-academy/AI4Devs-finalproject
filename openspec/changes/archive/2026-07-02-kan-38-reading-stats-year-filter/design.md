## Context

Monthly stats were delivered in KAN-15 via `GET /v1/stats/{year}/{month}`. Product docs and Jira KAN-38 describe a query-param year period that was never implemented. The frontend month picker from KAN-23 uses design-system tokens and must be extended, not replaced.

## Goals / Non-Goals

**Goals**
- Year-scoped aggregates with identical response fields (minus `month`).
- Year as default period; month remains available.
- Persist filter in `localStorage`.
- Backward-compatible monthly path route.

**Non-Goals**
- `period=custom` date ranges.
- Bar charts or axis switching (KAN-42).
- Unified stats response with insights array from readme aspirational spec.

## Decisions

### Decision 1: Query-param year endpoint

`GET /v1/stats?period=year&year=YYYY` on the existing `StatsController` root `GET`, validated with a small DTO (`period`, `year`, optional `month`).

**Alternative:** `GET /v1/stats/{year}` path — rejected to align with readme/Jira and avoid route ambiguity with `:year/:month`.

### Decision 2: Shared aggregation helper

Extract `aggregateStats(userId, periodStart, periodEnd)` in `StatsService`; `getMonthlyStats` and `getYearlyStats` call it with `monthBounds` / `yearBounds` (same half-open interval pattern as goals).

### Decision 3: Frontend period state

```ts
type StatsPeriod =
  | { mode: 'year'; year: number }
  | { mode: 'month'; year: number; month: number };
```

Query keys: `['stats', 'year', year]` and `['stats', 'month', year, month]`.

Persist JSON in `localStorage` key `stats_period_v1`; validate on read; fall back to current UTC year.

### Decision 4: UI pattern

Radio group or select for mode (`Año` / `Mes`) plus conditional `input type="number"` (year) or `input type="month"`. Reuse `.stats-month-picker` token styles under a renamed `.stats-period-filter` block.

## Risks / Trade-offs

- **Default change (month → year):** Users accustomed to monthly default will see year totals first. Matches KAN-38 acceptance criteria.
- **Cache invalidation:** Year queries must be invalidated alongside month queries when `finished_on` changes across months in the same year.

## Migration Plan

No data migration. Deploy backend first; frontend consumes new endpoint. Monthly path unchanged.
