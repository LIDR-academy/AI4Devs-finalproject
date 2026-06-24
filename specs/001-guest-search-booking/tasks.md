---
description: "Task list for Guest Search and Booking feature"
---

# Tasks: Guest Search and Booking

**Input**: Design documents from `specs/001-guest-search-booking/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/ ✅ | research.md ✅

**Tests**: Not explicitly requested — no test tasks generated. Add TDD tasks manually if desired.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Paths use `backend/` and `frontend/` roots per plan.md

---

## Phase 1: Setup

**Purpose**: Initialize project structure and tooling for both backend and frontend.

- [ ] T001 Initialize Gradle Kotlin DSL project in `backend/` with Spring Boot 4.x, Kotlin 2.0, Spring WebFlux, Spring Security, Spring Data R2DBC, Flyway, Actuator dependencies in `backend/build.gradle.kts`
- [ ] T002 [P] Initialize Next.js 15 TypeScript project in `frontend/` with App Router, Tailwind CSS, TanStack Query, react-map-gl, Stripe Elements, Axios in `frontend/package.json` and `frontend/next.config.ts`
- [ ] T003 [P] Create `docker-compose.yml` at repo root with postgis/postgis:16-3.4 and Mailpit services (MailHog replaced by Mailpit in #92 — multi-arch, actively maintained)
- [ ] T004 Create backend package structure: `backend/src/main/kotlin/com/stayhub/domain/`, `application/`, `infrastructure/`, `presentation/` directories per plan.md
- [ ] T005 [P] Create frontend directory structure: `frontend/src/app/`, `components/`, `hooks/`, `services/`, `types/`, `lib/` per plan.md
- [ ] T006 Configure `backend/src/main/resources/application.yml` with R2DBC datasource, Flyway, mail, Stripe, Actuator, and CORS settings
- [ ] T007 [P] Configure `frontend/.env.local.example` with `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_MAPBOX_TOKEN`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

---

## Phase 2: Foundational

**Purpose**: Shared infrastructure that MUST complete before any user story begins.

⚠️ **CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T008 Create Flyway migration `backend/src/main/resources/db/migration/V1__create_extensions.sql` enabling uuid-ossp and PostGIS extensions
- [ ] T009 Create Flyway migration `backend/src/main/resources/db/migration/V2__create_users.sql` with Guest and Host tables per data-model.md
- [ ] T010 Create Flyway migration `backend/src/main/resources/db/migration/V3__create_properties.sql` with Property table, PostGIS geography column, and all indexes (GiST spatial, nightly_rate, avg_rating, property_type) per data-model.md
- [ ] T011 Create Flyway migration `backend/src/main/resources/db/migration/V4__create_availability.sql` with Availability and AvailabilityHold tables and indexes per data-model.md
- [ ] T012 Create Flyway migration `backend/src/main/resources/db/migration/V5__create_bookings.sql` with Booking table and indexes per data-model.md
- [ ] T013 [P] Create Flyway migration `backend/src/main/resources/db/migration/V6__create_reviews.sql` with Review table per data-model.md
- [ ] T014 [P] Create Flyway migration `backend/src/main/resources/db/migration/V7__seed_sample_data.sql` with 3 hosts, 15 properties across Barcelona/Madrid/Lisbon, 90-day availability, 5 sample bookings
- [ ] T015 Implement shared domain value objects: `backend/src/main/kotlin/com/stayhub/domain/shared/Money.kt` (EUR amount), `DateRange.kt` (check-in/out validation)
- [ ] T016 [P] Implement JWT authentication filter `backend/src/main/kotlin/com/stayhub/infrastructure/config/SecurityConfig.kt` and `JwtAuthFilter.kt` — protect all `/api/v1/bookings/**` endpoints, allow public access to search and property endpoints
- [ ] T017 [P] Implement global error handler `backend/src/main/kotlin/com/stayhub/presentation/middleware/GlobalExceptionHandler.kt` returning `ErrorResponse` JSON per `contracts/error-responses.yml`
- [ ] T018 [P] Implement correlation ID / trace ID filter `backend/src/main/kotlin/com/stayhub/presentation/middleware/TraceIdFilter.kt` — adds `X-Trace-Id` header to all responses and injects into MDC for structured logging
- [ ] T019 [P] Configure structured JSON logging in `backend/src/main/resources/logback-spring.xml` with correlation ID in every log line
- [ ] T020 [P] Implement API client base service `frontend/src/services/apiClient.ts` with Axios instance, base URL from env, auth token injection, and error normalization
- [ ] T021 [P] Implement shared TypeScript types `frontend/src/types/index.ts` for Property, Booking, SearchFilters, PriceBreakdown, PaginatedResponse matching all contracts

**Checkpoint**: Foundation ready. All user story work can now begin.

---

## Phase 3: User Story 1 — Search Properties (Priority: P1) 🎯 MVP

**Goal**: Guest enters location + dates on a map-based search page and sees paginated, filterable property results.

**Independent Test**: Navigate to `/search?check_in=2025-06-01&check_out=2025-06-05`, verify map loads with property markers, results list shows title/photo/price/rating, filter by price range narrows results, empty state shown when no matches.

### Backend — Search

- [ ] T022 [P] [US1] Implement Property domain model `backend/src/main/kotlin/com/stayhub/domain/property/Property.kt` with id, title, location (lat/lng), city, country, propertyType, maxGuests, bedrooms, nightlyRateEur, cleaningFeeEur, amenities, photos, avgRating, reviewCount
- [ ] T023 [P] [US1] Implement PropertyRepository port interface `backend/src/main/kotlin/com/stayhub/domain/property/PropertyRepository.kt` with `searchByBoundingBox(swLat, swLng, neLat, neLng, filters, pageable): Page<Property>`
- [ ] T024 [US1] Implement SearchPropertiesUseCase `backend/src/main/kotlin/com/stayhub/application/search/SearchPropertiesUseCase.kt` — validates bounding box, delegates to PropertyRepository, returns paginated PropertySummary list
- [ ] T025 [US1] Implement R2DBC PropertyRepositoryAdapter `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/PropertyRepositoryAdapter.kt` — PostGIS `ST_MakeEnvelope` bounding-box query with availability join, dynamic filter predicates (price, guests, type, bedrooms, amenities), sort by relevance/price/rating
- [ ] T026 [P] [US1] Implement GeocodeService port `backend/src/main/kotlin/com/stayhub/domain/property/GeocodeService.kt` and Mapbox adapter `backend/src/main/kotlin/com/stayhub/infrastructure/geocoding/MapboxGeocodeAdapter.kt`
- [ ] T027 [US1] Implement SearchController `backend/src/main/kotlin/com/stayhub/presentation/api/SearchController.kt` with `GET /api/v1/properties/search` and `GET /api/v1/properties/geocode` per `contracts/search-api.yml`
- [ ] T028 [P] [US1] Create request/response DTOs `backend/src/main/kotlin/com/stayhub/presentation/dto/search/SearchRequest.kt`, `SearchResultsResponse.kt`, `PropertySummaryDto.kt`, `GeocodeResponse.kt`

### Frontend — Search

- [ ] T029 [P] [US1] Implement search API service `frontend/src/services/searchService.ts` wrapping `GET /api/v1/properties/search` and `GET /api/v1/properties/geocode` with TanStack Query hooks `usePropertySearch` and `useGeocode`
- [ ] T030 [P] [US1] Implement `SearchBar` component `frontend/src/components/search/SearchBar.tsx` — location autocomplete input (calls geocode API), check-in/out date pickers, guests counter
- [ ] T031 [P] [US1] Implement `FilterPanel` component `frontend/src/components/search/FilterPanel.tsx` — price range slider, property type selector, bedrooms selector, amenities checkboxes
- [ ] T032 [P] [US1] Implement `PropertyCard` component `frontend/src/components/search/PropertyCard.tsx` — photo, title, location, price/night, rating stars, review count
- [ ] T033 [US1] Implement `MapView` component `frontend/src/components/search/MapView.tsx` — Mapbox GL map with property markers, fires `onViewportChange` callback on pan/zoom to trigger new search
- [ ] T034 [US1] Implement `EmptyState` component `frontend/src/components/search/EmptyState.tsx` for no-results scenario with suggestions to broaden search
- [ ] T035 [US1] Implement search page `frontend/src/app/search/page.tsx` — composes SearchBar, FilterPanel, MapView, PropertyCard list, pagination; syncs viewport with URL query params; handles loading skeleton and error states

**Checkpoint**: US1 independently functional — search with map, filters, results, empty state.

---

## Phase 4: User Story 2 — View Property Details (Priority: P2)

**Goal**: Guest clicks a property and sees full detail page: photos, description, amenities, calendar, price breakdown, reviews.

**Independent Test**: Navigate to `/property/{id}?check_in=2025-06-01&check_out=2025-06-05`, verify photo gallery renders, availability calendar shows blocked dates, price breakdown calculates correctly (nightly × nights + cleaning + 12% service fee), reviews listed most-recent first.

### Backend — Property Details

- [ ] T036 [P] [US2] Implement GetPropertyDetailsUseCase `backend/src/main/kotlin/com/stayhub/application/property/GetPropertyDetailsUseCase.kt` — fetches full property including host summary
- [ ] T037 [P] [US2] Implement GetPropertyAvailabilityUseCase `backend/src/main/kotlin/com/stayhub/application/property/GetPropertyAvailabilityUseCase.kt` — returns unavailable dates (booked + blocked + active holds) for a date range
- [ ] T038 [P] [US2] Implement CalculatePriceUseCase `backend/src/main/kotlin/com/stayhub/application/property/CalculatePriceUseCase.kt` — computes subtotal, cleaning fee, 12% service fee, tax (0%), total per pricing formula in data-model.md
- [ ] T039 [US2] Implement PropertyController `backend/src/main/kotlin/com/stayhub/presentation/api/PropertyController.kt` with `GET /api/v1/properties/{id}`, `GET /api/v1/properties/{id}/availability`, `GET /api/v1/properties/{id}/reviews`, `GET /api/v1/properties/{id}/price` per `contracts/property-api.yml`
- [ ] T040 [P] [US2] Create response DTOs `backend/src/main/kotlin/com/stayhub/presentation/dto/property/PropertyDetailsResponse.kt`, `AvailabilityResponse.kt`, `ReviewsResponse.kt`, `PriceBreakdownResponse.kt`
- [ ] T041 [P] [US2] Implement AvailabilityRepositoryAdapter `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/AvailabilityRepositoryAdapter.kt` querying Availability + AvailabilityHold tables for a date range

### Frontend — Property Details

- [ ] T042 [P] [US2] Implement property API service `frontend/src/services/propertyService.ts` with TanStack Query hooks `usePropertyDetails`, `usePropertyAvailability`, `usePropertyReviews`, `usePriceCalculation`
- [ ] T043 [P] [US2] Implement `PhotoGallery` component `frontend/src/components/property/PhotoGallery.tsx` — primary photo + thumbnail strip, lightbox on click
- [ ] T044 [P] [US2] Implement `AvailabilityCalendar` component `frontend/src/components/property/AvailabilityCalendar.tsx` — 2-month date range picker, blocked/held dates visually distinct, enforces check-in before check-out and future dates only
- [ ] T045 [P] [US2] Implement `AmenityList` component `frontend/src/components/property/AmenityList.tsx` — icon + label for each amenity, truncated with "Show all" toggle
- [ ] T046 [P] [US2] Implement `PriceBreakdown` component `frontend/src/components/property/PriceBreakdown.tsx` — displays nightly rate × nights, cleaning fee, service fee, total; fetches from `/price` endpoint on date change
- [ ] T047 [P] [US2] Implement `ReviewList` component `frontend/src/components/property/ReviewList.tsx` — aggregate rating, individual reviews (guest name, date, comment, stars), paginated load-more
- [ ] T048 [US2] Implement property detail page `frontend/src/app/property/[id]/page.tsx` — composes PhotoGallery, description, AmenityList, house rules, map location pin, AvailabilityCalendar, PriceBreakdown, ReviewList, host card, Reserve CTA button (navigates to checkout)

**Checkpoint**: US2 independently functional — full property detail with availability and pricing.

---

## Phase 5: User Story 3 — Complete a Booking (Priority: P3)

**Goal**: Guest reserves dates, enters payment, gets booking confirmation with reference number. 10-minute hold prevents double-booking during checkout.

**Independent Test**: Select dates on property page → click Reserve → checkout page shows correct price breakdown → enter Stripe test card → confirm → redirected to `/confirmation/{id}` with booking reference number. Verify booking record in DB with status `confirmed`.

### Backend — Booking

- [ ] T049 [P] [US3] Implement Booking domain aggregate `backend/src/main/kotlin/com/stayhub/domain/booking/Booking.kt` — encapsulates booking invariants: dates must be in future, check-out after check-in, guest count ≤ property max; exposes `confirm()`, `cancel()` domain methods
- [ ] T050 [P] [US3] Implement BookingRepository port `backend/src/main/kotlin/com/stayhub/domain/booking/BookingRepository.kt` with `save`, `findById`, `findByGuestId`, `findByPropertyAndDates`
- [ ] T051 [P] [US3] Implement AvailabilityHoldRepository port `backend/src/main/kotlin/com/stayhub/domain/availability/AvailabilityHoldRepository.kt` with `createHold`, `releaseHold`, `findActiveHoldForDates`
- [ ] T052 [P] [US3] Implement PaymentService port `backend/src/main/kotlin/com/stayhub/domain/booking/PaymentService.kt` and Stripe adapter `backend/src/main/kotlin/com/stayhub/infrastructure/payment/StripePaymentAdapter.kt` — creates PaymentIntent, returns client_secret, verifies payment intent status
- [ ] T053 [P] [US3] Implement EmailNotificationService port `backend/src/main/kotlin/com/stayhub/domain/booking/EmailNotificationService.kt` and Spring Mail adapter `backend/src/main/kotlin/com/stayhub/infrastructure/email/SmtpEmailAdapter.kt` with Thymeleaf booking confirmation template
- [ ] T054 [US3] Implement CreateBookingUseCase `backend/src/main/kotlin/com/stayhub/application/booking/CreateBookingUseCase.kt` — checks availability, creates 10-min hold, calculates price snapshot, creates Stripe PaymentIntent, persists booking draft, returns client_secret and hold expiry
- [ ] T055 [US3] Implement ConfirmBookingUseCase `backend/src/main/kotlin/com/stayhub/application/booking/ConfirmBookingUseCase.kt` — verifies Stripe PaymentIntent succeeded, transitions booking → confirmed, marks availability dates as booked, releases hold, sends email notifications asynchronously
- [ ] T056 [P] [US3] Implement BookingRepositoryAdapter `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/BookingRepositoryAdapter.kt` and AvailabilityHoldRepositoryAdapter `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/AvailabilityHoldRepositoryAdapter.kt`
- [ ] T057 [US3] Implement BookingController `backend/src/main/kotlin/com/stayhub/presentation/api/BookingController.kt` with `POST /api/v1/bookings` and `POST /api/v1/bookings/{id}/confirm` per `contracts/booking-api.yml`
- [ ] T058 [P] [US3] Implement Stripe webhook handler `backend/src/main/kotlin/com/stayhub/presentation/api/StripeWebhookController.kt` — handles `payment_intent.succeeded` and `payment_intent.payment_failed` events, verifies signature, calls ConfirmBookingUseCase or releases hold
- [ ] T059 [P] [US3] Implement scheduled hold cleanup job `backend/src/main/kotlin/com/stayhub/infrastructure/persistence/HoldCleanupScheduler.kt` — runs every 5 minutes, deletes expired holds (held_until < NOW())
- [ ] T060 [P] [US3] Create request/response DTOs `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/CreateBookingRequest.kt`, `CreateBookingResponse.kt`, `ConfirmBookingResponse.kt`

### Frontend — Booking

- [ ] T061 [P] [US3] Implement booking API service `frontend/src/services/bookingService.ts` with `createBooking`, `confirmBooking` functions and TanStack Query mutations
- [ ] T062 [P] [US3] Implement `BookingSummary` component `frontend/src/components/booking/BookingSummary.tsx` — property photo, title, dates, guest count, nights, nightly rate, cleaning fee, service fee (12%), total; shows hold expiry countdown
- [ ] T063 [P] [US3] Implement `PaymentForm` component `frontend/src/components/booking/PaymentForm.tsx` — Stripe Elements card input, loading/error states, submit handler calling `confirmBooking`
- [ ] T064 [US3] Implement checkout page `frontend/src/app/booking/[id]/page.tsx` — composes BookingSummary + PaymentForm; calls `POST /api/v1/bookings` on mount to create booking and get client_secret; on payment success navigates to `/confirmation/{id}`
- [ ] T065 [US3] Implement confirmation page `frontend/src/app/confirmation/[id]/page.tsx` — shows booking reference, property name, dates, total paid, "View My Trips" and "Back to Search" CTAs

**Checkpoint**: US3 independently functional — end-to-end booking from property page to paid confirmation.

---

## Phase 6: User Story 4 — Manage Bookings (Priority: P4)

**Goal**: Guest views upcoming/past trips list and individual booking details with cancellation capability.

**Independent Test**: Log in → navigate to `/trips` → see list of bookings with property name, dates, status, total → click booking → see full details with address and host name → click Cancel on eligible booking → see refund policy modal → confirm → booking shows as cancelled.

### Backend — Trip Management

- [ ] T066 [P] [US4] Implement GetMyTripsUseCase `backend/src/main/kotlin/com/stayhub/application/booking/GetMyTripsUseCase.kt` — fetches paginated bookings for authenticated guest, filtered by status
- [ ] T067 [P] [US4] Implement GetBookingDetailsUseCase `backend/src/main/kotlin/com/stayhub/application/booking/GetBookingDetailsUseCase.kt` — fetches full booking detail, verifies booking belongs to requesting guest, computes `can_cancel` and `refund_amount_eur` per cancellation policy
- [ ] T068 [P] [US4] Implement CancelBookingUseCase `backend/src/main/kotlin/com/stayhub/application/booking/CancelBookingUseCase.kt` — validates booking is confirmed and not completed, determines refund amount (full if 48+ hours before check-in, zero otherwise), issues Stripe refund, transitions booking → cancelled, restores availability dates, sends cancellation notification email
- [ ] T069 [US4] Extend BookingController `backend/src/main/kotlin/com/stayhub/presentation/api/BookingController.kt` with `GET /api/v1/bookings/my-trips`, `GET /api/v1/bookings/{id}`, `POST /api/v1/bookings/{id}/cancel` per `contracts/booking-api.yml`
- [ ] T070 [P] [US4] Create response DTOs `backend/src/main/kotlin/com/stayhub/presentation/dto/booking/BookingDetailResponse.kt`, `BookingSummaryDto.kt`, `MyTripsResponse.kt`, `CancellationResponse.kt`

### Frontend — Trip Management

- [ ] T071 [P] [US4] Implement trips API service `frontend/src/services/tripsService.ts` with TanStack Query hooks `useMyTrips`, `useBookingDetail`, and `useCancelBooking` mutation
- [ ] T072 [P] [US4] Implement `TripCard` component `frontend/src/components/booking/TripCard.tsx` — property photo, name, city, check-in/out dates, status badge (confirmed/cancelled/completed), total price
- [ ] T073 [P] [US4] Implement `CancellationModal` component `frontend/src/components/booking/CancellationModal.tsx` — displays cancellation policy, refund amount, confirm/cancel buttons
- [ ] T074 [US4] Implement my trips page `frontend/src/app/trips/page.tsx` — lists bookings grouped by upcoming/past, status filter tabs, renders TripCard for each, links to detail page
- [ ] T075 [US4] Implement trip detail page (extend booking detail) `frontend/src/app/trips/[id]/page.tsx` — shows all booking details including property address, host name, full price breakdown, cancellation policy, Cancel button (if can_cancel), CancellationModal

**Checkpoint**: US4 independently functional — trip list, detail, and cancellation flow.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Quality, observability, and UX improvements across all stories.

- [ ] T076 [P] Add Actuator health endpoints `backend/src/main/resources/application.yml` — expose `/actuator/health`, `/actuator/info` with DB and disk space indicators
- [ ] T077 [P] Implement `LoadingSkeleton` components `frontend/src/components/shared/` — PropertyCardSkeleton, PropertyDetailSkeleton, TripCardSkeleton for smooth loading states
- [ ] T078 [P] Implement `NavigationBar` component `frontend/src/components/shared/NavigationBar.tsx` — logo, search shortcut, "My Trips" link (auth-gated), mobile responsive
- [ ] T079 [P] Add past-date validation in `frontend/src/components/search/SearchBar.tsx` — disable dates before today in date pickers, display inline validation message
- [ ] T080 [P] Add unauthenticated booking redirect in checkout page `frontend/src/app/booking/[id]/page.tsx` — detect 401 response, redirect to login preserving `?redirect=/booking/{id}` query param
- [ ] T081 [P] Add hold-expiry countdown with auto-redirect in checkout page `frontend/src/app/booking/[id]/page.tsx` — display MM:SS timer from `hold_expires_at`, redirect to property page with expiry notice on timeout
- [ ] T082 [P] Implement `ErrorBoundary` component `frontend/src/components/shared/ErrorBoundary.tsx` wrapping each page with user-friendly fallback UI and trace ID display
- [ ] T083 [P] Add OpenAPI documentation via SpringDoc `backend/build.gradle.kts` — expose Swagger UI at `/swagger-ui.html` with all contracts documented
- [ ] T084 Run quickstart validation: start full stack via docker-compose, verify all 5 pages load, complete one end-to-end booking with Stripe test card `4242 4242 4242 4242`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 Search (Phase 3)**: Depends on Phase 2
- **US2 Property Details (Phase 4)**: Depends on Phase 2 (independent of US1)
- **US3 Booking (Phase 5)**: Depends on Phase 2; integrates with US1 and US2 (Property read model must exist)
- **US4 Trip Management (Phase 6)**: Depends on US3 (needs bookings to exist)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no other story dependency
- **US2 (P2)**: Can start after Foundational — parallel with US1
- **US3 (P3)**: Depends on Property entity from Foundational; integrates with US1/US2 UI but backend is independent
- **US4 (P4)**: Depends on US3 (bookings must exist to manage them)

### Within Each User Story

- Domain models → Use cases → Repository adapters → Controllers (backend)
- API service hooks → UI components → Page composition (frontend)
- Backend and frontend can run in parallel once contracts are defined

---

## Parallel Opportunities

### Phase 2 Foundational (run together after Phase 1)

```
T008–T014: All Flyway migrations (independent files)
T015, T016, T017, T018, T019: Domain + infra setup (independent)
T020, T021: Frontend base (independent of backend)
```

### Phase 3 US1 (run together)

```
Backend parallel group:  T022, T023, T026, T028
Frontend parallel group: T029, T030, T031, T032
Then: T024 (needs T022, T023), T025 (needs T024)
Then: T033, T034 (needs T029–T032 complete)
Then: T027, T035 (depends on respective layers)
```

### Phase 4 US2 (run together, parallel with US1 if staffed)

```
Backend parallel group:  T036, T037, T038, T040, T041
Frontend parallel group: T042, T043, T044, T045, T046, T047
Then: T039 (controller, needs use cases)
Then: T048 (page, needs all components)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 Search
4. **STOP and VALIDATE**: Search page with map, filters, and results works end-to-end
5. Demo or deploy

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. **+ US1**: Map search with results → Demo #1
3. **+ US2**: Property detail with availability → Demo #2
4. **+ US3**: End-to-end booking flow → Demo #3 (core product!)
5. **+ US4**: Trip management + cancellation → Demo #4 (full MVP)
6. **Polish**: Production hardening

### Parallel Team Strategy

With two developers:

- Dev A: Backend (T008–T027, etc.)
- Dev B: Frontend (T029–T035, etc.)
- Sync on contracts (already defined) — no blocking dependencies

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks in same phase
- `[Story]` label maps task to specific user story for traceability
- Stripe test card for development: `4242 4242 4242 4242`, any future date, any CVC
- PostGIS is required — use `postgis/postgis:16-3.4` Docker image, not plain postgres
- Flyway migrations run automatically on `bootRun` — no manual steps needed
- All booking endpoints require JWT `Authorization: Bearer <token>` header
- Hold cleanup scheduler (T059) prevents stale holds from blocking availability
