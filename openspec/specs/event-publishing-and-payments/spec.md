# event-publishing-and-payments Specification

## Purpose
TBD - created by archiving change psrp-013-stripe-payment-and-event-publishing. Update Purpose after archive.
## Requirements
### Requirement: Stripe Payment Intent Creation
The system SHALL provide an API to create a Stripe PaymentIntent when a host initiates the publication process.

#### Scenario: Host selects a tier to publish
- **WHEN** the `POST /api/events/{slug}/publish` endpoint is invoked with a selected tier
- **THEN** the system generates a `client_secret` from Stripe for the configured tier price and creates a pending `Payment` record.

### Requirement: Idempotent Webhook Processing
The system SHALL process Stripe webhooks idempotently using the `StripePaymentIntentId`.

#### Scenario: Duplicate webhook received
- **WHEN** a `payment_intent.succeeded` webhook is received but the corresponding `Payment` record is already marked as succeeded
- **THEN** the system safely skips processing and returns an HTTP 200 success.

### Requirement: Event Publishing on Payment Success
The system SHALL transition the `Event` status to `published` when the payment intent succeeds.

#### Scenario: Payment succeeds
- **WHEN** the `payment_intent.succeeded` webhook is successfully verified and processed
- **THEN** the `Payment` status is updated to `succeeded`, the `Event` status changes to `published`, and an SSG generation job is enqueued.

### Requirement: Payment Failure Handling
The system SHALL handle payment failures cleanly.

#### Scenario: Payment fails
- **WHEN** a `payment_intent.failed` webhook is received
- **THEN** the `Payment` record is marked as `failed` and the `Event` remains in `draft` status.

