# Feature Specification: Guest Search and Booking

**Feature Branch**: `001-guest-search-booking`

**Created**: 2025-05-17

**Status**: Draft

**Input**: User description: "Guest search and booking - Guests can search/filter properties, view details, and complete a booking with date selection and payment"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Search Properties by Location and Dates (Priority: P1)

As a guest, I want to search for available properties by entering a
destination and travel dates so I can find suitable accommodations for
my trip.

**Why this priority**: Search is the entry point to the entire guest
experience. Without a functional search, no other feature delivers
value.

**Independent Test**: Can be fully tested by entering a location and
date range, verifying that only available properties in that area are
returned, and confirming results display key information (title, price,
photo, rating).

**Acceptance Scenarios**:

1. **Given** a guest on the search page, **When** they enter a city
   name and check-in/check-out dates, **Then** the system displays a
   list of available properties in that location for those dates.
2. **Given** search results are displayed, **When** the guest applies
   filters (price range, number of guests, amenities), **Then** the
   results update to show only matching properties.
3. **Given** a search with no matching results, **When** the page
   renders, **Then** the system displays a helpful empty state with
   suggestions to broaden the search.
4. **Given** a large result set, **When** the guest scrolls, **Then**
   results are paginated or lazily loaded without blocking the UI.

---

### User Story 2 - View Property Details (Priority: P2)

As a guest, I want to view the full details of a property so I can
decide whether it meets my needs before booking.

**Why this priority**: Guests must evaluate a property before
committing. This bridges search and booking and is essential for
informed decision-making.

**Independent Test**: Can be tested by navigating to any property
detail page and verifying all essential information is displayed:
photos, description, amenities, house rules, location map, reviews,
pricing breakdown, and availability calendar.

**Acceptance Scenarios**:

1. **Given** a guest viewing search results, **When** they select a
   property, **Then** the system displays a detail page with photos,
   description, amenities, house rules, and host information.
2. **Given** a property detail page, **When** the guest views the
   pricing section, **Then** they see a nightly rate, cleaning fee,
   service fee, and total cost for their selected dates.
3. **Given** a property detail page, **When** the guest checks the
   availability calendar, **Then** blocked dates are clearly marked
   and selectable dates reflect real-time availability.
4. **Given** a property with reviews, **When** the guest scrolls to
   reviews, **Then** they see an aggregate rating and individual
   guest reviews sorted by most recent.

---

### User Story 3 - Complete a Booking (Priority: P3)

As a guest, I want to book a property for my selected dates so I can
secure my accommodation and receive a confirmation.

**Why this priority**: Booking is the core transaction of the
marketplace and the primary revenue-generating action. It depends on
search and property detail being functional.

**Independent Test**: Can be tested by selecting dates on a property
page, proceeding to checkout, entering payment details, and verifying
a booking confirmation is created with correct dates, pricing, and
status.

**Acceptance Scenarios**:

1. **Given** a guest on a property detail page with valid dates
   selected, **When** they click "Reserve", **Then** the system
   navigates to a booking confirmation page showing dates, guest
   count, price breakdown, and payment form.
2. **Given** a guest on the booking confirmation page, **When** they
   enter valid payment information and confirm, **Then** the system
   creates the booking, charges payment, and displays a success
   confirmation with a booking reference number.
3. **Given** a guest attempts to book dates that another guest just
   booked, **When** they confirm the booking, **Then** the system
   displays a conflict message and prompts them to select new dates.
4. **Given** a successful booking, **When** the transaction completes,
   **Then** both guest and host receive email notifications with
   booking details.

---

### User Story 4 - Manage Bookings (Priority: P4)

As a guest, I want to view my upcoming and past bookings so I can
manage my travel plans and access booking details.

**Why this priority**: Post-booking management completes the guest
lifecycle. Without it, guests cannot reference their reservations.

**Independent Test**: Can be tested by logging in as a guest with
existing bookings and verifying the bookings list shows correct
statuses, dates, and allows viewing individual booking details.

**Acceptance Scenarios**:

1. **Given** a logged-in guest, **When** they navigate to "My Trips",
   **Then** they see a list of upcoming and past bookings with
   property name, dates, status, and total cost.
2. **Given** a guest viewing an upcoming booking, **When** they select
   it, **Then** they see full booking details including property
   address, check-in instructions, and host contact information.
3. **Given** a guest with an upcoming booking outside the cancellation
   window, **When** they attempt to cancel, **Then** the system
   displays the cancellation policy and applicable refund amount
   before confirming cancellation.

---

### Edge Cases

- What happens when a guest searches for dates in the past? The system
  MUST prevent past date selection and display a validation message.
- How does the system handle concurrent booking attempts for the same
  property and dates? The first guest to enter checkout gets a
  10-minute hold; a second guest attempting the same dates sees them
  as unavailable. If the hold expires, dates become available again.
- What happens if payment processing fails mid-booking? The system
  MUST NOT create a confirmed booking; it displays an error and allows
  the guest to retry or choose a different payment method.
