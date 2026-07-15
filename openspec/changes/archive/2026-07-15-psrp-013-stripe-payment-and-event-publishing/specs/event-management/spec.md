## ADDED Requirements

### Requirement: Publish Event
The system SHALL transition an event from `draft` to `published` status, but only upon a successful Stripe payment.

#### Scenario: Event publication requires payment
- **WHEN** the host requests to publish an event
- **THEN** the system must first process a Stripe Payment Intent, and the event will only become `published` once the `payment_intent.succeeded` webhook is processed.
