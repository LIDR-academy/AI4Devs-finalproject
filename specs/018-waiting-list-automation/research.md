# Research: Waiting List Automation

**Feature**: 018-waiting-list-automation
**Date**: 2026-08-24

## R1: How should the cancellation trigger waiting-list processing?

**Decision**: The `CancelEnrollment` use case will call `ProcessWaitingListService.processSpotOpened()` after successfully deleting the enrollment and within the same transaction. The domain service handles all notification dispatch and waiting-list logic.

**Rationale**: The cancellation is the sole trigger for waiting-list processing (per the spec). Invoking it from within `CancelEnrollment` keeps the因果 chain explicit and testable. The domain service is injected as a dependency, preserving Hexagonal Architecture — the use case depends on a domain port, not on infrastructure.

**Alternatives considered**:
- Event-driven (Domain Events emitted from `CancelEnrollment`): Rejected because the project has no event bus infrastructure, and adding one for a single trigger is over-engineering.
- Background job/queue: Rejected because the spec requires "simultaneous" notification within the same processing pass, and a queue introduces latency that contradicts the first-come-first-served requirement.
- Trigger from Prisma middleware/hooks: Rejected because Prisma middleware cannot invoke domain services cleanly and would violate the architecture.

## R2: What notification types does the waiting-list automation produce?

**Decision**: Extend `WaitingListPolicy` with static methods for the new notification types:

| Type | Recipient | Meaning | When |
|------|-----------|---------|------|
| 1 | Waitlisted Coachee | "Spot opened in class X — claim it first-come-first-served" | After cancellation with waiting list |
| 4 | Coach | "Spot opened in class X — waitlisted Coachees notified" | After cancellation with waiting list |
| 5 | Coach | "Spot opened in class X" | After cancellation without waiting list |
| 6 | Coach | "Waitlisted Coachee Y claimed the spot in class X" | After successful claim |
| 9 | Claiming Coachee | "You joined class X from the waiting list" | After successful claim |
| 10 | Leaving Coachee | "You left the waiting list for class X" | After leaving (already in WaitingListPolicy) |

**Rationale**: Types 9 and 10 already exist in `WaitingListPolicy`. Types 1, 4, 5, and 6 are new and follow the same pattern. Using static methods on the policy keeps notification type mapping centralized and testable.

**Alternatives considered**:
- Notification type constants in a separate file: Rejected because it fragments the notification-type knowledge that already lives in the policy.
- Notification type as enum in a shared module: Rejected because the existing pattern uses methods on the policy, and consistency is more valuable than a different pattern for four new types.

## R3: How should the claim endpoint work?

**Decision**: New use case `ClaimWaitingListSpot` invoked by a new `POST /api/v1/classes/:id/waiting-list/claim` endpoint. The use case:
1. Loads the class, waiting-list entry, and coachee in a serializable transaction
2. Verifies the coachee is on the waiting list
3. Verifies the class is ACTIVE and not full
4. Creates a ClassEnrollment
5. Deletes the WaitingList entry
6. Sends notification #9 to the claiming Coachee
7. Sends notification #6 to the Coach
8. Returns the enrollment result

The serializable isolation level prevents two Coachees from both claiming the last spot (the second transaction will see the first's write and fail the uniqueness constraint on `ClassEnrollment`).

**Rationale**: The claim is a new action (distinct from `JoinWaitingList` which adds to the list, and `JoinTrainingClass` which enrolls directly). A dedicated use case keeps the domain model clear. The serializable transaction is the same pattern used by `JoinWaitingList` for contention safety.

**Alternatives considered**:
- Reuse `JoinTrainingClass` with a flag: Rejected because `JoinTrainingClass` does not handle waiting-list entry removal or the claim-specific notifications.
- Claim as part of the notification tap handler (frontend-only): Rejected because the claim is a server-side state change that must be atomic and auditable.

## R4: What content should each notification carry?

**Decision**: Notification content follows the pattern established by `JoinWaitingList` and `LeaveWaitingList` — short, action-oriented strings:

| Type | Content template |
|------|-----------------|
| 1 | "A spot has opened in {classType} ({level}) on {date} at {time} with Coach {coachName}. Claim it now — first come, first served!" |
| 4 | "A Coachee canceled enrollment in {classType} ({level}) on {date}. Waitlisted Coachees have been notified to claim the spot." |
| 5 | "A Coachee canceled enrollment in {classType} ({level}) on {date}. The spot is now available." |
| 6 | "A waitlisted Coachee has claimed the spot in {classType} ({level}) on {date}." |
| 9 | "You joined {classType} ({level}) on {date} at {time} from the waiting list." |
| 10 | "You left the waiting list for {classType} ({level}) on {date}." (already defined) |

**Rationale**: Content must be human-readable and include the class details needed to take action. The exact wording is finalized during implementation but must convey the semantics from the spec's acceptance scenarios.

**Alternatives considered**:
- Templated/interpolated strings using a i18n library: Deferred — the current codebase uses inline strings and i18n is not yet introduced.
- Structured data payloads instead of text: Rejected because the notification infrastructure (US-4.1) sends text content in push notifications.

## R5: How does the domain service avoid infrastructure dependencies?

**Decision**: `ProcessWaitingListService` depends on two domain ports:
- `WaitingListNotificationPort` (new): knows how to persist and dispatch notifications to recipients
- `ClassRepository` (new or extended): provides read access to class and waiting-list data for the service's logic

The concrete implementations (Prisma adapter, FCM adapter) are injected through the DI container. The domain service contains zero imports from `@prisma/client`, Express, or any infrastructure package.

**Rationale**: This follows the established pattern — `WaitingListPolicy` is pure, `JoinWaitingList` use case depends on Prisma (application layer), and the domain service must be pure (Constitution I). The ports are the bridge.

**Alternatives considered**:
- Direct Prisma dependency in the domain service: Rejected — violates Constitution I (Domain Purity).
- Domain events with an event bus: Rejected — no event bus exists, and adding infrastructure for one trigger is disproportionate.

## R6: How is the `CancelEnrollment` response extended?

**Decision**: The existing `CancelEnrollmentResult` type is extended with:
```typescript
export interface CancelEnrollmentResult {
  message: string;
  waitingListProcessed: boolean;
  claimedByCoachee: string | null;
  notificationsSent: number;      // new: total notifications dispatched
  waitingListMembersNotified: number; // new: count of waitlisted Coachees notified
}
```

**Rationale**: The response is additive — existing consumers see new fields they can ignore. The `waitingListProcessed` field already exists and returns `true` when the class had a waiting list. The new fields give the caller visibility into the automation's outcome.

**Alternatives considered**:
- No response change: Rejected because the spec requires the Coachee to see confirmation and the API contract must document the new behavior.
- Separate endpoint for waiting-list status: Rejected because the cancellation and its waiting-list processing are a single atomic operation from the user's perspective.
