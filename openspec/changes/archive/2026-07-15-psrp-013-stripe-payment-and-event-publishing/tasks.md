## 1. Domain and Configuration Setup

- [x] 1.1 Add Stripe.net package dependency to `Aura.Infrastructure`.
- [x] 1.2 Define `Payment` entity and database schema updates (migrations) for tracking payments linked to an `Event`.
- [x] 1.3 Add application settings configuration for Stripe API keys and Webhook secret.

## 2. Payment Service Layer

- [x] 2.1 Implement `IPaymentService` interface with methods for PaymentIntent creation and Webhook processing.
- [x] 2.2 Implement `StripePaymentService` using Stripe.net SDK to create `PaymentIntent` objects.
- [x] 2.3 Implement idempotency checks inside the service using `StripePaymentIntentId`.
- [x] 2.4 Add unit tests for `StripePaymentService` intent creation and signature validation logic.

## 3. Webhooks and API Controllers

- [x] 3.1 Create `PaymentsController` for Stripe interactions (`/api/events/{slug}/publish` and `/api/payments/webhook`).
- [x] 3.2 Implement `payment_intent.succeeded` logic: update `Payment` status, set `Event` to `published`, and enqueue SSG job.
- [x] 3.3 Implement `payment_intent.failed` logic to update `Payment` status accordingly.
- [x] 3.4 Add unit tests for `PaymentsController` and webhook payload parsing.

## 4. Frontend Integration

- [x] 4.1 Install `@stripe/stripe-js` and relevant Angular wrappers/dependencies.
- [x] 4.2 Create `PublishDialogComponent` UI (tier selection: Standard EUR 19, Premium EUR 29).
- [x] 4.3 Integrate Stripe Elements within `PublishDialogComponent` to handle secure card inputs.
- [x] 4.4 Implement `PaymentService` in frontend to call `/api/events/{slug}/publish` and confirm the Stripe payment.
- [x] 4.5 Handle post-payment success logic (animations, redirecting to dashboard, updating local event status).
