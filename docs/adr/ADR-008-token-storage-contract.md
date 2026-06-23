# ADR-008: Token Storage Contract — Domain Abstraction and Per-Platform Encryption

## Status
Accepted

## Context

ADR-003 established the high-level strategy: delegate session persistence to Firebase SDKs on Android and iOS, and implement manual encrypted storage on Desktop JVM. That decision answers *where* tokens are stored, but leaves open *how* the rest of the codebase interacts with that storage in a uniform, safe, and testable way.

Three specific problems remain:

1. **No standard API** for save/clear/read operations. Without an explicit contract, callers could bypass the repository and access the Firebase SDK or KeyStore directly, breaking Clean Architecture boundaries.
2. **No domain enforcement** that the token never leaks outside `:component:auth`. The raw JWT is a sensitive credential — it must never reach a ViewModel, a Composable, or any layer above the repository.
3. **Desktop JVM gap**. Firebase Auth SDK is not available on JVM; a concrete, auditable encryption strategy is needed.

This ADR defines the `SessionStorage` interface as the internal contract for token lifecycle management within `:component:auth`, and specifies the encryption requirements per platform.

## Decision

### 1. `SessionStorage` — internal data-layer contract

Define `SessionStorage` as an **internal interface** in `:component:auth`, inside the `data/datasource/` package. It is never exposed to consumers outside the component.

```kotlin
// :component:auth — data/datasource/SessionStorage.kt
internal interface SessionStorage {
    /** Persists a Firebase ID token (and optionally a refresh token). */
    suspend fun saveToken(token: String, refreshToken: String? = null)

    /** Removes all stored credentials. Must be called on sign-out. */
    suspend fun clearToken()

    /** Returns the stored token, or null if not authenticated. */
    suspend fun readToken(): String?

    /** Emits the current AuthUser on subscription and on every auth state change. Emits null when signed out. */
    fun observeAuthState(): Flow<AuthUser?>
}
```

`AuthRepository` is the **only public API** exposed from `:component:auth` to the rest of the app. Use cases and ViewModels never call `SessionStorage` directly.

```
:component:auth
└── domain/
│   └── repository/AuthRepository.kt     ← public API (interface)
└── data/
    ├── datasource/SessionStorage.kt     ← internal interface
    ├── datasource/AuthDataSource.kt     ← expect class, implements SessionStorage per platform
    └── repository/AuthRepositoryImpl.kt ← delegates to AuthDataSource
```

### 2. Per-platform implementation via `expect/actual`

`AuthDataSource` is an `expect class` that implements `SessionStorage`. Each platform actual provides the correct storage backend:

#### Android (actual: `androidMain`)

Token storage is **fully delegated to the Firebase SDK**. The Android Keystore backs `FirebaseAuth` token persistence automatically (no manual storage needed).

- `saveToken()` → no-op; Firebase persists the session internally after sign-in.
- `clearToken()` → calls `FirebaseAuth.getInstance().signOut()`.
- `readToken()` → calls `FirebaseAuth.getInstance().currentUser?.getIdToken(false)` on-demand (suspending). Never cached in a field.
- `observeAuthState()` → wraps `FirebaseAuth.addAuthStateListener` as `callbackFlow`.

`EncryptedSharedPreferences` is **not used** for token storage; Firebase already uses the Android Keystore internally. Use `EncryptedSharedPreferences` only for non-sensitive user preferences (distinct concern, separate component).

#### iOS (actual: `iosMain`)

Token storage is **fully delegated to the Firebase SDK**, backed by the iOS Keychain automatically.

- `saveToken()` → no-op.
- `clearToken()` → calls `Auth.auth().signOut()`.
- `readToken()` → calls `Auth.auth().currentUser?.getIDToken(completion:)` on-demand.
- `observeAuthState()` → wraps `Auth.auth().addStateDidChangeListener` as `callbackFlow`.

#### Desktop JVM (actual: `jvmMain`)

Firebase Auth SDK is unavailable. The Desktop actual implements full manual encryption:

- **Storage location**: `~/.dividox/session.enc` (user home directory, restricted permissions `600`).
- **Encryption**: AES-256/GCM. A random 12-byte IV is prepended to each ciphertext.
- **Key management**: The AES master key is stored in a PKCS12 `KeyStore` at `~/.dividox/session.ks`, protected by a passphrase. The passphrase is derived from a combination of the OS user identity and a static app salt (using PBKDF2/HMAC-SHA256, 310 000 iterations).
- `saveToken()` → encrypts and writes to `session.enc`; stores the AES key in `session.ks`.
- `clearToken()` → deletes `session.enc` and removes the KeyStore entry. Both deletions happen atomically via a temp-file rename strategy.
- `readToken()` → reads and decrypts `session.enc`, verifies GCM auth tag.
- `observeAuthState()` → polls `readToken()` on a dedicated coroutine at startup; emits changes via `MutableStateFlow`.

**Security note**: The Desktop passphrase derivation from OS credentials is a best-effort measure on JVM. Before production release, consider integrating with OS-native secret stores (macOS Keychain via `security` CLI, Linux `libsecret`/`secret-tool`). This is tracked as a separate security audit task (OWASP MASVS-STORAGE-1).

