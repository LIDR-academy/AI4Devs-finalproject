## Context

The platform allows hosts to create and manage events. Once an event is fully configured (in `draft` mode), the host can publish it. We are integrating Stripe as the payment gateway. The publishing step requires the host to pay a fee based on the selected tier (Standard or Premium).

## Goals / Non-Goals

**Goals:**
- Provide a seamless in-app payment experience using Stripe Elements.
- Implement secure, server-side Payment Intent creation and tracking.
- Handle asynchronous Stripe Webhooks to reliably transition the event status to `published` and trigger SSG generation.
- Ensure webhook handlers are idempotent to prevent duplicate status changes or double-billing tracking.

**Non-Goals:**
- Supporting subscription billing (this feature is one-off payments only).
- Supporting alternative payment gateways (e.g., PayPal).

## Decisions

- **Stripe Integration Strategy**: We will use Stripe Payment Intents. The frontend requests an intent, the backend creates it and returns the `client_secret`. The frontend then uses `@stripe/stripe-js` to collect payment details securely.
- **Webhook Handlers**: We will expose a public endpoint `/api/payments/webhook` for Stripe. It will verify the signature using the configured Stripe Webhook Secret (`EventUtility.ConstructEvent`).
- **Idempotency**: Webhook events can be delivered multiple times by Stripe. We will track processed payments using the `StripePaymentIntentId` within the `Payments` table. If a `payment_intent.succeeded` event arrives for an intent that is already marked as `succeeded`, we will return 200 OK without processing further.
- **SSG Trigger**: SSG execution (`ssg:queue`) is only triggered *after* the payment has been successfully confirmed via the webhook.

## Risks / Trade-offs

- **Risk: Webhook delivery failure or delay**
  - *Mitigation*: The frontend will poll the event status or we will rely strictly on Stripe's retry mechanism for webhooks. For MVP, we will rely on Stripe's built-in robust webhook delivery and retries.
- **Risk: Duplicate processing of webhook events**
  - *Mitigation*: Strictly enforce idempotency using `StripePaymentIntentId` and optimistic concurrency/transactions where applicable.
