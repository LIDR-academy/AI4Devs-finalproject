## 1. Core Services Setup

- [x] 1.1 Implement `IWhatsAppService` interface in `Aura.Core/Interfaces/Services/`
- [x] 1.2 Implement `MetaWhatsAppService` using `HttpClient` in `Aura.Infrastructure/Services/` to call Meta Cloud API
- [x] 1.3 Write unit tests for `MetaWhatsAppService` verifying correct HTTP request formatting and authorization headers

## 2. Webhook Controller Implementation

- [x] 2.1 Implement `WebhooksController.cs` in `Aura.Api` with `GET /api/webhooks/whatsapp` to handle hub challenge verification
- [x] 2.2 Implement `POST /api/webhooks/whatsapp` to receive Meta delivery receipt callbacks
- [x] 2.3 Add logic to update `DeliveryLogs` and `Invitations` tables based on webhook status updates (e.g., sent, delivered, failed)
- [x] 2.4 Write unit tests for `WebhooksController` verifying challenge logic and delivery receipt parsing

## 3. Background Worker Creation

- [x] 3.1 Create new `Aura.Workers.WhatsApp` project with `Program.cs` configured for background processing
- [x] 3.2 Implement `WhatsAppDispatcherWorker` to BRPOP from Dragonfly `whatsapp:queue`
- [x] 3.3 Integrate `MetaWhatsAppService` into `WhatsAppDispatcherWorker` to send dequeued messages
- [x] 3.4 Write unit tests for `WhatsAppDispatcherWorker` validating successful execution and status updates

## 4. Retry and Fallback Logic

- [x] 4.1 Implement delayed retry queue logic using Dragonfly sorted sets (`whatsapp:retry` with ZADD score = unix timestamp)
- [x] 4.2 Add polling logic in `WhatsAppDispatcherWorker` via ZRANGEBYSCORE to process scheduled retries
- [x] 4.3 Configure retry policy: Attempt 1 (immediate), Attempt 2 (5 min delay), Attempt 3 (30 min delay)
- [x] 4.4 Implement fallback logic: After 2 failures, enqueue message to `email:queue` with type `invitation-fallback`
- [x] 4.5 Write unit tests verifying retry delays and email fallback behavior

## 5. Deployment and Operations

- [x] 5.1 Create `Dockerfile` for `Aura.Workers.WhatsApp`
- [x] 5.2 Create Kubernetes Deployment manifest `k8s/base/workers/whatsapp-deployment.yaml` with 1 replica
- [x] 5.3 Update local development scripts (`dev.ps1`) to include the new worker (if necessary)
