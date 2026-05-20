# ADR-004: Social Auth Provider Integration (Google + Apple)

## Status
Accepted

## Context
The app must support Google Sign-In alongside Email/Password. Social auth requires platform-native UI flows (consent screens, OS sheets) that cannot be fully abstracted in commonMain.

**Sign in with Apple** is explicitly **out of scope for v1** (PRD-01). If it is added in a future version, Apple Sign-In is mandatory on iOS whenever any other social provider is offered (App Store Review Guideline 4.8), so it must be added before any App Store submission that includes Google Sign-In on iOS.

## Decision
Use **expect/actual** for the platform-specific launch of the Google Sign-In flow:

```kotlin
// commonMain
expect class GoogleSignInLauncher {
    suspend fun launch(): String // idToken
}
```

The resulting ID token is passed to Firebase Auth in `AuthRepositoryImpl` (common code), which exchanges it for a Firebase session.

### Google Sign-In
- **Android**: `Credential Manager API` (Android 14+) with `GoogleSignInClient` fallback
- **iOS**: `GoogleSignIn-iOS` CocoaPods SDK via Kotlin/Native interop
- **Desktop**: Not supported in v1 — throws `UnsupportedOperationException`. Desktop supports Email/Password only.

## Consequences
- **Positive**: Native UX for each platform; single credential contract in commonMain
- **Negative**: Google Sign-In on iOS requires CocoaPods config; Desktop limited to Email/Password
- **Future**: Before iOS App Store submission with Google Sign-In enabled, Apple Sign-In must be added (App Store Guideline 4.8)

## Related
- [ADR-001](ADR-001-firebase-authentication-backend.md): Firebase as Authentication Backend
- DVX-13: Google Sign-In Launchers
