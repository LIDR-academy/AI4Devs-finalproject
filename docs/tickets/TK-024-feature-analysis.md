# Task: TK-024 · feature:analysis — Scaffold + Security Analysis MVI + Navigation

## Description

Scaffold `:feature:analysis`, implement the Security Analysis screen MVI, and wire `SecurityDetailRoute` in `mainGraph`. `GetPriceHistoryUseCase` and `GetSecurityDetailUseCase` were already added to their respective modules in TK-015 and TK-017.

**User Stories:** DVX-US-020 · DVX-US-021 · DVX-US-022
**PRD:** PRD-05
**ADRs:** ADR-007, ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-023
**Blocks:** TK-025
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-024-feature-analysis` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [ ] **Scaffold `:feature:analysis`**
  - `feature/analysis/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:analysis")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :feature:analysis:compileKotlinJvm`
  - **Commit:** `DVX-TK-024 Scaffold feature:analysis module`

### Phase 3: MVI
- [ ] **`SecurityDetailContract`** — State: `ticker, detail: SecurityDetail?, selectedPeriod: ChartPeriod, isLoading, error` · Event: `PeriodSelected, FavouriteToggled, AddToPortfolioClicked, EditHoldingClicked, BackClicked, Refresh` · Effect: `NavigateBack, NavigateToAddHolding(ticker), NavigateToEditHolding(holdingId)`
- [ ] **`SecurityDetailViewModel`** + unit tests
  - `GetSecurityDetailUseCase` on init with `ticker`; `AddToWatchlistUseCase`/`RemoveFromWatchlistUseCase` on toggle
  - CTA: "Add Security" when `!isInPortfolio`, "Edit Holding" when `isInPortfolio`
  - `PeriodSelected` → re-fetch price history only
  - **Verify:** `./gradlew :feature:analysis:jvmTest`
  - **Commit:** `DVX-TK-024 Add SecurityDetailViewModel with unit tests`

- [ ] **`SecurityDetailScreen`**
  - Header: back arrow + ticker (centred) + heart icon (solid/outlined)
  - Price + % change with direction icon + "Refreshed X min ago" + pull-to-refresh
  - Price line chart + period selector `[1D|1W|1M|YTD|1Y|ALL]`
  - Dividend Metrics 2x2 grid (Yield · Annual Payout · Payout Ratio · 5Y Growth)
  - Dividend Growth bar chart (10 years)
  - Fundamentals: Market Cap · P/E Ratio · Ex-Div Date
  - "Add Security" / "Edit Holding" full-width primary CTA
  - "Prices delayed 15 minutes" disclaimer
  - **Commit:** `DVX-TK-024 Add SecurityDetailScreen UI`

### Phase 4: Navigation + Koin
- [ ] **Wire `SecurityDetailRoute` in `mainGraph`** — `ticker` from `toRoute<SecurityDetailRoute>().ticker` · callbacks for AddHolding, EditHolding, Back
- [ ] **Register `:feature:analysis` Koin module** in `App.kt` startKoin
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-024 Wire SecurityDetailRoute and register analysis Koin module`

### Phase 5: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 0 **Remaining:** 7
