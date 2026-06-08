## PSRP-013: feat(payments): stripe-payment-and-event-publishing

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W4
**Dependencies:** PSRP-006

## Feature Summary
Implement the Stripe payment flow for event publishing: create payment intents, handle Stripe webhooks (payment_intent.succeeded/failed), transition event status from 'draft' to 'published' on successful payment, and create the publish dialog UI. Includes tier pricing (Standard EUR 19, Premium EUR 29), idempotent webhook processing, and the publish flow that triggers static site generation.

## Requirements
- [ ] Implement `IPaymentService` interface in Aura.Core/Interfaces/Services/ with methods: CreatePaymentIntentAsync(eventId, tier), HandleWebhookAsync(payload, signature), GetPaymentByEventAsync(eventId)
- [ ] Implement `StripePaymentService` in Aura.Infrastructure/Services/ using Stripe.net SDK: create PaymentIntent, construct event from webhook signature
- [ ] Implement `PaymentsController` with endpoints: `POST /api/events/{slug}/publish` (create payment intent, return client_secret), `POST /api/payments/webhook` (Stripe webhook handler)
- [ ] Implement tier pricing: Standard = EUR 19.00, Premium = EUR 29.00 (configurable via appsettings)
- [ ] Implement idempotent webhook processing: use StripePaymentIntentId as idempotency key. If Payment record already exists with same StripePaymentIntentId, skip processing
- [ ] Implement event status transition: on `payment_intent.succeeded`, update Event.Status from 'draft' to 'published', set PublishedAt, and enqueue SSG job to `ssg:queue`
- [ ] Implement webhook signature verification: `EventUtility.ConstructEvent(body, signatureHeader, webhookSecret)`
- [ ] Create Payment record on publish request (status='pending'), update on webhook (status='succeeded' or 'failed')
- [ ] Implement publish dialog component (`features/events/components/publish-dialog.component.ts`) with: tier selection (Standard/Premium), price display, Stripe Elements payment form, "Publish" button
- [ ] Integrate Stripe Elements on frontend: load Stripe.js, create Elements, create PaymentElement, confirm payment on submit
- [ ] Implement publish success flow: after payment confirmation, show success message, redirect to event dashboard with "Published" status
- [ ] Write unit tests for PaymentService (webhook handling, idempotency) and publish flow (status transition, SSG enqueue)

## Technical Notes
- **Backend:**
  - `POST /api/events/{slug}/publish` — creates Payment record (status='pending'), calls Stripe API to create PaymentIntent, returns `{ clientSecret, paymentIntentId }`
  - `POST /api/payments/webhook` — receives Stripe webhook, verifies signature, processes `payment_intent.succeeded` (update Payment status='succeeded', Event status='published', enqueue SSG) or `payment_intent.failed` (update Payment status='failed')
  - Stripe.net SDK: `Stripe.PaymentIntent.Create(options)`, `Stripe.EventUtility.ConstructEvent(body, sig, secret)`
  - SSG enqueue payload: `{ eventType: "published", eventId, eventSlug }`
- **Frontend:**
  - Stripe Elements: `@stripe/stripe-js` and `@stripe/react-stripe-js` npm packages
  - Publish dialog: modal with tier selection, payment form, loading state during payment confirmation
  - On success: show confetti or success animation, redirect to dashboard
- **Database:** Payments table (StripePaymentIntentId, Amount, Currency, Status, Tier), Events table (Status, PublishedAt)
- **Integrations:** Stripe (Payment Intents, Webhooks)
- **Key files:**
  - `backend/src/Aura.Core/Interfaces/Services/IPaymentService.cs`
  - `backend/src/Aura.Core/Services/PaymentService.cs`
  - `backend/src/Aura.Infrastructure/Services/StripePaymentService.cs`
  - `backend/src/Aura.Api/Controllers/PaymentsController.cs`
  - `backend/src/Aura.Core/DTOs/Payments/CreatePaymentRequest.cs`
  - `backend/src/Aura.Core/DTOs/Payments/PaymentResponse.cs`
  - `frontend/src/app/features/events/components/publish-dialog.component.ts`
  - `frontend/src/app/core/services/payment.service.ts`

## Acceptance Criteria
- [ ] AC1: Given a draft event, when the host clicks "Publish" and selects Standard tier, then a Stripe PaymentIntent is created for EUR 19.00 and the payment form is displayed
- [ ] AC2: Given the host completes payment, when Stripe confirms the payment, then the Payment record is updated to status='succeeded', Event.Status changes to 'published', and an SSG job is enqueued
- [ ] AC3: Given a webhook is received for an already-processed payment (duplicate), when the webhook is processed, then no duplicate action is taken (idempotent)
- [ ] AC4: Given a webhook with invalid signature, when the webhook is received, then 400 Bad Request is returned and no processing occurs
- [ ] AC5: Given payment fails, when the `payment_intent.failed` webhook is received, then Payment.Status is updated to 'failed' and the event remains in 'draft' status
- [ ] AC6: Given the event is published, when the host views the dashboard, then the event shows "Published" status with PublishedAt timestamp

## Related Items
- **PRD section:** 01-executive-summary.md (business model: Standard EUR 19, Premium EUR 29), 06-mvp-features.md (publishing flow)
- **Architecture:** 02-components.md (API — Payments Controller), 05-security.md (Stripe webhook verification)
- **Data model:** entities.md (Payments, Events)

## Blockers
Blocked by: PSRP-006

## Branch Name
`feature/PSRP-013-stripe-payment-and-event-publishing`
