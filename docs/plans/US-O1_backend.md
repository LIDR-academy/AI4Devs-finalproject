# Backend Implementation Plan: US-O1 Health Checks (Liveness / Readiness)

## Overview

Add a NestJS **Health** module that exposes public ops probes under the global prefix `api`:

| Endpoint | Meaning | DB |
|----------|---------|-----|
| `GET /api/health/live` | Process is up | **No** Prisma |
| `GET /api/health/ready` | API can serve traffic | `SELECT 1` via existing `PrismaService` pool |

**Architecture principles:** Controllers → Services → Prisma (Nest modular monolith); TDD; English JSON keys/messages; no JWT on probes; prefer a **lightweight custom module** over `@nestjs/terminus` for MVP (document choice in PR).

**User story reference:** [`us/monitoreo y observabilidad/US-O1-health-readiness-liveness.md`](../../us/monitoreo%20y%20observabilidad/US-O1-health-readiness-liveness.md)

**Base branch:** `finalproject-RFM`  
**Implementation branch (required):** `feature/US-O1-backend`

**Prerequisites:** Nest API + Prisma (`US-001`); `PrismaModule` already available for feature imports.

**Out of scope:** `/api/metrics` (US-O2), Prometheus/Grafana containers (US-O3/O4), alert rules (US-O5), Next.js web health, deep checks (disk, email, Redis), JWT on probes, Compose `healthcheck` on `api` (optional follow-up in US-O3).

---

## Architecture Context

### Layers

| Layer | Responsibility | US-O1 artifacts |
|-------|----------------|-----------------|
| **Presentation** | HTTP routes, status codes, response DTOs | `HealthController` |
| **Application** | Live always-ok; ready orchestrates DB check + timeout | `HealthService` |
| **Domain** | Minimal — status literals `ok` / `error`, check keys | DTO types / constants |
| **Infrastructure** | Existing Prisma client pool | `PrismaService.$queryRaw` |

Auth note: `JwtAuthGuard` is **not** global. Controllers without `@UseGuards` are already public (same pattern as unauthenticated login). Do **not** add JWT to health.

### Files to add/modify

```
apps/api/src/modules/health/
├── health.module.ts                 # NEW
├── health.controller.ts             # NEW — GET live, GET ready
├── health.service.ts                # NEW — checkDatabase + ready aggregation
├── health.service.spec.ts           # NEW — TDD
├── health.controller.spec.ts        # NEW — optional but recommended
└── dto/
    ├── health-live-response.dto.ts  # NEW
    └── health-ready-response.dto.ts # NEW

apps/api/src/app.module.ts           # import HealthModule
apps/api/test/health.e2e-spec.ts     # NEW
apps/api/README.md                   # document probes
docs/api-spec.health.yml             # NEW (ops OpenAPI fragment)
```

### API contracts

#### `GET /api/health/live`

- **Auth:** none  
- **200:** `{ "status": "ok" }`
- Must not call Prisma.

#### `GET /api/health/ready`

- **Auth:** none  
- **200** (DB up): `{ "status": "ok", "checks": { "database": "up" } }`
- **503** (DB down / timeout / query error): `{ "status": "error", "checks": { "database": "down" } }`
- Return **503** with the exact JSON above via `@Res()` (see Step 4 — `HttpExceptionFilter` strips custom fields from `HttpException` bodies).
- Body must **never** include `DATABASE_URL`, stack traces, table names, or Prisma error codes.

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** Create and switch to the backend feature branch. Do not implement Nest work only on the epic umbrella branch.
- **Branch naming:** `feature/US-O1-backend` (required).
- **Implementation steps:**
  1. `git fetch origin`
  2. `git checkout finalproject-RFM` and `git pull origin finalproject-RFM`
  3. `git checkout -b feature/US-O1-backend`
  4. `git branch` — confirm current branch
- **Notes:** First step before any code changes. Aligns with `docs/backend-standards.mdc` (feature branches with `-backend` suffix).

---

### Step 1: Write Unit Tests for `HealthService` (TDD — Red)

