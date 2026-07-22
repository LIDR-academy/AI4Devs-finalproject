## ADDED Requirements

### Requirement: Default Template Generation
The system SHALL automatically create 8 default MessageTemplates when an event's status is changed to 'published'.

#### Scenario: Event publication triggers template creation
- **WHEN** the host publishes an event
- **THEN** the system generates 8 default templates (e.g., Bride Leaving, Ceremony Starting, etc.) for that event.

### Requirement: Send Live Message Endpoint
The system SHALL provide an endpoint `POST /api/live/{accompliceToken}/send` for accomplices to trigger a live message.

#### Scenario: Valid accomplice sends a message
- **WHEN** an accomplice with the "send_messages" permission and a valid token calls the endpoint with a template ID and custom message
- **THEN** the system creates a LiveMessage record, enqueues it to `whatsapp:queue`, and returns a 202 Accepted.

### Requirement: Accomplice Permissions and Validation
The system SHALL verify that the accomplice token is valid, not expired, not revoked, and contains the "send_messages" permission before allowing a message to be sent.

#### Scenario: Unauthorized accomplice attempt
- **WHEN** an accomplice without the "send_messages" permission attempts to send a message
- **THEN** the system rejects the request and returns a 403 Forbidden.

### Requirement: Accomplice Rate Limiting
The system SHALL limit accomplices to sending a maximum of 20 live messages per hour.

#### Scenario: Rate limit exceeded
- **WHEN** an accomplice attempts to send their 21st message within an hour
- **THEN** the system returns a 429 Too Many Requests status code with a cooldown message.

### Requirement: Message Delivery Tracking
The system SHALL update the DeliveryStatus of a LiveMessage when a WhatsApp webhook event is received for that message.

#### Scenario: Webhook updates delivery status
- **WHEN** the WhatsApp Dispatcher processes the message and Meta sends a delivery webhook
- **THEN** the system updates the corresponding LiveMessage record's DeliveryStatus to 'delivered' or 'failed'.

### Requirement: Message Templates Management
The system SHALL provide endpoints for hosts to retrieve and update their event's message templates.

#### Scenario: Host updates a template
- **WHEN** the host calls `PUT /api/events/{slug}/message-templates/{id}` with a new label and default message
- **THEN** the system updates the template and it is reflected in the accomplice panel on the next load.
