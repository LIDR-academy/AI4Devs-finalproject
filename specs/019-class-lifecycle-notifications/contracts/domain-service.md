# Contracts: Class Lifecycle Notifications

**Date**: 2026-08-24
**Feature**: 019-class-lifecycle-notifications

## Overview

This feature does NOT introduce new API endpoints. The notifications are system-triggered side effects of existing business operations. The "contracts" here define the domain service interfaces and the notification content contracts.

## Domain Service Interface: ClassLifecycleNotificationService

```typescript
// backend/src/domain/services/ClassLifecycleNotificationService.ts

export interface ClassLifecycleNotificationResult {
  notificationsSent: number;
}

export interface ClassLifecycleNotificationService {
  /**
   * Dispatch notification #2 to all eligible Coachees when a new GROUP class
   * is created with open spots. Eligibility: level within reach (|coacheeSortOrder - classSortOrder| <= 1).
   *
   * Triggers: After CreateTrainingClass succeeds for a GROUP class.
   * Recipients: All active Coachees whose level is within reach of the class level.
   * Content: Class type, date/time, level name, Coach name, "spots available" message.
   */
  notifyNewClassAvailable(classId: string): Promise<ClassLifecycleNotificationResult>;

  /**
   * Dispatch notification #8 to the assigned Coach when an individual class
   * is assigned to a Coachee.
   *
   * Triggers: After individual class assignment (CreateTrainingClass or reassignment).
   * Recipients: The assigned Coach.
   * Content: Class type, date/time, level name, Coachee name.
   */
  notifyIndividualClassAssigned(
    classId: string,
    coacheeId: string,
  ): Promise<ClassLifecycleNotificationResult>;

  /**
   * Dispatch notification #7 to all enrolled Coachees when a class is canceled
   * (single or series).
   *
   * Triggers: After CancelTrainingClass or CancelRecurringSeries succeeds.
   * Recipients: All Coachees enrolled in the canceled class(es).
   * Content: Class type, date/time, level name, Coach name, "canceled" message.
   */
  notifyClassCanceled(classId: string): Promise<ClassLifecycleNotificationResult>;

  /**
   * Dispatch notification #12 to a Coach when they are assigned to a class
   * they did not create (created_by !== assigned_coach_id).
   *
   * Triggers: After coach assignment where creator !== assigned coach.
   * Recipients: The assigned Coach.
   * Content: Class type, date/time, level name, "assigned to you" message.
   */
  notifyCoachAssigned(classId: string): Promise<ClassLifecycleNotificationResult>;
}
```

## Domain Policy Interface: ClassLifecycleNotificationPolicy

```typescript
// backend/src/domain/services/ClassLifecycleNotificationPolicy.ts

export type NotificationType = 2 | 3 | 7 | 8 | 12;

export interface ClassLifecycleNotificationPolicy {
  /** Returns notification type 2 for new class available events. */
  notificationTypeForNewClass(): 2;

  /** Returns notification type 8 for individual class assignment events. */
  notificationTypeForIndividualAssignment(): 8;

  /** Returns notification type 7 for class cancellation events. */
  notificationTypeForClassCanceled(): 7;

  /** Returns notification type 12 for coach assignment events. */
  notificationTypeForCoachAssignment(): 12;

  /**
   * Determines whether the assigned Coach should receive notification #12.
   * Returns true if the Coach did NOT create the class (createdBy !== assignedCoachId).
   */
  shouldNotifyCoachOfClassAssignment(
    createdBy: string,
    assignedCoachId: string,
  ): boolean;

  /**
   * Determines whether a Coachee is eligible for notification #2.
   * Returns true if the Coachee's level is within reach of the class level.
   */
  isEligibleForNewClassNotification(
    coacheeSortOrder: number,
    classSortOrder: number,
  ): boolean;
}
```

## Notification Content Contracts

Each notification type has a content rendering contract. The content is a human-readable string that includes specific fields.

### Notification #2 — New Group Class Available

```
Format: "New {levelName} group class available on {formattedDateTime} with {coachName}. Spots open!"

Example: "New Level 3 group class available on Monday Aug 25 at 18:00 with Coach Maria. Spots open!"

Required fields:
- levelName: string (e.g., "Level 3")
- formattedDateTime: string (e.g., "Monday Aug 25 at 18:00")
- coachName: string (e.g., "Coach Maria")
```

### Notification #8 — Individual Class Assigned

```
Format: "Individual class with {coacheeName} assigned on {formattedDateTime} — {levelName} with {coachName}."

Example: "Individual class with Ana assigned on Tuesday Aug 26 at 10:00 — Level 2 with Coach Pedro."

Required fields:
- coacheeName: string (e.g., "Ana")
- formattedDateTime: string (e.g., "Tuesday Aug 26 at 10:00")
- levelName: string (e.g., "Level 2")
- coachName: string (e.g., "Coach Pedro")
```

### Notification #7 — Class Canceled

```
Format: "Your {levelName} {classType} class on {formattedDateTime} with {coachName} has been canceled."

Example: "Your Level 3 group class on Monday Aug 25 at 18:00 with Coach Maria has been canceled."

Required fields:
- levelName: string (e.g., "Level 3")
- classType: "individual" | "group"
- formattedDateTime: string (e.g., "Monday Aug 25 at 18:00")
- coachName: string (e.g., "Coach Maria")
```

### Notification #12 — Coach Assigned to Class

```
Format: "You have been assigned to a {levelName} {classType} class on {formattedDateTime}."

Example: "You have been assigned to a Level 3 group class on Monday Aug 25 at 18:00."

Required fields:
- levelName: string (e.g., "Level 3")
- classType: "individual" | "group"
- formattedDateTime: string (e.g., "Monday Aug 25 at 18:00")
```

### Notification #3 — Coachee Cancels Individual Class (EXISTING)

```
Format: "A Coachee canceled their individual class on {formattedDateTime} — {levelName} with {coachName}."

This is already implemented. Ensure it uses the SendNotification use case for push + in-app delivery.
```

## Error Contracts

| Error Code | HTTP Status | When | Response |
|------------|-------------|------|----------|
| `NOTIFICATION_DISPATCH_FAILED` | N/A (logged, not thrown) | Push delivery fails | `{ error: { code, message, ref } }` — logged, not returned to caller |
| `NO_DEVICE_TOKENS` | N/A (logged, not thrown) | Recipient has no active devices | Notification persisted, delivery skipped, logged |

**Note**: Notification errors are never propagated to the caller. They are logged for audit purposes only.