### 3. Sign-out contract

`clearToken()` is the **only** sign-out path. `AuthRepositoryImpl.signOut()` must:
1. Call `authDataSource.clearToken()`.
2. Ensure any in-memory token references are released.
3. `ObserveAuthStateUseCase` will automatically emit `null`, triggering the navigation guard in `RootNavGraph`.

```kotlin
// AuthRepositoryImpl.kt
override suspend fun signOut() {
    authDataSource.clearToken()   // platform-specific teardown
}
```

### 4. Token never leaves the data layer

| Layer | Can access raw token? |
|---|---|
| `data/datasource` (SessionStorage impl) | Yes — handles raw JWT |
| `data/repository` (AuthRepositoryImpl) | No — uses `AuthUser` model only |
| `domain/usecase` | No |
| `feature/presentation` (ViewModel) | No |
| `composeApp` (Composable) | No |

## Alternatives Considered

### russhwolf/multiplatform-settings
- **Pros**: Simple KMP API, works across all platforms with no custom code.
- **Cons**: Stores values in plain `SharedPreferences` on Android and `NSUserDefaults` on iOS — both are unencrypted. Fails OWASP MASVS-STORAGE-1. Explicitly rejected in ADR-003.

### Jetpack DataStore (Proto or Preferences)
- **Pros**: Coroutine-native, type-safe with Proto DataStore, well-maintained by Google.
- **Cons**: Android-only library; no KMP support for iOS/Desktop. Would require a separate storage solution per platform, defeating the purpose of a unified interface. Suitable for non-sensitive user preferences, not credentials.

### SQLDelight with SQLCipher encryption
- **Pros**: Full KMP support, strong encryption, queryable.
- **Cons**: Significant overhead (full SQL engine + cipher extension) for storing a single token string. Overkill for this use case.

### Expose `SessionStorage` publicly (outside `:component:auth`)
- **Pros**: Flexibility for callers to read tokens for HTTP auth headers.
- **Cons**: Violates Clean Architecture — the HTTP client should receive a token interceptor/provider injected from `:component:auth`, not call `SessionStorage` directly. Token exposure surface grows unnecessarily.

### Store token in ViewModel `SavedStateHandle`
- **Pros**: Survives process death on Android.
- **Cons**: `SavedStateHandle` is backed by a `Bundle` (plain text, accessible via ADB backup on debug builds). Presents the raw JWT in the presentation layer. Violates separation of concerns.

## Consequences

### Positive
- Single, auditable interface for all token operations across three platforms.
- Raw JWT never escapes the `data/datasource` layer — ViewModel and UI are never exposed to credentials.
- Mobile platforms rely on battle-tested SDK-managed keystores; no custom crypto risk on Android/iOS.
- `SessionStorage` is easily mockable in unit tests for `AuthRepositoryImpl`.
- `clearToken()` as the single sign-out path prevents partial logout states.

### Negative
- Desktop JVM implementation requires custom AES/GCM code, which must be security-reviewed.
- Desktop `observeAuthState()` relies on polling rather than a native callback, introducing minor latency on session expiry detection.
- `saveToken()` being a no-op on mobile may be surprising for contributors; requires clear documentation in the interface KDoc.

## Implementation Notes
- `AuthDataSource` expect class declared in `commonMain`; actuals in `androidMain`, `iosMain`, `jvmMain`.
- `SessionStorage` is `internal` to prevent external modules importing it.
- Add `@VisibleForTesting` to `readToken()` in tests only via a test-scoped Koin override.
- Desktop encryption implementation must use `SecureRandom` for IV generation — never a fixed IV.

## Boundary with DataStore

`SessionStorage` and `DataStore` serve different purposes and must not be conflated:

| Concern | Storage |
|---|---|
| Firebase ID token / refresh token | `SessionStorage` (Firebase SDK / Desktop AES) |
| User preferences (currency, biometric, notifications) | `DataStore<Preferences>` in `:component:settings` |
| Non-sensitive cached data | `Room` in the relevant component |

`EncryptedSharedPreferences` is **not used** anywhere in the project — `SessionStorage` covers encrypted credentials; `DataStore` covers preferences (which are non-sensitive).

## Related
- [ADR-002](ADR-002-clean-architecture-auth-module-split.md): Module split that defines where `SessionStorage` lives
- [ADR-003](ADR-003-secure-token-session-storage.md): High-level storage strategy this ADR expands upon
- [ADR-004](ADR-004-social-auth-provider-integration.md): Social auth launchers that produce the token saved here
- [ADR-012](ADR-012-local-persistence-room-datastore.md): Room and DataStore usage strategy
- [ADR-013](ADR-013-user-session-lifecycle.md): `SessionState` sealed interface and `ObserveSessionUseCase` — the public session representation built on top of this storage contract
- TK-004: Auth Data Layer implementation
- TK-005: Session lifecycle implementation (`SessionState`, `ObserveSessionUseCase`, token refresh)
