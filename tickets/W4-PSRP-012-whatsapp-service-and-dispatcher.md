## PSRP-012: feat(messaging): whatsapp-service-and-dispatcher

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W4
**Dependencies:** PSRP-010

## Feature Summary
Implementar la abstracción del servicio de WhatsApp (`IWhatsAppService`) y el worker WhatsApp Dispatcher que desencola mensajes desde la cola Dragonfly `whatsapp:queue`, envía vía Meta WhatsApp Business Cloud API, maneja lógica de reintento (2 reintentos con delays de 5min/30min), y hace fallback a email después de 2 fallos. Incluye el handler de webhook para recibos de entrega y el deployment en Kubernetes para el worker.

## Requirements
- [ ] Implement `IWhatsAppService` interface in Aura.Core/Interfaces/Services/ with methods: SendTemplateMessageAsync(to, templateName, variables), SendTextMessageAsync(to, message), GetDeliveryStatusAsync(messageId)
- [ ] Implement `MetaWhatsAppService` in Aura.Infrastructure/Services/ using HttpClient to call Meta Cloud API: `POST https://graph.facebook.com/v18.0/{phone-number-id}/messages`
- [ ] Implement WhatsApp message template format per Meta API spec: `{ messaging_product: "whatsapp", to, type: "template", template: { name, language: { code: "es" }, components: [{ type: "body", parameters: [...] }] } }`
- [ ] Create `Aura.Workers.WhatsApp` project with `Program.cs` (HostBuilder for background worker)
- [ ] Implement `WhatsAppDispatcherWorker` (BackgroundService) that: BRPOP from `whatsapp:queue`, deserializes payload, calls MetaWhatsAppService, updates DeliveryLog, handles retry logic
- [ ] Implement retry logic: attempt 1 immediate, attempt 2 after 5 minutes (re-enqueue with delay), attempt 3 after 30 minutes (re-enqueue with delay). After 2 failures, fall back to email (enqueue to `email:queue`)
- [ ] Implement delayed retry using Dragonfly sorted sets (ZADD with score = unix timestamp) or separate retry queue with a scheduler
- [ ] Implement `WebhooksController` with `POST /api/webhooks/whatsapp` — receives Meta webhook callbacks for message delivery status updates (sent, delivered, failed), updates DeliveryLog and Invitation/LiveMessage status
- [ ] Implement Meta webhook verification: `GET /api/webhooks/whatsapp` — hub challenge verification (verify_token matching)
- [ ] Create Dockerfile for Aura.Workers.WhatsApp
- [ ] Create Kubernetes Deployment manifest for WhatsApp Dispatcher (1 replica)
- [ ] Write unit tests for MetaWhatsAppService (HTTP request formatting), WhatsAppDispatcherWorker (retry logic, fallback), and webhook handler (signature verification)

## Technical Notes
- **Backend:**
  - Meta API auth: `Authorization: Bearer {access_token}` header
  - Webhook verification: Meta sends GET with `hub.verify_token`, `hub.challenge`. Return challenge if verify_token matches
  - Webhook delivery receipts: POST with `entry[].changes[].value.statuses[]` containing `id`, `status`, `timestamp`
  - Retry: use Dragonfly sorted set `whatsapp:retry` with ZADD score=retry_timestamp. Worker polls with ZRANGEBYSCORE for due items
  - Fallback: after 2 failures, enqueue to `email:queue` with type='invitation-fallback'
- **Frontend:** N/A
- **Database:** DeliveryLogs table (update status from webhook), Invitations table (update DeliveryStatus)
- **Integrations:** Meta WhatsApp Cloud API, Dragonfly (queue + retry), Gmail SMTP (fallback)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IWhatsAppService.cs`
  - `backend/src/Aura.Infrastructure/Services/MetaWhatsAppService.cs`
  - `backend/workers/Aura.Workers.WhatsApp/Program.cs`
  - `backend/workers/Aura.Workers.WhatsApp/WhatsAppDispatcherWorker.cs`
  - `backend/src/Aura.Api/Controllers/WebhooksController.cs`
  - `backend/workers/Aura.Workers.WhatsApp/Dockerfile`
  - `k8s/base/workers/whatsapp-deployment.yaml`

## Acceptance Criteria
- [ ] AC1: Given a WhatsApp message is enqueued, when the WhatsApp Dispatcher processes it, then the message is sent via Meta Cloud API and the DeliveryLog is updated to status='sent' with the provider message ID
- [ ] AC2: Given a WhatsApp send fails (API error), when the failure occurs, then the message is re-enqueued for retry after 5 minutes (attempt 2)
- [ ] AC3: Given a WhatsApp message fails twice, when the second retry fails, then the message is sent via email as fallback (enqueued to `email:queue`)
- [ ] AC4: Given Meta sends a delivery receipt webhook, when the webhook is received, then the DeliveryLog is updated with the delivery status (delivered/failed)
- [ ] AC5: Given Meta sends the webhook verification GET request, when the verify_token matches, then the hub.challenge is returned and the webhook is activated
- [ ] AC6: Given the WhatsApp Dispatcher Docker image is built, when `docker run` is executed, then the worker connects to Dragonfly and starts processing the `whatsapp:queue`

## Related Items
- **PRD section:** 06-mvp-features.md (6.3.1 Email + WhatsApp Invitations, US-COM-02, US-COM-04, AC-COM-02, AC-COM-03)
- **Architecture:** 02-components.md (WhatsApp Dispatcher), 04-infrastructure-deployment.md
- **Data model:** entities.md (DeliveryLogs, Invitations)

## Blockers
Blocked by: PSRP-010

## Branch Name
`feature/PSRP-012-whatsapp-service-and-dispatcher`

(End of file - total 62 lines)