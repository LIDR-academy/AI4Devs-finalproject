## Original

**KAN-39 — US-10 · Galería de portadas del periodo filtrado en Reading Stats**

Como lectora, quiero ver al final de Reading Stats todas las portadas de los libros del periodo filtrado, para tener un recap visual del mes o año.

**Acceptance criteria:**
- Given a selected period (month or year), when I reach the end of Reading Stats, I see a gallery with covers of all books read in that period
- Gallery updates when period filter changes
- Each cover shows title/author in `alt` and/or on hover
- Responsive layout without overflow; images with `alt` (WCAG 2.1 AA)

**Technical notes:** Reuse books with `status = leido` and `finished_on` in period (same as KPIs). Depends on KAN-38 period filter.

## Enhanced

**Jira:** KAN-39 · **Change:** `kan-39-stats-cover-gallery` · **Branch:** `feature/KAN-39-stats-cover-gallery`

### Goal

Add a **cover gallery** section at the bottom of `/stats` showing every book finished in the active period (year or month). Data comes from the existing stats endpoints so the gallery stays in sync with KPIs and charts when the period filter changes.

### Backend

Extend `MonthlyStatsResponse` and `YearlyStatsResponse` with:

```json
"books_in_period": [
  {
    "id": "uuid",
    "title": "Dune",
    "authors": "Frank Herbert",
    "cover_image_url": "https://…",
    "finished_on": "2026-06-15"
  }
]
```

- **Qualification:** same as aggregates — `reading_records.status = 'leido'`, `finished_on` in period bounds, scoped to authenticated user.
- **Order:** `finished_on` ascending, then `title` ascending (chronological recap).
- **Implementation:** new `booksInPeriod()` query in `StatsService` joining `reading_records` + `books`; include in `getMonthlyStats` / `getYearlyStats`.
- **DTO:** `PeriodBookSummaryDto` in `backend/src/stats/dto/`.
- **Tests:** `backend/test/stats.integration-spec.ts` — array length matches `books_read`, ordering, user isolation, empty period returns `[]`.
- **Docs:** `docs/api-spec.yml` — `PeriodBookSummary` schema + required `books_in_period` on both stats responses.

### Frontend

- **Types:** `PeriodBookSummary` + `books_in_period` on `MonthlyStatsResponse` / `YearlyStatsResponse` in `frontend/src/api/types.ts`.
- **Components:**
  - `frontend/src/components/stats/CoverGallery.tsx` — responsive CSS grid of cover tiles.
  - `frontend/src/components/stats/CoverGallery.css` — token-based spacing; `object-fit: cover`; no horizontal overflow.
- **Each tile:** `<img alt="{title} — {authors}">` when URL present; placeholder div with visible title/author on hover (CSS) when missing cover.
- **StatsPage:** render gallery below `StatsChartsGrid` when `books_in_period.length > 0`; section heading references `periodScope`; hidden when empty period (existing empty state covers `books_read === 0`).
- **A11y:** `section` with `aria-label`; tiles are list items or grid with descriptive labels; focus-visible styles on interactive elements if any.

### OpenSpec

- Delta specs: `stats-cover-gallery` (new), `monthly-stats-api` (books_in_period field), `monthly-stats-ui` (gallery section).
- Manual test checklist `MANUAL-TEST-KAN-39.md`.

### Definition of done

- [ ] Stats API returns `books_in_period` for month and year modes
- [ ] Gallery renders at bottom of Reading Stats and updates on period change
- [ ] Integration tests + frontend build pass
- [ ] `docs/api-spec.yml` synced
