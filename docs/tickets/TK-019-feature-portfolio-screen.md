# Task: TK-019 · feature:portfolio — Scaffold + Portfolio Screen MVI + Navigation

## Description

Scaffold `:feature:portfolio`, implement the Portfolio (My Holdings) list screen MVI, and wire `PortfolioRoute` in `mainGraph`.

**User Stories:** DVX-US-011 · DVX-US-012 · DVX-US-013
**PRD:** PRD-03
**ADRs:** ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-018
**Blocks:** TK-020
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-019-feature-portfolio-screen` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [ ] **Scaffold `:feature:portfolio`**
  - `feature/portfolio/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:portfolio")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :feature:portfolio:compileKotlinJvm`
  - **Commit:** `DVX-TK-019 Scaffold feature:portfolio module`

### Phase 3: MVI
- [ ] **`PortfolioContract`**
  - State: `holdings: List<SecurityHolding>, isLoading, searchQuery, sortOrder: SortOrder, error`
  - Event: `SearchQueryChanged, SortOrderChanged, AddHoldingClicked, EditHoldingClicked(id), SecurityClicked(ticker)`
  - Effect: `NavigateToAddHolding, NavigateToEditHolding(holdingId), NavigateToSecurity(ticker)`
  - **Commit:** `DVX-TK-019 Add PortfolioContract`

- [ ] **`PortfolioViewModel`** + unit tests
  - `GetPortfolioWithQuotesUseCase` → enriched live list; client-side search + sort
  - Sort chips: Gain / Max Yield % / Date Added; active chip tap toggles asc/desc
  - **Verify:** `./gradlew :feature:portfolio:jvmTest`
  - **Commit:** `DVX-TK-019 Add PortfolioViewModel with unit tests`

- [ ] **`PortfolioScreen`**
  - Full-width search bar · sort chips · scrollable holding cards (logo · ticker · shares · price · dividend % · total value · gain badge)
  - "+" FAB · empty state: "No holdings yet. Tap + to add your first one."
  - **Commit:** `DVX-TK-019 Add PortfolioScreen UI`

### Phase 4: Navigation + Koin
- [ ] **Wire `PortfolioRoute` in `mainGraph`**
- [ ] **Register `:feature:portfolio` Koin module** in `App.kt` startKoin
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-019 Wire PortfolioRoute and register portfolio Koin module`

### Phase 5: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 0 **Remaining:** 7

---

## Notes
- Gain badge: green `+X.X%` / red `-X.X%` relative to cost basis
- Fractional shares: display up to 4 decimal places
