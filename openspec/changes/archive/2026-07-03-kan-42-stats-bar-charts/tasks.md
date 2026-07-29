# Tasks — KAN-42 Stats bar charts

Jira: KAN-42

## 0. Setup

- [x] 0.1 Branch `feature/KAN-42-stats-bar-charts`
- [x] 0.2 OpenSpec change `kan-42-stats-bar-charts`

## 1. Backend

- [x] 1.1 Add `MonthBucketDto`, `YearBucketDto` to DTOs
- [x] 1.2 Implement `monthlyBreakdown` and `yearlyBreakdown` in `StatsService`
- [x] 1.3 Update `docs/api-spec.yml`
- [x] 1.4 Integration tests for breakdown fields

## 2. Frontend

- [x] 2.1 `BarChart.tsx` + CSS (accessible vertical bars)
- [x] 2.2 `BooksBarChart`, `PagesBarChart`
- [x] 2.3 Update `api/types.ts`, wire `StatsPage` bar slots

## 3. Verification

- [x] 3.1 `npm test` stats + `npm run build` frontend
- [x] 3.2 `MANUAL-TEST-KAN-42.md` + test report

## 4. Docs

- [x] 4.1 api-spec synced