- What happens when a guest is not logged in and tries to book? The
  system redirects to login/signup, then returns them to the booking
  flow preserving their selected dates.
- How does the system handle properties with no availability for the
  selected dates? The property appears in results with a "No
  availability" indicator and the book button is disabled.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow guests to search properties by
  location (city, region, or coordinates) and date range (check-in
  and check-out dates). Location search uses a map viewport bounding
  box; results update dynamically as the user pans or zooms the map.
- **FR-002**: System MUST filter search results by: price range,
  number of guests, property type, number of bedrooms, and amenities.
- **FR-003**: System MUST display search results with property photo,
  title, price per night, aggregate rating, and location summary.
- **FR-004**: System MUST sort search results by relevance (default),
  price (low-to-high, high-to-low), and rating.
- **FR-005**: System MUST display a property detail page with: photo
  gallery, full description, amenities list, house rules, location
  map, host profile summary, reviews, and pricing breakdown.
- **FR-006**: System MUST show real-time availability on a calendar
  widget for each property.
- **FR-007**: System MUST calculate total booking cost including
  nightly rate × number of nights, cleaning fee (set by host),
  service fee (12% of subtotal, paid by guest), and applicable taxes.
- **FR-008**: System MUST process payments securely and create a
  booking record upon successful payment.
- **FR-009**: System MUST prevent double-booking by enforcing
  availability checks at payment confirmation time. When a guest
  initiates checkout, the system places a 10-minute temporary hold
  on the selected dates. The hold is released automatically on
  timeout, payment failure, or guest abandonment.
- **FR-010**: System MUST send email notifications to both guest and
  host upon booking confirmation.
- **FR-011**: System MUST allow guests to view their upcoming and
  past bookings with current status.
- **FR-012**: System MUST allow guests to cancel bookings according
  to the platform cancellation policy: full refund if cancelled 48+
  hours before check-in; no refund if cancelled within 48 hours.
- **FR-013**: System MUST require authentication for booking and
  booking management operations.
- **FR-014**: System MUST paginate search results with a maximum of
  20 results per page.

### Key Entities

- **Property**: A rentable accommodation with location, description,
  photos, amenities, pricing, availability calendar, and house rules.
  Owned by a Host.
- **Booking**: A reservation linking a Guest to a Property for
  specific dates. Contains status (confirmed, cancelled, completed),
  payment reference, and pricing breakdown. Lifecycle: payment
  succeeds → confirmed → (guest cancels → cancelled | stay ends →
  completed). No pending/approval state; booking is instant.
- **Guest**: A registered user who searches and books properties.
  Has profile, payment methods, and booking history.
- **Availability**: Date-level availability data for a Property.
  Tracks which dates are available, blocked, or booked.
- **Review**: Guest feedback on a completed stay. Contains rating,
  text, and date. Linked to a Booking and Property.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Guests can find a relevant property within 3 search
  attempts or fewer for 90% of common destinations.
- **SC-002**: Property detail page loads all essential information
  within 2 seconds for 95% of page views.
- **SC-003**: End-to-end booking flow (from search to confirmation)
  can be completed in under 5 minutes.
- **SC-004**: System supports at least 500 concurrent users
  performing searches without degradation.
- **SC-005**: Double-booking rate is 0% — no two confirmed bookings
  overlap for the same property and dates.
- **SC-006**: Booking confirmation notifications are delivered to
  both parties within 60 seconds of payment confirmation.
- **SC-007**: 85% of guests who reach the property detail page can
  complete a booking without encountering errors.

## Clarifications

### Session 2025-05-17

- Q: What is the booking lifecycle model? → A: Instant booking — Guest pays and status moves directly to "confirmed" (no host approval step).
- Q: How does geo-search work (radius vs. viewport vs. boundary)? → A: Map viewport bounding box — results match visible map area and update on pan/zoom.
- Q: What happens to availability during payment? → A: Temporary 10-minute hold — dates are soft-locked while guest completes payment; released on timeout or failure.
- Q: What cancellation policy model applies? → A: Single platform-wide policy — full refund if cancelled 48+ hours before check-in, no refund otherwise.
- Q: Who pays the service fee and how is it calculated? → A: Guest-only fee — a fixed percentage (12%) added to the booking total, paid by the guest.

## Assumptions

- Users have a registered account with a verified email address
  (authentication is handled by a separate feature/module).
- Payment processing is handled via a third-party payment gateway
  (e.g., Stripe) — the system integrates but does not build payment
  infrastructure.
- Property listings already exist in the system (created by hosts
  via a separate listing management feature).
- The platform supports a single currency (EUR) for the initial
  version; multi-currency is out of scope.
- Mobile responsiveness is expected but a native mobile app is out
  of scope for this feature.
- Geolocation search uses a third-party geocoding service for
  converting location names to coordinates.
- A single platform-wide cancellation policy applies to all bookings
  (full refund 48+ hours before check-in, no refund otherwise).
  Per-property policies are out of scope for v1.
