# Data Retention

## Requirements

### Requirement: Automated Data Deletion
The system SHALL delete all event data securely and atomically exactly 30 days after the event has concluded.

#### Scenario: Successful hard deletion
- **WHEN** the daily CronJob runs at 02:00 UTC and queries for DataRetentionJobs where `ScheduledDeleteAt` <= NOW and `Status` = 'scheduled'
- **THEN** the system executes a transaction deleting all related RSVPs, LiveMessages, MessageTemplates, Accomplices, Invitations, Guests, Events, and the DataRetentionJob itself. If successful, the transaction is committed.

#### Scenario: Deletion with soft-deleted records
- **WHEN** the deletion process identifies an event to delete
- **THEN** the system includes soft-deleted entities (IsDeleted=true) in the hard deletion by ignoring query filters, ensuring all data is wiped.

### Requirement: FK-Safe Atomic Execution
The system SHALL execute the deletion in an order that respects Foreign Key constraints, wrapped in a single database transaction.

#### Scenario: Deletion order and transaction commit
- **WHEN** deleting an event's data
- **THEN** the system deletes records in order (RSVPs → LiveMessages → MessageTemplates → Accomplices → Invitations → Guests → Events → DataRetentionJobs) to avoid FK constraint errors, and commits only if all deletions succeed.

#### Scenario: Transaction failure and rollback
- **WHEN** an error occurs during the deletion of any entity table
- **THEN** the entire transaction is rolled back, the DataRetentionJob `Status` is set to 'failed', and the `FailureReason` is recorded.

### Requirement: Excluded Audit Data
The system SHALL retain specific operational and financial tables that do not contain PII during the data retention deletion.

#### Scenario: Retaining audit records
- **WHEN** the event and its relational data are deleted
- **THEN** the related `Payments` and `DeliveryLogs` are left intact for legal and operational auditing.

### Requirement: Retry Mechanism
The system SHALL retry failed data retention jobs in subsequent executions.

#### Scenario: Retry on failure
- **WHEN** a DataRetentionJob fails but has been retried less than 3 times
- **THEN** its status is reset to 'scheduled' so it is picked up during the next daily execution.

#### Scenario: Max retries exceeded
- **WHEN** a DataRetentionJob fails 3 times
- **THEN** the system leaves it in 'failed' status and logs an alert for manual intervention.
