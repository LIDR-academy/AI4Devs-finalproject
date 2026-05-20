# Task: TK-033 · feature:notifications — Dividend Payment Push Notifications

## Description

Implement push notification support so users receive an alert when a dividend payment date arrives for a holding in their portfolio.

- **Android**: Firebase Cloud Messaging (FCM) — subscribe to topic `dividends/{uid}`, display notification on payment date
- **iOS**: APNs via Firebase Cloud Messaging — same topic subscription, notification permissions prompt on first launch
- **JVM Desktop**: no-op stub (local desktop alerts are out of scope for v1)
- **Backend trigger**: a Firebase Cloud Function scheduled daily checks portfolio holdings and sends FCM messages for holdings whose `paymentDate` matches today

**Depends on:** TK-031
**Blocks:** —
**Status:** Backlog

---

## Subtasks

### Phase 1: Architecture & Setup
- [ ] **Create Git Branch** `feature/DVX-TK-033-push-notifications` — `skill: manage-git-flow`

### Phase 2: Firebase Cloud Function
- [ ] **Daily dividend alert function** in `functions/`
  - Scheduled daily at 08:00 UTC
  - Query Firestore `users/{uid}/holdings` for all users; for each holding with `paymentDate == today`, send FCM to topic `dividends/{uid}`
  - Payload: `{ title: "Dividend Payment", body: "{ticker} dividend arrives today ({amount} {currency})" }`
  - **Commit:** `DVX-TK-033 Add daily dividend alert Cloud Function`

### Phase 3: KMP notification permission + FCM subscription
- [ ] **`NotificationPermissionService` expect/actual**
  - Android: `POST_NOTIFICATIONS` runtime permission (API 33+), subscribe to FCM topic on grant
  - iOS: `UNUserNotificationCenter.requestAuthorization`, subscribe to FCM topic on grant
  - JVM: no-op
  - **Commit:** `DVX-TK-033 Add NotificationPermissionService expect/actual`

### Phase 4: Settings integration
- [ ] **Notification preference in `AppSettings`** — `notificationsEnabled: Boolean`
- [ ] **`UpdateNotificationsUseCase`** — toggle FCM topic subscription + persist to DataStore
- [ ] **Wire `NotificationsClicked` in `SettingsViewModel`** — on Android, request permission and subscribe/unsubscribe; emit `ShowError` if denied
  - **Commit:** `DVX-TK-033 Wire notification toggle in SettingsViewModel`

### Phase 5: Notification deep-link
- [ ] **Deep-link from notification tap** → `SecurityDetailRoute(ticker)` via `AppNavigation`
  - Android: handle `Intent` extras in `MainActivity.onNewIntent`
  - iOS: handle `UNNotificationResponse` in `AppDelegate`/`SceneDelegate`
  - **Commit:** `DVX-TK-033 Handle notification deep-link to security detail`

### Phase 6: Testing & Quality
- [ ] `./gradlew :feature:settings:jvmTest :feature:settings:detekt`
- [ ] Create Pull Request — `skill: manage-git-flow`

---

## Progress Tracking
**Total Tasks:** 7 **Completed:** 0 **Remaining:** 7

---

## Notes
- Request notification permission at first meaningful action (first dividend portfolio hit), not at app launch — reduces denial rate
- FCM topic per-user (`dividends/{uid}`) avoids broadcasting to all users
- Notification permission on Android 13+ (API 33) is a runtime permission; silently skipped on older API levels
