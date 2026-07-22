## Context

The "Live Messages" feature allows event hosts to designate "accomplices" who can send real-time updates (e.g., "Ceremony Starting", "Dinner Time") to all guests via WhatsApp during the event. Currently, there is no backend infrastructure to support this. We need to implement template management, message dispatching with rate limiting, and delivery status tracking, while integrating with the existing WhatsApp Dispatcher (PSRP-012) and Dragonfly queue.

## Goals / Non-Goals

**Goals:**
- Provide CRUD APIs for `MessageTemplate` to allow hosts to customize the 8 default templates.
- Auto-generate the 8 default templates when an event is published.
- Implement an API for accomplices to trigger a live message broadcast using a template and an optional custom message.
- Enqueue messages to the `whatsapp:queue` using Dragonfly to ensure asynchronous and reliable delivery.
- Implement rate limiting (max 20 messages per accomplice per hour).
- Track message delivery status via WhatsApp webhooks.

**Non-Goals:**
- Segmenting broadcasts (e.g., sending only to VIPs). For the MVP, messages are sent to all guests with a phone number.
- Frontend implementation (this is handled in PSRP-018).

## Decisions

- **Queue Integration**: Use Dragonfly to push to the `whatsapp:queue`. This decouples the API from the actual WhatsApp HTTP requests, improving latency and reliability.
- **Rate Limiting**: Implement a simple Redis/Dragonfly-based rate limiter using `INCR` and `EXPIRE` on a key like `ratelimit:accomplice:{accompliceId}:messages`. It is efficient and meets the requirements.
- **Delivery Status**: Reuse the existing WhatsApp webhook handler from PSRP-012 to update the `DeliveryStatus` of `LiveMessages`. We just need to ensure the webhook payload can be matched to a `LiveMessage` entity (using `messageId`).
- **Default Templates**: Generate default templates within a transaction when the event status transitions to `published`. This ensures data consistency.

## Risks / Trade-offs

- **Risk: WhatsApp Rate Limits** → The Meta API might rate limit us if we send too many messages concurrently. **Mitigation**: The WhatsApp Dispatcher worker should handle backoff and retries.
- **Risk: Accomplice Spam** → An accomplice might spam guests. **Mitigation**: Implemented the 20 messages/hour rate limit per accomplice.
