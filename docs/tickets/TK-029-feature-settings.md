# Task: TK-029 · feature:settings — Scaffold + MVI + Navigation + Currency Propagation

## Description

Scaffold `:feature:settings`, implement the full Settings screen MVI with all sub-flows (biometric, currency, notifications, export, delete account, sign out), wire `SettingsRoute` in `mainGraph`, and inject `GetSettingsUseCase` into `DashboardViewModel` and `AddHoldingViewModel` so currency changes propagate immediately across the app.

**User Stories:** DVX-US-023 · DVX-US-027 · DVX-US-028 · DVX-US-029 · DVX-US-030 · DVX-US-031 · DVX-US-032
**PRD:** PRD-08
**ADRs:** ADR-005, ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-025, TK-028
**Blocks:** —
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-029-feature-settings` — `skill: manage-git-flow`

### Phase 2: Scaffold
- [ ] **Scaffold `:feature:settings`**
  - `feature/settings/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:settings")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :feature:settings:compileKotlinJvm`
  - **Commit:** `DVX-TK-029 Scaffold feature:settings module`

### Phase 3: MVI
- [ ] **`SettingsContract`**
  - State: `settings: UserSettings?, appVersion: String, isLoading, error`
  - Event: `BiometricToggled, CurrencyChanged(currency), NotificationsClicked, FavoritesClicked, ExportClicked, DeleteAccountClicked, DeleteAccountConfirmed, SignOutClicked, SignOutConfirmed, HelpClicked, AboutClicked, TermsClicked, PrivacyClicked`
  - Effect: `NavigateToFavorites, NavigateToLogin, ShowDeleteConfirmDialog, ShowSignOutConfirmDialog, LaunchShareSheet(fileUri), OpenUrl(url), ShowError(message)`
  - **Commit:** `DVX-TK-029 Add SettingsContract`

- [ ] **`SettingsViewModel`** + unit tests
  - `GetSettingsUseCase` → observe reactively; `UpdateCurrencyUseCase`, `UpdateBiometricLockUseCase` on toggles
  - `SignOutUseCase` on confirmed sign out → `NavigateToLogin`
  - Delete account: sign out + Firestore delete (re-auth deferred to post-v1)
  - Portfolio export: CSV to temp dir → `LaunchShareSheet`
  - **Verify:** `./gradlew :feature:settings:jvmTest`
  - **Commit:** `DVX-TK-029 Add SettingsViewModel with unit tests`

- [ ] **`SettingsScreen`**
  - Header "Profile & Settings"
  - Security & Preferences: Biometric Lock toggle (hidden on Desktop) · Notifications row (hidden on Desktop) · Currency toggle [USD|EUR]
  - Portfolio: **Favorites row** → navigates to Favorites screen
  - Support & Help: Help Center row · Contact Support button
  - Legal & About: About DiviDox · Terms & Conditions · Privacy Policy
  - Data Management: Export Portfolio · Delete Account (destructive)
  - Sign Out full-width red button
  - Footer: "v{major}.{minor}.{patch} (Build {number})"
  - Confirmation dialogs for Sign Out and Delete Account
  - **Commit:** `DVX-TK-029 Add SettingsScreen UI`

### Phase 4: Navigation + Koin
- [ ] **Wire `SettingsRoute` in `mainGraph`** — `onFavoritesClicked` → `FavoritesRoute` · Sign Out/Delete → `LoginRoute` with `popUpTo(0) { inclusive = true }` · `onOpenUrl` → platform `UriHandler` · `onLaunchShareSheet` → platform share intent
- [ ] **Register `:feature:settings` Koin module** in `App.kt` startKoin
  - **Verify:** `./gradlew :composeApp:assembleDebug`
  - **Commit:** `DVX-TK-029 Wire SettingsRoute and register settings Koin module`

### Phase 5: Currency Propagation
- [ ] **Inject `GetSettingsUseCase` into `DashboardViewModel`** — replace local currency state with `settings.map { it.baseCurrency }`; currency toggle calls `UpdateCurrencyUseCase` (persisted)
  - **Verify:** `./gradlew :feature:dashboard:jvmTest`
  - **Commit:** `DVX-TK-029 Wire currency setting to DashboardViewModel`

- [ ] **Inject `GetSettingsUseCase` into `AddHoldingViewModel`** — replace hardcoded "USD" default with `settings.baseCurrency`
  - **Verify:** `./gradlew :feature:portfolio:jvmTest`
  - **Commit:** `DVX-TK-029 Wire currency setting to AddHoldingViewModel`

### Phase 6: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 9 **Completed:** 0 **Remaining:** 9

---

## Notes
- Biometric toggle takes effect immediately — no "Save" button
- Delete Account confirmation: "Are you sure? This action is permanent and cannot be undone."
- Export: write to temp dir → share sheet; do NOT write to public storage
- `Flow<UserSettings>` from `SettingsRepository` is the single currency source of truth — Dashboard and Portfolio subscribe, never maintain their own currency state
- This is the final ticket — after TK-029, DiviDox v1 is feature-complete
