## ADDED Requirements

### Requirement: Send WhatsApp Template Messages
The system SHALL provide an implementation of `IWhatsAppService` that uses the Meta WhatsApp Business Cloud API to send template messages.

#### Scenario: Host sends a template message
- **WHEN** the `IWhatsAppService.SendTemplateMessageAsync` is invoked with valid credentials and a template payload
- **THEN** the system sends the HTTP POST request to the Meta Cloud API and returns a success result if accepted by Meta.

### Requirement: Send WhatsApp Text Messages
The system SHALL provide an implementation of `IWhatsAppService` to send raw text messages via Meta API.

#### Scenario: Dispatcher sends a text message
- **WHEN** `IWhatsAppService.SendTextMessageAsync` is invoked
- **THEN** a standard text message payload is submitted to the Meta API.

### Requirement: Dispatcher Message Queueing and Sending
The system SHALL have a background worker (`WhatsAppDispatcherWorker`) that continuously pops messages from `whatsapp:queue` and invokes the WhatsApp service.

#### Scenario: Worker processes queued message
- **WHEN** a valid WhatsApp message payload is available on the queue
- **THEN** the worker deserializes it, calls the Meta API, and records a 'sent' status in the DeliveryLog.

### Requirement: Retry Mechanism
The system SHALL implement a retry strategy using a sorted set for delayed re-queueing of failed messages. Attempt 1 is immediate, attempt 2 is after 5 minutes, attempt 3 is after 30 minutes.

#### Scenario: Meta API returns a transient error
- **WHEN** sending the WhatsApp message fails on the first attempt
- **THEN** the system catches the error, increments the retry counter, and schedules the message for processing 5 minutes later in `whatsapp:retry`.

### Requirement: Fallback to Email
The system SHALL enqueue a fallback email invitation if the WhatsApp message fails twice (i.e. fails on attempt 3).

#### Scenario: WhatsApp delivery completely fails
- **WHEN** the third processing attempt fails
- **THEN** the message is pushed to `email:queue` with an 'invitation-fallback' type, and the WhatsApp delivery log is marked as 'failed'.

### Requirement: Delivery Receipt Webhook
The system SHALL expose a `WebhooksController` to verify Meta's challenge requests and process delivery receipts for WhatsApp messages.

#### Scenario: Webhook setup verification
- **WHEN** Meta sends a GET request to `/api/webhooks/whatsapp` with a valid `hub.verify_token`
- **THEN** the API responds with the `hub.challenge` value.

#### Scenario: Delivery receipt update
- **WHEN** Meta sends a POST request with status updates (e.g., delivered, read, failed)
- **THEN** the system parses the timestamp and message ID, updating the corresponding DeliveryLog and Invitation status appropriately.
