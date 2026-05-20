# Task: TK-028 · component:settings — BiometricAuthenticator expect/actual

## Description

Implement the `BiometricAuthenticator` expect/actual class in `:component:settings` for all three platforms: `BiometricPrompt` on Android, `LocalAuthentication` on iOS, and a no-op on Desktop.

**User Stories:** DVX-US-027
**ADRs:** ADR-005
**Depends on:** TK-027
**Blocks:** TK-029
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-028-biometric-authenticator` — `skill: manage-git-flow`

### Phase 2: BiometricAuthenticator expect/actual
- [ ] **`BiometricResult` sealed class (commonMain)** — `Success | Failure(reason: String) | NotAvailable`
- [ ] **`expect class BiometricAuthenticator` (commonMain)** — `suspend fun authenticate(): BiometricResult`
  - Location: `component/settings/src/commonMain/kotlin/.../data/biometric/BiometricAuthenticator.kt`
  - **Commit:** `DVX-TK-028 Add BiometricAuthenticator expect class and BiometricResult`

- [ ] **`androidMain` actual** — `BiometricPrompt` API (AndroidX Biometric); title "Unlock DiviDox"
  - **Commit:** `DVX-TK-028 Implement BiometricAuthenticator androidMain actual`

- [ ] **`iosMain` actual** — `LAContext.evaluatePolicy(.deviceOwnerAuthenticationWithBiometrics, ...)`
  - **Commit:** `DVX-TK-028 Implement BiometricAuthenticator iosMain actual`

- [ ] **`jvmMain` actual** — always returns `BiometricResult.NotAvailable`
  - **Commit:** `DVX-TK-028 Implement BiometricAuthenticator jvmMain no-op`

### Phase 3: Testing & Quality
- [ ] `./gradlew test` + `./gradlew detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 6 **Completed:** 0 **Remaining:** 6

---

## Notes
- Desktop: Biometric Lock toggle in SettingsScreen must be hidden (not just disabled)
- iOS: `NSFaceIDUsageDescription` required in Info.plist before App Store submission
