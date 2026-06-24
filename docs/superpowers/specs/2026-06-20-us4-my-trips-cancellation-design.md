# Design: US4 — My Trips & Cancellation

**Date:** 2026-06-20
**Status:** Approved (brainstorming) — pending implementation plan
**User story:** US4 — Manage Bookings (spec.md, Priority P4)
**Issues:** #67–#76 (T066–T076)

## Context & motivation

US4 is genuinely unbuilt: there is no `/trips` page, no `TripCard`/`CancellationModal`, no
`tripsService.ts`, and no `Cancel*`/`GetMyTrips*`/`GetBookingDetails*` use cases. The
confirmation page already renders a **disabled** "View My Trips (coming soon)" button — the
designed entry point waiting for this work.

Most of the contract is already pinned down and partially scaffolded, which keeps this slice small:

- **Spec scenarios** (US4) and the **cancellation policy** are fixed.
- The **OpenAPI contract** (`contracts/booking-api.yml`) fully specifies all three endpoints and
  their response schemas.
- The **frontend TS types** already exist (`BookingSummary`, `MyTripsResponse`,
  `CancellationResponse`, and `BookingDetailResponse` with `can_cancel` / `refund_amount_eur`).
- The backend already has `Booking.cancel(reason)`, `BookingRepository.findByGuestId(guestId, pageable)`,
  the `currentGuestId()` controller helper + ownership-403 pattern, and —
  verified — **`BookingCannotCancelException` → `ErrorCode.BOOKING_CANNOT_CANCEL` → HTTP 422**
  already wired in `GlobalExceptionHandler`.

So US4 is mostly *assembly* over existing parts, plus one new payment-port method (refund).

## Goals

1. A logged-in guest can list their bookings (filterable: upcoming / past / cancelled / all), paginated.
2. A guest can open a single booking and see full detail, including whether it can be cancelled and
   the refund they'd receive if cancelled now.
3. A guest can cancel a **confirmed** booking and see the refund outcome, per the platform policy.
4. Coverage follows the now-mandatory testing strategy: a **per-endpoint backend integration test**
   for each new endpoint + unit tests for the refund logic, and a **Playwright** cancellation journey.

## Non-goals

- Cancellation **email** notification — deferred to #54 (the `EmailNotificationService` port + SMTP
  adapter is not built; US4 must not be blocked on it).
