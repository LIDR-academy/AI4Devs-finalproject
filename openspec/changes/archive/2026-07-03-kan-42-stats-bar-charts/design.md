## Context

Bar slots 5–6 are placeholders. Period filter supports year (default) and month modes (KAN-38).

## Decisions

- **Month mode:** `monthly_breakdown` — 12 zero-filled buckets for `year`, books/pages per calendar month.
- **Year mode:** `yearly_breakdown` — ascending years with reads up to selected year.
- **SQL portability:** `SUBSTR(finished_on, …)` for month/year extraction (SQLite + Postgres).
- **CSS vertical bars** (same approach as `PieChart`).

## Risks / Trade-offs

- **[Many years of data]** → cap display at 15 most recent years with data.
- **[Single-month spike]** → emphasize selected month/year in bar styling.
