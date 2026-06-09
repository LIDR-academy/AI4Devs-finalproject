## PSRP-016: feat(live-messages): live-messages-backend

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W5
**Dependencies:** PSRP-006, PSRP-012

## Feature Summary
Implementar el backend del sistema de mensajes en vivo que permite a los accomplices enviar actualizaciones de WhatsApp en tiempo real a los invitados durante el evento. Incluye CRUD de MessageTemplate (8 plantillas por defecto creadas al publicar el evento), creación y encolado de LiveMessage vía Dragonfly `whatsapp:queue`, seguimiento de estado de entrega, rate limiting por accomplice, y los endpoints de API que el panel de accomplice (PSRP-018) consumirá.

## Requirements
- [ ] Implement `IMessageTemplateService` and `MessageTemplateService` with methods: CreateDefaultTemplatesAsync(eventId), GetTemplatesByEventAsync, UpdateTemplateAsync, SoftDeleteTemplateAsync
- [ ] Implement `ILiveMessageService` and `LiveMessageService` with methods: SendLiveMessageAsync(accompliceToken, messageTemplateId, customMessage), GetLiveMessagesByEventAsync, GetLiveMessagesByAccompliceAsync
- [ ] Implement auto-creation of 8 default MessageTemplates when event is published (triggered from PSRP-013 publish flow): Bride Leaving, Ceremony Starting, They Said Yes, Cocktail Hour, Dinner Time, First Dance, Cake Cutting, Party Time
- [ ] Implement `POST /api/live/{accompliceToken}/send` endpoint — validates accomplice token and permissions, creates LiveMessage record, enqueues to `whatsapp:queue` with type='live_update', returns 202 Accepted with messageId
- [ ] Implement `GET /api/events/{slug}/message-templates` endpoint — returns templates for the event (host view for customization)
- [ ] Implement `PUT /api/events/{slug}/message-templates/{id}` endpoint — host updates template label and default message
- [ ] Implement `GET /api/events/{slug}/live-messages` endpoint — returns live message history with delivery status
- [ ] Implement accomplice permission check: verify Accomplice token, check `Permissions` JSON contains "send_messages", check not revoked, check not expired
- [ ] Implement rate limiting: max 20 messages per accomplice per hour (via Dragonfly)
- [ ] Implement live message enqueue payload: `{ type: "live_update", to: guestPhone, templateName: "live_update", variables: { customMessage }, eventId, entityType: "live_message", entityId: liveMessage.Id }`
- [ ] Implement delivery status tracking: LiveMessage.DeliveryStatus updated via WhatsApp webhook (reuse PSRP-012 webhook handler)
- [ ] Implement FluentValidation for SendLiveMessageRequest: MessageTemplateId required, CustomMessage max 500 chars
- [ ] Write unit tests for LiveMessageService (permission check, rate limiting, enqueue logic) and MessageTemplateService (default template creation)

## Technical Notes
- **Backend:**
  - `POST /api/live/{accompliceToken}/send` — hash token, lookup Accomplice, verify permissions and expiry, create LiveMessage (status='pending'), enqueue to `whatsapp:queue`, return 202
  - WhatsApp template for live updates: must be pre-approved by Meta. Template name: `live_update`, body: `{{1}}` (custom message variable)
  - Rate limiting: Dragonfly key `ratelimit:accomplice:{accompliceId}:messages`, INCR + EXPIRE 3600
  - Default templates: created in a transaction when event status changes to 'published'
  - Live message broadcast: for MVP, send to all guests with phone numbers. V2: segment by category
- **Frontend:** N/A (accomplice panel UI in PSRP-018)
- **Database:** MessageTemplates table (soft delete), LiveMessages table (DeliveryStatus, RetryCount)
- **Integrations:** Dragonfly (queue to `whatsapp:queue`), WhatsApp Dispatcher (PSRP-012 processes the queue)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IMessageTemplateService.cs`
  - `backend/src/Aura.Core/Services/MessageTemplateService.cs`
  - `backend/src/Aura.Core/Interfaces/Services/ILiveMessageService.cs`
  - `backend/src/Aura.Core/Services/LiveMessageService.cs`
  - `backend/src/Aura.Api/Controllers/LiveMessagesController.cs`
  - `backend/src/Aura.Api/Controllers/MessageTemplatesController.cs`
  - `backend/src/Aura.Core/DTOs/LiveMessages/SendLiveMessageRequest.cs`
  - `backend/src/Aura.Core/DTOs/LiveMessages/LiveMessageResponse.cs`
  - `backend/src/Aura.Core/DTOs/MessageTemplates/MessageTemplateResponse.cs`
  - `backend/src/Aura.Core/DTOs/MessageTemplates/UpdateMessageTemplateRequest.cs`

## Acceptance Criteria
- [ ] AC1: Given an event is published, when the publish flow completes, then 8 default MessageTemplates are created with labels and default messages per specification
- [ ] AC2: Given an accomplice with valid token and "send_messages" permission, when `POST /api/live/{token}/send` is called with a template ID, then a LiveMessage is created, a WhatsApp message is enqueued, and 202 Accepted is returned
- [ ] AC3: Given an accomplice tries to send without "send_messages" permission, when the request is made, then 403 Forbidden is returned
- [ ] AC4: Given an accomplice sends 21 messages within 1 hour, when the 21st message is attempted, then 429 Too Many Requests is returned with cooldown message
- [ ] AC5: Given the host views message templates, when `GET /api/events/{slug}/message-templates` is called, then all 8 templates are returned with labels, default messages, and icons
- [ ] AC6: Given the host updates a template label and message, when `PUT` is called, then the template is updated and the accomplice panel reflects the changes on next load

## Related Items
- **PRD section:** 06-mvp-features.md (6.4 Live Guest Journey, US-LGJ-05 for template configuration)
- **Architecture:** 02-components.md (Accomplice Panel, WhatsApp Dispatcher), 01-architecture-diagram.md (Live Guest Journey flow)
- **Data model:** entities.md (MessageTemplates, LiveMessages, Accomplices)

## Blockers
Blocked by: PSRP-006, PSRP-012

## Branch Name
`feature/PSRP-016-live-messages-backend`

(End of file - total 66 lines)