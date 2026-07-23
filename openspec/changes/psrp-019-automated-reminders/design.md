## Context

Aura needs a way to automatically ping guests who haven't responded to their RSVP. We already have the background dispatching mechanisms in place (`email:queue` and `whatsapp:queue` via Dragonfly) and the data schema tracking RSVPs, so we need a query and scheduling layer on top to queue the reminders.

## Goals / Non-Goals

**Goals:**
- Reliable scheduling of a daily sweep at 03:00 UTC to queue reminders.
- Ability to manually trigger reminders from the Guest Manager UI.
- Ensure no duplicate reminders are sent within 24 hours.
- Route reminders via the same channel as the original invitation.

**Non-Goals:**
- Customizing reminder message copy per event (we'll use a standard template).
- Sending reminders through channels other than email or WhatsApp.

## Decisions

- **Architecture:** We will implement `ReminderSchedulerWorker` as a Kubernetes CronJob. It will run daily, querying the database and enqueueing jobs into Dragonfly (`email:queue` and `whatsapp:queue`).
- **Deduplication:** We will insert an entry into `DeliveryLogs` when a reminder is queued, and the query will check `DeliveryLogs` where `EntityType='reminder'` and `SentAt > NOW() - 24 hours` to ensure we don't spam.
- **Routing:** Since `Invitations` store `SentVia`, we just inspect that to know whether to enqueue into Dragonfly's `email:queue` or `whatsapp:queue`.

## Risks / Trade-offs

- **Risk:** High volume of guests could cause the CronJob to queue thousands of messages at once, hitting rate limits.
  - **Mitigation:** The actual email/whatsapp dispatcher workers already have concurrency controls and will process the queue at a safe rate.
- **Risk:** Timezones. If the cron runs at 03:00 UTC, some users might get the reminder at an inconvenient time.
  - **Mitigation:** For MVP, 03:00 UTC is an acceptable compromise until we implement timezone-aware scheduling per event.
