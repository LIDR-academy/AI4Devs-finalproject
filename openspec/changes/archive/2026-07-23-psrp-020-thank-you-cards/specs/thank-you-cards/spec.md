## ADDED Requirements

### Requirement: Automated Thank You Cards Dispatch
The system SHALL dispatch thank you cards to guests who attended the event exactly 1 day after the event date.

#### Scenario: Eligible guests after event
- **WHEN** the daily CronJob runs at 04:00 UTC and finds published events with an EventDate of exactly yesterday, and guests with an RSVP attendance of 'yes'
- **THEN** it enqueues a thank you message to the `email:queue` or `whatsapp:queue` based on their original invitation channel.

#### Scenario: No guests attended
- **WHEN** an event occurred yesterday but no guests have an RSVP of 'yes'
- **THEN** no thank you messages are scheduled for that event.

### Requirement: Thank You Message Deduplication
The system SHALL prevent sending multiple thank you cards to the same guest for the same event.

#### Scenario: Existing thank you delivery log
- **WHEN** the system attempts to enqueue a thank you card but a `DeliveryLog` record of type 'thank_you' exists for that guest
- **THEN** it skips enqueuing another message.
