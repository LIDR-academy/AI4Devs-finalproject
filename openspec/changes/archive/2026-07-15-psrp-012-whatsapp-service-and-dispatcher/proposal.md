## Why

The system currently supports sending email invitations to guests. We need to expand this functionality to include WhatsApp messaging through the Meta WhatsApp Business Cloud API. This will increase guest engagement and provide an alternative communication channel for invitations and notifications, complete with delivery tracking, automated retries, and email fallback.

## What Changes

- Add a new `IWhatsAppService` abstraction in `Aura.Core`.
- Implement `MetaWhatsAppService` using HttpClient to interact with the Meta Cloud API.
- Create a new background worker project: `Aura.Workers.WhatsApp`.
- Implement a `WhatsAppDispatcherWorker` that consumes messages from Dragonfly's `whatsapp:queue`.
- Introduce a retry mechanism utilizing a sorted set `whatsapp:retry` for delayed processing (5 min and 30 min delays).
- Implement a fallback mechanism to send emails via `email:queue` after 2 failed WhatsApp attempts.
- Create `WebhooksController` in `Aura.Api` to handle Meta WhatsApp webhooks (challenge verification and delivery receipts).
- Provide Dockerfile and Kubernetes deployment manifests for the new worker.

## Capabilities

### New Capabilities
- `whatsapp-messaging`: Covers sending template and text messages via Meta API, handling delivery webhooks, automatic retries, and fallback to email.

### Modified Capabilities
- (None)

## Impact

- **Backend Architecture**: Introduces a new background worker microservice (`Aura.Workers.WhatsApp`).
- **Infrastructure**: New Kubernetes deployment `whatsapp-deployment`.
- **Database**: Updates to `DeliveryLogs` and `Invitations` tables based on webhook status updates.
- **Third-Party APIs**: Integration with Meta WhatsApp Cloud API.
- **Queue System**: Utilization of Dragonfly sorted sets for scheduled retries.
