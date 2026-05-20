# Task: TK-018 · feature:dashboard — Scaffold + MVI + Navigation + MainGraph BottomNavBar

## Description

Scaffold `:feature:dashboard`, implement the full Dashboard MVI (DashboardContract, DashboardViewModel, DashboardScreen), wire `DashboardRoute` inside the new `mainGraph`, and implement the `BottomNavBar` scaffold that hosts all authenticated top-level screens.

This ticket also owns the **`mainGraph`** — the `Scaffold` + `NavigationBar` container that replaces the old `HomeRoute` placeholder. All future feature tabs (Portfolio, Dividends, Settings) will plug in here; this ticket adds their stub screens.

**User Stories:** DVX-US-005 · DVX-US-006 · DVX-US-007 · DVX-US-008 · DVX-US-009 · DVX-US-010
**PRD:** PRD-02
**ADRs:** ADR-005, ADR-006, ADR-007, ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-017
**Blocks:** TK-019
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-018-feature-dashboard` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [x] **Scaffold `:feature:dashboard`**
  - `feature/dashboard/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:dashboard")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :feature:dashboard:compileKotlinJvm`
  - **Commit:** `DVX-TK-018 Scaffold feature:dashboard module`

### Phase 3: MVI
- [x] **`DashboardContract`**
  - State: `isLoading, summary: PortfolioSummary?, watchlist: List<EnrichedWatchlistEntry>, selectedPeriod: ChartPeriod, showInEur: Boolean, error`
  - Event: `PeriodSelected(period), CurrencyToggled, FavouriteToggled(ticker), SecurityClicked(ticker), ViewAllFavouritesClicked`
  - Effect: `NavigateToSecurity(ticker), NavigateToFavorites`
  - **Commit:** `DVX-TK-018 Add DashboardContract`

- [x] **`DashboardViewModel`** + unit tests (MockK, jvmTest)
  - `GetPortfolioSummaryUseCase` + `GetEnrichedWatchlistUseCase` combined with `combine {}` on init
  - `RemoveFromWatchlistUseCase` on `FavouriteToggled`
  - **Verify:** `./gradlew :feature:dashboard:jvmTest`
  - **Commit:** `DVX-TK-018 Add DashboardViewModel with unit tests`

- [x] **`DashboardScreen`**
  - TopAppBar with title + USD/EUR toggle (`FilledTonalButton`)
  - Period selector row `[1D|1W|1M|1Y|YTD|ALL]`
  - 4 metric cards: Total Value · Total Gain % · Yield · Dividends (2×2 grid)
  - Favourites section: header + VIEW ALL + up to 2 `WatchlistEntryRow` entries + empty state
  - "Prices delayed 15 minutes" disclaimer
  - All strings from `strings.xml` (generic keys, no screen prefix)
  - `formatPrice(Currency)` / `formatPercent()` / `formatPercentSigned()` from `common:ui-resources`
  - Gain colors via `MaterialTheme.extendedColors.profit` / `MaterialTheme.colorScheme.error`
  - **Commit:** `DVX-TK-018 Add DashboardScreen UI`

### Phase 4: MainGraph — BottomNavBar Scaffold
- [ ] **`MainNavTab` sealed class** in `composeApp/navigation/`
  - `Dashboard`, `Portfolio`, `Search` (FAB), `Dividends`, `Settings`
  - Each entry carries: `icon: ImageVector`, `selectedIcon: ImageVector`, `labelRes: StringResource`
  - `Search` tab is the central FAB — no label, distinctive icon
  - List `mainNavTabs` excludes Search (rendered separately as FAB)

- [ ] **`DividoxBottomBar` composable** in `common:ui-resources`
  - M3 `NavigationBar` with items for Dashboard · Portfolio · [Search FAB] · Dividends · Settings
  - Search rendered as a `FloatingActionButton` raised above the bar (use `Scaffold`'s `floatingActionButton` + `floatingActionButtonPosition = FabPosition.Center` and `isFloatingActionButtonDocked = false` if using legacy, or overlay approach with M3)
  - Active tab uses `NavigationBarItem(selected = true)`
  - Strings: `section_dashboard`, `section_portfolio`, `section_dividends`, `section_settings` (add to `strings.xml`)
  - Icons: use `Icons.Outlined.*` for inactive, `Icons.Filled.*` for active

- [ ] **`MainGraphRoute`** in `composeApp/navigation/MainNavigation.kt`
  - `@Serializable data object MainGraphRoute`
  - `fun NavController.navigateToMain(navOptions)`
  - `fun NavGraphBuilder.mainGraphNode(navController)` — `composable<MainGraphRoute>` containing:
    - Inner `rememberNavController()` (tab nav controller)
    - `Scaffold(bottomBar = { DividoxBottomBar(...) })` wrapping `NavHost` for tab content
    - Back stack save/restore: each tab switch uses `saveState = true` / `restoreState = true` / `launchSingleTop = true`
  - Tabs inside the inner `NavHost`:
    - `DashboardRoute` → `dashboardScreenNode(innerNavController)` (moved from root)
    - `PortfolioRoute` → stub composable "Portfolio — coming soon"
    - `DividendsRoute` → stub composable "Dividends — coming soon"
    - `SettingsRoute` → stub composable "Settings — coming soon"
  - `SecurityDetailRoute` and `FavoritesRoute` remain in the **outer** `RootNavGraph` (full-screen, no bottom bar)
  - FAB (`SearchRoute`) navigates via **outer** `navController` to a future full-screen search

- [ ] **Update `RootNavGraph`**
  - Replace `homeScreenNode(navController)` + `dashboardScreenNode(navController)` with `mainGraphNode(navController)`
  - Auth guard navigates to `MainGraphRoute` on `Authenticated`
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-018 Add MainGraph BottomNavBar scaffold and wire DashboardRoute`

### Phase 5: Navigation + Koin
- [x] **Register `:feature:dashboard` Koin module** in `KoinInitializer`
- [ ] Add stub Koin modules (empty for now) for Portfolio, Dividends, Settings so the tab NavHost compiles

### Phase 6: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 12 **Completed:** 6 **Remaining:** 6

---

## Notes

### BottomNavBar architecture (adapted from cgm-otc-android pattern)
cgm-otc-android uses Navigation3 with independent per-tab back stacks managed by `BottomBarNavState`. Dividox uses standard `androidx.navigation.compose` — the equivalent pattern is:
- One **outer** `NavController` (root) for full-screen destinations outside the bar
- One **inner** `NavController` (tabs) inside `mainGraphNode`, managing tab destinations
- Tab switches call `innerNavController.navigate(tab) { saveState = true; restoreState = true; launchSingleTop = true; popUpTo(startTab) { saveState = true } }` to preserve per-tab back stack state

### Screens inside vs outside the bottom bar
| Inside (inner NavHost) | Outside (root NavHost) |
|---|---|
| DashboardRoute | SecurityDetailRoute |
| PortfolioRoute (stub) | FavoritesRoute |
| DividendsRoute (stub) | SearchRoute (future) |
| SettingsRoute (stub) | |

### Search FAB
Tapping the search FAB navigates via the outer `navController` to `SearchRoute` (full-screen, no bottom bar). TK-026 implements the actual search screen. Until then, FAB can be present but disabled/no-op.

### Currency toggle
`showInEur` state lives in `DashboardViewModel` until TK-029 (Settings) — local state only.
