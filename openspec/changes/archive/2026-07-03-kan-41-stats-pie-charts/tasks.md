# Tasks — KAN-41 Stats pie charts

Jira: KAN-41

## 0. Setup: Create Feature Branch (MANDATORY - FIRST STEP)

- [x] 0.1 Create feature branch `feature/KAN-41-stats-pie-charts` from `main`
- [x] 0.2 OpenSpec change `kan-41-stats-pie-charts` created

## 1. Backend: API distributions (TDD)

- [x] 1.1 Add `AudienceCountDto`, `RatingCountDto` to monthly/yearly DTOs
- [x] 1.2 Extend `StatsService` with audience (`b.audience`) and rating (`rr.rating`) distributions
- [x] 1.3 Update `docs/api-spec.yml` schemas
- [x] 1.4 Add integration tests for audience and rating distributions

## 2. Frontend: PieChart component

- [x] 2.1 Create `PieChart.tsx` + CSS (SVG slices, legend, aria-label)
- [x] 2.2 Create `GenrePieChart`, `FormatPieChart`, `AudiencePieChart`, `RatingPieChart`
- [x] 2.3 Update `api/types.ts` with new distribution types
- [x] 2.4 Wire `StatsPage` pie slots 1–4; remove old list/bar components from stats grid

## 3. Backend: Review and Update Existing Unit Tests (MANDATORY)

- [x] 3.1 Review stats unit/integration tests; update for new response fields

## 4. Backend: Run Unit Tests and Verify State (MANDATORY)

- [x] 4.1 Run `cd backend && npm test` (stats specs)
- [x] 4.2 Create report `openspec/changes/kan-41-stats-pie-charts/reports/2026-07-02-step-4-unit-test-verification.md`

## 5. Backend: Manual Endpoint Testing with curl (MANDATORY - AGENT MUST EXECUTE)

- [x] 5.1 Login via dev-login; GET `/v1/stats?period=year&year=YYYY` and verify new fields
- [x] 5.2 Document in report

## 6. Frontend: E2E / manual verification

- [x] 6.1 `npm run build` in frontend
- [x] 6.2 Add `MANUAL-TEST-KAN-41.md`

## 7. Update Technical Documentation (MANDATORY)

- [x] 7.1 Confirm `docs/api-spec.yml` reflects new fields

## 8. Wrap-up

- [x] 8.1 Mark all tasks complete; validate openspec change
