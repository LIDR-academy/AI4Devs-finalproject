## Context

To comply with GDPR, the system needs to hard-delete event data 30 days after the event concludes. A mechanism `DataRetentionJob` already exists to track when an event is scheduled for deletion, but the actual deletion logic and background worker haven't been implemented yet. The deletion process must be secure, FK-safe, and capable of rolling back in case of failure to avoid data inconsistencies.

## Goals / Non-Goals

**Goals:**
- Atomically hard-delete all related event data (RSVPs, LiveMessages, MessageTemplates, Accomplices, Invitations, Guests, Events).
- Retain non-PII financial/operational data (Payments, DeliveryLogs).
- Implement a Kubernetes CronJob to execute the deletion logic daily.
- Handle soft-deleted entities during the hard deletion process.

**Non-Goals:**
- Implementing an API for immediate manual deletion (out of scope, this is automated).
- Archiving data to cold storage (we are permanently deleting it to comply with data minimization).

## Decisions

### 1. Dedicated Worker vs. Reusing Existing Worker
**Decision:** Reuse the `.NET BackgroundService` pattern but deploy it as a dedicated CronJob `Aura.Workers.DataRetention` (or using an existing worker image with a CronJob argument if it has multiple entrypoints). We'll create a new worker project `Aura.Workers.DataRetention` for isolation.
**Rationale:** Data deletion is a high-risk operation that should be isolated from standard messaging queues (like WhatsApp/Email workers). A dedicated CronJob allows strict concurrency policies (`Forbid`) and resource limits.

### 2. Deletion Strategy: FK-Safe Raw/Bulk Execution vs. EF Core Cascade
**Decision:** Use EF Core 8 `ExecuteDeleteAsync()` in a strict order from leaves to root, inside a transaction.
**Rationale:** While EF Core can handle cascading deletes, explicit bulk deletion using `ExecuteDeleteAsync()` is much more performant, avoids loading entities into memory, and gives us fine-grained control over the exact tables being deleted (and those being retained, like Payments).
**Order:** `RSVPs` → `LiveMessages` → `MessageTemplates` → `Accomplices` → `Invitations` → `Guests` → `Events` → `DataRetentionJobs`.

### 3. Soft-delete Override
**Decision:** Use `.IgnoreQueryFilters()` before calling `ExecuteDeleteAsync()`.
**Rationale:** Guests and Invitations might have `IsDeleted=true`. If we don't ignore the filter, the hard delete query will skip them, leaving orphaned PII in the database.

## Risks / Trade-offs

- **Risk: Timeout on large events.** If an event has 10,000+ guests and live messages, the transaction might time out.
  **Mitigation:** `ExecuteDeleteAsync()` is translated directly into `DELETE FROM ...` SQL statements on the server side, which handles large numbers of records efficiently without memory bloat. If needed in the future, we can chunk the deletes.
- **Risk: Retained tables with FKs.**
  **Mitigation:** Ensure `Payments` and `DeliveryLogs` have `ON DELETE SET NULL` for their `EventId` if they reference the event, or that they are structurally decoupled so the Event can be safely deleted without a constraint violation.
