# ADR-013: User Session Lifecycle Management

## Status
Accepted

## Context

ADR-003 and ADR-008 define *how* authentication tokens are stored across platforms. They answer "where does the token live?" but leave open "what does the rest of the app see when it asks about session state?".

Three problems exist without an explicit session lifecycle model:

1. **`Flow<AuthUser?>` is ambiguous at cold start.** `null` can mean "not yet resolved" or "definitely unauthenticated". Without a `Loading` state, the nav guard in `RootNavGraph` must choose between flashing the Login screen briefly on every launch or waiting for an arbitrary delay — both are wrong.

2. **Token refresh is implicit.** Firebase handles refresh automatically on mobile, but Desktop requires a manual REST call. There is no defined policy for what happens when refresh fails (network error, revoked refresh token, etc.).

3. **Session invalidation events are scattered.** Sign-out, account deletion, and server-side revocation all terminate the session. There is no single point that guarantees the app always reacts consistently to any of these.

This ADR introduces `SessionState` as the canonical session representation, defines `ObserveSessionUseCase` as its producer, and specifies token refresh and invalidation policies per platform.

## Decision

### 1. `SessionState` — sealed interface

Define `SessionState` in `:component:auth` domain layer, exposed via `ObserveSessionUseCase`:

```kotlin
// :component:auth — domain/model/SessionState.kt
sealed interface SessionState {
    /** Initial state — session resolution is in progress. Never show auth UI. */
    data object Loading : SessionState

    /** Valid session confirmed. */
    data class Authenticated(val user: AuthUser) : SessionState

    /** No valid session. Navigate to Login. */
    data object Unauthenticated : SessionState
}
```

`SessionState.Loading` is emitted exactly once per app process — between cold start and the first Firebase auth state callback (or Desktop token read). Once resolved, the flow never returns to `Loading`.

### 2. `ObserveSessionUseCase`

Replace `ObserveAuthStateUseCase` (which returned `Flow<AuthUser?>`) with `ObserveSessionUseCase`:

```kotlin
// :component:auth — domain/usecase/ObserveSessionUseCase.kt
class ObserveSessionUseCase(private val repository: AuthRepository) {
    operator fun invoke(): Flow<SessionState> = repository
        .observeAuthState()        // Flow<AuthUser?> from AuthRepositoryImpl
        .map { user ->
            if (user != null) SessionState.Authenticated(user)
            else SessionState.Unauthenticated
        }
        .onStart { emit(SessionState.Loading) }
}
```

The `onStart { emit(SessionState.Loading) }` guarantees the nav guard never sees an unresolved state.

### 3. Nav guard pattern in `RootNavGraph`

```kotlin
// composeApp — RootNavGraph.kt
val sessionState by observeSessionUseCase().collectAsStateWithLifecycle(SessionState.Loading)

when (sessionState) {
    SessionState.Loading       -> SplashScreen()
    SessionState.Unauthenticated -> authGraph(...)
    is SessionState.Authenticated -> mainGraph(...)
}
```

The splash screen is shown only during `Loading` (typically < 300ms on mobile). No artificial delays.

### 4. Token refresh policy

#### Android / iOS
Firebase SDK refreshes the ID token silently and automatically before expiry (every ~55 minutes). `observeAuthState()` emits only when the user object changes, not on token rotation. No action required by the app.

#### Desktop JVM
The Desktop actual (`jvmMain`) must implement proactive refresh:

1. On cold start, read the stored ID token and check its `exp` claim (JWT decode, no signature verification needed here).
2. If token is valid and not expiring within 5 minutes → emit `Authenticated`.
3. If token is expired or expiring within 5 minutes → call `securetoken.googleapis.com/v1/token` with the stored refresh token.
   - On success: save the new ID token + refresh token; emit `Authenticated`.
   - On failure (network error): emit `Authenticated` with the old token (best-effort); Ktor interceptor will retry on 401.
   - On 400 `TOKEN_EXPIRED` or `USER_DISABLED`: call `clearToken()`; emit `Unauthenticated`.
