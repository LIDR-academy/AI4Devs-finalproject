## Context

The application needs to expand communication channels beyond email, incorporating WhatsApp as a primary way to reach guests. Meta's WhatsApp Cloud API will be used for sending messages and receiving delivery updates via webhooks. We also need a robust queueing and retry mechanism because external API calls can fail or hit rate limits. To achieve this, a new background worker process (`Aura.Workers.WhatsApp`) will be responsible for dequeuing tasks, sending messages, and applying retry strategies. 

## Goals / Non-Goals

**Goals:**
- Implement `IWhatsAppService` using Meta WhatsApp Cloud API via `HttpClient`.
- Deploy a standalone `WhatsAppDispatcherWorker` to process the `whatsapp:queue`.
- Enable a retry mechanism backed by Dragonfly sorted sets (delays of 5 minutes, then 30 minutes).
- Implement a fallback mechanism to `email:queue` after 2 WhatsApp delivery failures.
- Add webhook endpoints in the API (`WebhooksController`) to verify Meta's challenge token and process asynchronous delivery receipts.

**Non-Goals:**
- Direct integration of two-way messaging (chatbot logic) - only outbound messages and delivery receipts are handled.
- Implementing an in-house message template editor (templates are managed via Meta Business Manager).

## Decisions

- **Architecture:** We are creating a separate worker process (`Aura.Workers.WhatsApp`) rather than running the dispatcher in the main API. This isolates background processing and allows independent scaling.
- **Retry Mechanism:** Dragonfly's sorted sets (`whatsapp:retry`) will be used to schedule delayed messages. The worker will poll `ZRANGEBYSCORE` to fetch items whose retry timestamp has arrived.
- **Webhook Verification:** A standard `GET /api/webhooks/whatsapp` endpoint will be created to echo `hub.challenge` when `hub.verify_token` matches the configured secret, as required by Meta.
- **Fallback Strategy:** If an invitation fails to send via WhatsApp after all retries, the payload is converted and pushed to the `email:queue` to ensure the guest still receives the invitation.

## Risks / Trade-offs

- **[Risk] High volume of retries backing up the sorted set:** 
  → **Mitigation:** The 5-minute and 30-minute delays spread the load. If the API is completely down, failures will quickly exhaust their 2 retries and fallback to email.
- **[Risk] Webhook out-of-order delivery:** 
  → **Mitigation:** The webhook handler must carefully parse the `timestamp` in the payload and ensure older statuses (e.g. `sent`) do not overwrite newer statuses (e.g. `delivered`).
- **[Risk] Rate limits from Meta API:** 
  → **Mitigation:** Relying on the queue to throttle outgoing requests if needed, and handling HTTP 429 status codes by immediately triggering the retry flow.
