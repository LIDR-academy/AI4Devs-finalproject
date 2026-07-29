# Tasks — KAN-39 Stats cover gallery

Jira: KAN-39

## 0. Setup

- [x] 0.1 Branch `feature/KAN-39-stats-cover-gallery`
- [x] 0.2 OpenSpec change `kan-39-stats-cover-gallery`

## 1. Backend

- [x] 1.1 Add `PeriodBookSummaryDto` to stats DTOs
- [x] 1.2 Implement `booksInPeriod` in `StatsService` and include in monthly/yearly responses
- [x] 1.3 Update `docs/api-spec.yml`
- [x] 1.4 Integration tests for `books_in_period`

## 2. Frontend

- [x] 2.1 `PeriodBookSummary` type + `books_in_period` on stats responses
- [x] 2.2 `CoverGallery.tsx` + CSS (responsive grid, a11y)
- [x] 2.3 Wire gallery in `StatsPage` below chart grid

## 3. Verification

- [x] 3.1 `npm test` stats + `npm run build` frontend
- [x] 3.2 `MANUAL-TEST-KAN-39.md`

## 4. Docs

- [x] 4.1 api-spec synced
