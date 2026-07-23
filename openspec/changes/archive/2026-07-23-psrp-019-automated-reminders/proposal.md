## Why

Guests often forget to RSVP, causing uncertainty for event hosts. An automated reminder system solves this by automatically following up with pending guests as the RSVP deadline approaches, ensuring hosts get accurate attendance counts without having to manually track who hasn't responded.

## What Changes

- Implement a `ReminderSchedulerWorker` as a Kubernetes CronJob that runs daily at 03:00 UTC.
- Automatically identify guests who haven't responded within 7 days of the event date.
- Send reminders automatically via the guest's original invitation channel (email or WhatsApp).
- Implement manual reminder triggers via a new backend API and a "Send Reminder" button in the Guest Manager UI.
- Ensure reminders are deduplicated and canceled if a guest has already RSVP'd or received a reminder in the last 24 hours.

## Capabilities

### New Capabilities
- `automated-reminders`: Manages automated and manual scheduling, dispatching, and deduplication of RSVP reminders for pending guests.

### Modified Capabilities
- `guest-management`: Modifies the guest manager UI to support selecting pending guests and sending manual reminders.

## Impact

- **Backend API**: New endpoint `POST /api/events/{slug}/reminders/send` for manual triggers.
- **Workers**: New `ReminderSchedulerWorker` or CronJob.
- **Frontend UI**: Updates to the `guest-manager.page.ts` to include the manual reminder button and flow.
- **Database**: Queries joining `Guests`, `Invitations`, `RSVPs`, and `DeliveryLogs`.
- **Infrastructure**: New Kubernetes CronJob manifest.
