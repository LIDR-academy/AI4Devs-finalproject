## Why

To allow event hosts to publish their events and monetize our platform, we need an integrated payment flow. By integrating Stripe payment intents and webhooks, hosts can securely pay to publish their draft events (changing them to `published`), which directly triggers the static site generation process to make their event live.

## What Changes

- Add a Stripe-backed `IPaymentService` and `StripePaymentService` for generating Payment Intents.
- Add a `PaymentsController` handling the creation of payment intents and processing Stripe webhooks.
- Support tier-based pricing (Standard EUR 19.00, Premium EUR 29.00).
- Update event lifecycle: transitioning `Status` from `draft` to `published` upon a `payment_intent.succeeded` webhook event.
- Introduce an idempotency mechanism using `StripePaymentIntentId`.
- Trigger static site generation (`ssg:queue`) when a payment succeeds.
- Frontend: Implement a "Publish" dialog containing tier selection and a Stripe Elements payment form.

## Capabilities

### New Capabilities
- `event-publishing-and-payments`: Capabilities to initiate Stripe payments, handle webhook callbacks idempotently, and publish events.

### Modified Capabilities
- `event-management`: The event publication requirement changes to mandate payment processing before moving from draft to published status.

## Impact

- **Backend / APIs**: New `POST /api/events/{slug}/publish` and `POST /api/payments/webhook`.
- **Infrastructure**: Requires Stripe API keys and Webhook secret configured.
- **Frontend**: Adds Stripe.js dependency (`@stripe/stripe-js`, `@stripe/react-stripe-js` or Angular equivalent) and a new modal/dialog.
- **Data Model**: A new `Payment` entity tracking status, amounts, and Stripe identifiers, plus extending `Event` with publication metrics.
