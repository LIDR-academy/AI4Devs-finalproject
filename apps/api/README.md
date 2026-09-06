# MecaTrack API

NestJS REST API for MecaTrack workshop management (US-001: authentication, US-002: user management, US-003: client registration, US-004: vehicle registration, US-005: work order creation, US-006: work order task management, US-007: technical notes, US-008: delivery panel, US-009: vehicle and client history, US-D4: maintenance reminders, US-O1: health probes, US-O2: Prometheus metrics).

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

## Health probes (US-O1)

Public ops endpoints (no JWT). Custom lightweight Nest module (not `@nestjs/terminus`).
Readiness uses the existing Prisma connection pool with a ~2.5s timeout; failures never leak connection strings or stack traces.

| Method | Path | Meaning | Database |
|--------|------|---------|----------|
| `GET` | `/api/health/live` | Process is running | Not queried |
| `GET` | `/api/health/ready` | Ready for traffic | `SELECT 1` via Prisma |

| Ready outcome | HTTP | Body |
|---------------|------|------|
| Healthy | `200` | `{ "status": "ok", "checks": { "database": "up" } }` |
| Unhealthy | `503` | `{ "status": "error", "checks": { "database": "down" } }` |

```bash
curl http://localhost:4000/api/health/live
curl http://localhost:4010/api/health/ready
```

Use these probes from Docker Compose / orchestration and (later) Prometheus/Grafana. Prefer **ready** for traffic readiness and **live** for process liveness so a DB outage can mark the instance unready without immediately killing the process.

OpenAPI fragment: [`docs/api-spec.health.yml`](../../docs/api-spec.health.yml)

## Metrics (US-O2)

Public Prometheus exposition (no JWT). Uses `prom-client` with HTTP RED metrics and default Node process metrics (`mecatrack_` prefix). A global HTTP metrics **middleware** records requests on response `finish`; **`/api/metrics` itself is excluded** from HTTP RED counters/histograms to avoid scrape noise.

| Method | Path | Content-Type |
|--------|------|--------------|
| `GET` | `/api/metrics` | Prometheus text exposition (`text/plain`) |

| Metric | Type | Labels |
|--------|------|--------|
| `mecatrack_http_requests_total` | Counter | `method`, `route`, `status_code` |
| `mecatrack_http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` |
| `mecatrack_*` (defaults) | process/Node | via `collectDefaultMetrics` |

**Label policy:** `route` uses Nest path templates (e.g. `/api/work-orders/:id`). Unknown paths use `unmatched`. Never put UUIDs, license plates, emails, tokens, or request bodies in labels.

```bash
# DEV (typical host port)
curl http://localhost:4010/api/metrics

# Docker Compose internal scrape target (US-O3)
# http://api:4000/api/metrics
```

Do **not** publish a dedicated host port only for metrics in production; scrape on the Docker network. Do not expose `/api/metrics` on the public internet without network restriction.

OpenAPI fragment: [`docs/api-spec.metrics.yml`](../../docs/api-spec.metrics.yml)

## Seed users (development only)

| Email | Password | Role |
|-------|----------|------|
| `admin@taller.com` | `AdminPass123` | ADMIN |
| `mechanic@taller.com` | `MechanicPass123` | MECHANIC |
| `inactive@taller.com` | `InactivePass123` | MECHANIC (inactive) |

## Auth endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/login` | Login; returns `accessToken` + sets `refreshToken` httpOnly cookie. Native clients send `X-MecaTrack-Client: mobile` to also receive `refreshToken` in JSON |
| `POST` | `/api/auth/refresh` | New access token from refresh cookie, or `{ "refreshToken" }` in the body for native apps |
| `POST` | `/api/auth/logout` | Revoke refresh token (Bearer required) |
| `GET` | `/api/auth/me` | Current user profile (Bearer required) |

## User management (US-002, admin only)

