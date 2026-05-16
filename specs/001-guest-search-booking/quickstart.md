# Quickstart: Guest Search and Booking

## Prerequisites

- **Docker** + Docker Compose (for PostgreSQL + PostGIS)
- **JDK 21+** (for Spring Boot 4 / Kotlin backend)
- **Node.js 20+** and pnpm (for Next.js frontend)
- **Stripe CLI** (for webhook testing in development)

## Environment Variables

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stayhub
DB_USER=stayhub
DB_PASSWORD=stayhub_dev

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

MAPBOX_ACCESS_TOKEN=pk.test_...

MAIL_HOST=localhost
MAIL_PORT=1025
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_MAPBOX_TOKEN=pk.test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Start Development Environment

```bash
# 1. Start infrastructure (PostgreSQL + PostGIS, MailHog)
docker compose up -d

# 2. Run backend (applies Flyway migrations automatically)
cd backend
./gradlew bootRun

# 3. In another terminal, start frontend
cd frontend
pnpm install
pnpm dev

# 4. (Optional) Start Stripe webhook forwarding
stripe listen --forward-to localhost:8080/api/v1/webhooks/stripe
```

## Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| API Docs (Swagger) | http://localhost:8080/swagger-ui.html |
| MailHog (email viewer) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

## Verify Setup

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Search endpoint (after seed data loads)
curl "http://localhost:8080/api/v1/properties/search?\
sw_lat=40.0&sw_lng=-4.0&ne_lat=41.0&ne_lng=-3.0&\
check_in=2025-06-01&check_out=2025-06-05"
```

## Sample Data

Flyway migration `V7__seed_sample_data.sql` loads:
- 3 sample hosts
- 15 sample properties across Barcelona, Madrid, and Lisbon
- Availability data for the next 90 days
- 5 sample bookings with reviews

## Running Tests

```bash
# Backend unit + integration tests
cd backend
./gradlew test

# Frontend unit tests
cd frontend
pnpm test

# Frontend E2E tests (requires running dev environment)
cd frontend
pnpm test:e2e
```

## Docker Compose Services

```yaml
# docker-compose.yml provides:
services:
  postgres:     # PostgreSQL 16 + PostGIS 3.4
  mailhog:      # Fake SMTP server for email testing
```

## Common Issues

- **PostGIS extension not found**: Ensure you use the `postgis/postgis:16-3.4`
  Docker image, not plain `postgres:16`.
- **Stripe webhooks not received**: Run `stripe listen` and copy the webhook
  signing secret to `STRIPE_WEBHOOK_SECRET`.
- **Map not loading**: Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set. For development,
  a free Mapbox account provides 50k loads/month.
- **Port 8080 in use**: Change backend port via `SERVER_PORT` env var or
  `application.yml`.
