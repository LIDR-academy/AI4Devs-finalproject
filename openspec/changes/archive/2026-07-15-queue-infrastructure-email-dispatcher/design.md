## Context

Currently, the Aura application lacks an asynchronous processing mechanism. Features such as email dispatch, WhatsApp messaging, and static site generation will soon require a background processing worker that can dequeue jobs without stalling the main API process. This feature establishes that infrastructure using Dragonfly (a Redis-compatible in-memory data store) for message queuing, and a .NET BackgroundService for email dispatch.

## Goals / Non-Goals

**Goals:**
- Implement `IQueueService` and its Dragonfly-backed concrete implementation.
- Introduce an Email Dispatcher worker inside a new `Aura.Workers.Email` project.
- Implement an email template rendering engine using simple string replacement for `.html` templates.
- Define a generic message payload schema for queue operations.
- Ensure robust delivery tracking by updating `DeliveryLog` table statuses correctly.

**Non-Goals:**
- Implementing the WhatsApp worker, SSG worker, or reminder worker (only queue infrastructure and Email Dispatcher).
- Creating advanced UI template engines; simple string replacement (`{{token}}`) is sufficient.
- Defining the triggers that push messages into the queue (this is part of other features like event publishing).

## Decisions

- **Queue Store (Dragonfly vs RabbitMQ):** We chose Dragonfly/Redis using StackExchange.Redis. `LPUSH` / `BRPOP` provides a robust, lightweight, and performant queue implementation without requiring the heavyweight setup of RabbitMQ or Kafka.
- **Worker Framework (.NET BackgroundService):** `BackgroundService` provides a native, seamless way to run long-running tasks in .NET, perfectly suited for our dequeuing loop `ExecuteAsync`.
- **Template Rendering:** A minimal string replacement approach (`{{guestName}}`) for HTML templates allows quick iteration without the overhead of Razor Engine. The templates are stored in a `templates/` folder and read into memory.
- **Delivery Logging:** `DeliveryLog` entity will have status updates (e.g. `pending`, `sent`, `failed`). This guarantees a reliable state machine where retries can be applied later if needed.

## Risks / Trade-offs

- **Risk: BRPOP blocking connection:** StackExchange.Redis `BRPOP` will block the specific multiplexer connection if not configured carefully. 
  - *Mitigation:* We will use `database.ListRightPopAsync` (or `Execute` with `BRPOP`) with a short timeout (e.g. 5 seconds) to allow graceful shutdowns, and potentially use a dedicated connection multiplexer for the worker.
- **Risk: Email delivery failures:** SMTP servers may reject messages or time out.
  - *Mitigation:* We will catch exceptions in the Email Dispatcher and update the `DeliveryLog` status to `failed`, incrementing the `retryCount`. Future iterations can introduce a dead-letter queue.