- **File:** `apps/api/src/modules/health/health.service.spec.ts`
- **Action:** Fail-first tests with mocked `PrismaService`.
- **Function signatures under test:**

```typescript
checkDatabase(): Promise<'up' | 'down'>;
getLiveStatus(): { status: 'ok' };
getReadyStatus(): Promise<{ status: 'ok' | 'error'; checks: { database: 'up' | 'down' } }>;
```

- **Implementation steps:**
  1. Mock `prisma.$queryRaw` resolving → `checkDatabase` returns `'up'`; ready → `{ status: 'ok', checks: { database: 'up' } }`.
  2. Mock `$queryRaw` rejecting → `'down'` / ready `status: 'error'`.
  3. Assert rejected Prisma errors are swallowed (no raw error leaked).
  4. Assert `getLiveStatus` never touches Prisma (spy not called).
  5. Optional: timeout path with fake timers (~2–3s hang → `'down'`).
- **Dependencies:** Jest mocks; construct service like `clients.service.spec.ts` (`prisma as unknown as PrismaService`).

---

### Step 2: Implement `HealthService` (Green)

- **File:** `apps/api/src/modules/health/health.service.ts`
- **Action:** Implement DB check using the **existing** Prisma pool (no new connections per request).
- **Function signature:**

```typescript
@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}
  getLiveStatus(): HealthLiveResponseDto;
  async getReadyStatus(): Promise<HealthReadyResponseDto>;
  private async checkDatabase(): Promise<'up' | 'down'>;
}
```

- **Implementation steps:**
  1. Inject `PrismaService`.
  2. `checkDatabase`: `await this.prisma.$queryRaw\`SELECT 1\`` in try/catch; success → `'up'`; failure → `'down'`.
  3. Wrap with timeout (~2500ms) via `Promise.race`; clear timer in `finally`.
  4. `getReadyStatus`: map check to DTO; do not log PII or Prisma internals.
  5. `getLiveStatus`: return `{ status: 'ok' }` synchronously.
- **Dependencies:** `@nestjs/common`, `PrismaService` from `../../prisma/prisma.service`.
- **Implementation notes:** Prefer tagged `$queryRaw\`SELECT 1\``; never `$queryRawUnsafe` with external input.

---

### Step 3: DTOs

- **Files:**
  - `apps/api/src/modules/health/dto/health-live-response.dto.ts`
  - `apps/api/src/modules/health/dto/health-ready-response.dto.ts`
- **Shapes:**

```typescript
export class HealthLiveResponseDto {
  status: 'ok';
}

export class HealthReadyResponseDto {
  status: 'ok' | 'error';
  checks: { database: 'up' | 'down' };
}
```

- **Implementation notes:** English keys; stable for Compose/Prometheus consumers.

---

### Step 4: Controller + Module

- **Files:** `health.controller.ts`, `health.module.ts`
- **Controller signature:**

```typescript
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  getLive(): HealthLiveResponseDto;

  @Get('ready')
  async getReady(): Promise<HealthReadyResponseDto>; // HTTP 503 when status === 'error'
}
```

- **Implementation steps:**
  1. `@Controller('health')` → `/api/health/*` via global prefix in `main.ts`.
  2. **No** `@UseGuards(JwtAuthGuard)`.
  3. **Critical:** `HttpExceptionFilter` rewrites `HttpException` bodies to `{ statusCode, message, error }` and drops arbitrary fields. For ready **503**, do **not** rely on `ServiceUnavailableException` alone — use `@Res()` to `response.status(503).json({ status: 'error', checks: { database: 'down' } })`, **or** extend the filter with an allow-list for health probe fields (prefer `@Res()` for minimal blast radius).
  4. Happy-path ready: return DTO normally (200).
  5. `HealthModule`: providers + controller only. `PrismaModule` is already `@Global()` — no extra import required (same as `ClientsModule` / `WorkOrdersModule`).
- **Dependencies:** Nest HTTP decorators; global `PrismaService`.

---

### Step 5: Register in `AppModule`

- **File:** `apps/api/src/app.module.ts`
- **Action:** Add `HealthModule` to `imports` (after `PrismaModule`).

---

### Step 6: Controller Specs

