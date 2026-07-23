## Why

To comply with GDPR and privacy policies, we must ensure that all event-related data (including personally identifiable information of guests) is permanently deleted 30 days after the event concludes. A robust, atomic, and automated background process is necessary to enforce this retention policy and clean up the database securely without leaving orphaned records.

## What Changes

- A new `DataRetentionWorker` (CronJob running daily at 02:00 UTC) to identify and process scheduled data deletions.
- Implementation of a data retention service that executes an atomic, FK-safe deletion of event-scoped data (RSVPs, LiveMessages, MessageTemplates, Accomplices, Invitations, Guests, Events, and the DataRetentionJobs tracking records).
- Soft-deleted entities will be permanently hard-deleted.
- Payment and DeliveryLog records will be retained (for financial and operational auditing).
- Addition of Kubernetes CronJob configuration (`retention-cronjob.yaml`) to run the worker pod.

## Capabilities

### New Capabilities
- `data-retention`: Defines the automated GDPR compliance job, the rules for atomic deletion of event data, retry mechanisms, and auditing exclusions.

### Modified Capabilities
- None.

## Impact

- **Database**: Hard deletion queries that bypass EF Core soft-delete filters (`IgnoreQueryFilters()`) affecting multiple core tables.
- **Infrastructure**: A new Kubernetes CronJob workload and container image (`Aura.Workers.DataRetention` or an addition to an existing worker).
- **Compliance**: Ensures legal GDPR compliance regarding data minimization and storage limitation.
