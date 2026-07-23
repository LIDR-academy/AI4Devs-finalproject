## ADDED Requirements

### Requirement: Automated RSVP Reminders Scheduling
The system SHALL execute a daily background job to schedule RSVP reminders for pending guests.

#### Scenario: Guest has not responded and deadline approaches
- **WHEN** the daily CronJob runs and a guest has an invitation marked 'sent', no RSVP recorded, and the event date is 7 days or less away
- **THEN** the system enqueues a reminder job for that guest via the original invitation channel.

#### Scenario: Guest has already responded
- **WHEN** the daily CronJob runs and a guest has already submitted an RSVP
- **THEN** the system ignores the guest and no reminder is scheduled.

### Requirement: Reminder Deduplication
The system SHALL prevent sending multiple reminders to the same guest within a 24-hour window.

#### Scenario: Recent reminder exists
- **WHEN** the system attempts to enqueue a reminder for a guest but a `DeliveryLog` record of type 'reminder' exists within the last 24 hours
- **THEN** the system skips enqueueing a new reminder.

### Requirement: Manual Reminder Trigger
The system SHALL allow hosts to manually trigger reminders for specific guests.

#### Scenario: Host selects pending guests and sends reminder
- **WHEN** the host submits a request to `/api/events/{slug}/reminders/send` with a list of guest IDs
- **THEN** the system enqueues reminders for those specific guests, provided they haven't received a reminder in the last 24 hours.

### Requirement: Reminder Routing
The system SHALL route the reminder to the correct queue based on the original invitation method.

#### Scenario: Original invitation sent via WhatsApp
- **WHEN** a reminder is enqueued for a guest whose original invitation `SentVia` is 'whatsapp'
- **THEN** the system enqueues the message to `whatsapp:queue` with the 'rsvp_reminder' template.

#### Scenario: Original invitation sent via Email
- **WHEN** a reminder is enqueued for a guest whose original invitation `SentVia` is 'email'
- **THEN** the system enqueues the message to `email:queue` with the 'rsvp-reminder' template.
