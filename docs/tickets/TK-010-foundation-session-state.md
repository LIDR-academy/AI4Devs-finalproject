# Task: TK-010 · Foundation — SessionState & RootNavGraph Guard

## Description

Complete the navigation foundation started in DVX-1. The typed routes and Koin entry point are already in place; this ticket adds the `SessionState` sealed interface and a stub `ObserveSessionUseCase` (always emits `Unauthenticated`) to `:component:auth` domain, wires the `SessionState`-driven guard into `RootNavGraph` (Loading → SplashScreen, Unauthenticated → authGraph, Authenticated → mainGraph), and adds the `SplashScreen` composable. The stub is replaced with the real implementation in TK-012.

**ADRs:** ADR-011, ADR-013
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-009
**Blocks:** TK-011
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-010-foundation-session-state` — `skill: manage-git-flow`

### Phase 2: SessionState Domain
- [ ] **Scaffold `:component:auth`** (minimal — domain only, data layer added in TK-011)
  - `component/auth/build.gradle.kts` — `dividox.kmp.library` + `dividox.kmp.test`
  - `include(":component:auth")` in `settings.gradle.kts`
  - **Verify:** `./gradlew :component:auth:compileKotlinJvm`
  - **Commit:** `DVX-TK-010 Scaffold component:auth module`

- [ ] **Define `SessionState` sealed interface**
  - `Loading`, `Authenticated(user: AuthUser)`, `Unauthenticated`
  - `AuthUser(uid, email, displayName, provider: AuthProvider)` + `AuthProvider` enum
  - Location: `component/auth/src/commonMain/kotlin/.../domain/model/`
  - **Commit:** `DVX-TK-010 Add SessionState and AuthUser domain models`

- [ ] **Define `AuthRepository` interface** (minimal — `observeAuthState(): Flow<AuthUser?>`)
  - **Commit:** `DVX-TK-010 Add AuthRepository interface stub`

- [ ] **Implement stub `ObserveSessionUseCase`** — always emits `Unauthenticated` until TK-012
  - Maps `Flow<AuthUser?>` → `Flow<SessionState>` with `onStart { emit(Loading) }`
  - Location: `component/auth/src/commonMain/kotlin/.../domain/usecase/`
  - **Verify:** `./gradlew :component:auth:jvmTest`
  - **Commit:** `DVX-TK-010 Add ObserveSessionUseCase stub`

### Phase 3: RootNavGraph Guard + SplashScreen
- [ ] **Wire `SessionState` guard in `RootNavGraph`**
  - `collectAsStateWithLifecycle(SessionState.Loading)`
  - `Loading → SplashScreen()` | `Unauthenticated → authGraph {}` | `Authenticated → mainGraph {}`
  - `authGraph {}` and `mainGraph {}` as empty extension functions with placeholder composables
  - `BottomNavBar` scaffold: Home · Portfolio · Search (FAB) · Dividends · Profile
  - **Verify:** `./gradlew :composeApp:jvmTest`
  - **Commit:** `DVX-TK-010 Wire SessionState guard in RootNavGraph`

- [ ] **Add `SplashScreen` composable** — follow Stitch design for logo placement and background colour
  - DiviDox logo centred on theme background; non-dismissable (BackHandler {})
  - **Commit:** `DVX-TK-010 Add SplashScreen composable`

- [ ] **Register stub auth Koin module** in `App.kt` startKoin
  - **Commit:** `DVX-TK-010 Register stub auth Koin module`

### Phase 4: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 8 **Completed:** 0 **Remaining:** 8

---

## Notes
- `SessionState.Loading` prevents login-screen flash on cold start (ADR-013)
- Stub `ObserveSessionUseCase` keeps auth screens reachable while TK-011–TK-013 are in progress
- Full `AuthRepository` implementation and data layer added in TK-011
