# MecaTrack API

NestJS REST API for MecaTrack workshop management (US-001: authentication, US-002: user management, US-003: client registration, US-004: vehicle registration).

## Prerequisites

- Node.js 20+
- Docker (PostgreSQL 16)

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh token signing (reserved) |
| `JWT_ACCESS_TTL` | Access token TTL (default `15m`) |
| `JWT_REFRESH_TTL` | Refresh token TTL (default `7d`) |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:3000`) |
| `NODE_ENV` | `development` or `production` |

## Local setup

From repository root:

```bash
docker compose up -d
```

From `apps/api`:

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

API base URL: `http://localhost:4000/api`

## Seed users (development only)

| Email | Password | Role |
|-------|----------|------|
| `admin@taller.com` | `AdminPass123` | ADMIN |
| `mechanic@taller.com` | `MechanicPass123` | MECHANIC |
| `inactive@taller.com` | `InactivePass123` | MECHANIC (inactive) |

## Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login; returns `accessToken` + sets `refreshToken` httpOnly cookie |
| `POST` | `/api/auth/refresh` | New access token from refresh cookie |
| `POST` | `/api/auth/logout` | Revoke refresh token (Bearer required) |
| `GET` | `/api/auth/me` | Current user profile (Bearer required) |

## User management (US-002, admin only)

All `/api/users` routes require a valid Bearer token with role `ADMIN`. Mechanics receive `403 Forbidden`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List all users (active first, then by name) |
| `POST` | `/api/users` | Create active employee (`ADMIN` or `MECHANIC`) |
| `PATCH` | `/api/users/:id/deactivate` | Soft-deactivate user and revoke refresh tokens |

Deactivated users cannot log in or refresh sessions. The last active administrator cannot be deactivated. Admins cannot deactivate their own account.

OpenAPI fragment: [`docs/api-spec.users.yml`](../../docs/api-spec.users.yml)

## Client management (US-003, admin and mechanic)

All `/api/clients` routes require a valid Bearer token with role `ADMIN` or `MECHANIC`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/clients/search?q=` | Search by name, national ID fragment, or phone digits |
| `GET` | `/api/clients/search?nationalId=` | Exact national ID lookup |
| `GET` | `/api/clients/:id` | Get client by ID |
| `POST` | `/api/clients` | Create a new client |
| `PATCH` | `/api/clients/:id` | Update client (`fullName`, `phone`, `email`; `nationalId` immutable) |

Search requires at least one of `q` or `nationalId`. Duplicate `nationalId` returns `409` with an `existingClient` object in the response body.

### Examples

```bash
# Search by name
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/clients/search?q=Juan"

# Create client
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"New Client","nationalId":"9-8765-4321","phone":"88881234"}' \
  http://localhost:4000/api/clients
```

OpenAPI fragment: [`docs/api-spec.clients.yml`](../../docs/api-spec.clients.yml)

## Vehicle management (US-004, admin and mechanic)

All `/api/vehicles` routes require a valid Bearer token with role `ADMIN` or `MECHANIC`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/vehicles/search?q=` | Search by license plate fragment |
| `GET` | `/api/vehicles/search?licensePlate=` | Exact plate lookup |
| `GET` | `/api/vehicles/:id` | Get vehicle with `currentOwner` |
| `GET` | `/api/vehicles/:id/history` | Visit history (`visits: []` until US-005) |
| `POST` | `/api/vehicles` | Create vehicle + initial ownership |
| `PATCH` | `/api/vehicles/:id` | Update vehicle (`licensePlate`, `brand`, `model`, `year`, `color`) |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle if no work orders (204) |

Plates are stored normalized (uppercase, no spaces). Duplicate plate returns `409` with `existingVehicle`. Create with unknown `clientId` returns `404`.

### Examples

```bash
# Search by plate
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/vehicles/search?licensePlate=ABC123"

# Create vehicle for existing client
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"licensePlate":"DEF456","brand":"Toyota","model":"Yaris","year":2021,"clientId":"CLIENT_UUID"}' \
  http://localhost:4000/api/vehicles
```

OpenAPI fragment: [`docs/api-spec.vehicles.yml`](../../docs/api-spec.vehicles.yml)

## Seed clients (development only)

| Name | National ID | Phone | Email |
|------|-------------|-------|-------|
| Juan Pérez | `1-2345-6789` | `88887777` | `juan@email.com` |
| María López | `2-3456-7890` | `77776666` | — |
| Carlos Ruiz | `3-4567-8901` | — | `carlos@email.com` |

## Seed vehicles (development only)

| Plate | Brand | Model | Year | Owner |
|-------|-------|-------|------|-------|
| `ABC123` | Toyota | Corolla | 2018 | Juan Pérez |
| `XYZ789` | Honda | Civic | 2020 | María López |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with watch mode |
| `npm run build` | Compile TypeScript |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests (requires PostgreSQL) |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:seed` | Seed database |

## Database port

Docker maps PostgreSQL to host port **5434** (to avoid conflicts with local PostgreSQL on 5432/5433).
