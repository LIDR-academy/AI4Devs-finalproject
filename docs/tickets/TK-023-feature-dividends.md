# Task: TK-023 · feature:dividends — Scaffold + MVI + Navigation

## Description

Scaffold `:feature:dividends`, implement the full Dividends screen MVI, and wire `DividendsRoute` in `mainGraph`.

**User Stories:** DVX-US-016 · DVX-US-017 · DVX-US-018 · DVX-US-019
**PRD:** PRD-04
**ADRs:** ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-022
**Blocks:** TK-024
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-023-feature-dividends` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [ ] **Scaffold `:feature:dividends`**
  - `feature/dividends/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:dividends")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :feature:dividends:compileKotlinJvm`
  - **Commit:** `DVX-TK-023 Scaffold feature:dividends module`

### Phase 3: MVI
- [ ] **`DividendsContract`** — State: `summary, projectionBars, upcomingPayments, historyByMonth, expandedMonths, isLoading, error` · Event: `SecurityClicked, MonthGroupToggled, Refresh` · Effect: `NavigateToSecurity(ticker)`
- [ ] **`DividendsViewModel`** + unit tests — all 4 integration use cases on init; most recent month expanded by default
  - **Verify:** `./gradlew :feature:dividends:jvmTest`
  - **Commit:** `DVX-TK-023 Add DividendsViewModel with unit tests`

- [ ] **`DividendsScreen`**
  - Critical Metrics Block (6 values + YoC progress indicator)
  - 12-month bar chart (filled past / outlined future)
  - Upcoming Payments list (Confirmed green / Estimated gray badge)
  - Collapsible month groups (Cash vs Reinvested visual distinction)
  - **Commit:** `DVX-TK-023 Add DividendsScreen UI`

### Phase 4: Navigation + Koin
- [ ] **Wire `DividendsRoute` in `mainGraph`** — `onSecurityClick(ticker)` → `SecurityDetailRoute`
- [ ] **Register `:feature:dividends` Koin module** in `App.kt` startKoin
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-023 Wire DividendsRoute and register dividends Koin module`

### Phase 5: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 0 **Remaining:** 7
