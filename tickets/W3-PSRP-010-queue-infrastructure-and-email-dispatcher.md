## PSRP-010: feat(infra): queue-infrastructure-and-email-dispatcher

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W3
**Dependencies:** PSRP-003, PSRP-004

## Feature Summary
Implement the Dragonfly-based queue infrastructure (IQueueService abstraction, DragonflyQueueService using StackExchange.Redis) and the Email Dispatcher worker service. The queue service provides LPUSH/BRPOP operations for distributed message queues. The Email Dispatcher worker dequeues email messages from the `email:queue`, renders HTML templates with personalization tokens, sends via Gmail SMTP, and updates delivery status in the database. This establishes the async messaging backbone for all future features (invitations, reminders, live messages, thank you cards).

## Requirements
- [ ] Implement `IQueueService` interface in Aura.Core/Interfaces/Services/ with methods: EnqueueAsync(string queueName, string message), DequeueAsync(string queueName), GetQueueLengthAsync(string queueName)
- [ ] Implement `DragonflyQueueService` in Aura.Infrastructure/Queue/ using StackExchange.Redis: LPUSH for enqueue, BRPOP (blocking) for dequeue, LLEN for queue length
- [ ] Define queue name constants in `QueueNames.cs`: `email:queue`, `whatsapp:queue`, `ssg:queue`, `reminder:queue`
- [ ] Create `Aura.Workers.Email` project with `Program.cs` (HostBuilder for background worker)
- [ ] Implement `EmailDispatcherWorker` (BackgroundService) that: connects to Dragonfly, BRPOP from `email:queue` in a loop, deserializes message payload, routes to email template renderer, sends via SmtpEmailService, updates DeliveryLog status
- [ ] Define email message payload schema: `{ type: string, to: string, subject: string, templateName: string, tokens: {key: value}, eventId: string, entityType: string, entityId: string }`
- [ ] Implement email template renderer: load HTML templates from `templates/` directory, replace `{{token}}` placeholders with values from payload
- [ ] Create 6 email HTML templates: magic-link, invitation-email, rsvp-reminder, thank-you-card, accomplice-invite, payment-receipt
- [ ] Implement DeliveryLog creation and status updates: create DeliveryLog on enqueue (status=pending), update to 'sent' on success, 'failed' on failure with retry count and failure reason
- [ ] Create Dockerfile for Aura.Workers.Email
- [ ] Create Kubernetes Deployment manifest for Email Dispatcher (1 replica, resource limits)
- [ ] Write unit tests for QueueService (enqueue/dequeue round-trip) and EmailDispatcherWorker (template rendering, delivery status updates)

## Technical Notes
- **Backend:**
  - Queue service: StackExchange.Redis `IDatabase`. LPUSH for enqueue, BRPOP with 5-second timeout for dequeue (prevents busy-wait)
  - Email worker: `BackgroundService` with `ExecuteAsync` loop. Graceful shutdown on CancellationToken
  - Email templates: Razor Light or simple string replacement. Store in `backend/workers/Aura.Workers.Email/templates/`
  - Delivery tracking: create DeliveryLog record before enqueue, update after send attempt
- **Frontend:** N/A
- **Database:** DeliveryLogs table (create on enqueue, update on send)
- **Integrations:** Dragonfly (queue), Gmail SMTP (send)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IQueueService.cs`
  - `backend/src/Aura.Infrastructure/Queue/DragonflyQueueService.cs`
  - `backend/src/Aura.Infrastructure/Queue/QueueNames.cs`
  - `backend/workers/Aura.Workers.Email/Program.cs`
  - `backend/workers/Aura.Workers.Email/EmailDispatcherWorker.cs`
  - `backend/workers/Aura.Workers.Email/EmailTemplateRenderer.cs`
  - `backend/workers/Aura.Workers.Email/templates/magic-link.html`
  - `backend/workers/Aura.Workers.Email/templates/invitation-email.html`
  - `backend/workers/Aura.Workers.Email/templates/rsvp-reminder.html`
  - `backend/workers/Aura.Workers.Email/templates/thank-you-card.html`
  - `backend/workers/Aura.Workers.Email/templates/accomplice-invite.html`
  - `backend/workers/Aura.Workers.Email/templates/payment-receipt.html`
  - `backend/workers/Aura.Workers.Email/Dockerfile`
  - `k8s/base/workers/email-deployment.yaml`

## Acceptance Criteria
- [ ] AC1: Given a message is enqueued to `email:queue`, when the Email Dispatcher worker is running, then the message is dequeued, rendered with the correct template, sent via Gmail SMTP, and the DeliveryLog is updated to status='sent'
- [ ] AC2: Given an email fails to send (SMTP error), when the failure occurs, then the DeliveryLog is updated to status='failed' with failure reason and retry count incremented
- [ ] AC3: Given the queue is empty, when the worker calls BRPOP, then it blocks for up to 5 seconds and returns null (no busy-wait CPU spin)
- [ ] AC4: Given an email template with tokens `{{guestName}}` and `{{rsvpLink}}`, when the template is rendered with values, then the output HTML contains the substituted values
- [ ] AC5: Given the Email Dispatcher Docker image is built, when `docker run` is executed with correct environment variables, then the worker connects to Dragonfly and starts processing the queue
- [ ] AC6: Given the Kubernetes manifest is applied, when `kubectl get pods` is run, then the email-dispatcher pod is running with 1 replica

## Related Items
- **PRD section:** 06-mvp-features.md (6.3.1 Email + WhatsApp Invitations — email portion), 07-work-breakdown.md (Backend — background jobs)
- **Architecture:** 02-components.md (Email Dispatcher), 04-infrastructure-deployment.md (worker deployments)
- **Data model:** entities.md (DeliveryLogs)

## Blockers
Blocked by: PSRP-003, PSRP-004

## Branch Name
`feature/PSRP-010-queue-infrastructure-and-email-dispatcher`
