# Task: TK-026 · feature:search — Scaffold + Search MVI + Navigation

## Description

Scaffold `:feature:search`, implement the Search screen MVI with 250ms debounce, and wire `SearchRoute` in `mainGraph` including the central FAB in `BottomNavBar`.

**User Stories:** DVX-US-026
**PRD:** PRD-07
**ADRs:** ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-025
**Blocks:** TK-027
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-026-feature-search` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [ ] **Scaffold `:feature:search`**
  - `feature/search/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:search")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :feature:search:compileKotlinJvm`
  - **Commit:** `DVX-TK-026 Scaffold feature:search module`

### Phase 3: MVI
- [ ] **`SearchContract`** — State: `query, results: List<EnrichedWatchlistEntry>, isLoading, isEmpty, error` · Event: `QueryChanged, FavouriteToggled(ticker), SecurityClicked(ticker), BackClicked` · Effect: `NavigateToSecurity, NavigateBack`
- [ ] **`SearchViewModel`** + unit tests
  - `SearchSecuritiesUseCase` with 250ms debounce; `IsInWatchlistUseCase` for initial heart state; `AddToWatchlistUseCase`/`RemoveFromWatchlistUseCase` on toggle
  - **Verify:** `./gradlew :feature:search:jvmTest`
  - **Commit:** `DVX-TK-026 Add SearchViewModel with unit tests`

- [ ] **`SearchScreen`**
  - Auto-focus search bar · back + "Search" title
  - Placeholder state (before first char) · loading skeleton · `SecurityCard` results
  - No-results: "No results for '{query}'." · offline: "Search requires an internet connection."
  - "Prices delayed 15 minutes" disclaimer
  - **Commit:** `DVX-TK-026 Add SearchScreen UI`

### Phase 4: Navigation + Koin
- [ ] **Wire `SearchRoute` in `mainGraph`** — opens from central FAB in `BottomNavBar` · `onSecurityClick` → `SecurityDetailRoute` · `onBack` → `popBackStack`
- [ ] **Register `:feature:search` Koin module** in `App.kt` startKoin
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-026 Wire SearchRoute and register search Koin module`

### Phase 5: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 0 **Remaining:** 7

---

## Notes
- Debounce: 250ms after LAST keystroke — never fire on every character
