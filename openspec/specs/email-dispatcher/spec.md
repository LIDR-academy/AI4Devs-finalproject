## ADDED Requirements

### Requirement: Queue infrastructure with Dragonfly
The system SHALL support pushing and popping messages from distributed queues using `Dragonfly` via `StackExchange.Redis`. 

#### Scenario: Enqueue a message
- **WHEN** the `IQueueService.EnqueueAsync` is called with a queue name and a JSON string message
- **THEN** it executes an LPUSH command to add the message to the left of the specified list in Redis.

#### Scenario: Blocking dequeue
- **WHEN** the `IQueueService.DequeueAsync` is called for an empty queue
- **THEN** it uses BRPOP with a 5-second timeout, returning null if no messages arrive.

### Requirement: Email Dispatcher Worker
The system SHALL have a background worker (`Aura.Workers.Email`) that consumes the `email:queue` continuously and dispatches emails.

#### Scenario: Message processing loop
- **WHEN** the worker starts
- **THEN** it repeatedly polls `email:queue` using a blocking pop and attempts to process arriving messages.

#### Scenario: Valid email dispatch
- **WHEN** a valid email payload is dequeued (e.g. valid recipient, subject, template name)
- **THEN** it renders the HTML template using string replacements, sends it via the `SmtpEmailService`, and marks the corresponding `DeliveryLog` status to `sent`.

#### Scenario: Invalid email dispatch or failure
- **WHEN** sending fails (e.g. SMTP exception)
- **THEN** the worker sets the `DeliveryLog` status to `failed`, sets the failure reason, and increments the retry count.

### Requirement: Delivery state tracking
The system SHALL track delivery attempt states in a `DeliveryLogs` database table.

#### Scenario: Initialize tracking
- **WHEN** a message is requested to be sent
- **THEN** a `DeliveryLog` record is created with a `pending` status before it's enqueued.

### Requirement: Template Rendering
The worker SHALL render predefined HTML templates before dispatch.

#### Scenario: Simple token replacement
- **WHEN** a template string contains `{{guestName}}` and the payload's token dictionary provides `{"guestName": "Pedro"}`
- **THEN** the resulting HTML output replaces `{{guestName}}` with `Pedro`.
