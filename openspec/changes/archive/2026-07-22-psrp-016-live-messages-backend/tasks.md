## 1. Core Interfaces and DTOs

- [x] 1.1 Define `IMessageTemplateService` interface with methods for CRUD operations and default template generation.
- [x] 1.2 Define `ILiveMessageService` interface with methods for sending messages and retrieving history.
- [x] 1.3 Create DTOs: `SendLiveMessageRequest`, `UpdateMessageTemplateRequest`, `MessageTemplateResponse`, and `LiveMessageResponse`.
- [x] 1.4 Add FluentValidation rules for `SendLiveMessageRequest` (MessageTemplateId required, CustomMessage max 500 chars).

## 2. Service Implementation

- [x] 2.1 Implement `MessageTemplateService` with `CreateDefaultTemplatesAsync`, `GetTemplatesByEventAsync`, and `UpdateTemplateAsync`.
- [x] 2.2 Wire up default template generation in the event publication flow (transactional).
- [x] 2.3 Implement `LiveMessageService` logic to check permissions (verify token, "send_messages" permission, not expired/revoked).
- [x] 2.4 Implement rate limiting in `LiveMessageService` using Dragonfly (max 20 messages per hour per accomplice).
- [x] 2.5 Implement enqueueing logic in `LiveMessageService` to push payloads to `whatsapp:queue` via Dragonfly.

## 3. API Controllers

- [x] 3.1 Create `MessageTemplatesController` with `GET /api/events/{slug}/message-templates` and `PUT /api/events/{slug}/message-templates/{id}`.
- [x] 3.2 Create `LiveMessagesController` with `POST /api/live/{accompliceToken}/send`.
- [x] 3.3 Add `GET /api/events/{slug}/live-messages` endpoint in `LiveMessagesController` to return history and delivery status.

## 4. Webhook & Integration

- [x] 4.1 Update the existing WhatsApp webhook handler (from PSRP-012) to match payload `messageId` and update the `DeliveryStatus` on the `LiveMessage` entity.

## 5. Testing

- [x] 5.1 Write unit tests for `LiveMessageService` validating permission checks and rate limiting logic.
- [x] 5.2 Write unit tests for `MessageTemplateService` to ensure 8 default templates are generated correctly upon event publication.
