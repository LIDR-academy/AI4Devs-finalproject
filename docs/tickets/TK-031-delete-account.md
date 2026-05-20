# Task: TK-031 · feature:settings — Delete Account

## Description

Implement proper account deletion triggered from Settings. Replace the TODO stub in `SettingsViewModel.deleteAccount()` that just calls `signOut()`. Full flow: delete Firestore portfolio → delete Firestore watchlist → delete Firebase Auth user → clear local Room dividend cache → navigate to Login.

**Depends on:** TK-030
**Blocks:** —
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-031-delete-account`

### Phase 2: Repository `clearAll()`
- [x] **`PortfolioRepository.clearAll()`** — interface + `FirestorePortfolioDataSource` (batch-delete all docs) + `PortfolioRepositoryImpl` delegate + fix test fakes
  - **Commit:** `DVX-TK-031 Add PortfolioRepository.clearAll`
- [x] **`WatchlistRepository.clearAll()`** — interface + `WatchlistFirestoreDataSource` + `WatchlistRepositoryImpl` delegate + fix test fakes
  - **Commit:** `DVX-TK-031 Add WatchlistRepository.clearAll`

### Phase 3: Auth domain
- [x] **`AuthRepository.deleteAccount(): Result<Unit>`** interface method + `RecentLoginRequiredException` in `component/auth/domain/exception/`
  - **Commit:** `DVX-TK-031 Add deleteAccount to AuthRepository interface`
- [x] **Android `AuthDataSource.deleteAccount()`** — `auth.currentUser?.delete()?.await()`, catch `FirebaseAuthRecentLoginRequiredException` → `RecentLoginRequiredException`
  - **Commit:** `DVX-TK-031 Implement deleteAccount on Android AuthDataSource`
- [x] **iOS `AuthDataSource.deleteAccount()`** — `user.deleteWithCompletion`, check `err.code == FIRAuthErrorCodeRequiresRecentLogin` → `RecentLoginRequiredException`
  - **Commit:** `DVX-TK-031 Implement deleteAccount on iOS AuthDataSource`
- [x] **JVM stub + `AuthRepositoryImpl` delegate** — JVM returns `Unit`, impl wraps in `try/catch`; fix `FakeAuthRepository` in tests
  - **Commit:** `DVX-TK-031 Add deleteAccount stub on JVM and delegate in AuthRepositoryImpl`

### Phase 4: Wire SettingsViewModel
- [x] **`DeleteAccountUseCase`** in `feature/settings` — orchestrates portfolio.clearAll → watchlist.clearAll → auth.deleteAccount → dividend.clearAll
- [x] **Inject `DeleteAccountUseCase`** into `SettingsViewModel`, implement `deleteAccount()` — set `isLoading`, handle `RecentLoginRequiredException`, emit `NavigateToLogin` on success
- [x] **Unit tests**: success → NavigateToLogin, generic failure → ShowError, RecentLoginRequired → ShowError with re-auth message
  - **Commit:** `DVX-TK-031 Add DeleteAccountUseCase with tests and wire SettingsViewModel`

### Phase 5: Quality
- [x] `./gradlew :component:auth:jvmTest :component:portfolio:jvmTest :component:watchlist:jvmTest :feature:settings:jvmTest :component:auth:detekt :feature:settings:detekt`
- [x] Create Pull Request #60

---

## Progress Tracking
**Total Tasks:** 10 **Completed:** 10 **Remaining:** 0

---

## Notes
- Deletion order matters: Firestore must be deleted before Firebase Auth user (auth token must remain valid for Firestore writes)
- `DeleteAccountUseCase` lives in `feature/settings` (not `component/auth`) to avoid cross-component dependencies
- `DividendRepository.clearAll()` returns `Unit`, not `Result<Unit>` — wrap with `runCatching`
