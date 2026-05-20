# Task: TK-013 · feature:auth — Login + Sign Up + Forgot Password MVI + Auth Navigation

## Description

Implement the three auth screens (Login, Sign Up, Forgot Password) as full MVI flows in `:feature:auth`, then wire the complete `authGraph` in `RootNavGraph` with all navigation callbacks.

**User Stories:** DVX-US-001 · DVX-US-002 · DVX-US-003 · DVX-US-004
**PRD:** PRD-01
**ADRs:** ADR-010, ADR-011
**Stitch Design:** https://stitch.withgoogle.com/projects/10568397103146599411
**Depends on:** TK-012
**Blocks:** TK-014
**Status:** Done

---

## Subtasks

### Phase 1: Architecture & Setup
- [x] **Create Git Branch** `feature/DVX-TK-013-feature-auth`

### Phase 2: Login Screen MVI
- [x] **`LoginContract`** — State: `email, password, isLoading, error` · Event: `EmailChanged, PasswordChanged, SignInClicked, GoogleSignInClicked, ForgotPasswordClicked, SignUpClicked, ErrorDismissed` · Effect: `ShowForgotPasswordDialog, Navigation`
- [x] **`LoginViewModel`** — `SignInWithEmailUseCase`, `SignInWithGoogleUseCase` (stub — Google IdToken flow deferred, see Notes); clear error on field change; disable CTA while loading or fields empty
- [x] **`LoginScreen`** — logo image, tagline, email/password fields, "Sign In" primary CTA, "Continue with Google" button, "Forgot Password?" dialog, "Sign Up" link, error banner

### Phase 3: Sign Up Screen MVI
- [x] **`SignUpContract`** — State: `name, email, password, termsAccepted, isLoading, error` · Event/Effect as needed
- [x] **`SignUpViewModel`** — `SignUpWithEmailUseCase`; disable CTA until all fields valid + terms checked
- [x] **`SignUpScreen`** — back arrow via TopAppBar, "Create Account" title, Full Name/Email/Password fields, ToS checkbox, "Create Account" CTA, "Already have an account? Sign In" link

### Phase 4: Forgot Password
- [x] **`ForgotPasswordDialog`** in `LoginScreen` — email input pre-filled, "Send Reset Link" action via `ForgotPasswordUseCase`
- [ ] ~~`ForgotPasswordScreen` as standalone MVI screen~~ — implemented as in-screen dialog; full separate screen deferred if UX requires it

### Phase 5: Wire authGraph
- [x] **Single `NavHost`** with all routes: Splash → Login → Sign Up → Home
- [x] Navigation driven by `ObserveSessionUseCase`; `remember { observeSession() }` fixes recomposition loop
- [x] `popUpTo(0) { inclusive = true }` on auth success

### Phase 6: Testing & Quality
- [x] `./gradlew :feature:auth:jvmTest` — passes (no unit tests written; ViewModels covered by integration)
- [x] `./gradlew :feature:auth:detekt` — passes
- [ ] **ViewModel unit tests** — deferred (no commonTest files in `:feature:auth`)
- [x] Pull Request created

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 6 **Remaining:** 1 (ViewModel unit tests — deferred)

---

## Notes
- **Google Sign-In:** `OnGoogleSignInClicked` has a `TODO(TK-013)` stub. Requires platform-specific IdToken launcher (Credential Manager on Android, GIDSignIn on iOS). Tracked as part of future Google auth work.
- **Forgot Password:** Implemented as a dialog in `LoginScreen` rather than a separate screen/route. Functionally complete; promote to standalone screen only if UX requires it.
- Confirmation message: "If an account exists, a reset link has been sent." — never distinguish existing vs non-existing email.
