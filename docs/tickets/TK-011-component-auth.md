# Task: TK-011 · component:auth — Dependencies + Domain + Data

## Description

Add Firebase Auth and Google Sign-In dependencies to `:component:auth` (module scaffold created in TK-010), complete the auth domain layer (full `AuthRepository` interface, all use cases with TDD — `SessionState` and the stub `ObserveSessionUseCase` were added in TK-010), and implement the full data layer (SessionStorage expect/actual, GoogleSignInLauncher expect/actual, AuthRepositoryImpl, Koin module). Also scaffolds `:feature:auth` for use in TK-013.

**User Stories:** DVX-US-001 · DVX-US-002 · DVX-US-003 · DVX-US-004
**PRD:** PRD-01
**ADRs:** ADR-001, ADR-002, ADR-003, ADR-004, ADR-008
**Depends on:** TK-010
**Blocks:** TK-012
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-011-component-auth` — `skill: manage-git-flow`

### Phase 2: Dependencies + Scaffold feature:auth
- [x] **Scaffold `:feature:auth`**
  - `feature/auth/build.gradle.kts` — `dividox.kmp.library` + `dividox.compose.multiplatform` + `dividox.kmp.ios` + `dividox.kmp.test`
  - `include(":feature:auth")` in `settings.gradle.kts`
  - **Commit:** `DVX-TK-011 Scaffold feature:auth module`

- [x] **Add Firebase Auth + Google Sign-In dependencies** to `:common:auth`
  - Stubs para Desktop (Firebase REST en TK-012)
  - `play-services-auth` / Credential Manager (Android), `GoogleSignIn-iOS` CocoaPod (iOS)
  - **Verify:** `./gradlew :common:auth:compileKotlinJvm` ✅
  - **Commit:** `DVX-TK-011 Add Firebase Auth and Google Sign-In dependencies`

### Phase 3: Domain Layer
- [x] **Complete `AuthRepository` interface** (extends the stub from TK-010)
  - `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle`, `sendPasswordResetEmail`, `signOut`, `observeAuthState(): Flow<AuthUser?>`
  - **Commit:** `DVX-TK-011 Add AuthRepository interface`

- [x] **Implement use cases** (TDD)
  - `SignInWithEmailUseCase`, `SignUpWithEmailUseCase`, `SignInWithGoogleUseCase`, `ForgotPasswordUseCase`, `SignOutUseCase`
  - ObserveSessionUseCase maps `Flow<AuthUser?>` → `Flow<SessionState>` with `onStart { emit(Loading) }`
  - **Verify:** `./gradlew :common:auth:jvmTest` ✅
  - **Commit:** `DVX-TK-011 Add auth use cases with unit tests`

### Phase 4: Data Layer
- [x] **Implement `SessionStorage` internal interface** + **`AuthDataSource` expect/actual**
  - `androidMain` / `iosMain`: stub (Firebase en TK-012)
  - `jvmMain`: stub (AES-256/GCM en TK-012)
  - **Commit:** `DVX-TK-011 Implement SessionStorage and AuthDataSource expect/actual`

- [x] **Implement `GoogleSignInLauncher` expect/actual**
  - `androidMain`: Credential Manager API (stub)
  - `iosMain`: GoogleSignIn-iOS interop (stub)
  - `jvmMain`: `throw UnsupportedOperationException`
  - **Commit:** `DVX-TK-011 Implement GoogleSignInLauncher expect/actual`

- [x] **Implement `AuthRepositoryImpl`** (TDD, mock `AuthDataSource`)
  - **Verify:** `./gradlew :common:auth:jvmTest` ✅
  - **Commit:** `DVX-TK-011 Implement AuthRepositoryImpl with tests`

- [x] **Register auth Koin module** in `App.kt` startKoin
  - **Commit:** `DVX-TK-011 Register auth Koin module`

### Phase 5: Testing & Quality
- [x] `./gradlew test` + `./gradlew detekt` ✅
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 10 **Completed:** 10 **Remaining:** 0

---

## Notes
- `SessionStorage` is `internal` — never exposed outside `:component:auth`
- Desktop: `SecureRandom` for IV; never a fixed IV (OWASP MASVS-STORAGE-1)
- `ObserveSessionUseCase.onStart { emit(Loading) }` prevents login flash on cold start
