## Context

Stats aggregates (KAN-15, KAN-38) are stable. Insights are computed on read alongside existing fields.

## Decisions

- **Embed on stats responses** — `insights: StatsInsight[]` on both monthly and yearly endpoints (same refetch as KPIs).
- **Deterministic rules** — pure `generateStatsInsights()` with kinds: `volume_delta`, `genre_trend`, `format_mix`, `pages_milestone`, `rating_pattern`.
- **Period comparison** — month mode compares to previous calendar month; year mode to previous calendar year.
- **Minimum count** — when `books_read >= 1`, return at least 3 insights (fill from priority list).
- **Empty period** — `insights: []` when `books_read === 0`.
- **Copy** — Spanish `title`/`body` strings from server templates; stable `id` derived from kind + period scope.
- **UI** — card list below KPIs, above charts; uses design tokens.

## Risks / Trade-offs

- **[Sparse data]** → genre/format insights may reference `unknown` buckets; still meet count via pages/rating insights.
- **[First period]** → volume_delta describes growth from zero baseline.