4. A Ktor interceptor in `:component:market` and `:component:portfolio` detects `401 Unauthorized` responses and triggers a token refresh before retrying the request once.

### 5. Session invalidation

Any of the following must result in `SessionState.Unauthenticated` being emitted:

| Trigger | Mechanism |
|---|---|
| User taps Sign Out | `AuthRepositoryImpl.signOut()` → `clearToken()` → Firebase/Desktop logs out → `Unauthenticated` |
| User deletes account | Firebase delete → `clearToken()` → `Unauthenticated` |
| Refresh token revoked server-side | Token refresh fails with `TOKEN_EXPIRED` → `clearToken()` → `Unauthenticated` |
| Session file corrupted (Desktop) | `readToken()` throws → `clearToken()` → `Unauthenticated` |

`clearToken()` from ADR-008 is the **single sign-out path** — no session can be terminated without going through it.

### 6. Splash screen requirement

The `SplashScreen` composable shown during `Loading` must:
- Show the DiviDox logo centred on a background matching the theme.
- Not be navigable via back button.
- Be dismissed as soon as `Loading` transitions to any other state — typically < 300ms on mobile, < 1s on Desktop (includes token file read and optional refresh).

## Alternatives Considered

### Keep `Flow<AuthUser?>` with a null-means-loading convention
- Rejected: `null` is already used to mean "unauthenticated". Overloading its meaning requires callers to use a separate boolean flag, which leads to inconsistent state management across ViewModels.

### Use `StateFlow<SessionState>` with a default `Loading`
- Valid approach. The current design uses `Flow` with `onStart` to keep the use case stateless. A `StateFlow` in `AuthRepositoryImpl` is acceptable but introduces shared mutable state; deferred to implementer preference as long as `Loading` is the initial value.

### SessionManager as a separate class
- Considered wrapping the session logic in a `SessionManager` singleton (Koin single). Rejected for v1: the logic is simple enough to live in `AuthRepositoryImpl` + `ObserveSessionUseCase`. If session state needs to be shared across multiple consumers simultaneously, revisit with `SharedFlow`.

## Consequences

### Positive
- No login-screen flash on cold start — `Loading` absorbs the resolution window.
- Single sealed type makes nav guard exhaustive and type-safe.
- Token refresh policy is explicit and auditable, not implicit.
- Any session invalidation path goes through `clearToken()` — no partial logout states.

### Negative
- `ObserveAuthStateUseCase` is renamed to `ObserveSessionUseCase` — existing callers (nav guard stub from TK-001) must be updated in TK-009.
- Desktop refresh logic adds complexity to `jvmMain` actual — must be tested with expired-token scenarios.

## Implementation Notes
- `SessionState` lives in `component/auth/src/commonMain/kotlin/.../domain/model/SessionState.kt`
- `ObserveSessionUseCase` lives in `component/auth/src/commonMain/kotlin/.../domain/usecase/`
- The Ktor 401 interceptor lives in `:component:market` and `:component:portfolio` — inject a `TokenProvider` (lambda `suspend () -> String?`) from `:component:auth` to avoid circular module dependencies
- Desktop `exp` claim parsing: decode base64url middle segment of JWT, parse JSON — no external library needed for this simple operation

## Related
- [ADR-003](ADR-003-secure-token-session-storage.md): High-level storage strategy (token persistence)
- [ADR-008](ADR-008-token-storage-contract.md): `SessionStorage` interface and per-platform encryption
- [ADR-011](ADR-011-navigation.md): `RootNavGraph` auth guard that consumes `SessionState`
- DVX-US-033: Session persistence across restarts
- DVX-US-034: Automatic redirect on session expiry
- TK-005: Implementation of `SessionState` + `ObserveSessionUseCase` + token refresh
