## Why

This change is needed to provide the backend infrastructure for the "Live Messages" feature (PSRP-016). It allows event hosts and their designees (accomplices) to broadcast real-time updates to guests via WhatsApp during the event. This solves the communication gap on the event day by utilizing the existing WhatsApp integration.

## What Changes

- Create `IMessageTemplateService` and `MessageTemplateService` with CRUD operations for message templates.
- Implement automatic generation of 8 default templates when an event status is updated to `published`.
- Create `ILiveMessageService` and `LiveMessageService` to handle sending live messages and enqueuing them to the `whatsapp:queue`.
- Implement API endpoints for accomplices to send messages (`POST /api/live/{accompliceToken}/send`), validating token, permissions, and applying rate limiting (20 messages/hour).
- Implement API endpoints for hosts to view and update templates (`GET` and `PUT` at `/api/events/{slug}/message-templates`).
- Implement API endpoint to retrieve live message history (`GET /api/events/{slug}/live-messages`).
- Implement tracking of WhatsApp delivery status updates via webhook.

## Capabilities

### New Capabilities
- `live-messages-backend`: Covers sending real-time WhatsApp updates, template management, rate limiting, and status tracking.

### Modified Capabilities
- `<none>`

## Impact

- **Database**: Add logic to handle `MessageTemplates` (soft delete) and `LiveMessages` tables.
- **Message Broker**: Enqueue messages to `whatsapp:queue` via Dragonfly. Add rate limit keys to Dragonfly (`ratelimit:accomplice:{accompliceId}:messages`).
- **External Integration**: Integrates with the WhatsApp Dispatcher (PSRP-012) using pre-approved Meta templates (`live_update`).
- **APIs**: Introduces new endpoints under `/api/live/...` and `/api/events/{slug}/...`.
