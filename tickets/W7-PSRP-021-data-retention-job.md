## PSRP-021: feat(compliance): data-retention-job

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** M (2-3d)
**Sprint Week:** W7
**Dependencies:** PSRP-002

## Feature Summary
Implementar el CronJob de retención de datos automatizado que elimina físicamente todos los datos del evento 30 días después del EventEndDate para cumplimiento GDPR. El job se ejecuta diariamente a las 02:00 UTC, consulta DataRetentionJobs donde ScheduledDeleteAt <= NOW y Status = 'scheduled', y realiza eliminación atómica y segura para FK en el orden correcto: RSVPs → LiveMessages → MessageTemplates → Accomplices → Invitations → Guests → Events → DataRetentionJobs. Payments y DeliveryLogs se retienen (sin PII, requisito de auditoría).

## Requirements
- [ ] Implement `DataRetentionWorker` as a CronJob (Kubernetes CronJob, `schedule: "0 2 * * *"`, `concurrencyPolicy: Forbid`)
- [ ] Implement retention query: `SELECT * FROM "DataRetentionJobs" WHERE "ScheduledDeleteAt" <= NOW() AND "Status" = 'scheduled'`
- [ ] Implement FK-safe deletion order within a transaction: 1) RSVPs, 2) LiveMessages, 3) MessageTemplates, 4) Accomplices, 5) Invitations, 6) Guests, 7) Events, 8) DataRetentionJobs (self)
- [ ] Implement atomic deletion: all-or-nothing per event within a database transaction. If any delete fails, rollback entire transaction
- [ ] Implement status tracking: update DataRetentionJob.Status to 'running' before deletion, 'completed' after success, 'failed' on error with FailureReason
- [ ] Implement retry logic: failed jobs retried next day (CronJob runs daily). Max 3 retries before logging alert
- [ ] Retain Payments and DeliveryLogs: do NOT delete these tables (no PII, financial/operational audit requirement)
- [ ] Implement soft-deleted record cleanup: use `IgnoreQueryFilters()` to include soft-deleted Guests, Invitations, MessageTemplates in the deletion
- [ ] Implement GDPR anonymization pre-step (optional): before hard delete, anonymize any PII fields that haven't been anonymized yet (defensive measure)
- [ ] Create Kubernetes CronJob manifest for Data Retention (`concurrencyPolicy: Forbid`, resource limits)
- [ ] Create Dockerfile for Data Retention worker (can reuse Aura.Workers.Email project or separate)
- [ ] Write unit tests for deletion order, transaction rollback, and status tracking
- [ ] Write integration test with Testcontainers: create event + all child records, run retention job, verify all records deleted except Payments and DeliveryLogs

## Technical Notes
- **Backend:**
  - CronJob runs daily at 02:00 UTC. Single pod execution via `concurrencyPolicy: Forbid`
  - Deletion order respects FK constraints. Use `DELETE FROM "RSVPs" WHERE "EventId" = @eventId` first (no dependents), then LiveMessages, etc.
  - Transaction: `BEGIN` → delete all → `COMMIT`. On exception: `ROLLBACK`, set Status='failed', FailureReason=exception message
  - Soft-deleted records: `context.Guests.IgnoreQueryFilters().Where(g => g.EventId == eventId).ExecuteDeleteAsync()`
  - Retry: if Status='failed' and retry count < 3, reset to 'scheduled' for next run
  - Alert: if retry count >= 3, log error with event details for manual intervention
- **Frontend:** N/A
- **Database:** All event-scoped tables. DataRetentionJobs table (status tracking)
- **Integrations:** N/A
- **Key files:**
  - `backend/workers/Aura.Workers.Email/DataRetentionWorker.cs` (or separate worker project)
  - `backend/src/Aura.Core/Interfaces/Services/IDataRetentionService.cs`
  - `backend/src/Aura.Core/Services/DataRetentionService.cs`
  - `k8s/base/cronjobs/retention-cronjob.yaml`

## Acceptance Criteria
- [ ] AC1: Given a DataRetentionJob with ScheduledDeleteAt <= NOW and Status='scheduled', when the CronJob runs, then all event-scoped data (RSVPs, LiveMessages, MessageTemplates, Accomplices, Invitations, Guests, Event) is hard-deleted in FK-safe order
- [ ] AC2: Given the deletion is in progress and a database error occurs, when the error is caught, then the transaction is rolled back, Status is set to 'failed', and FailureReason is recorded
- [ ] AC3: Given a failed job with retry count < 3, when the CronJob runs the next day, then the job is retried (Status reset to 'scheduled')
- [ ] AC4: Given the deletion completes successfully, when the transaction commits, then Payments and DeliveryLogs for the event are NOT deleted (retained for audit)
- [ ] AC5: Given soft-deleted guests exist (IsDeleted=true), when the retention job runs, then they are included in the hard deletion (IgnoreQueryFilters)
- [ ] AC6: Given the Kubernetes CronJob manifest is applied, when `kubectl get cronjobs` is run, then the data-retention cronjob exists with schedule "0 2 * * *" and concurrencyPolicy: Forbid

## Related Items
- **PRD section:** 09-risks-assumptions.md (GDPR compliance), 06-mvp-features.md (data deletion)
- **Architecture:** 02-components.md (Data Retention Service CronJob), 05-security.md (30-day auto-delete)
- **Data model:** README.md (automated retention, deletion order, GDPR strategy), entities.md (DataRetentionJobs)

## Blockers
Blocked by: PSRP-002

## Branch Name
`feature/PSRP-021-data-retention-job`

(End of file - total 61 lines)