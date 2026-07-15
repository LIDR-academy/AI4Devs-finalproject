## 1. Queue Infrastructure

- [x] 1.1 Define `IQueueService` interface in `Aura.Core/Interfaces/Services/` with methods `EnqueueAsync`, `DequeueAsync`, and `GetQueueLengthAsync`.
- [x] 1.2 Define queue name constants in `Aura.Infrastructure/Queue/QueueNames.cs`: `email:queue`, `whatsapp:queue`, `ssg:queue`, `reminder:queue`.
- [x] 1.3 Implement `DragonflyQueueService` in `Aura.Infrastructure/Queue/` using StackExchange.Redis (LPUSH, BRPOP, LLEN).
- [x] 1.4 Register `IQueueService` in `Aura.Infrastructure` Dependency Injection.

## 2. Delivery Tracking

- [x] 2.1 Ensure `DeliveryLog` entity exists or create it in `Aura.Core/Models/` to track message delivery state.
- [x] 2.2 Add DbContext configuration for `DeliveryLog` if not already present.

## 3. Worker Project Setup

- [x] 3.1 Create a new worker project `Aura.Workers.Email` using `dotnet new worker`.
- [x] 3.2 Add necessary project references (Aura.Core, Aura.Infrastructure) to `Aura.Workers.Email`.
- [x] 3.3 Set up `Program.cs` with generic HostBuilder and configuration for Dragonfly and SMTP.

## 4. Email Dispatcher Implementation

- [x] 4.1 Define the email message payload schema DTO in `Aura.Core/DTOs/` or the worker project.
- [x] 4.2 Create `EmailTemplateRenderer` class to load and render HTML templates using string replacement.
- [x] 4.3 Add the 6 HTML templates to the `templates/` folder (magic-link, invitation-email, rsvp-reminder, thank-you-card, accomplice-invite, payment-receipt).
- [x] 4.4 Implement `EmailDispatcherWorker` inheriting from `BackgroundService` that dequeues payloads and handles dispatching and DeliveryLog updates.

## 5. Deployment and Tests

- [x] 5.1 Write unit tests for `DragonflyQueueService` covering enqueue and dequeue behavior.
- [x] 5.2 Write unit tests for `EmailDispatcherWorker` ensuring correct template rendering and status updates.
- [x] 5.3 Create `Dockerfile` for `Aura.Workers.Email`.
- [x] 5.4 Create Kubernetes Deployment manifest `email-deployment.yaml` in `k8s/base/workers/`.
