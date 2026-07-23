## 1. Core Services

- [x] 1.1 Implement `IReminderService` and `ReminderService` in `Aura.Core` with logic to find pending guests and enqueue messages.
- [x] 1.2 Implement deduplication check logic using `DeliveryLogs` in the `ReminderService`.
- [x] 1.3 Add unit tests for `ReminderService` verifying query logic, channel routing, and deduplication.

## 2. Background Worker

- [x] 2.1 Implement a `ReminderSchedulerWorker` as a hosted service or standalone worker project.
- [x] 2.2 Configure the worker to run daily on a schedule (e.g., 03:00 UTC) using a Cron library or Kubernetes CronJob.
- [x] 2.3 Create Kubernetes CronJob manifest `reminder-cronjob.yaml`.

## 3. API Endpoints

- [x] 3.1 Implement `RemindersController` with `POST /api/events/{slug}/reminders/send` for manual triggers.
- [x] 3.2 Update `DeliveryLogs` integration if necessary to ensure it's recorded correctly by API.

## 4. Frontend Integration

- [x] 4.1 Add `sendManualReminders(slug: string, guestIds: string[])` to `EventService`.
- [x] 4.2 Update `GuestListComponent` to include a "Send Reminders" action button when there are pending guests.
- [x] 4.3 Ensure the button disables if no eligible guests exist or if they all received reminders recently.
