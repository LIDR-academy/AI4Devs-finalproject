# Data Model: Waiting List Automation

**Feature**: 018-waiting-list-automation
**Date**: 2026-08-24

## No Schema Changes

This feature introduces **no new database tables or columns**. All data model interactions use existing tables:

- `TrainingClass` — read to check status, class type, assigned coach, enrollment count, waiting-list membership
- `ClassEnrollment` — delete on cancellation; create on claim
- `WaitingList` — read to enumerate members; delete on claim
- `Notification` — create for each dispatched notification (types 1, 4, 5, 6, 9, 10)
- `User` — read to resolve coachee/coach details for notification content

## Entity Relationships (existing)

```
TrainingClass 1──N ClassEnrollment N──1 User (coachee)
TrainingClass 1──N WaitingList     N──1 User (coachee)
TrainingClass 1──N Notification    N──1 User (recipient)
TrainingClass N──1 User (assignedCoach)
```

## State Transitions

### Cancellation-triggered processing flow

```
[Enrollment exists] ──cancel──▶ [Enrollment deleted]
                                      │
                                      ▼
                              [WaitingList > 0?]
                              │              │
                             YES             NO
                              │              │
                              ▼              ▼
                    [Notify all waitlist    [Coach gets #5]
                     members with #1]
                    [Coach gets #4]
```

### Claim flow

```
[Coachee on WaitingList] ──claim──▶ [Class ACTIVE + not full?]
                                          │              │
                                         YES             NO
                                          │              │
                                          ▼              ▼
                                   [Create Enrollment]  [Refuse: spot taken
                                   [Delete WaitingList   or class canceled]
                                    entry]
                                   [Notify coachee #9]
                                   [Notify coach #6]
```

## Key Invariants

1. **Enrollment uniqueness**: `@@unique([class_id, coachee_id])` on `ClassEnrollment` prevents duplicate enrollment — the serializable transaction in `ClaimWaitingListSpot` relies on this constraint to enforce first-come-first-served.
2. **WaitingList uniqueness**: `@@unique([class_id, coachee_id])` on `WaitingList` prevents a Coachee from being on the same waiting list twice.
3. **Notification type mapping**: Notification types are determined by `WaitingListPolicy` static methods, not stored as data.
4. **No position column**: `WaitingList` has no position/order column — all members are notified simultaneously and priority is not tracked.
5. **Class status gate**: Processing only occurs for ACTIVE classes; a CANCELED class refuses all claims.

## Validation Rules (from spec)

| Rule | Enforced by | Layer |
|------|-------------|-------|
| Class must be ACTIVE | `WaitingListPolicy.assertJoinEligible` / `EnrollmentPolicy.assertCancellationAllowed` | Domain |
| Coachee must be on the waiting list | `ClaimWaitingListSpot` use case check | Application |
| Class must not be full at claim time | Capacity check in `ClaimWaitingListSpot` | Application |
| Coachee identity from JWT only | Middleware extracts `coacheeId` from token | Infrastructure |
| No duplicate enrollment | `@@unique` constraint + serializable transaction | Database + Application |
