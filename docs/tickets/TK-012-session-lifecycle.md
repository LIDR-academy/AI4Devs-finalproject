# Task: TK-012 · Auth — User Session Lifecycle

## Description

Implement the full session lifecycle: Desktop token refresh logic in `jvmMain` AuthDataSource, wire the real `ObserveSessionUseCase` into `RootNavGraph` replacing the TK-010 stub, and verify the Loading → Authenticated/Unauthenticated flow end-to-end.

**User Stories:** DVX-US-033 · DVX-US-034
**PRD:** PRD-01 (FR-01-04)
**ADRs:** ADR-003, ADR-013
**Depends on:** TK-011
**Blocks:** TK-013
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-012-session-lifecycle` — `skill: manage-git-flow`

### Phase 2: Desktop Token Refresh
- [ ] **Implement proactive refresh** in `jvmMain` `AuthDataSource`
  - Decode JWT `exp` claim (base64url, no external lib)
  - If expiring within 5 min: `POST securetoken.googleapis.com/v1/token` with refresh token
  - Success → save new tokens, continue; `TOKEN_EXPIRED` / `USER_DISABLED` → `clearToken()` → `Unauthenticated`; network error → best-effort with old token
  - **Verify:** `./gradlew :component:auth:jvmTest`
  - **Commit:** `DVX-TK-012 Implement Desktop proactive token refresh`

### Phase 3: Wire into RootNavGraph
- [ ] **Replace stub** with real `ObserveSessionUseCase` in `RootNavGraph`
  - Inject via Koin; collect as `StateFlow` with `Loading` initial value
  - `Loading → SplashScreen` | `Unauthenticated → authGraph` | `Authenticated → mainGraph`
  - **Verify:** `./gradlew :composeApp:jvmTest`
  - **Commit:** `DVX-TK-012 Wire ObserveSessionUseCase into RootNavGraph`

### Phase 4: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 4 **Completed:** 0 **Remaining:** 4

---

## Notes
- `SplashScreen` must block back navigation — use `BackHandler {}`
- Desktop refresh timeout ≤ 1s to avoid user-visible delay on cold start
