# Research: Guest Search and Booking

**Date**: 2025-05-17
**Feature**: Guest Search and Booking

## Geospatial Search Strategy

**Decision**: PostgreSQL with PostGIS extension using bounding-box queries
(`ST_MakeEnvelope`) for viewport-based search.

**Rationale**: PostGIS is the industry standard for geospatial queries in
PostgreSQL. Bounding-box queries map directly to the map viewport UX
(sw_lat, sw_lng, ne_lat, ne_lng). Spatial indexing (GiST) ensures
sub-second query times for large datasets.

**Alternatives considered**:
- Elasticsearch with geo_bounding_box: Adds operational complexity of a
  second data store; overkill for v1 scale (< 100k properties).
- Application-level filtering: Poor performance, doesn't scale.
- H3/S2 geohash indexing: More complex, better for radius queries;
  bounding box is sufficient for viewport search.

## Availability Hold Mechanism

**Decision**: Database-level row with TTL tracked via a `held_until`
timestamp column on an `availability_hold` table. A scheduled job (or
lazy expiration check at query time) releases expired holds.

**Rationale**: Simple to implement, leverages existing PostgreSQL
infrastructure. The hold is just a row with an expiry — no external
cache or message broker needed. Availability queries check
`WHERE held_until IS NULL OR held_until < NOW()`.

**Alternatives considered**:
- Redis TTL keys: Adds infrastructure dependency; hold state must be
  durable (survives restarts), making Redis unreliable without
  persistence config.
- Optimistic locking only: Race condition between checkout start and
  payment completion; 10-min hold explicitly prevents this.
- PostgreSQL advisory locks: Don't survive connection drops; not
  suitable for multi-minute holds.

## Payment Integration (Stripe)

**Decision**: Stripe Payment Intents API with Stripe Elements on the
frontend for PCI-compliant card collection.

**Rationale**: Payment Intents handle the full payment lifecycle
(create → confirm → capture) and support SCA/3D Secure automatically.
Stripe Elements keeps card data off our servers (PCI SAQ-A compliance).

**Alternatives considered**:
- Stripe Checkout (hosted): Less control over UX; redirects away from
  our domain.
- PayPal: Lower developer experience; less suitable for recurring
  marketplace payments.
- Custom payment form + Stripe Tokens: Deprecated pattern; Payment
  Intents is the current recommended approach.

**Integration pattern**:
1. Frontend creates a booking intent (POST /api/bookings)
2. Backend creates Stripe PaymentIntent, returns `client_secret`
3. Frontend confirms payment via Stripe Elements
4. Stripe webhook notifies backend of payment success/failure
5. Backend transitions booking status to `confirmed`

## Map Library

**Decision**: Mapbox GL JS via `react-map-gl` wrapper.

**Rationale**: Best performance for interactive web maps with large
marker sets. Vector tiles render smoothly on pan/zoom. React wrapper
provides declarative component API matching Next.js patterns.

**Alternatives considered**:
- Leaflet + react-leaflet: Lighter weight but raster tiles are slower
  for dynamic viewport search. Less smooth interaction.
- Google Maps: Expensive at scale; vendor lock-in on geocoding too.
- OpenLayers: More complex API; better suited for GIS applications
  than consumer UIs.

**Fallback**: If Mapbox costs are a concern for MVP, Leaflet with
OpenStreetMap tiles is a zero-cost alternative with acceptable UX.

## Reactive Backend (R2DBC vs JDBC)

**Decision**: Spring Data R2DBC with Kotlin coroutines for non-blocking
database access.

**Rationale**: Spring Boot 4 + WebFlux + coroutines provides a clean
async programming model. R2DBC enables non-blocking DB queries which is
critical for the search endpoint (potentially slow geospatial queries
should not block threads). Kotlin coroutines make async code readable.

**Alternatives considered**:
- Traditional JDBC + Spring MVC: Simpler but thread-per-request model
  doesn't scale well for 500 concurrent search users with potentially
  slow geo queries.
- JDBC with virtual threads (Loom): Viable alternative in Java 21+;
  Spring Boot 4 supports this, but R2DBC aligns better with the
  reactive WebFlux model already chosen.

**Trade-off**: R2DBC has a smaller ecosystem (no Flyway native support
for R2DBC; migrations still run via JDBC). PostGIS support in R2DBC
requires manual SQL queries rather than Spring Data derived queries.

## Email Notifications

**Decision**: Spring Mail with Thymeleaf HTML templates, sent
asynchronously via coroutine dispatch.

**Rationale**: Simple, no external message broker needed for v1. Email
sending is fire-and-forget from the booking flow (doesn't block
confirmation response). Retry logic handles transient SMTP failures.

**Alternatives considered**:
- Dedicated email service (SendGrid, Mailgun): Better deliverability
  and analytics but adds external dependency and cost for MVP.
- Event-driven via Kafka/RabbitMQ: Overkill for v1; adds operational
  complexity.

## Geocoding Service

**Decision**: Mapbox Geocoding API (bundled with map tiles subscription).

**Rationale**: If using Mapbox GL for the map, geocoding is included in
the API plan. Provides forward geocoding (city name → coordinates) for
initial search, and the map viewport handles subsequent refinement.

**Alternatives considered**:
- Google Geocoding API: Separate billing; no advantage if already on
  Mapbox.
- Nominatim (OpenStreetMap): Free but rate-limited; quality varies by
  region.
- Photon: Self-hosted OSM geocoder; good for cost control but adds
  infrastructure.

## Frontend State Management

**Decision**: TanStack Query (React Query) for server state; React
context for minimal UI state (selected dates, guest count).

**Rationale**: Search and property data is server-driven (cache,
refetch on viewport change). TanStack Query handles caching,
background refetch, pagination, and loading states. No need for
Redux/Zustand for this feature scope.

**Alternatives considered**:
- Redux Toolkit + RTK Query: More boilerplate; RTK Query is comparable
  to TanStack Query but heavier.
- Zustand: Good for client state but doesn't replace server state
  management.
- SWR: Similar to TanStack Query but fewer features (no pagination
  utilities, less mature devtools).
