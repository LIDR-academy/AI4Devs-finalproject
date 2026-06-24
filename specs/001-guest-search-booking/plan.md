# Implementation Plan: Guest Search and Booking

**Branch**: `001-guest-search-booking` | **Date**: 2025-05-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-guest-search-booking/spec.md`

## Summary

Build a guest-facing search and booking system for a vacation rental marketplace.
Guests search properties by location (map viewport) and dates, view detailed
listings, and complete instant bookings with a 10-minute availability hold and
Stripe payment integration. The system uses a React/Next.js frontend with an
interactive map, a Spring Boot/Kotlin backend following Clean Architecture, and
PostgreSQL with PostGIS for geospatial queries.

## Technical Context

**Language/Version**: Kotlin 2.0+ (backend), TypeScript 5.x (frontend)

**Primary Dependencies**:
- Backend: Spring Boot 4.x, Spring WebFlux (coroutines), Spring Security, Spring Data R2DBC
- Frontend: Next.js 15+, React 19, Mapbox GL JS (or Leaflet), TanStack Query, Tailwind CSS
- Payments: Stripe SDK (server + Elements)
- Email: Spring Mail + templating (Thymeleaf or kotlinx.html)

**Storage**: PostgreSQL 16+ with PostGIS extension (geospatial queries)

**Testing**:
- Backend: JUnit 5, Kotest, Testcontainers, MockK, Spring WebTestClient
- Frontend: Vitest, React Testing Library, Playwright (E2E)

**Target Platform**: Web (responsive SPA), deployed via Docker containers

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Search results <1s p95, page loads <2s, 500 concurrent users

**Constraints**: 10-minute booking hold TTL, single currency (EUR), instant booking only

**Scale/Scope**: ~5 screens (search, detail, checkout, confirmation, my-trips), ~15 API endpoints

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Specification-First | PASS | Spec written and clarified before planning |
| II. Clean Architecture | PASS | Layered structure: domain → application → infrastructure → presentation |
| III. API-First Design | PASS | Contracts defined in Phase 1 before implementation |
| IV. Domain-Driven Design | PASS | Bounded contexts: Property (read model), Booking, Availability |
| V. Testing Discipline | PASS | Test strategy covers unit, integration, contract, E2E per spec scenarios |
| VI. Security by Default | PASS | Auth required for booking; input validation at API layer; Stripe handles PCI |
| VII. Observability | PASS | Structured logging, correlation IDs, health checks planned |

## Project Structure

### Documentation (this feature)

```text
specs/001-guest-search-booking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── search-api.yml
│   ├── property-api.yml
│   ├── booking-api.yml
│   └── error-responses.yml
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── build.gradle.kts
├── src/
│   ├── main/kotlin/com/stayhub/
│   │   ├── domain/
│   │   │   ├── property/           # Property aggregate (read model)
│   │   │   ├── booking/            # Booking aggregate
│   │   │   ├── availability/       # Availability value objects
│   │   │   └── shared/             # Shared value objects (Money, DateRange)
│   │   ├── application/
│   │   │   ├── search/             # SearchPropertiesUseCase
│   │   │   ├── booking/            # CreateBookingUseCase, CancelBookingUseCase
│   │   │   └── property/           # GetPropertyDetailsUseCase
│   │   ├── infrastructure/
│   │   │   ├── persistence/        # R2DBC repositories
│   │   │   ├── payment/            # Stripe adapter
│   │   │   ├── email/              # Email notification adapter
│   │   │   ├── geocoding/          # Geocoding service adapter
│   │   │   └── config/             # Spring configuration
│   │   └── presentation/
│   │       ├── api/                # REST controllers
│   │       ├── dto/                # Request/Response DTOs
│   │       └── middleware/         # Auth filters, error handlers
│   └── test/kotlin/com/stayhub/
│       ├── unit/                   # Domain + application tests
│       ├── integration/            # Repository + adapter tests
│       └── contract/               # API contract tests
├── docker-compose.yml
└── Dockerfile

frontend/
├── package.json
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── search/                 # Search page with map
│   │   ├── property/[id]/          # Property detail page
│   │   ├── booking/[id]/           # Checkout page
│   │   ├── confirmation/[id]/      # Booking confirmation
│   │   └── trips/                  # My trips page
│   ├── components/
│   │   ├── search/                 # SearchBar, FilterPanel, ResultCard, MapView
│   │   ├── property/               # PhotoGallery, AmenityList, Calendar, ReviewList
│   │   ├── booking/                # PriceBreakdown, PaymentForm, BookingSummary
│   │   └── shared/                 # Layout, Navigation, LoadingStates
│   ├── hooks/                      # Custom React hooks
│   ├── services/                   # API client layer
│   ├── types/                      # TypeScript interfaces
│   └── lib/                        # Utilities (formatting, validation)
├── tests/
│   ├── unit/                       # Component + hook tests
│   └── e2e/                        # Playwright E2E tests
├── Dockerfile
└── next.config.ts
```

**Structure Decision**: Web application structure with separate `backend/` and
`frontend/` directories. Backend follows Clean Architecture (domain → application
→ infrastructure → presentation). Frontend uses Next.js App Router with
feature-based component organization.

## Complexity Tracking

No constitution violations to justify.
