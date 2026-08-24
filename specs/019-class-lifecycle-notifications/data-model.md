# Data Model: Class Lifecycle Notifications

**Date**: 2026-08-24
**Feature**: 019-class-lifecycle-notifications

## Overview

This feature does NOT introduce new database models. It reuses the existing `Notification` model and adds new notification type values. The `TrainingClass`, `ClassEnrollment`, `User`, and `Level` models are also reused.

## Existing Models (Reused)

### Notification

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `notification_type` | Int | Notification type identifier (new values: 2, 8, 12) |
| `recipient_id` | UUID (FK → User) | The user receiving the notification |
| `class_id` | UUID? (FK → TrainingClass) | The associated class (nullable) |
| `content` | String | Rendered human-readable notification content |
| `is_read` | Boolean | Read status (default: false) |
| `sent_at` | DateTime | When the notification was sent |
| `created_at` | DateTime | Creation timestamp |
| `updated_at` | DateTime | Last update timestamp |

**No schema changes required.** The `notification_type` field is an integer that accepts any value. New types are defined in policy methods.

### Notification Type Registry

| Type | Trigger | Recipient | Content Semantics |
|------|---------|-----------|-------------------|
| **2** | New group class created with open spots | All eligible Coachees (level within reach) | "New [level] group class available on [date/time] with [Coach name]. Spots open!" |
| **3** | Coachee cancels individual class | Assigned Coach | "A Coachee canceled their individual class on [date/time]." (ALREADY IMPLEMENTED) |
| **7** | Coach/Admin cancels class (single or series) | All enrolled Coachees | "Your [level] class on [date/time] has been canceled." (ALREADY IMPLEMENTED) |
| **8** | Individual class assigned to Coachee | Assigned Coach | "Individual class with [Coachee name] assigned on [date/time]." |
| **12** | Coach assigned to class they didn't create | Assigned Coach | "You have been assigned to a [level] class on [date/time]." |

### TrainingClass (Reused)

| Field | Relevance |
|-------|-----------|
| `id` | Referenced in `notification.class_id` |
| `class_type` | INDIVIDUAL or GROUP — determines notification behavior |
| `level_id` | FK → Level — used to look up level name for content rendering |
| `assigned_coach_id` | FK → User — recipient for #3, #8; compared with `created_by` for #12 |
| `created_by` | FK → User — compared with `assigned_coach_id` for #12 |
| `start_time` | Used in notification content |
| `status` | ACTIVE or CANCELED — #7 dispatched on cancellation |

### User (Reused)

| Field | Relevance |
|-------|-----------|
| `id` | Recipient ID for notifications |
| `role` | COACHEE (recipient for #2, #7), COACH (recipient for #3, #8, #12) |
| `level_id` | FK → Level — used to determine reach for #2 |

### Level (Reused)

| Field | Relevance |
|-------|-----------|
| `id` | Joined via `level_id` on TrainingClass and User |
| `name` | Rendered in notification content (e.g., "Level 3") |
| `sort_order` | Used by `isWithinReach()` to filter #2 recipients |

### ClassEnrollment (Reused)

| Field | Relevance |
|-------|-----------|
| `class_id` | FK → TrainingClass |
| `coachee_id` | FK → User — recipient for #7 (all enrolled Coachees) |

## Domain Service: ClassLifecycleNotificationService

### Constructor Dependencies (Ports)

| Port | Purpose |
|------|---------|
| `NotificationRepository` | Persist notification records |
| `NotificationSender` | Push delivery via FCM |
| `DeviceTokenRepository` | Resolve device tokens for push |
| `UserRepository` | Load user data (name, level) |
| `ClassRepository` | Load class data (type, level, coach, time) |
| `EnrollmentRepository` | Load enrolled Coachees for #7 |

### Methods

| Method | Trigger | Input | Output |
|--------|---------|-------|--------|
| `notifyNewClassAvailable(classId)` | After GROUP class creation | Class ID | `{ notificationsSent: number }` |
| `notifyIndividualClassAssigned(classId, coacheeId)` | After individual class assignment | Class ID, Coachee ID | `{ notificationsSent: number }` |
| `notifyClassCanceled(classId)` | After class cancellation | Class ID | `{ notificationsSent: number }` |
| `notifyCoachAssigned(classId)` | After Coach assignment to class they didn't create | Class ID | `{ notificationsSent: number }` |

### Internal Flow (per method)

1. Load class data via `ClassRepository`
2. Load related entities (level, coach, coachees) via `UserRepository`
3. Determine eligible recipients via `ClassLifecycleNotificationPolicy`
4. For each recipient:
   a. Render content string
   b. Persist via `NotificationRepository.create()`
   c. Resolve tokens via `DeviceTokenRepository.listActiveTokens()`
   d. Push via `NotificationSender.send()` (wrapped in try/catch)
   e. Deactivate permanently failed tokens via `DeviceTokenRepository.deactivate()`
5. Return count of notifications sent

## Policy: ClassLifecycleNotificationPolicy

A pure domain policy (no ports) that determines:
- Which notification type to use for a given event
- Which recipients are eligible for notification #2 (level reach check)
- Whether notification #12 should be sent (created_by comparison)

### Methods

| Method | Input | Output |
|--------|-------|--------|
| `notificationTypeForNewClass()` | — | `2` |
| `notificationTypeForIndividualAssignment()` | — | `8` |
| `notificationTypeForClassCanceled()` | — | `7` |
| `notificationTypeForCoachAssignment()` | — | `12` |
| `shouldNotifyCoachOfClassAssignment(creatorId, assignedCoachId)` | creator ID, assigned coach ID | `boolean` |
| `isEligibleForNewClassNotification(coacheeSortOrder, classSortOrder)` | coachee sort order, class sort order | `boolean` |

## No Migration Required

The existing `Notification` model already supports all required fields. The `notification_type` integer column accepts any value. New types (2, 8, 12) are defined in code only.
