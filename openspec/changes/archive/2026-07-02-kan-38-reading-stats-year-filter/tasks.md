# Tasks — KAN-38 Reading Stats year filter

## 1. OpenSpec artifacts

- [x] 1.1 Add enhanced draft (`.drafts/KAN-38-enhanced.md`)
- [x] 1.2 Create proposal, design, specs, and tasks for `kan-38-reading-stats-year-filter`

## 2. Backend — year stats API

- [x] 2.1 Add `yearBounds` and refactor shared aggregation in `stats.service.ts`
- [x] 2.2 Add `getYearlyStats` and `yearly-stats-response.dto.ts`
- [x] 2.3 Add `GET /stats` query handler (`period=year`) in `stats.controller.ts`
- [x] 2.4 Extend integration tests for year endpoint

## 3. Frontend — period filter UI

- [x] 3.1 Add `getYearlyStats` to API client and `YearlyStatsResponse` type
- [x] 3.2 Add `statsPeriodStorage.ts` for localStorage persistence
- [x] 3.3 Update `StatsPage` with year/month mode filter (default year)
- [x] 3.4 Update `StatsPage.css` for period filter layout
- [x] 3.5 Extend `statsCacheInvalidation` for year query keys

## 4. Documentation

- [x] 4.1 Update `docs/api-spec.yml` with `GET /stats` year query endpoint

## 5. Verification

- [x] 5.1 Run backend stats integration tests
- [x] 5.2 Run `npm run build` in frontend
