# EP-04: Notifications & Automation

## Milestone
**All events trigger automatic notifications; waiting lists are auto-processed.**

## Description
Implement the complete notification system (push via FCM + in-app panel) and automate waiting list processing. After this epic, every business event in the system triggers the appropriate push notification (12 types total), and when a spot opens in a class with a waiting list, the system automatically notifies waitlisted Coachees and enrolls the first responder.

## Priority: High
## Dependencies: EP-02 (Scheduling), EP-03 (Coachee Self-Service)

---

## User Stories

### US-4.1: Push Notification Infrastructure

**As a** system,  
**I want** to send push notifications via Firebase Cloud Messaging,  
**So that** users receive real-time alerts on their devices.

**Acceptance Criteria:**
- [ ] `NotificationSender` port interface defined in domain layer (decoupled from FCM)
- [ ] `FCMNotificationAdapter` implements the port (Firebase Admin SDK, HTTP v1 API)
- [ ] Device token registration endpoint for frontend to register push tokens
- [ ] Service Worker configured to receive and display push events
- [ ] Notification permission requested at appropriate time
- [ ] Failed notification deliveries are logged (no hard failure for the triggering operation)
- [ ] Notification content stored in PostgreSQL with type, recipient, and read status

**Task File:** `userStories/US-4.1-push-notification-infrastructure.md`

---

### US-4.2: Waiting List Automation

**As a** system,  
**I want** waiting lists to be automatically processed when a spot opens,  
**So that** waitlisted Coachees are notified and the spot is claimed.

**Acceptance Criteria:**
- [ ] `ProcessWaitingListService` domain service handles the workflow
- [ ] When a Coachee cancels enrollment and a waiting list exists:
  - All waitlisted Coachees receive notification #1 simultaneously
  - Coach receives notification #4 (if group) or notification logic applies
- [ ] When a Coachee cancels and no waiting list exists:
  - Coach receives notification #5
- [ ] Spot claimed first-come, first-served (no hold time)
- [ ] When waitlisted Coachee claims the spot, Coach receives notification #6
- [ ] Notifications #4 and #5 are mutually exclusive
- [ ] Coachee receives confirmation on join (#9) and leave (#10)

**Task File:** `userStories/US-4.2-waiting-list-automation.md`

---

### US-4.3: Class Lifecycle Notifications

**As a** user,  
**I want** to be notified about class creation, assignment, and cancellation events,  
**So that** I stay informed about schedule changes.

**Acceptance Criteria:**
- [ ] New group class created within reach with open spots → notification #2 to eligible Coachees
- [ ] Coachee cancels individual class → notification #3 to assigned Coach
- [ ] Coach cancels entire class → notification #7 to all enrolled Coachees
- [ ] Individual class assigned to Coachee → notification #8 to Coachee
- [ ] Coach assigned to class they didn't create → notification #12 to assigned Coach
- [ ] All notifications include rendered content with relevant class/level/time details
- [ ] Notifications are sent both as push (FCM) and stored in-app

**Task File:** `userStories/US-4.3-class-lifecycle-notifications.md`

---

### US-4.4: Profile Change Notifications

**As a** Coachee,  
**I want** to be notified when my training level is changed,  
**So that** I know about my progression.

**Acceptance Criteria:**
- [ ] When Admin/Coach changes Coachee level → notification #11 to affected Coachee
- [ ] Content: "Tu nivel ha sido actualizado a [nuevo nivel]"
- [ ] Notification sent as push + stored in-app
- [ ] Notification tied to level change event (no class association)

**Task File:** `userStories/US-4.4-profile-change-notifications.md`

---

### US-4.5: In-App Notification Center

**As a** user,  
**I want** to view and manage notifications within the application,  
**So that** I never miss important alerts.

**Acceptance Criteria:**
- [ ] Bell icon in header shows unread notification count badge
- [ ] Admin/Coach: dropdown panel shows only current day's notifications
- [ ] Coachee: dedicated notifications screen shows full chronological history
- [ ] Each notification shows: content, timestamp, read status
- [ ] Tap/click marks notification as read
- [ ] Tap notification navigates to relevant class detail (if applicable)
- [ ] `GET /notifications` endpoint supports pagination and unread-only filter
- [ ] `PATCH /notifications/:id/read` marks single notification as read

**Task File:** `userStories/US-4.5-in-app-notification-center.md`
