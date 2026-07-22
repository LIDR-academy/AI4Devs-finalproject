# event-management Specification

## Purpose
TBD - created by archiving change psrp-013-stripe-payment-and-event-publishing. Update Purpose after archive.
## Requirements
### Requirement: Publish Event
The system SHALL transition an event from `draft` to `published` status, but only upon a successful Stripe payment.

#### Scenario: Event publication requires payment
- **WHEN** the host requests to publish an event
- **THEN** the system must first process a Stripe Payment Intent, and the event will only become `published` once the `payment_intent.succeeded` webhook is processed.

