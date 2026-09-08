# Research: Class Lifecycle Notifications

**Date**: 2026-08-24
**Feature**: 019-class-lifecycle-notifications

## Notification Type Numbering

### Decision
Use integer notification types: #2 (new group class available), #8 (individual class assigned to Coachee), #12 (Coach assigned to class they didn't create). Existing types #3 and #7 are already implemented.

### Rationale
The codebase already uses integer notification types (1, 3, 4, 5, 6, 7, 9, 10) defined as return values from policy methods. Types #2, #8, and #12 are currently unused. This follows the established pattern.

### Alternatives Considered
- **String enum types**: Rejected — the existing `Notification` model uses `notification_type Int`, and all policies return numbers. Changing to strings would require a schema migration and break existing patterns.
- **UUID-based type identifiers**: Rejected — over-engineered for this use case; integers are sufficient and consistent.

## Notification Dispatch Pattern

### Decision
Use the `SendNotification` application use case (Pattern C) for all new notifications. This orchestrates: persist → resolve tokens → push → deactivate failed tokens.

### Rationale
Pattern C is the most complete and correct pattern:
- Pattern A (direct `tx.notification.create()`) only persists, no push delivery — violates FR-013.
- Pattern B (`NotificationSender.send()` directly) skips persistence — violates FR-014.
- Pattern C (`SendNotification`) does all three: persist, push, cleanup — satisfies FR-013, FR-014, FR-015, FR-016.

### Alternatives Considered
- **Pattern A (direct create)**: Rejected — no push delivery, violates FR-013.
- **Pattern B (direct send)**: Rejected — no persistence, violates FR-014.
- **Inline persistence + send**: Rejected — duplicates logic already in `SendNotification`; violates DRY.

## ClassLifecycleNotificationService Architecture

### Decision
Create a new domain service `ClassLifecycleNotificationService` that:
1. Takes domain ports as constructor dependencies (NotificationRepository, UserRepository, ClassRepository, EnrollmentRepository, DeviceTokenRepository, NotificationSender)
2. Instantiates `ClassLifecycleNotificationPolicy` internally (pure policy, no DI needed)
3. Provides methods: `notifyNewClassAvailable()`, `notifyIndividualClassAssigned()`, `notifyClassCanceled()`, `notifyCoachAssigned()`
4. Each method: loads data via ports → determines recipients via policy → renders content → dispatches via `SendNotification`-like logic (persist + push + cleanup)

### Rationale
This follows the `ProcessWaitingListService` pattern — a domain service that orchestrates multiple ports to fulfill a business workflow. The service is pure (no infrastructure imports) and testable in isolation.

### Alternatives Considered
- **Add methods to existing policies**: Rejected — policies are pure (no ports), so they can't dispatch. Dispatch logic belongs in a service.
- **Add methods to `SendNotification` use case**: Rejected — `SendNotification` is a generic notification sender; lifecycle-specific logic (recipient determination, content rendering) belongs in a domain service.
- **Event-driven architecture (pub/sub)**: Rejected — over-engineered for this scale; the codebase uses direct method calls.

## Content Rendering

### Decision
Render notification content as a server-side string in the domain service. Each notification type has a rendering function that produces a human-readable string containing class type, date/time, level name, and Coach/Coachee names.

### Rationale
- Content must be rendered before persistence (FR-014 requires content in the notification record).
- Content rendering is a business rule (what information to include), so it belongs in the domain layer.
- The exact wording is flexible but must convey the semantics from the spec.

### Alternatives Considered
- **Template-based rendering**: Rejected — adds complexity for simple string interpolation; the content is straightforward.
- **Frontend rendering**: Rejected — violates FR-014 (content must be persisted); also, push notifications need content at send time.

## Coach Assignment Detection

### Decision
For notification #12, compare the `created_by` field on `TrainingClass` with the `assigned_coach_id`. If they differ, the Coach was assigned to a class they didn't create.

### Rationale
The spec states: "the Coach is considered the creator if their user ID matches the `created_by` field." This is the simplest and most reliable check.

### Alternatives Considered
- **Track assignment history**: Rejected — adds complexity; the `created_by` field is sufficient.
- **Ask the Admin why they assigned**: Rejected — not feasible in the current architecture.

## Level Reach for Notification #2

### Decision
Use the existing `isWithinReach()` function from `ReachCalculator.ts` to filter eligible Coachees for notification #2. A Coachee is eligible if `Math.abs(coacheeSortOrder - classSortOrder) <= 1`.

### Rationale
The spec states: "within reach for notification #2 uses the same level proximity rule as waiting-list eligibility." The existing function is already tested and used in 5+ places.

### Alternatives Considered
- **Custom reach logic**: Rejected — duplicates existing, tested logic.
- **Broader reach for notifications**: Rejected — spec explicitly says "same level proximity rule."

## Failure Isolation

### Decision
Wrap all push delivery attempts in try/catch blocks. If delivery fails, log the error and continue. Never propagate notification errors to the triggering operation (class creation, assignment, cancellation).

### Rationale
This matches the existing pattern in `ProcessWaitingListService` and satisfies FR-015, FR-016, and SC-007.

### Alternatives Considered
- **Retry logic**: Rejected — adds complexity; FCM handles retries internally for transient failures.
- **Dead letter queue**: Rejected — over-engineered for this scale; logging is sufficient.

## Integration Points

### Decision
Hook notification dispatch into existing use cases:
- `CreateTrainingClass`: After successful class creation, call `ClassLifecycleNotificationService.notifyNewClassAvailable()` for GROUP classes.
- `CancelTrainingClass` / `CancelRecurringSeries`: After successful cancellation, call `ClassLifecycleNotificationService.notifyClassCanceled()`.
- `CancelEnrollment`: After successful individual cancellation, call existing notification #3 logic (already implemented, ensure it uses `SendNotification`).
- Coach assignment: Hook into `CreateTrainingClass` (when `assignedCoachId` differs from `created_by`) or a new `AssignCoachToClass` use case.

### Rationale
Notifications are side effects of business operations. Hooking into existing use cases keeps the notification dispatch co-located with the triggering event.

### Alternatives Considered
- **Separate notification endpoint**: Rejected — notifications are not user-triggered; they're system-triggered side effects.
- **Database triggers**: Rejected — violates Domain Purity (Prisma-level logic); also, push delivery can't be done in DB triggers.
- **Event sourcing**: Rejected — over-engineered; the codebase uses direct method calls.