- A real Stripe **refund** — payments are a `StubPaymentAdapter`; US4 adds a stub refund only.
- A global **NavigationBar** (#79). US4 enables only the existing confirmation-page entry point
  (and a minimal link); a site-wide nav is a separate concern.
- Explicit `availability`-table restoration on cancel — **not needed** (see Decisions).

## Cancellation policy (fixed by spec FR-012)

> Full refund if cancelled **48+ hours before check-in**; **no refund** if cancelled within 48 hours.

- Only **`confirmed`** bookings are cancellable. `cancelled` or `completed` → **422 BOOKING_CANNOT_CANCEL**.
- Refund amount = `total_eur` if `now ≤ check_in − 48h`, else `0.00`.
- Refund status = `full_refund` when the amount is the full total, else `no_refund`.
- The 48-hour threshold is measured against **check-in at 00:00** in the application's clock (UTC),
  i.e. cancellable when `Instant.now()` is before `checkIn.atStartOfDay(UTC) − 48h`. (Hour-of-day
  precision on check-in is out of scope; the domain stores `check_in` as a date.)

## Decisions (locked in brainstorming)

| Decision | Choice |
|---|---|
| Cancel side-effects | **Stub refund + status→cancelled.** No email (defer to #54). |
| Restore availability on cancel? | **No explicit write needed.** Create/confirm never mark the `availability` table; the booking-conflict check is `findByPropertyAndDates(...).any { status != CANCELLED }`, so a cancelled booking's dates are bookable again automatically. (Releasing any lingering hold is optional tidy-up; post-confirm holds have already expired.) |
| Upcoming / past boundary | By **check-out**: `cancelled` = status cancelled; `past` = non-cancelled & `check_out < today`; `upcoming` = non-cancelled & `check_out ≥ today` (a mid-stay trip still counts as upcoming). |
| `my-trips` filter strategy | Filter **at the repository/query level** (a new category-aware paginated query), so pagination totals stay correct. NOT in-memory filtering of a page. |
| `can_cancel` / `refund_amount_eur` | Computed **on the fly** in `GetBookingDetailsUseCase` (depend on `now` vs check-in; never stored). |
| 422 error type | **Reuse** existing `BookingCannotCancelException` / `ErrorCode.BOOKING_CANNOT_CANCEL`. No new error type. |
| Cancellation `reason` | Optional (contract: `maxLength 500`); stored in the existing `cancellation_reason` column via `Booking.cancel(reason)`. No required UI input. |

## Contract (from `contracts/booking-api.yml`)

- **`GET /api/v1/bookings/my-trips`** — auth required. Query: `status ∈ {upcoming, past, cancelled, all}` (default `all`),
  `page ≥ 1` (default 1), `size 1..50` (default 10). → **200** `MyTripsResponse { bookings: BookingSummary[], pagination }`; **401**.
- **`GET /api/v1/bookings/{bookingId}`** — auth required. → **200** `BookingDetailResponse` (incl. `can_cancel`, `refund_amount_eur`, `cancellation_policy`); **401**; **403** not owner; **404** missing.
- **`POST /api/v1/bookings/{bookingId}/cancel`** — auth required. Optional body `{ reason?: string≤500 }`. → **200** `CancellationResponse { booking_id, status:"cancelled", refund_amount_eur, refund_status }`; **401**; **403** not owner; **404** missing; **422** not cancellable.

## Backend design

**New payment port method** (`domain/booking/PaymentService.kt`):
```kotlin
suspend fun refund(paymentIntentId: String, amountEur: BigDecimal): RefundResult
// RefundResult(refundId: String, status: RefundStatus) where RefundStatus = FULL_REFUND | NO_REFUND | FAILED (as needed)
```
Implemented in `StubPaymentAdapter` (returns success for known intents; a zero-amount refund is a valid `no_refund`).

**Repository** (`domain/booking/BookingRepository.kt` + adapter): add a category-aware paginated query, e.g.
`findByGuestIdAndCategory(guestId, category, pageable): Page<Booking>` where `category ∈ {ALL, UPCOMING, PAST, CANCELLED}`,
implemented in `BookingRepositoryAdapter` with the date/status `WHERE` clause (keeps `total_results`/`total_pages` correct).
`Pageable`/`Page` already cross the domain boundary here (accepted Spring Data leak per the backend skill).

**Use cases** (`application/booking/`):
- `GetMyTripsUseCase(bookingRepository, propertyRepository).execute(guestId, category, page, size): MyTripsResult`
  — fetches the page, enriches each booking with property title/photo/city for the summary.
- `GetBookingDetailsUseCase(bookingRepository, propertyRepository).execute(bookingId, guestId): Booking(+derived)`
  — `findById` → 404; `guestId` mismatch → 403; computes `can_cancel` + `refund_amount_eur` per policy.
- `CancelBookingUseCase(bookingRepository, paymentService).execute(bookingId, guestId, reason?): CancellationResult`
  — 404 if missing; 403 if not owner; **422** (`BookingCannotCancelException`) if not `confirmed`; compute refund per the 48h
  rule; call `paymentService.refund(...)`; `bookingRepository.save(booking.cancel(reason))`; return amount + status.

**Controller** (`presentation/api/BookingController.kt`) — three humble endpoints calling the use cases, each via `currentGuestId()`.

**DTOs** (`presentation/dto/booking/`): add `BookingSummaryDto`, `MyTripsResponse`, `CancellationResponse`,
`CancelBookingRequest { reason: String? }`; **populate** the existing `BookingDetailResponse.can_cancel` /
`refund_amount_eur` (today hardcoded `true` / `null`). Mapping stays in the controller, not the use case.

## Frontend design

- `services/tripsService.ts` — `useMyTrips(filter, page)`, `useBookingDetail(id)`, `useCancelBooking()` (mutation
  that invalidates the trips + detail query keys on success). Through `apiClient`, snake_case contract.
- `components/booking/TripCard.tsx` — props-driven (photo, title, city, dates, status badge, total). No internal fetch.
- `components/booking/CancellationModal.tsx` — shows the policy + computed refund amount; confirm / dismiss.
- `app/trips/page.tsx` — orchestrator: filter tabs (Upcoming / Past / Cancelled) → `useMyTrips` → list of `TripCard`.
- `app/trips/[id]/page.tsx` — orchestrator: `useBookingDetail` → full detail (property address, host, price breakdown,
  cancellation policy) + a **Cancel** button (shown when `can_cancel`) → `CancellationModal` → `useCancelBooking`.
- Enable the confirmation page's **"View My Trips"** button → links to `/trips`.

## Testing (required by the flow-testing strategy)

- **Backend per-endpoint integration tests** (`presentation/api/integration/`, extending `AbstractApiIntegrationTest`):
  - `my-trips`: 200 (returns the caller's bookings; filter narrows; pagination shape), 401 unauthenticated.
  - `GET /{id}`: 200 (owner, with `can_cancel`/`refund_amount_eur` present), 403 (other guest), 404 (missing).
  - `cancel`: 200 **full_refund** (check-in > 48h away), 200 **no_refund** (check-in within 48h), 403 (other guest),
    404 (missing), 422 (already cancelled / not confirmed).
  - Setup uses the existing `registerGuest()` + a created/confirmed booking; reuse the shared date allocator to avoid
    cross-test collisions in the shared dev DB.
- **Unit tests** for the 48h refund boundary (`CancelBookingUseCase` / `GetBookingDetailsUseCase`) with MockK fakes:
  just-over-48h → full refund + `can_cancel=true`; just-under → no refund; non-confirmed → 422.
- **Playwright** (`frontend/tests/e2e/`): a cancellation journey — register/login → book → confirm → open **My Trips**
  → open the trip → cancel → assert the trip shows **cancelled** and the refund outcome. Navigates via the results list
  and completes booking through the stub payment path (per the existing journey conventions).

## Rollout (slices — each its own PR; reuse existing tickets)

1. **Slice A — backend** (#67–#71, T066–T071): `PaymentService.refund` + stub; repository category query; the three
   use cases; controller endpoints; DTOs; per-endpoint integration tests + refund unit tests.
2. **Slice B — frontend** (#72–#76, T072–T076): `tripsService` + `TripCard` + `CancellationModal` + `/trips` +
   `/trips/[id]` + enable the confirmation button; vitest for the hooks/components/pages.
3. **Slice C — E2E:** the Playwright cancellation journey (+ any `data-testid`s the trips UI needs).

## Risks & mitigations

- **Stub vs. real refund divergence** → acceptable now (no real Stripe); the `refund` port lands the seam so #53 can
  drop in a real adapter without touching the use case.
- **Shared dev-DB date collisions** in integration tests → reuse the shared `nextStayWindow()` allocator; CI uses a fresh DB.
- **Filter/pagination correctness** → filtering at the query level (not in-memory) keeps `total_results`/`total_pages` honest.
- **Boundary ambiguity (upcoming vs past)** → fixed explicitly to the check-out boundary above; encode it once in the
  repository query and reuse in the frontend grouping copy.