All `/api/users` routes require a valid Bearer token with role `ADMIN`. Mechanics receive `403 Forbidden`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/users` | List all users (active first, then by name); includes `canActAsMechanic` |
| `POST` | `/api/users` | Create active employee (`ADMIN` or `MECHANIC`); optional `canActAsMechanic` |
| `PATCH` | `/api/users/:id` | Partial update (`fullName`, `email`, `role`, `password`, `canActAsMechanic`) — US-D6 |
| `PATCH` | `/api/users/:id/deactivate` | Soft-deactivate user and revoke refresh tokens |

Deactivated users cannot log in or refresh sessions. The last active administrator cannot be deactivated. Admins cannot deactivate their own account.

**US-D6 — edit users:** `PATCH /api/users/:id` requires at least one field. Inactive users return `409`. Duplicate email returns `409`. Demoting the last active admin returns `400`. Changing `password` or `role` clears refresh tokens (full access-token `sessionVersion` revocation is US-012). Name/email/`canActAsMechanic`-only updates do not clear refresh tokens.

**US-D8 — admin as mechanic:** `canActAsMechanic` defaults to `false`. When `role = MECHANIC`, the flag is always stored as `false`. When `role = ADMIN` and the flag is `true`, that admin appears in `GET /api/work-orders/mechanics` and may be assigned on `POST /api/work-orders`. The flag does not change RBAC (admin routes stay admin-only).

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
| `GET` | `/api/vehicles/:id/history` | Visit history from work orders |
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

## Work order management (US-005, admin and mechanic)

All `/api/work-orders` routes require a valid Bearer token with role `ADMIN` or `MECHANIC`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/work-orders/mechanics` | List assignable users: active `MECHANIC` + active `ADMIN` with `canActAsMechanic` (includes `role`) |
| `GET` | `/api/work-orders/active?vehicleId=` | Active work order for vehicle (or `null`) |
| `GET` | `/api/work-orders/in-progress` | Paginated active OTs for dashboards (US-D10); ADMIN=all, MECHANIC=assigned only (`limit`/`offset`) |
| `POST` | `/api/work-orders` | Create work order + initial tasks (transactional); `mileage` optional; `intakeMode` `OWNER` (default) or `THIRD_PARTY` with `broughtByName` (+ optional `broughtByPhone`) |
| `GET` | `/api/work-orders/:id` | Work order detail with tasks, `totalAmount`, `assignedMechanic`, nullable `owner`, `broughtBy*`, derived `intakeMode` |
| `PATCH` | `/api/work-orders/:id/link-owner` | Link a client to an ownerless work order (US-D9); never silently transfers vehicle ownership |
| `PATCH` | `/api/work-orders/:id/mileage` | Update mileage (`number` ≥ 0 or `null`); MECHANIC forbidden on `ENTREGADA` |
| `POST` | `/api/work-orders/:workOrderId/tasks` | Add task (`EN_PROCESO` only) |
| `PATCH` | `/api/work-orders/:workOrderId/tasks/:taskId` | Update task status / complete with cost |
| `PATCH` | `/api/work-orders/:workOrderId/tasks/:taskId/technical-notes` | Update task diagnosis/repair/parts/notes |
| `PATCH` | `/api/work-orders/:workOrderId/visit-notes` | Update visit-level technical notes |

Business rules:

- `mileage` on work orders is nullable (US-D7); omit or send `null` on create when odometer is unknown.
- **US-D9 — ownerless / third-party intake:** `POST /api/vehicles` may omit `clientId` (no ownership). `POST /api/work-orders` with `intakeMode: THIRD_PARTY` requires `broughtByName`, leaves `ownerClientId` null, and does not use vehicle ownership. `PATCH /api/work-orders/:id/link-owner` associates a client later. Delivery `mark-contacted` returns `409` when there is no owner; deliver still works without an owner.
- `ownerClientId` is snapshotted from the vehicle's current owner at check-in.
- `createdById` comes from the JWT — never from the request body.
- Duplicate active work order returns `409` with `activeWorkOrderId` in the response.
- Task mutations allowed only when work order status is `EN_PROCESO`.
- Completing a task requires `cost` ≥ 0; optional `costNotes`.
- When all tasks are `COMPLETED`, work order auto-transitions to `LISTA_PARA_ENTREGA`.
- `totalAmount` = sum of completed task costs (0 if none).
- Technical notes (US-007): editable only when WO is `EN_PROCESO`; task notes not editable when task is `COMPLETED`.
- Technical note fields max 5000 characters; `null` or empty string clears a field; omitted fields unchanged on PATCH.
- Technical notes do not block task completion (US-006).

### Examples

```bash
# List mechanics
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/work-orders/mechanics

# Check active work order for vehicle
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/work-orders/active?vehicleId=VEHICLE_UUID"

# Create work order
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"VEHICLE_UUID","entryReason":"Oil change and inspection","mileage":45000,"initialTasks":[{"description":"Change engine oil"}]}' \
  http://localhost:4000/api/work-orders

# Add task to work order
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Rotate tires"}' \
  http://localhost:4000/api/work-orders/WORK_ORDER_UUID/tasks

# Complete task with cost
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"COMPLETED","cost":85.50,"costNotes":"Includes labor"}' \
  http://localhost:4000/api/work-orders/WORK_ORDER_UUID/tasks/TASK_UUID

# Update task technical notes
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"diagnosis":"Worn pads","repairPerformed":"Replaced front pads","partsUsed":"Pad kit"}' \
  http://localhost:4000/api/work-orders/WORK_ORDER_UUID/tasks/TASK_UUID/technical-notes

# Update visit-level notes
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"visitDiagnosis":"General inspection","visitRepairSummary":"Brake service"}' \
  http://localhost:4000/api/work-orders/WORK_ORDER_UUID/visit-notes
```

> **Note:** The readme `task-notes` logical module is implemented as `work-order-technical-notes` inside the `work-orders` Nest module.

OpenAPI fragment: [`docs/api-spec.work-orders.yml`](../../docs/api-spec.work-orders.yml)