- **File:** `health.controller.spec.ts` (recommended)
- **Action:** Mock `HealthService`; live ok; ready ok; ready error → `ServiceUnavailableException` with expected body.

---

### Step 7: E2E Tests

- **File:** `apps/api/test/health.e2e-spec.ts`
- **Action:** Bootstrap like `auth.e2e-spec.ts` (`AppModule`, `setGlobalPrefix('api')`, pipes, `HttpExceptionFilter`). No login.
- **Cases:**
  1. `GET /api/health/live` → 200, `{ status: 'ok' }`.
  2. `GET /api/health/ready` → 200 with migrated test DB, `checks.database === 'up'`.
  3. Override `PrismaService.$queryRaw` to reject → ready 503 + `status: 'error'`.
- **Implementation notes:** Prefer provider override for 503 (do not stop Docker Postgres in CI). Manual stop-Postgres check stays in checklist.

---

### Step 8: Run Tests Green

- From `apps/api`:
  - `npm test -- health.service.spec`
  - `npm test -- health.controller.spec` (if present)
  - `npm run test:e2e -- health.e2e-spec`

---

### Step 9: Update Technical Documentation

- **Action:** Mandatory docs (English).
- **Implementation steps:**
  1. Review: new public GET endpoints; no Prisma schema change.
  2. Update:
     - `apps/api/README.md` — live vs ready table, curl examples, Docker/Prometheus note.
     - `docs/api-spec.health.yml` — paths + 200/503 schemas.
  3. Verify contracts match code.
  4. List updated files in PR description.
- **References:** `docs/documentation-standards.mdc`

---

## Implementation Order

1. Step 0 — Create `feature/US-O1-backend`
2. Step 1 — Red: `health.service.spec.ts`
3. Step 2 — Green: `HealthService`
4. Step 3 — DTOs
5. Step 4 — Controller + Module (+ 503 mapping)
6. Step 5 — `AppModule` import
7. Step 6 — Controller specs
8. Step 7 — E2E
9. Step 8 — Tests green
10. Step 9 — Documentation

---

## Testing Checklist

- [ ] Unit: DB up / down / live never hits Prisma
- [ ] Controller: ready error → 503 shape
- [ ] E2E: live 200 without JWT
- [ ] E2E: ready 200 with test DB
- [ ] E2E/override: ready 503
- [ ] Manual (optional): stop Postgres → ready 503, live 200
- [ ] No secrets/stack in response body
- [ ] README + OpenAPI updated

---

## Error Response Format

**Ready unhealthy (US contract):**

```json
{
  "status": "error",
  "checks": { "database": "down" }
}
```

HTTP **503**.

Do not throw bare `ServiceUnavailableException` expecting `{ status, checks }` to survive — the global filter only forwards a few business fields. Use `@Res()` for the 503 body and document the final JSON in README.

**Live:** only 200 when process responds; crash = connection refused.

---

## Partial Update Support

Not applicable.

---

## Dependencies

| Package | Change |
|---------|--------|
| Existing Nest + Prisma | Reuse |
| `@nestjs/terminus` | **Do not add** for MVP unless PR documents alternative |

No new npm dependencies for preferred MVP.

---

## Notes

- English-only for code, logs, docs, error keys.
- Reuse `PrismaService` pool — do not open a second `PrismaClient`.
- Ready timeout avoids hung probes when DB is unreachable.
- Live vs ready prevents unnecessary container kills when only DB is down.
- US-O2 metrics interceptor must not break probes.

---

## Next Steps After Implementation

1. Merge `feature/US-O1-backend` → `finalproject-RFM` (or open PR).
2. Implement **US-O2** (`feature/US-O2-backend`) for `/api/metrics`.
3. US-O3 may add Compose `healthcheck` on `api` using `/api/health/ready`.

---

## Implementation Verification

- [ ] Code quality: typed, module-scoped, no secrets in responses
- [ ] Functionality: live/ready contracts match US-O1
- [ ] Testing: unit + e2e green
- [ ] Integration: works with existing `AppModule` / Prisma
- [ ] Documentation updates completed
- [ ] Branch is `feature/US-O1-backend`
