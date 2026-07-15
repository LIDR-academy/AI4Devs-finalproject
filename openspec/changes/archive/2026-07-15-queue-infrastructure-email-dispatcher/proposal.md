## Why

We need a scalable background processing infrastructure to handle asynchronous tasks like sending emails without blocking the main API thread. Implementing a Dragonfly-backed queue service and an Email Dispatcher worker establishes the core messaging backbone required for invitations, reminders, live event messages, and payment receipts.

## What Changes

- Abstract queue operations (enqueue, dequeue, get length) behind an `IQueueService`.
- Implement `DragonflyQueueService` using StackExchange.Redis for reliable distributed queues via LPUSH/BRPOP operations.
- Introduce `QueueNames` constants for standardized queue topics (`email:queue`, `whatsapp:queue`, `ssg:queue`, `reminder:queue`).
- Create a new background worker project `Aura.Workers.Email` running as a .NET BackgroundService.
- Implement `EmailDispatcherWorker` to consume payloads from the `email:queue`, render HTML templates, and dispatch emails via SmtpEmailService.
- Implement an email template renderer that injects tokenized values into HTML templates (e.g. `{{guestName}}`).
- Provide core email templates for magic-link, invitation, rsvp-reminder, thank-you-card, accomplice-invite, and payment-receipt.
- Add `DeliveryLog` entity state tracking: creating logs on enqueue, and updating status to sent or failed (with retry counts) after processing.
- Add Docker and Kubernetes configurations for the Email Dispatcher worker.

## Capabilities

### New Capabilities
- `email-dispatcher`: A background worker service and queue infrastructure responsible for asynchronously consuming, rendering, and sending transactional emails through an SMTP provider, while tracking delivery state.

### Modified Capabilities
None.

## Impact

- **Backend Architecture**: Introduces a new background worker layer (`Aura.Workers.Email`) scaling independently from the main API.
- **Dependencies**: Introduces StackExchange.Redis for Redis/Dragonfly connectivity.
- **Data Persistence**: Requires a new (or updated) table for `DeliveryLog` tracking.
- **Infrastructure**: Requires Dragonfly (Redis-compatible memory store) to be available to the workers and API, as well as a new Kubernetes deployment for the worker.
