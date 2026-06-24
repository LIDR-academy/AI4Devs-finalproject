## Index

0. [Project Card](#0-project-card)
1. [General Product Description](#1-general-product-description)
2. [System Architecture](#2-system-architecture)
3. [Data Model](#3-data-model)
4. [API Specification](#4-api-specification)
5. [User Stories](#5-user-stories)
6. [Work Tickets](#6-work-tickets)
7. [Pull Requests](#7-pull-requests)

---

## 0. Project Card

### **0.1. Full name:**

Jordi Gil Llorca

### **0.2. Project name:**

StayHub

### **0.3. Brief project description:**

StayHub is an AI-assisted implementation of a modern vacation rental marketplace inspired by platforms like Airbnb. The platform allows hosts to publish and manage rental properties while guests can search, filter, book, and review accommodations through a clean and intuitive experience. The project is built using specification-first engineering workflows with Claude Code and Spec Kit, emphasizing production-quality architecture, domain-driven design, and AI-native development practices.

### **0.4. Project URL:**

_To be added after deployment._

### **0.5. Repository URL**

[https://github.com/jordi-gil-n26/AI4Devs-finalproject-JGLL](https://github.com/jordi-gil-n26/AI4Devs-finalproject-JGLL)

---

## 1. General Product Description

### **1.1. Objective:**

StayHub solves the challenge of finding and booking short-term vacation rentals by providing a marketplace where guests can discover properties through an interactive map, check real-time availability, and complete instant bookings with secure payment — all in a single seamless flow.

**Value delivered:**
- **For guests**: Find and book accommodations quickly with map-based search, transparent pricing, and immediate booking confirmation.
- **For hosts**: Reach guests with a listing that showcases photos, amenities, and availability with no friction.
- **For the project**: Serves as a real-world case study in AI-assisted, specification-driven software engineering.

### **1.2. Main features and functionalities:**

| Feature | Description |
|---------|-------------|
| **Map-based property search** | Guests search by location and dates using an interactive map viewport. Results update dynamically as the map is panned or zoomed. |
| **Advanced filtering** | Filter by price range, number of guests, property type (apartment, house, villa, cabin, studio), bedrooms, and amenities. |
| **Property detail page** | Full listing view with photo gallery, description, amenities, house rules, availability calendar, price breakdown, host profile, and guest reviews. |
| **Instant booking** | Guests reserve directly without host approval. A 10-minute availability hold is placed during checkout to prevent double-booking. |
| **Mock payment integration** | Payments use a mock adapter for development and testing. The domain's `PaymentService` port is designed to swap in a real provider (e.g. Stripe) without touching business logic. |
| **OpenAPI / Swagger UI** | Full API documentation at `/swagger-ui.html` with JWT bearer auth support for interactive endpoint testing. |
| **Booking management** | Guests can view upcoming and past trips, access booking details (address, host contact), and cancel eligible bookings per the platform cancellation policy. |
| **Cancellation policy** | Full refund if cancelled 48+ hours before check-in. No refund within 48 hours. |
| **Email notifications** | Email notification stubs are wired — the SMTP adapter is scaffolded but email delivery is not active in the current build (issue #54 open). |

### **1.3. Design and user experience:**

The guest experience follows a linear, low-friction flow:

1. **Search** — Guest enters a destination and dates. An interactive map renders matching properties as markers; a results list shows alongside.
2. **Filter** — Optional filters narrow results by price, type, guests, and amenities.
3. **Property detail** — Guest selects a property and views the full listing, availability calendar, and live price breakdown.
4. **Checkout** — Guest clicks Reserve, reviews the price summary, and enters card details via Stripe Elements.
5. **Confirmation** — Instant confirmation page with booking reference number.
6. **My Trips** — Guest can revisit all bookings, view details, and cancel if eligible.

_Screenshots and demo video to be added after initial implementation._

### **1.4. Installation instructions:**

#### Prerequisites

- Docker + Docker Compose
- JDK 21+
- Node.js 20+

#### 1. Clone the repository

```bash
git clone https://github.com/jordi-gil-n26/AI4Devs-finalproject-JGLL.git
cd AI4Devs-finalproject-JGLL
```

#### 2. Configure environment variables

Create `backend/.env`. The file is loaded automatically by Spring via
`spring.config.import=optional:file:./.env[.properties]`, so it must use
plain Java properties syntax: `KEY=VALUE` lines only — no `export`, no
quoted values, no shell interpolation.

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=stayhub
POSTGRES_USER=stayhub
POSTGRES_PASSWORD=stayhub_dev

STRIPE_API_KEY=sk_test_dummy
STRIPE_WEBHOOK_SECRET=whsec_test_dummy

MAPBOX_API_KEY=pk_test_...

MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM=noreply@stayhub.local

# 32+ character secret. Generate with: openssl rand -base64 48
JWT_SECRET=replace_me_with_a_32_plus_character_local_dev_secret
JWT_ISSUER=stayhub
```

The Spring context refuses to start if `JWT_SECRET` is unset or shorter
than 32 characters — boot fails fast with a clear binding error rather
than 500-ing on the first `/api/v1/auth/*` request.

See `specs/001-guest-search-booking/quickstart.md` for the full
developer setup walkthrough.

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_TOKEN=pk.test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### 3. Start the infrastructure

```bash
docker compose up -d
# Starts: PostgreSQL 16 + PostGIS, Mailpit (fake SMTP)
```

#### 4. Start the backend

```bash
cd backend
./gradlew bootRun
# Flyway migrations run automatically on startup
```

#### 5. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

#### Access points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Email viewer (Mailpit) | http://localhost:8025 |

---

## 2. System Architecture

### **2.1. Architecture diagram:**

```mermaid
graph TB
    subgraph Client["Browser (Next.js 15 / React 19)"]
        UI[Pages & Components]
        MapGL[Mapbox GL JS]
        StripeEl[Stripe Elements]
        TQ[TanStack Query]
    end

    subgraph Backend["Backend (Spring Boot 4 / Kotlin)"]
        CTRL[Presentation Layer\nREST Controllers]
        APP[Application Layer\nUse Cases]
        DOM[Domain Layer\nAggregates & Ports]
        INFRA[Infrastructure Layer\nAdapters]
    end

    subgraph Storage["Data"]
        PG[(PostgreSQL 16\n+ PostGIS)]
        FLYWAY[Flyway Migrations]
    end

    subgraph External["External Services"]
        STRIPE[Stripe API]
        MAPBOX[Mapbox Geocoding API]
        SMTP[SMTP / MailHog]
    end

    UI --> TQ
    TQ -->|HTTP/JSON| CTRL
    MapGL -->|Viewport coords| TQ
    StripeEl -->|client_secret| STRIPE

    CTRL --> APP
    APP --> DOM
    DOM --> INFRA
    INFRA --> PG
    INFRA -->|Payment| STRIPE
    INFRA -->|Geocode| MAPBOX
    INFRA -->|Email| SMTP
    FLYWAY --> PG
```

**Architecture pattern**: Clean Architecture with strict inward dependency rules — presentation depends on application, application depends on domain, infrastructure implements domain ports. This ensures the domain layer is framework-free and independently testable.

**Why this architecture?**
- Domain isolation means business rules (booking lifecycle, pricing, availability holds) are testable without spinning up Spring or a database.
- Port/adapter pattern allows swapping Stripe for another payment provider or Mapbox for another geocoder without touching business logic.
- Reactive stack (WebFlux + R2DBC + coroutines) handles concurrent search requests efficiently without blocking threads.

**Trade-offs:**
- R2DBC has a smaller ecosystem than JDBC (no PostGIS native type support; manual SQL for spatial queries).
- More boilerplate than a simple monolith — justified by the domain complexity of a marketplace.

### **2.2. Main components:**

| Component | Technology | Responsibility |
|-----------|-----------|----------------|
| **Frontend SPA** | Next.js 15, React 19, TypeScript | Renders all guest-facing pages; communicates with backend via REST |
| **Interactive Map** | Mapbox GL JS via react-map-gl | Displays property markers; fires viewport-change events to trigger new searches |
| **Payment UI** | Stripe Elements | Collects card details client-side; never sends raw card data to our servers |
| **Server State** | TanStack Query | Caches API responses, handles refetching on viewport change, manages loading/error states |
| **REST API** | Spring Boot 4, Spring WebFlux | Exposes all backend functionality; handles auth, validation, and routing |
| **Use Cases** | Kotlin coroutines | Orchestrates domain logic: search, create booking, confirm payment, cancel booking |
| **Domain Model** | Pure Kotlin | Aggregates (Booking, Property), value objects (Money, DateRange), port interfaces |
| **Persistence** | Spring Data R2DBC + PostgreSQL | Non-blocking database access; PostGIS bounding-box queries for geospatial search |
| **Payment Adapter** | Stripe SDK (Kotlin) | Creates PaymentIntents, verifies webhook signatures, processes refunds |
| **Email Adapter** | Spring Mail + Thymeleaf | Sends booking confirmation and cancellation notifications |
| **Geocoding Adapter** | Mapbox Geocoding API | Converts city names to coordinates for initial map centering |

### **2.3. High-level project structure**

```text
/
├── backend/                        # Spring Boot 4 / Kotlin service
│   ├── build.gradle.kts            # Gradle Kotlin DSL build file
│   ├── Dockerfile
│   └── src/main/kotlin/com/stayhub/
│       ├── domain/                 # Pure business logic (no framework)
│       │   ├── property/           # Property aggregate (read model for search)
│       │   ├── booking/            # Booking aggregate, PaymentService port
│       │   ├── availability/       # AvailabilityHold, port interfaces
│       │   └── shared/             # Money, DateRange value objects
│       ├── application/            # Use cases orchestrating domain objects
│       │   ├── search/             # SearchPropertiesUseCase
│       │   ├── property/           # GetPropertyDetailsUseCase, CalculatePriceUseCase
│       │   └── booking/            # CreateBookingUseCase, ConfirmBookingUseCase,
│       │                           # CancelBookingUseCase, GetMyTripsUseCase
│       ├── infrastructure/         # Adapter implementations
│       │   ├── persistence/        # R2DBC repository adapters + hold cleanup scheduler
│       │   ├── payment/            # Stripe adapter
│       │   ├── email/              # SMTP adapter + Thymeleaf templates
│       │   ├── geocoding/          # Mapbox geocoding adapter
│       │   └── config/             # Spring Security, R2DBC, Flyway config
│       └── presentation/           # HTTP layer
│           ├── api/                # SearchController, PropertyController, BookingController
│           ├── dto/                # Request/Response data classes
│           └── middleware/         # JWT filter, trace ID filter, global error handler
│
├── frontend/                       # Next.js 15 / TypeScript app
│   ├── next.config.ts
│   ├── Dockerfile
│   └── src/
│       ├── app/                    # Next.js App Router pages
│       │   ├── search/             # Map search page (P1 MVP)
│       │   ├── property/[id]/      # Property detail page
│       │   ├── booking/[id]/       # Checkout page
│       │   ├── confirmation/[id]/  # Booking confirmation
│       │   └── trips/              # My Trips + trip detail
│       ├── components/             # Feature-organized UI components
│       │   ├── search/             # SearchBar, FilterPanel, PropertyCard, MapView
│       │   ├── property/           # PhotoGallery, AvailabilityCalendar, PriceBreakdown
│       │   ├── booking/            # BookingSummary, PaymentForm, TripCard
│       │   └── shared/             # NavigationBar, LoadingSkeletons, ErrorBoundary
│       ├── services/               # API client functions + TanStack Query hooks
│       ├── types/                  # TypeScript interfaces matching API contracts
│       └── lib/                    # Formatting utilities, validation helpers
│
├── specs/001-guest-search-booking/ # Specification-first design artifacts
│   ├── spec.md                     # Feature specification
│   ├── plan.md                     # Implementation plan
│   ├── data-model.md               # Entity model + ERD
│   ├── research.md                 # Technology decisions and rationale
│   ├── quickstart.md               # Developer setup guide
│   ├── tasks.md                    # Ordered implementation task list
│   └── contracts/                  # OpenAPI 3.1 contracts (search, property, booking)
│
├── docker-compose.yml              # PostgreSQL + PostGIS + MailHog
└── .github/
    └── pull_request_template.md    # Enforced PR structure
```

### **2.4. Infrastructure and deployment**

```mermaid
graph LR
    subgraph Local["Local Development"]
        DC[docker-compose\nPostgreSQL + PostGIS\nMailHog]
        BE[Backend :8080]
        FE[Frontend :3000]
    end

    subgraph CI["GitHub Actions CI"]
        LINT[Lint & Type Check]
        TEST[Unit + Integration Tests\nTestcontainers]
        BUILD[Docker Build]
    end

    subgraph Prod["Production (target)"]
        CDN[CDN / Vercel\nNext.js Frontend]
        API[Container\nSpring Boot API]
        DB[(PostgreSQL\n+ PostGIS)]
    end

    Local --> CI
    CI -->|on merge to main| Prod
```

**Local**: Everything runs via Docker Compose. Flyway migrations apply automatically on backend startup. No manual setup beyond environment variables.

**CI**: GitHub Actions runs lint, type checks, and tests (Testcontainers spins up a real PostgreSQL + PostGIS instance for integration tests) on every push and PR.

**Production target**: Frontend deployed to Vercel (or similar CDN-backed platform). Backend and database containerized and deployed to a cloud provider. Secrets managed via environment variables — never committed to source control.

### **2.5. Security**

| Practice | Implementation |
|----------|---------------|
| **Authentication** | JWT tokens validated on every authenticated request via a Spring Security filter chain |
| **Authorization** | Enforced at the use-case layer — guests can only access their own bookings (not just at the controller) |
| **Input validation** | All API inputs validated at the presentation layer before reaching use cases; errors return structured `ErrorResponse` with field-level details |
| **PCI compliance** | Card data never touches our servers — Stripe Elements tokenizes on the client; we only receive a `payment_intent_id` |
| **Webhook security** | Stripe webhook signature verified using `STRIPE_WEBHOOK_SECRET` before processing any payment events |
| **Secrets management** | All credentials in environment variables; `.env` files excluded from version control via `.gitignore` |
| **Structured logging** | No PII (card numbers, emails) written to logs; trace IDs enable request correlation without exposing sensitive data |
| **OWASP Top 10** | SQL injection prevented by parameterized R2DBC queries; XSS mitigated by React's default escaping; CSRF not applicable (JWT stateless API) |

### **2.6. Tests**

The testing strategy covers five layers aligned with the constitution's Testing Discipline principle. The project contains **51 backend test files**, **44 frontend test files**, and **1 Playwright E2E spec** covering 2 full booking journeys.

| Layer | Tool | Scope |
|-------|------|-------|
| **Unit** | JUnit 5 + MockK | Domain aggregates (Booking state transitions, pricing formula), use case logic with mocked ports |
| **Integration** | Testcontainers + Spring WebTestClient | Full HTTP stack (real PostgreSQL + PostGIS, real Spring Security/Jackson/CORS chain) via `AbstractApiIntegrationTest` base |
| **Contract** | Spring WebTestClient | API endpoint compliance against OpenAPI contracts in `specs/contracts/` |
| **E2E** | Playwright | Full booking journey (register → search → book → confirm) and trip cancellation flow; runs against real Docker-compose stack in CI |
| **Architecture** | ArchUnit | Layering rules enforced on every build — fails CI if any import crosses the dependency boundary |

**Example unit test — pricing formula:**
```kotlin
@Test
fun `calculates total with 12% service fee and zero tax`() {
    val price = PriceCalculator.calculate(
        nightlyRate = Money(100.EUR),
        nights = 3,
        cleaningFee = Money(30.EUR)
    )
    assertThat(price.subtotal).isEqualTo(Money(300.EUR))
    assertThat(price.serviceFee).isEqualTo(Money(36.EUR))  // 12% of 300
    assertThat(price.total).isEqualTo(Money(366.EUR))
}
```

**Example integration test — availability hold:**
```kotlin
@Test
fun `places 10-minute hold and prevents concurrent booking`() {
    // Given a property with available dates
    val hold = availabilityHoldRepository.createHold(propertyId, checkIn, checkOut, guestId)
    assertThat(hold.heldUntil).isAfter(Instant.now().plus(9, MINUTES))

    // When another guest queries the same dates
    val available = availabilityRepository.isAvailable(propertyId, checkIn, checkOut)
    assertThat(available).isFalse()
}
```

---

## 3. Data Model

### **3.1. Data model diagram:**

```mermaid
erDiagram
    GUEST ||--o{ BOOKING : "makes"
    PROPERTY ||--o{ BOOKING : "receives"
    PROPERTY ||--o{ AVAILABILITY : "has"
    PROPERTY ||--o{ AVAILABILITY_HOLD : "holds"
    PROPERTY ||--o{ REVIEW : "has"
    BOOKING ||--o| REVIEW : "generates"
    HOST ||--o{ PROPERTY : "owns"
    GUEST ||--o{ AVAILABILITY_HOLD : "creates"

    GUEST {
        uuid id PK
        string email UK "NOT NULL"
        string first_name "NOT NULL"
        string last_name "NOT NULL"
        string phone
        string avatar_url
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    HOST {
        uuid id PK
        string email UK "NOT NULL"
        string first_name "NOT NULL"
        string last_name "NOT NULL"
        string bio
        string avatar_url
        boolean is_verified "DEFAULT false"
        timestamp created_at "NOT NULL"
    }

    PROPERTY {
        uuid id PK
        uuid host_id FK "NOT NULL"
        string title "NOT NULL"
        text description "NOT NULL"
        string property_type "apartment|house|villa|cabin|studio"
        geography location "PostGIS POINT, NOT NULL"
        string city "NOT NULL"
        string region
        string country "NOT NULL"
        string address "NOT NULL"
        integer max_guests "NOT NULL, CHECK gt 0"
        integer bedrooms "NOT NULL, CHECK gte 0"
        integer bathrooms "NOT NULL, CHECK gt 0"
        decimal nightly_rate_eur "NOT NULL, CHECK gt 0"
        decimal cleaning_fee_eur "NOT NULL, CHECK gte 0"
        jsonb amenities "DEFAULT []"
        jsonb house_rules "DEFAULT []"
        jsonb photos "min 1 required"
        decimal avg_rating "CHECK 1.0-5.0"
        integer review_count "DEFAULT 0"
        boolean is_active "DEFAULT true"
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    AVAILABILITY {
        uuid id PK
        uuid property_id FK "NOT NULL"
        date date "NOT NULL"
        boolean is_available "DEFAULT true"
        string status "available|booked|blocked"
    }

    AVAILABILITY_HOLD {
        uuid id PK
        uuid property_id FK "NOT NULL"
        uuid guest_id FK "NOT NULL"
        date check_in "NOT NULL"
        date check_out "NOT NULL"
        timestamp held_until "NOT NULL"
        timestamp created_at "NOT NULL"
    }

    BOOKING {
        uuid id PK
        uuid property_id FK "NOT NULL"
        uuid guest_id FK "NOT NULL"
        string reference_number UK "NOT NULL"
        date check_in "NOT NULL"
        date check_out "NOT NULL"
        integer guest_count "NOT NULL, CHECK gt 0"
        integer nights "NOT NULL, CHECK gt 0"
        decimal nightly_rate_eur "snapshot, NOT NULL"
        decimal cleaning_fee_eur "snapshot, NOT NULL"
        decimal service_fee_eur "12pct of subtotal"
        decimal tax_eur "NOT NULL"
        decimal total_eur "NOT NULL"
        string status "confirmed|cancelled|completed"
        string stripe_payment_intent_id "NOT NULL"
        string cancellation_reason
        timestamp cancelled_at
        timestamp created_at "NOT NULL"
        timestamp updated_at "NOT NULL"
    }

    REVIEW {
        uuid id PK
        uuid booking_id FK "UK, NOT NULL"
        uuid property_id FK "NOT NULL"
        uuid guest_id FK "NOT NULL"
        integer rating "NOT NULL, CHECK 1-5"
        text comment
        timestamp created_at "NOT NULL"
    }
```

### **3.2. Description of main entities:**

**GUEST**
Represents a registered user who searches and books properties. Read-only for this feature — writes handled by the authentication bounded context. Key fields: `email` (unique), `first_name`, `last_name`. No FK dependencies within this feature.

**HOST**
Represents a property owner. Also a read model in this context. Notable field: `is_verified` flag shown on property listings to build guest trust.

**PROPERTY**
The central search entity. The `location` column uses PostgreSQL's PostGIS `geography` type (POINT), enabling spatial indexing via GiST for sub-second bounding-box queries. `photos`, `amenities`, and `house_rules` are stored as JSONB arrays. `avg_rating` and `review_count` are denormalized for fast search result rendering.

**AVAILABILITY**
Sparse table tracking date-level availability per property. One row per blocked/booked date — absence of a row means the date is available. Unique constraint on `(property_id, date)`.

**AVAILABILITY\_HOLD**
Temporary lock created when a guest initiates checkout. `held_until` is set to `NOW() + 10 minutes`. A scheduled cleanup job deletes expired rows every 5 minutes. Availability queries exclude dates covered by active holds.

**BOOKING**
The core transactional aggregate. Prices (`nightly_rate_eur`, `cleaning_fee_eur`, `service_fee_eur`) are snapshotted at creation time — the booking record always reflects the exact price the guest agreed to, regardless of subsequent host pricing changes. Lifecycle: `confirmed → cancelled` (guest cancels) or `confirmed → completed` (check-out date passes). No pending state — booking is instant upon payment success.

**REVIEW**
One review per booking (enforced by unique constraint on `booking_id`). Only creatable after booking status is `completed`. Stores first name only in query results to protect guest privacy.

---

## 4. API Specification

The full OpenAPI 3.1 contracts are in `specs/001-guest-search-booking/contracts/`. Below are the three primary endpoints.

### Endpoint 1 — Search Properties

```yaml
GET /api/v1/properties/search

Parameters:
  sw_lat, sw_lng, ne_lat, ne_lng  # Map viewport bounding box (required)
  check_in, check_out             # Date range in YYYY-MM-DD (required)
  guests                          # Number of guests (default: 1)
  min_price, max_price            # EUR nightly rate filter
  property_type                   # apartment | house | villa | cabin | studio
  bedrooms                        # Minimum bedrooms
  amenities[]                     # Required amenities (all must match)
  sort                            # relevance | price_asc | price_desc | rating
  page, size                      # Pagination (default: page=1, size=20)
```

**Example request:**
```
GET /api/v1/properties/search?sw_lat=41.3&sw_lng=2.1&ne_lat=41.5&ne_lng=2.3
  &check_in=2025-07-01&check_out=2025-07-07&guests=2&sort=price_asc
```

**Example response:**
```json
{
  "results": [
    {
      "id": "a1b2c3d4-...",
      "title": "Sunny apartment near Sagrada Família",
      "photo_url": "https://cdn.stayhub.com/photos/a1b2c3d4/main.jpg",
      "nightly_rate_eur": 85.00,
      "cleaning_fee_eur": 25.00,
      "location": { "lat": 41.403, "lng": 2.174, "city": "Barcelona", "country": "Spain" },
      "avg_rating": 4.8,
      "review_count": 42,
      "property_type": "apartment",
      "max_guests": 4,
      "bedrooms": 2
    }
  ],
  "pagination": { "page": 1, "size": 20, "total_results": 34, "total_pages": 2 }
}
```

---

### Endpoint 2 — Create Booking (Initiate Payment)

```yaml
POST /api/v1/bookings
Authorization: Bearer <JWT>

Body:
  property_id   # UUID (required)
  check_in      # YYYY-MM-DD (required)
  check_out     # YYYY-MM-DD (required)
  guest_count   # integer >= 1 (required)
```

**Example request:**
```json
{
  "property_id": "a1b2c3d4-e5f6-...",
  "check_in": "2025-07-01",
  "check_out": "2025-07-07",
  "guest_count": 2
}
```

**Example response (201 Created):**
```json
{
  "booking_id": "b9c8d7e6-...",
  "reference_number": "BK-20250517-X7K2M1",
  "price_breakdown": {
    "nights": 6,
    "nightly_rate_eur": 85.00,
    "subtotal_eur": 510.00,
    "cleaning_fee_eur": 25.00,
    "service_fee_eur": 61.20,
    "tax_eur": 0.00,
    "total_eur": 596.20
  },
  "stripe_client_secret": "pi_3abc...secret_xyz",
  "hold_expires_at": "2025-05-17T14:25:00Z"
}
```

---

### Endpoint 3 — Get Property Details

```yaml
GET /api/v1/properties/{propertyId}
```

**Example response (200 OK):**
```json
{
  "id": "a1b2c3d4-...",
  "title": "Sunny apartment near Sagrada Família",
  "description": "A bright 2-bedroom apartment...",
  "property_type": "apartment",
  "location": {
    "lat": 41.403, "lng": 2.174,
    "city": "Barcelona", "country": "Spain",
    "address": "Visible after booking"
  },
  "max_guests": 4,
  "bedrooms": 2,
  "bathrooms": 1,
  "nightly_rate_eur": 85.00,
  "cleaning_fee_eur": 25.00,
  "amenities": ["wifi", "air_conditioning", "kitchen", "washing_machine"],
  "house_rules": ["No smoking", "No pets", "Check-in after 15:00"],
  "photos": [
    { "url": "https://cdn.stayhub.com/photos/a1b2c3d4/1.jpg", "caption": "Living room" }
  ],
  "host": {
    "id": "h1i2j3k4-...",
    "first_name": "Maria",
    "avatar_url": "https://cdn.stayhub.com/avatars/h1i2j3k4.jpg",
    "is_verified": true
  },
  "avg_rating": 4.8,
  "review_count": 42
}
```

---

## 5. User Stories

### User Story 1 — Search Properties by Location and Dates (P1 · MVP)

> As a guest, I want to search for available properties by entering a destination and travel dates so I can find suitable accommodations for my trip.

**Acceptance criteria:**
1. **Given** a guest on the search page, **When** they enter a city and check-in/check-out dates, **Then** the system displays available properties for those dates on a map and in a results list.
2. **Given** search results are displayed, **When** the guest applies filters (price, guests, amenities), **Then** results update to show only matching properties.
3. **Given** no matching results, **When** the page renders, **Then** an empty state is shown with suggestions to broaden the search.
4. **Given** a large result set, **When** the guest scrolls, **Then** results are paginated (20 per page) without blocking the UI.

**Definition of Done:** Guest can find a relevant property within 3 search attempts for 90% of common destinations. Search results load in under 1 second (p95).

---

### User Story 2 — Complete a Booking (P3 · Core Transaction)

> As a guest, I want to book a property for my selected dates so I can secure my accommodation and receive a confirmation.

**Acceptance criteria:**
1. **Given** a guest on a property detail page with dates selected, **When** they click "Reserve", **Then** they see a checkout page with the full price breakdown and a Stripe payment form.
2. **Given** a guest on the checkout page, **When** they enter valid card details and confirm, **Then** the system creates a confirmed booking and displays a confirmation with a reference number.
3. **Given** two guests attempting the same dates simultaneously, **When** the first enters checkout, **Then** a 10-minute hold is placed on those dates — the second guest cannot book until the hold expires.
4. **Given** a successful payment, **When** the transaction completes, **Then** both guest and host receive email notifications.

**Definition of Done:** End-to-end booking flow completes in under 5 minutes. Double-booking rate is 0%.

---

### User Story 3 — Manage Bookings (P4 · Post-Booking)

> As a guest, I want to view my upcoming and past bookings so I can manage my travel plans and access booking details.

**Acceptance criteria:**
1. **Given** a logged-in guest, **When** they navigate to "My Trips", **Then** they see all bookings with property name, dates, status, and total cost.
2. **Given** a guest viewing an upcoming booking, **When** they select it, **Then** they see full details including property address, check-in instructions, and host contact.
3. **Given** a guest with a booking outside the 48-hour cancellation window, **When** they cancel, **Then** the system displays the refund amount and processes a full refund via Stripe.

**Definition of Done:** Booking list loads correctly for all statuses; cancellation correctly applies the platform policy and triggers a Stripe refund.

---

## 6. Work Tickets

### Ticket 1 — Backend: AbstractApiIntegrationTest — Shared Integration Test Harness

**Type:** Backend  
**Issue:** #130 / #132 (bugs caught by this harness)  
**User Story:** Cross-cutting — foundational for all backend integration tests

**Description:**  
`AbstractApiIntegrationTest` is the base class for all integration tests. It starts a shared Testcontainers PostgreSQL + PostGIS instance, loads the full Spring context (including security filter chain, Jackson serializers, and CORS config), and exposes a pre-configured `WebTestClient` to all subclasses.

The value of this harness is that it tests the real HTTP stack — not mocked controllers or mocked repositories. This is the layer that caught two real bugs:

- **Issue #130** (CORS 401 on preflight): browsers send an `OPTIONS` request before `POST /api/v1/bookings`. The CORS filter was rejecting it before the security chain could process it. Only caught when the real security config was loaded.
- **Issue #132** (Jackson serialization): `LocalDate` fields were serializing as arrays `[2025, 7, 1]` instead of `"2025-07-01"`. The `jackson-datatype-jsr310` module was present but the Spring Boot auto-configuration wasn't wiring it via the test context.

Neither bug would have been visible in unit tests with mocked Spring beans.

**Acceptance criteria:**
- A single `@SpringBootTest(webEnvironment = RANDOM_PORT)` with shared `@Container` (started once, reused across all tests)
- Flyway migrations applied before any test runs
- Subclasses get a `WebTestClient` with a pre-issued guest JWT for authenticated endpoints
- Each endpoint test class extends `AbstractApiIntegrationTest` with zero extra config

**Key files:**
- `backend/src/test/kotlin/com/stayhub/AbstractApiIntegrationTest.kt`
- `backend/src/test/kotlin/com/stayhub/booking/BookingControllerIntegrationTest.kt`
- `backend/src/test/kotlin/com/stayhub/property/PropertyControllerIntegrationTest.kt`

---

### Ticket 2 — Bug: Availability Calendar Shows Booked Dates as Available

**Type:** Bug Fix  
**Issue:** #156  
**User Story:** US2 — Complete a Booking

**Description:**  
The property detail page's availability calendar was showing all dates as selectable, even dates already booked by other guests or blocked by a host.

**Root cause:** `SearchPropertiesUseCase` was querying `availability` rows for `status = 'available'`, but `CreateBookingUseCase` was writing `BOOKING` rows without inserting corresponding `availability` rows marking the dates as `booked`. The two write paths were out of sync.

Additionally, the search endpoint was not filtering out properties that had no availability for the requested date range — it was returning them as visible results, and guests could attempt to book already-booked properties only to receive a 409 at checkout.

**Fix applied:**
- `CreateBookingUseCase`: after confirming a booking, writes `availability` rows for each booked date with `status = 'booked'`
- `SearchPropertiesUseCase`: adds a SQL filter to exclude properties where any requested date is `status != 'available'`
- Integration test added to verify that a booked property disappears from search results for the same dates

**Key files:**
- `backend/src/main/kotlin/com/stayhub/application/booking/CreateBookingUseCase.kt`
- `backend/src/main/kotlin/com/stayhub/application/search/SearchPropertiesUseCase.kt`
- `backend/src/test/kotlin/com/stayhub/search/SearchAvailabilityIntegrationTest.kt`

---

### Ticket 3 — Bug: React Strict Mode Double-Mount Hangs Booking Hold

**Type:** Bug Fix  
**Issue:** #166  
**User Story:** US2 — Complete a Booking

**Description:**  
Under React 18+ Strict Mode (active in local development), the checkout page was silently hanging — the booking hold was never created and the user saw an indefinite loading spinner.

**Root cause:** The checkout page created the availability hold by calling a `mutate()` function inside a `useEffect`. In React Strict Mode, effects are deliberately mounted, unmounted, and remounted once — so `mutate()` fired twice. The first call created the hold; the second call hit the API again with the same guest+dates and received a 409 `DATES_UNAVAILABLE` (the hold from the first call was still active). The second 409 set the component's error state, which never resolved.

**Fix applied:** Replaced the `useEffect + mutate()` pattern with a params-keyed `useQuery`. The booking hold creation is now triggered by the query key (property ID + dates + guest ID) rather than a mount effect. A query fires exactly once per unique key — React Strict Mode's double-mount does not fire the query twice because the cache already holds the result from the first invocation.

**Key files:**
- `frontend/src/app/booking/[id]/page.tsx`
- `frontend/src/services/bookingService.ts`
- Memory: `reference_mutate_in_effect_strictmode.md` (captures this pattern for future sessions)

---

## 7. Pull Requests

### Pull Request 1 — feat(e2e): Playwright booking-journey spec + Docker-compose CI stack (#145)

**What:** Adds the full end-to-end Playwright test suite (`booking-journey.spec.ts`) covering two critical journeys: (1) guest registers → searches Barcelona → opens a property → reserves → pays via mock stub → sees confirmation with a `BK-` reference number; (2) guest cancels a confirmed booking from My Trips and verifies the status becomes `cancelled`. Also wires the `e2e` CI job in GitHub Actions to boot the full stack with `docker compose -f docker-compose.yml -f docker-compose.e2e.yml` before running Playwright.

**Why:** Unit and integration tests cover the layers in isolation, but they don't catch wiring bugs between the frontend, backend, and database. The E2E spec was the first test to catch the React Strict Mode double-mount issue (#166) and the fact that the frontend payment form was calling the wrong API path under the E2E stub configuration. The CI job makes both issues visible on every PR without manual testing.

**Impact:** E2E tests run in CI on every push and PR. Later promoted to a required check (PR #176), meaning the branch cannot be merged if Playwright fails. `docker-compose.e2e.yml` sets `NEXT_PUBLIC_E2E=true` to bypass the real payment form and use a mock stub path.

**References:** Issues #144 (E2E spec), #147 (promote E2E to required check), #166 (Strict Mode bug found by E2E)

---

### Pull Request 2 — feat(trips): US4 Slice A — My Trips & cancellation backend (#149)

**What:** Implements the complete backend for US4: `GetMyTripsUseCase` (paginated list of bookings for the authenticated guest), `GetTripDetailsUseCase` (single booking with property details), and `CancelBookingUseCase` (validates the 48-hour cancellation policy, updates booking status to `cancelled`, inserts `availability` rows back to `available`, and triggers the mock refund via `PaymentService` port). Includes a `TripsController` in the presentation layer and full integration tests via `AbstractApiIntegrationTest`.

**Why:** US4 is the final user story in scope and the one that closes the booking lifecycle loop. Without cancellation, confirmed bookings never free up dates — the availability system would permanently mark dates as booked even if the guest cancelled.

**Impact:** New endpoints: `GET /api/v1/trips` (paginated), `GET /api/v1/trips/{bookingId}`, `POST /api/v1/trips/{bookingId}/cancel`. All require JWT authentication and enforce that the guest can only access their own bookings. The cancellation endpoint respects the 48-hour policy: requests within 48 hours of check-in return `422 CANCELLATION_NOT_ALLOWED`.

**References:** US4 — Manage Bookings, issue #148 (trips backend), issue #151 (cancellation policy enforcement)

---

### Pull Request 3 — fix(search): exclude unavailable properties; align booking with calendar (#173)

**What:** Fixes the two-part availability bug discovered via the Playwright E2E spec: (1) `SearchPropertiesUseCase` was returning properties that had existing bookings for the requested dates — they appeared in results but threw 409 at checkout. (2) `CreateBookingUseCase` was not writing `availability` rows after confirming a booking, so the property calendar showed all dates as available even after a confirmed booking existed.

**Why:** The search/booking split was a spec-time oversight — the search query and the booking write path were implemented in separate PRs without coordinating the availability row lifecycle. The E2E spec caught it because it books a property, returns to the search page, and then attempts to book the same dates — the second attempt should fail at the results level, not at checkout.

**Impact:** Search results now exclude properties with any `booked` or `blocked` availability row in the requested date range (SQL fix in `SearchPropertiesRepository`). Booking confirmation now inserts one `availability` row per booked date. Added a dedicated integration test class `SearchAvailabilityIntegrationTest` that seeds a booking and asserts the property disappears from search for those dates.

**References:** Issue #156 (calendar shows booked dates), issue #172 (search returns unavailable properties)
