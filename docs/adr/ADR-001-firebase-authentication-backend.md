# ADR-001: Firebase as Authentication Backend for KMP

## Status
Accepted

## Context
Dividox needs a cross-platform authentication solution supporting Google Sign-In and Email/Password (Sign in with Apple is out of scope for v1 — see PRD-01). The solution must work across Android, iOS, and Desktop (JVM) targets in a Kotlin Multiplatform project.

## Decision
Use **Firebase Authentication** as the single authentication backend, accessed via:
- `firebase-auth-ktx` on Android
- Native Firebase SDK on iOS via Kotlin/Native interop
- Firebase REST API (via Ktor) on Desktop JVM

Firebase is chosen over alternatives (Auth0, Supabase, custom backend) because:
1. Native SDKs exist for both Android and iOS with full Google Sign-In support
2. Handles token refresh, session persistence, and secure storage natively
3. Google Sign-In is a first-class provider; Apple Sign-In deferred to post-v1
4. Free tier covers MVP scale
5. Team familiarity

## Alternatives Considered

### Supabase
- **Pros**: Open-source, Postgres-native, self-hostable
- **Cons**: KMP SDK is community-maintained, less mature social auth story

### Auth0
- **Pros**: Enterprise-grade, excellent docs
- **Cons**: Cost, no official KMP SDK, requires REST wrappers

### Custom backend
- **Pros**: Full control
- **Cons**: High implementation cost, security risk, not MVP-appropriate

## Consequences
- **Positive**: Fast integration, mature SDKs, built-in token management
- **Negative**: Vendor lock-in to Firebase/Google; Desktop JVM target requires REST fallback via Ktor
- **Risk**: Firebase REST API for Desktop must be maintained separately; consider scoping Desktop auth out of MVP

## Implementation Notes
- Android: `com.google.firebase:firebase-auth-ktx` + `com.google.android.gms:play-services-auth`
- iOS: Native Firebase SDK via CocoaPods + `GoogleSignIn` pod
- Desktop: Firebase REST Auth API via Ktor Client
- All platforms share domain models and use-case interfaces (expect/actual for data sources)

## Related
- [ADR-002](ADR-002-clean-architecture-auth-module-split.md): Clean Architecture for Auth Module Split
- DVX-10: Setup Firebase KMP
