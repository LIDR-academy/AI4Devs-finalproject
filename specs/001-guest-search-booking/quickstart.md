# Quickstart: Guest Search and Booking

## Prerequisites

- **Docker** + Docker Compose (for PostgreSQL + PostGIS)
- **JDK 21+** (for the Spring Boot / Kotlin backend)
- **Node.js 20+** (for the Next.js frontend — uses `npm`, not pnpm)

## Environment Variables

Create `backend/.env`. The file is loaded automatically by Spring via
`spring.config.import=optional:file:./.env[.properties]` — so it must use
plain Java properties syntax: `KEY=VALUE` lines only, no `export`, no
quoted values, no shell-style interpolation.

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=stayhub
POSTGRES_USER=stayhub
POSTGRES_PASSWORD=stayhub_dev

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

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080

# Set NEXT_PUBLIC_E2E=true to use the mock payment path (no real Stripe needed).
# Payments are demo-only — clicking "Pay" auto-succeeds via the backend stub.
NEXT_PUBLIC_E2E=true
```

**Mapbox token:** the map requires a public Mapbox token (`pk.…`). Add it to
your shell profile so it is never committed:

```bash
# Add to ~/.zshenv (sourced by all zsh sessions, including non-interactive)
export NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_token_here"
```

Get a free token at <https://account.mapbox.com/access-tokens/> (50k map
loads/month, no card required). Open a new terminal after adding it.

## Start Development Environment

```bash
# 1. Start infrastructure (PostgreSQL + PostGIS, Mailpit)
docker compose up -d

# 2. Run backend (applies Flyway migrations automatically)
backend/gradlew -p backend bootRun

# 3. In another terminal, start frontend
npm --prefix frontend install
npm --prefix frontend run dev
```

## Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| API Docs (Swagger) | http://localhost:8080/swagger-ui.html |
| Mailpit (email viewer) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

## Verify Setup

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Search endpoint — Barcelona bbox, future dates
curl "http://localhost:8080/api/v1/properties/search?sw_lat=41.30&sw_lng=2.05&ne_lat=41.47&ne_lng=2.25&check_in=2026-08-01&check_out=2026-08-05"
```

## End-to-End Booking Flow

1. Open http://localhost:3000 (redirects to `/search`)
2. Search a city (Barcelona, Madrid, Sevilla, or Lisbon) and pick dates
3. Click a property card → property detail page
4. Select dates in the calendar → click **Reserve**
5. Log in or register when prompted
6. On checkout, click **Pay** — the mock payment auto-succeeds
7. Confirmation page shows your booking reference
8. Visit **My Trips** to see the booking; you can cancel it there

No real payment card is needed. Payments use a backend stub adapter that
auto-succeeds (no Stripe integration).

## Sample Data

Flyway migrations V7–V12 seed:
- 3 sample hosts
- **120 properties** across Barcelona, Madrid, Sevilla, and Lisbon (30 per city)
  with curated real interior photos
- Availability data for the next 90 days
- 5 sample bookings with reviews

## Running Tests

```bash
# Backend unit + integration tests
backend/gradlew -p backend test

# Frontend unit tests
npm --prefix frontend run test

# Frontend E2E tests (requires running dev environment)
npm --prefix frontend run test:e2e
```

## Docker Compose Services

```yaml
# docker-compose.yml provides:
services:
  postgres:     # PostgreSQL 16 + PostGIS 3.4
  mailpit:      # Fake SMTP server for email testing (replaces MailHog; multi-arch, actively maintained)
```

## Common Issues

- **PostGIS extension not found**: Ensure you use the `postgis/postgis:16-3.4`
  Docker image, not plain `postgres:16`.
- **Map not loading**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is exported in your
  shell profile (`~/.zshenv`) and you opened a new terminal after adding it.
- **Port 8080 in use**: Change the backend port via `SERVER_PORT` env var or
  `application.yml`.
- **`JWT_SECRET` too short**: The backend refuses to start if the secret is
  under 32 characters. Generate one with `openssl rand -base64 48`.