## Maintenance reminders (US-D4, admin only)

ADMIN-only module to list vehicles due for preventive outreach and batch-send reminder emails via shared `EmailPort` (console adapter). No schema migration — uses existing `Vehicle` reminder columns.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/reminders/eligible` | Paginated eligible list (`limit`/`offset`; dashboard uses `limit=5`) |
| `POST` | `/api/reminders/send` | Batch send (partial success `200`) |
| `POST` | `/api/reminders/:vehicleId/opt-out` | Exclude from reminders |
| `POST` | `/api/reminders/:vehicleId/opt-in` | Clear exclusion |
| `GET` | `/api/reminders/opted-out` | Manage exclusions |

| Env | Default | Purpose |
|-----|---------|---------|
| `REMINDER_INACTIVE_DAYS` | `180` | Days since last `ENTREGADA` delivery |
| `EMAIL_ENABLED` | `false` | Master switch for sending |
| `EMAIL_PROVIDER` | `console` | Console adapter (SMTP deferred to US-D2) |
| `WORKSHOP_NAME` / `WORKSHOP_PHONE` / `WORKSHOP_ADMIN_EMAIL` | — | Template + CC |

OpenAPI: [`docs/api-spec.reminders.yml`](../../docs/api-spec.reminders.yml)

## Delivery panel (US-008, admin only)

All `/api/delivery` routes require a valid Bearer token with role `ADMIN`. Mechanics receive `403 Forbidden`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/delivery/ready` | List `LISTA_PARA_ENTREGA` + `OWNER_CONTACTED` with contact audit fields |
| `GET` | `/api/delivery/ready/:workOrderId` | Detail for panel row (either ready status) |
| `PATCH` | `/api/delivery/ready/:workOrderId/mark-contacted` | `LISTA_PARA_ENTREGA` → `OWNER_CONTACTED`; sets `ownerContactedAt` + actor (US-D1) |
| `PATCH` | `/api/delivery/ready/:workOrderId/deliver` | Mark `ENTREGADA` from either panel status; optional body `{ "mileage": number }` |

Business rules:

- Panel lists both ready statuses; items include `status`, `ownerContactedAt`, `ownerContactedBy`.
- `ownerPhone` is always present in list items (nullable when client has no phone); sourced from `ownerClient` snapshot at check-in.
- `totalAmount` reuses `calculateTotalAmount` from work-orders (sum of completed task costs).
- `elapsedLabel` is a Spanish human-readable duration since `checkedInAt`.
- Second `mark-contacted` → `409` `Owner already contacted` (audit not overwritten).
- Deliver allowed without contacting first; from `OWNER_CONTACTED` preserves contact fields.
- `OWNER_CONTACTED` is an **active** work order (blocks a second OT for the same vehicle).
- After delivery, vehicle is released for a new active work order (US-005).
- Mileage on deliver is optional (US-D7); never required to close delivery.

### Examples

```bash
# List ready for delivery
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/delivery/ready

# Sort by total amount descending
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:4000/api/delivery/ready?sort=totalAmount&order=desc"

# Get detail
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/delivery/ready/WORK_ORDER_UUID

# Mark owner contacted
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/delivery/ready/WORK_ORDER_UUID/mark-contacted

# Mark delivered
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/delivery/ready/WORK_ORDER_UUID/deliver
```

OpenAPI fragment: [`docs/api-spec.delivery.yml`](../../docs/api-spec.delivery.yml)

## History (US-009, admin and mechanic)

Read-only consolidated history endpoints. No mutation routes in the `history` module.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/vehicles/:id/history` | Full visit timeline with tasks, notes, amounts, owner snapshots |
| `GET` | `/api/clients/:id` | Client profile + active vehicles + last visit summary |

### Vehicle history contract

- Includes **all** work order statuses (`EN_PROCESO`, `LISTA_PARA_ENTREGA`, `OWNER_CONTACTED`, `ENTREGADA`).
- Visits ordered by `checkedInAt` DESC.
- `ownerAtVisit` comes from `ownerClientId` snapshot at check-in — **not** the vehicle's current owner (D3 integrity).
- `currentOwner` reflects active `VehicleOwnership` (`validTo IS NULL`).
- `statusLabel` is Spanish; `status` remains the enum value.
- `totalAmount` per visit uses `calculateTotalAmount` (sum of completed task costs).
- Empty history returns `{ visits: [], total: 0 }` with `200`.

### Client profile extension

`GET /api/clients/:id` now includes `vehicles[]` with `lastVisitAt` and `lastVisitStatus` per active vehicle (ownership `validTo IS NULL`). Sold/transferred vehicles are excluded from the client profile; access their history via vehicle plate search.

### Examples

```bash
# Full vehicle visit timeline
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/vehicles/VEHICLE_UUID/history

# Client profile with owned vehicles
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/api/clients/CLIENT_UUID
```

OpenAPI fragment: [`docs/api-spec.history.yml`](../../docs/api-spec.history.yml)

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
