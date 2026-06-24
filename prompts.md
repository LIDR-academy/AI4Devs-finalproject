> This section details the main prompts used during project creation, justifying the use of AI coding assistants across all phases of the development lifecycle. A maximum of 3 prompts per section are included, focusing on the initial creation or the most relevant corrections and feature additions.

## Index

1. [General Product Description](#1-general-product-description)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [API Specification](#4-api-specification)
5. [User Stories](#5-user-stories)
6. [Work Tickets](#6-work-tickets)
7. [Pull Requests](#7-pull-requests)
8. [Implementation Workflow](#8-implementation-workflow)
9. [Testing & Quality](#9-testing--quality)
10. [Bug Fixes & Debugging](#10-bug-fixes--debugging)

---

## 1. General Product Description

**Prompt 1:**

> I want to build an AI-powered vacation rental marketplace inspired by Airbnb, called StayHub. The goal is to design and build a production-quality web platform from scratch using AI-driven development workflows, primarily leveraging Claude Code and Spec Kit for specification-first engineering. The platform will allow hosts to publish and manage rental properties while guests can search, filter, book, and review accommodations. Rather than focusing only on feature delivery, the project emphasizes AI-native software development, specification-driven architecture, scalable backend design, modern frontend UX, strong domain modeling, and production-ready engineering practices. Define a project constitution with 7 core development principles using Spec-First, Clean Architecture, and API-First as the guiding approach, for a React/Next.js + Spring Boot 4/Kotlin + PostgreSQL stack.

**Prompt 2:**

> Create a feature specification for the guest search and booking experience: guests can search and filter properties by location using a map viewport bounding box, view property details with availability calendar and price breakdown, complete instant bookings with a 10-minute availability hold and Stripe payment integration, and manage their upcoming and past trips including cancellations. The platform uses a single currency (EUR), a platform-wide cancellation policy (full refund 48+ hours before check-in), and a 12% guest service fee.

**Prompt 3:**

> Clarify the following decisions in the specification: (1) The booking model should be instant — guest pays and booking is confirmed immediately with no host approval step. (2) Location search should use a map viewport bounding box that updates results as the user pans and zooms. (3) Availability during checkout should use a 10-minute temporary hold on dates. (4) A single platform-wide cancellation policy applies to all bookings. (5) A guest-only service fee of 12% is added to the booking total.

---

## 2. System Architecture

### **2.1. Architecture diagram:**

**Prompt 1:**

> Design the system architecture for StayHub following Clean Architecture with strict inward dependency rules: domain layer with pure Kotlin business logic, application layer with use cases, infrastructure layer with adapters (R2DBC persistence, Stripe payment, Mapbox geocoding, SMTP email), and presentation layer with REST controllers. The backend uses Spring Boot 4 with Spring WebFlux and Kotlin coroutines for reactive, non-blocking request handling. Generate a Mermaid diagram showing the component relationships between the Next.js frontend, Spring Boot backend, PostgreSQL with PostGIS, and external services (Stripe, Mapbox, SMTP).

**Prompt 2:**

> Justify the choice of a reactive backend stack (Spring WebFlux + R2DBC + Kotlin coroutines) over traditional Spring MVC + JDBC for this project, and document the trade-offs. Also justify using PostGIS for geospatial search over alternatives like Elasticsearch or application-level filtering, and Mapbox GL JS over Google Maps or Leaflet for the interactive map.

**Prompt 3:**

> Design the deployment architecture for StayHub: local development via Docker Compose (PostgreSQL + PostGIS + MailHog), CI pipeline via GitHub Actions (lint, type check, integration tests with Testcontainers), and production deployment with the Next.js frontend on a CDN-backed platform and the Spring Boot backend as a container. Generate a Mermaid diagram illustrating the flow from local development through CI to production.

### **2.2. Description of main components:**

**Prompt 1:**

> Describe all main technical components of StayHub with their technology and responsibility: the Next.js frontend SPA, the Mapbox GL interactive map, Stripe Elements for payment UI, TanStack Query for server state management, the Spring Boot REST API, Kotlin coroutine use cases, the Clean Architecture domain model, the R2DBC persistence layer with PostGIS, the Stripe payment adapter, the Spring Mail email adapter, and the Mapbox geocoding adapter. Format as a table with columns: Component, Technology, Responsibility.

**Prompt 2:**

> Explain how the port/adapter (hexagonal architecture) pattern is applied in StayHub's backend. Specifically: how the `PaymentService` port in the domain layer is implemented by `StripePaymentAdapter` in the infrastructure layer, and how this allows the payment provider to be swapped without touching business logic. Include a concrete example with the `CreateBookingUseCase`.

**Prompt 3:**

> Define the bounded contexts for StayHub's domain model. Identify the separation between the Property context (read model for search), the Booking context (transactional aggregate with availability hold and payment lifecycle), the Availability context (date-level tracking with temporary holds), and the User context (guest and host — read-only for this feature, managed by a separate auth module).

### **2.3. High-level project structure:**

**Prompt 1:**

> Define the complete file and directory structure for StayHub as a web application with separate `backend/` and `frontend/` directories. The backend follows Clean Architecture with packages: `domain/` (property, booking, availability, shared), `application/` (search, property, booking use cases), `infrastructure/` (persistence, payment, email, geocoding, config), and `presentation/` (api controllers, dto, middleware). The frontend uses Next.js App Router with `app/` pages (search, property/[id], booking/[id], confirmation/[id], trips/), `components/` organized by feature, `services/`, `types/`, `hooks/`, and `lib/`.

**Prompt 2:**

> Explain the purpose of each top-level directory in the StayHub project: `backend/src/main/kotlin/com/stayhub/domain/` contains pure business logic with no framework dependencies; `application/` contains use cases that orchestrate domain objects; `infrastructure/` contains adapter implementations for persistence, payment, and external services; `presentation/` contains the HTTP layer. Also explain how Flyway database migrations are organized under `backend/src/main/resources/db/migration/`.

**Prompt 3:**

> Document the specification-first design artifacts under `specs/001-guest-search-booking/`: the feature spec (`spec.md`), implementation plan (`plan.md`), entity data model (`data-model.md`), developer quickstart (`quickstart.md`), OpenAPI contracts under `contracts/`, and ordered task list (`tasks.md`). Explain how these artifacts are produced sequentially by the Spec Kit workflow commands before any code is written.

### **2.4. Infrastructure and deployment:**

**Prompt 1:**

> Define the Docker Compose configuration for StayHub local development. It must include: a PostgreSQL 16 + PostGIS service (using the `postgis/postgis:16-3.4` image — not plain postgres, which lacks the spatial extension), and a MailHog service for local email testing. Include the environment variables needed for the backend to connect to both services, and explain why the PostGIS-specific image is required for geospatial bounding-box queries.

**Prompt 2:**

> Design the GitHub Actions CI pipeline for StayHub. It should run on every push and PR: (1) backend lint and Kotlin compilation check, (2) backend unit and integration tests using Testcontainers to spin up a real PostgreSQL + PostGIS instance, (3) frontend TypeScript type check and unit tests with Vitest, (4) Docker image build for both services. Explain why Testcontainers is preferred over mocking the database in integration tests.

**Prompt 3:**

> Define the environment variable strategy for StayHub across local, CI, and production environments. Identify all secrets that must never appear in source control: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MAPBOX_ACCESS_TOKEN`, database credentials. Explain how Stripe webhook signature verification (`STRIPE_WEBHOOK_SECRET`) protects the backend from fraudulent payment confirmation events.

### **2.5. Security:**

**Prompt 1:**

> Define the security model for StayHub following the constitution's Security by Default principle. All booking and trip management endpoints require JWT authentication. Authorization is enforced at the use-case layer (not just the controller) — a guest can only access their own bookings. Input validation occurs at the API boundary. Describe how to implement this in Spring Security with a stateless JWT filter chain, and how the use case verifies ownership before returning booking data.

**Prompt 2:**

> Explain how StayHub achieves PCI compliance for payment card data without building payment infrastructure. Stripe Elements collects card details client-side and tokenizes them — raw card numbers never reach the StayHub backend. The backend only receives a `payment_intent_id`. Stripe webhook events are verified using the `STRIPE_WEBHOOK_SECRET` signing key to prevent fraudulent booking confirmations. Document what data the backend stores vs. what stays with Stripe.

**Prompt 3:**

> Identify the OWASP Top 10 vulnerabilities most relevant to StayHub and document how each is mitigated: SQL injection (parameterized R2DBC queries), XSS (React's default output escaping), CSRF (not applicable — stateless JWT API with no cookie sessions), broken access control (ownership check in use case layer), security misconfiguration (secrets in env vars, never in code), and sensitive data exposure (no PII or card data in logs; trace IDs used for debugging instead).

### **2.6. Tests:**

**Prompt 1:**

> Define the four-layer testing strategy for StayHub aligned with the constitution's Testing Discipline principle: (1) Unit tests with JUnit 5 + Kotest + MockK for domain aggregates and use case logic with mocked ports — example: pricing formula test verifying `subtotal × 0.12 = service_fee`; (2) Integration tests with Testcontainers + Spring WebTestClient for repository adapters against a real PostgreSQL + PostGIS instance; (3) Contract tests for API endpoint compliance against the OpenAPI contracts in `specs/contracts/`; (4) E2E tests with Playwright covering the full search → detail → checkout → confirmation flow.

**Prompt 2:**

> Write an example unit test for the availability hold behavior: given a property with available dates, when `AvailabilityHoldRepository.createHold()` is called, then `held_until` is set to NOW + 10 minutes; when a second guest queries the same dates while the hold is active, `isAvailable()` returns false; when the hold expires, the dates become available again. Use Kotlin + Kotest + MockK syntax.

**Prompt 3:**

> Write an example integration test for the `CreateBookingUseCase` using Testcontainers: spin up a real PostgreSQL + PostGIS instance, seed a property with available dates, call the use case with valid dates and guest count, assert the returned `CreateBookingResponse` contains a non-null `stripe_client_secret` and `hold_expires_at` in the future, and verify the `availability_hold` row exists in the database with the correct `property_id` and `held_until`.

---

## 3. Data Model

**Prompt 1:**

> Design the complete PostgreSQL data model for StayHub's guest search and booking feature. Define six entities: GUEST (registered user who books), HOST (property owner), PROPERTY (rentable accommodation with PostGIS geography point for location, JSONB for amenities/photos/house_rules, and denormalized avg_rating), AVAILABILITY (sparse date-level availability per property), AVAILABILITY_HOLD (temporary 10-minute lock during checkout), BOOKING (transactional record with snapshotted prices and Stripe payment intent ID), and REVIEW (one per completed booking). Generate a Mermaid ERD with all primary keys, foreign keys, and constraints.

**Prompt 2:**

> Define all database indexes required for StayHub's performance goals (search results under 1 second p95, 500 concurrent users). For the PROPERTY table: a GiST spatial index on the `location` geography column for bounding-box queries, B-tree indexes on `nightly_rate_eur` (price sort) and `avg_rating` (rating sort), and a partial index on `(property_type, is_active)` filtering only active properties. For AVAILABILITY_HOLD: a B-tree index on `held_until` for the cleanup scheduler. Explain why a GiST index is required for PostGIS queries.

**Prompt 3:**

> Define the Flyway migration strategy for StayHub. Create 7 sequential migration files: V1 enables PostGIS and uuid-ossp extensions; V2 creates Guest and Host tables; V3 creates the Property table with the PostGIS geography column; V4 creates Availability and AvailabilityHold tables with all indexes; V5 creates the Booking table with the price snapshot columns; V6 creates the Review table; V7 seeds 15 sample properties across Barcelona, Madrid, and Lisbon with 90-day availability for local development. Explain the pricing snapshot pattern in the Booking table — why prices are copied at booking creation rather than referenced dynamically.

---

## 4. API Specification

**Prompt 1:**

> Define the OpenAPI 3.1 contract for the property search API. The `GET /api/v1/properties/search` endpoint accepts a map viewport bounding box (sw_lat, sw_lng, ne_lat, ne_lng), check-in/check-out dates, number of guests, and optional filters (price range, property type, bedrooms, amenities array, sort order). It returns a paginated list of `PropertySummary` objects (id, title, photo_url, nightly_rate_eur, location with lat/lng/city/country, avg_rating, review_count) and a pagination metadata object. Also define `GET /api/v1/properties/geocode` for converting city names to coordinates.

**Prompt 2:**

> Define the OpenAPI 3.1 contract for the booking API with JWT authentication. Include: `POST /api/v1/bookings` (creates booking, places 10-min hold, returns Stripe client_secret and hold_expires_at); `POST /api/v1/bookings/{id}/confirm` (verifies Stripe PaymentIntent succeeded, transitions to confirmed); `POST /api/v1/bookings/{id}/cancel` (applies cancellation policy, returns refund_amount_eur and refund_status); `GET /api/v1/bookings/my-trips` (paginated trip list filtered by status); `GET /api/v1/bookings/{id}` (full booking detail with can_cancel flag and refund_amount_eur). Define the 409 DATES_UNAVAILABLE and 422 BOOKING_CANNOT_CANCEL error responses.

**Prompt 3:**

> Define a shared error response schema for all StayHub API endpoints. The `ErrorResponse` object must include: a machine-readable `code` (e.g., VALIDATION_ERROR, NOT_FOUND, DATES_UNAVAILABLE, UNAUTHORIZED, FORBIDDEN, PAYMENT_FAILED, HOLD_EXPIRED, BOOKING_CANNOT_CANCEL), a human-readable `message`, an optional `details` array for field-level validation errors (each with `field` and `reason`), and a `trace_id` for support and debugging. Define reusable response components for 400, 401, 403, and 404 that all endpoint contracts can reference.

---

## 5. User Stories

**Prompt 1:**

> Write the user story for the guest search experience (Priority P1, MVP): "As a guest, I want to search for available properties by entering a destination and travel dates so I can find suitable accommodations for my trip." Include 4 acceptance scenarios in Given/When/Then format covering: successful search with results, filter application narrowing results, empty state with no results, and large result set pagination. Define the independent test criteria and explain why this is the highest priority story.

**Prompt 2:**

> Write the user story for the instant booking flow (Priority P3, core transaction): "As a guest, I want to book a property for my selected dates so I can secure my accommodation and receive a confirmation." Include 4 acceptance scenarios covering: navigation to checkout with price breakdown, successful payment creating a confirmed booking with reference number, concurrent booking attempt handled by the 10-minute hold, and email notification to both parties. Define measurable success criteria: booking flow completed in under 5 minutes, double-booking rate 0%.

**Prompt 3:**

> Write the user story for booking management (Priority P4): "As a guest, I want to view my upcoming and past bookings so I can manage my travel plans and access booking details." Include 3 acceptance scenarios: trips list with status/dates/cost, full booking detail with property address and host contact, and cancellation flow showing the platform policy and refund amount before confirming. Add edge cases for: what happens when a guest is not logged in and attempts to book (redirect to login preserving destination), and what happens when a booking is already completed and the guest tries to cancel (422 error with BOOKING_CANNOT_CANCEL code).

---

## 6. Work Tickets

**Prompt 1:**

> Generate an ordered, dependency-aware task list for the Guest Search and Booking feature organized by user story. Phase 1 is project setup (Gradle/Next.js initialization, Docker Compose, directory structure). Phase 2 is foundational blocking prerequisites (Flyway migrations V1–V7, JWT security config, global error handler, trace ID filter, structured logging, frontend API client and TypeScript types). Phases 3–6 are one phase per user story (P1 Search, P2 Property Details, P3 Booking, P4 Trip Management), each with backend domain models, use cases, repository adapters, controllers, and frontend service hooks, components, and pages. Phase 7 is polish and cross-cutting concerns. Mark parallelizable tasks with [P] and label each task with its user story [US1]–[US4].

**Prompt 2:**

> For the CreateBookingUseCase (Task T054, US3), write a detailed work ticket suitable for an LLM to implement without additional context. Describe the exact steps: validate dates, verify property exists and is active, check for active holds or confirmed bookings, create a 10-minute AvailabilityHold row, calculate the price snapshot (nightly rate × nights + cleaning fee + 12% service fee), create a Stripe PaymentIntent for the total EUR amount, persist a booking record, return CreateBookingResponse with booking_id, reference_number, price_breakdown, stripe_client_secret, and hold_expires_at. Include error responses: 409 DATES_UNAVAILABLE, 400 VALIDATION_ERROR.

**Prompt 3:**

> For the MapView component (Task T033, US1), write a detailed work ticket for implementing the interactive Mapbox GL map in `frontend/src/components/search/MapView.tsx`. Requirements: render via react-map-gl centered on geocoded location, display a marker per property in results, fire `onViewportChange(bounds: BoundingBox)` callback on pan/zoom to trigger re-search, highlight the marker of the hovered property card, navigate to `/property/{id}` on marker click. Acceptance criteria: panning triggers onViewportChange with updated bounding box coords, marker count matches results list, hovered marker changes style, clicking navigates correctly.

---

## 7. Pull Requests

**Prompt 1:**

> Create a GitHub pull request template at `.github/pull_request_template.md` that enforces the following structure for every PR in the project: a What section describing what the PR changes, a Why section explaining the motivation and linking to the spec or constitution principle, an Impact section covering API contract changes, data model changes, new dependencies, and security/observability implications, a References section linking to the user story, task ID, or issue number, and a Checklist verifying Clean Architecture compliance, acceptance scenario coverage, no secrets in code, and structured logging with trace IDs. Also update the project constitution's Development Workflow section to mandate use of this template.

**Prompt 2:**

> Document the pull request for adding the project constitution and guest search & booking specification. The PR title should be: "[Spec Kit] Add project constitution and guest search & booking specification". The description should explain: What — introduces StayHub constitution (7 principles) and feature spec (4 user stories, 14 FRs, 5 clarifications); Why — establishes governance and specification-first baseline per Principle I before any code is written; Impact — no code changes, but all subsequent PRs must reference these artifacts; References — Constitution v1.0.0, Feature spec US1–US4.

**Prompt 3:**

> Document the pull request for adding the implementation plan, data model, API contracts, and task list. The PR title should be: "[Spec Kit] Add implementation plan, data model, and API contracts". The description should explain: What — plan.md, data-model.md with ERD, OpenAPI 3.1 contracts for Search/Property/Booking APIs, quickstart.md, and tasks.md with 85 ordered tasks; Why — completes the design phase, defines the backend/frontend interface contract enabling parallel development; Impact — no production code, but defines ~15 API endpoints, 6 database entities with PostGIS spatial indexing, and Flyway migration strategy; References — all spec artifacts under `specs/001-guest-search-booking/`.

---

## 8. Implementation Workflow

**Prompt 1:**

> I need to implement task T054: CreateBookingUseCase with AvailabilityHold. Read the full context from `specs/001-guest-search-booking/plan.md` (look for T054) and `docs/superpowers/plans/`. Create a feature branch (`issue-22-t054-create-booking-use-case`), implement the use case following Clean Architecture — domain port interface first, application use case second, infrastructure adapter third. Write a failing test before any implementation code (TDD: red → green → refactor). When the tests pass, open a PR with the standard template. Do not commit to main under any circumstances.

**Prompt 2:**

> Dispatch subagents to implement Tasks T040–T043 in parallel using isolated git worktrees. Each subagent works in its own worktree, implements the assigned task with TDD discipline (failing test before implementation), and opens a PR targeting main. Assign: T040 (BookingController + integration tests) to worktree-1, T041 (ConfirmBookingUseCase) to worktree-2, T042 (CancelBookingUseCase) to worktree-3, T043 (GetMyTripsUseCase) to worktree-4. Each subagent must read `CLAUDE.md` before starting — it contains the dependency direction rules, the common import mistake to avoid, and how to respond when ArchUnit fails. Never commit directly to main.

**Prompt 3:**

> Update `CLAUDE.md` to document the Clean Architecture layering rules for this codebase in a way that AI agents understand without needing any prior conversation context. Specifically document: (1) the dependency direction (presentation → application → domain, infrastructure → application → domain — never the reverse); (2) what lives in each layer (domain is pure Kotlin, no Spring annotations; use-case exceptions go in `application/error/` not `presentation/error/`); (3) the most common mistake (importing `ErrorResponse` from `presentation.error` — it must come from `application.error`); (4) what ArchUnit does on every build and how to fix a violation (move the type to a lower layer, never relax the rule). Any AI agent reading CLAUDE.md cold must be able to implement a new use case correctly without further guidance.

---

## 9. Testing & Quality

**Prompt 1:**

> We need a shared integration test base class that boots the full Spring application context against a real PostgreSQL + PostGIS Testcontainer so that tests exercise the real security filter chain, Jackson serializers, and CORS configuration — not mocked versions. Create `AbstractApiIntegrationTest.kt` in `backend/src/test/kotlin/com/stayhub/` that: starts a shared `@Container` (one instance reused across the entire test run), uses `@SpringBootTest(webEnvironment = RANDOM_PORT)`, applies Flyway migrations before any test runs, and provides a pre-configured `WebTestClient` with a pre-issued guest JWT for authenticated endpoints. Any integration test class should be able to extend it with zero boilerplate. Explain in the PR why this harness catches bugs that pure unit tests miss (serialization config, CORS headers, security filter ordering).

**Prompt 2:**

> Add a Playwright E2E test spec at `frontend/tests/e2e/booking-journey.spec.ts` covering two critical guest journeys. Test 1 — full booking: register a new user, search for a property in Barcelona with dates 30–37 days from today, click a result, open the property detail page, click Reserve, submit the mock payment form (use `NEXT_PUBLIC_E2E=true` stub path — no real Stripe), and assert the confirmation page shows a reference number starting with `BK-`. Test 2 — cancellation: run the same booking flow, navigate to My Trips, open the trip detail, click Cancel, confirm in the modal, and assert the status reads `cancelled`. Wire this spec into GitHub Actions via a `docker-compose.e2e.yml` that builds and starts the full stack (backend, frontend, postgres) before running `npx playwright test`. The job must tear down the stack after the run regardless of test outcome.

**Prompt 3:**

> Add `CleanArchitectureTest.kt` in `backend/src/test/kotlin/com/stayhub/architecture/` using ArchUnit to mechanically enforce the layering rules on every build. The test must fail if: (1) any class in `domain/` imports from `application/`, `infrastructure/`, or `presentation/`; (2) any class in `application/` imports from `infrastructure/` or `presentation/`; (3) any class in `infrastructure/` imports from `presentation/`; (4) any domain class carries `@Component`, `@Service`, or `@Repository`; (5) any class annotated `@RestController` lives outside `presentation/`; (6) any class annotated `@Repository` lives outside `infrastructure/`. These rules must run as a standard JUnit 5 test and fail the Gradle build on violation — the goal is that an AI agent cannot accidentally introduce a layering violation without CI catching it on the next PR.

---

## 10. Bug Fixes & Debugging

**Prompt 1:**

> The frontend is receiving a `401` error on `OPTIONS` preflight requests to `POST /api/v1/bookings`, which blocks the browser from sending the actual POST. Diagnose this: the Spring Security filter chain is rejecting the OPTIONS request before the CORS filter can process it. Fix it by ensuring the CORS configuration is applied before the authentication filter — specifically, call `.cors().and()` before `.csrf().disable()` in the security config, and configure a `CorsConfigurationSource` bean that permits `OPTIONS` from the frontend origin (`http://localhost:3000`) with the required headers. After fixing, add an integration test using `AbstractApiIntegrationTest` that sends an `OPTIONS` preflight to `/api/v1/bookings` and asserts the response is `200` with the correct `Access-Control-Allow-*` headers. The bug must not be closed until the integration test is green on CI.

**Prompt 2:**

> The property detail page availability calendar shows all dates as selectable even when those dates have confirmed bookings. Investigate the full write path: when `CreateBookingUseCase` confirms a booking, does it write `availability` rows with `status = 'booked'`? Check the search SQL — is it filtering out properties where any requested date has `status != 'available'` before returning results? Fix both gaps: (1) in `CreateBookingUseCase`, after persisting the booking, insert one `availability` row per booked date with `status = 'booked'`; (2) in the search repository SQL, add a correlated subquery or join that excludes properties where any requested date falls in a booked or blocked range. Add an integration test in `SearchAvailabilityIntegrationTest` that seeds a confirmed booking and asserts the property is excluded from search results when queried for the same dates.

**Prompt 3:**

> The checkout page hangs indefinitely in local development — the booking hold is never created and the page shows an endless loading spinner. Reproduce by navigating to a property detail page and clicking Reserve. Diagnose: the checkout component calls `mutate()` inside a `useEffect` to create the availability hold. Under React 18 Strict Mode (active in development), effects are deliberately mounted, unmounted, and remounted once — so `mutate()` fires twice. The second call gets a `409 DATES_UNAVAILABLE` (the first hold is still active), which sets an unrecoverable error state. Fix: replace the `useEffect + mutate()` pattern with a params-keyed `useQuery` that triggers hold creation as a query keyed on `(propertyId, checkIn, checkOut, guestId)`. React Strict Mode's double-mount does not fire the same query twice because the cache already holds the result from the first invocation. Save this pattern to memory as a known pitfall for future sessions.
