# Backend Implementation Plan: US-O2 Metrics Instrumentation (Prometheus)

## Overview

Expose Prometheus text metrics from the NestJS API at `GET /api/metrics`, with HTTP **RED** series and Node default process metrics, using **`prom-client`**. Instrument all Nest HTTP traffic via a global interceptor (or middleware) with **low-cardinality** `route` labels (Nest path templates / `unmatched` — never UUIDs, plates, or PII).

**Architecture principles:** Controllers → Metrics service (registry) → Interceptor observes requests; TDD on route normalizer + observe helpers; English metric names/help text; public ops endpoint (no JWT); security by network posture (internal scrape), not by workshop JWT.

**User story reference:** [`us/monitoreo y observabilidad/US-O2-instrumentacion-metricas-api.md`](../../us/monitoreo%20y%20observabilidad/US-O2-instrumentacion-metricas-api.md)

**Base branch:** `finalproject-RFM` (preferably after US-O1 merged, or branched from same base with health optional)  
**Implementation branch (required):** `feature/US-O2-backend`

**Prerequisites:** Nest API bootstrapped; US-O1 recommended (health ≠ metrics). US-O3 scrapes this endpoint.

**Out of scope:** Prometheus/Grafana containers (US-O3/O4), alert rules (US-O5), business counters (OT/day), Next.js instrumentation, OpenTelemetry tracing, dedicated host port for metrics.

---

## Architecture Context

### Layers

| Layer | Responsibility | US-O2 artifacts |
|-------|----------------|-----------------|
| **Presentation** | `GET /api/metrics` text/plain | `MetricsController` |
| **Application** | Registry singleton, observe request, collect defaults | `MetricsService` |
| **Domain / pure** | Route label normalization | `route-normalizer.ts` |
| **Cross-cutting** | Measure every Nest HTTP response | `HttpMetricsInterceptor` |

### Canonical metrics

| Name | Type | Labels |
|------|------|--------|
| `mecatrack_http_requests_total` | Counter | `method`, `route`, `status_code` |
| `mecatrack_http_request_duration_seconds` | Histogram | `method`, `route`, `status_code` |
| `mecatrack_*` defaults | via `collectDefaultMetrics({ prefix: 'mecatrack_' })` | — |

**Decision (document in README + PR):** Exclude `/api/metrics` itself from duration/counter observation **or** include it — prefer **exclude** scrape path from HTTP RED to avoid self-noise; still allow default Node metrics.

### Files to add/modify

```
apps/api/package.json                              # + prom-client (+ @types if needed)
apps/api/package-lock.json

apps/api/src/modules/metrics/
├── metrics.module.ts                              # NEW — APP_INTERCEPTOR provider
├── metrics.controller.ts                          # NEW — GET metrics
├── metrics.service.ts                             # NEW — registry, counters, histogram
├── metrics.service.spec.ts                        # NEW
├── http-metrics.interceptor.ts                    # NEW
├── route-normalizer.ts                            # NEW — pure helper
└── route-normalizer.spec.ts                       # NEW

apps/api/src/app.module.ts                         # import MetricsModule
apps/api/test/metrics.e2e-spec.ts                  # NEW
apps/api/README.md
docs/api-spec.metrics.yml                          # NEW (ops)
```

### API contract

| | |
|--|--|
| Method/Path | `GET /api/metrics` |
| Auth | None (ops) |
| 200 Content-Type | Prometheus exposition (`text/plain; version=0.0.4; charset=utf-8` or whatever `prom-client` emits) |
| Body | Parseable by Prometheus |
| Errors | Generic 500; no business JSON |

---

## Implementation Steps

### Step 0: Create Feature Branch

- **Action:** Create backend feature branch from latest base.
- **Branch naming:** `feature/US-O2-backend` (required).
- **Implementation steps:**
  1. `git fetch origin`
  2. `git checkout finalproject-RFM` && `git pull origin finalproject-RFM` (include US-O1 if already merged)
  3. `git checkout -b feature/US-O2-backend`
  4. Verify with `git branch`
- **Notes:** Do not implement metrics on a shared non-`-backend` ticket branch.

---

### Step 1: Add Dependency

- **File:** `apps/api/package.json`
- **Action:** Install `prom-client` in `apps/api` (justify in PR: standard Prometheus client for Node).
- **Implementation steps:**
  1. From `apps/api`: `npm install prom-client`
  2. Confirm lockfile update only under api workspace as expected for this monorepo.
- **Notes:** Pin to a current stable major; no Grafana/Prometheus server packages in the API.

---

### Step 2: Route Normalizer (TDD — Red then Green)

- **Files:** `route-normalizer.ts`, `route-normalizer.spec.ts`
- **Function signature:**

```typescript
export function normalizeHttpRoute(params: {
  routePath?: string | string[]; // Nest route path / reflector
  url?: string;                  // fallback raw URL path
}): string;
```

- **Implementation steps:**
  1. **Prefer** Nest Express layer path / `request.route?.path` combined with controller path when available (e.g. `/api/work-orders/:id`).
  2. If no matched route (404): return `unmatched`.
  3. Never emit raw UUIDs, license plates, or query strings as labels.
  4. Unit table (minimum):

| Input hint | Expected `route` label |
|------------|------------------------|
| Matched `work-orders/:id` | `/api/work-orders/:id` or Nest-equivalent template including global prefix consistently |
| Matched `clients/:id` | `/api/clients/:id` |
| Matched `vehicles/:id/history` | `/api/vehicles/:id/history` |
| No route / unknown URL with UUID | `unmatched` |
| `/api/health/live` | `/api/health/live` |

  5. Pick **one** convention for leading `/api` in labels and use it everywhere (dashboards US-O4 / alerts US-O5 assume consistency). Prefer including `/api` prefix in the label to match real paths.
- **Implementation notes:** Inspect interceptor `ExecutionContext` → `switchToHttp().getRequest()` for Express `req.route.path` and mount path. Document chosen algorithm in a short code comment + README.

---

### Step 3: `MetricsService` Unit Tests (Red)

- **File:** `metrics.service.spec.ts`
- **Action:**
  1. Construct service; call `observeHttpRequest({ method, route, statusCode, durationSeconds })`.
  2. `await service.getMetricsText()` contains `mecatrack_http_requests_total` and label values.
  3. Second observe increments counter (parse or use registry `getSingleMetric` / `get()`).
  4. Ensure tests do not leak duplicate metric registration: use a fresh `Registry` per test **or** `register.clear()` / inject custom registry in constructor for testability.
- **Function signatures:**

```typescript
observeHttpRequest(input: {
  method: string;
  route: string;
  statusCode: number;
  durationSeconds: number;
}): void;

getMetricsText(): Promise<string>;
getContentType(): string;
```

---

### Step 4: Implement `MetricsService` (Green)

- **File:** `metrics.service.ts`
- **Implementation steps:**
  1. Own a `Registry` (prefer inject/create in constructor; call `collectDefaultMetrics({ register, prefix: 'mecatrack_' })` once).
  2. Create Counter + Histogram with names from US-O2.
  3. Histogram: default buckets OK for MVP.
  4. `getMetricsText()` → `register.metrics()`; `getContentType()` → `register.contentType`.
  5. Guard against double `collectDefaultMetrics` in Nest hot-reload/tests (custom registry per app instance is safest).
- **Dependencies:** `prom-client` (`Registry`, `Counter`, `Histogram`, `collectDefaultMetrics`).

---

### Step 5: `HttpMetricsInterceptor`

- **File:** `http-metrics.interceptor.ts`
- **Signature:**

```typescript
@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
```

- **Implementation steps:**
  1. Record `start = process.hrtime.bigint()` (or `Date.now()`).
  2. `next.handle().pipe(tap / finalize)`:
     - Read response status from Express `res.statusCode` (works for exceptions handled by filter if finalize runs after status set — verify with error path test).
     - Normalize route; skip if path is metrics scrape (decision).
     - `observeHttpRequest` with `method`, `route`, `status_code` as string/number consistent with Prom labels (stringify status).
  3. Use `finalize` so both success and error paths are counted.
  4. Confirm interaction with `HttpExceptionFilter`: after filter sets status, interceptor finalize should still see final status — if not, also listen to `res.on('finish')`.
- **Recommended robust pattern:** subscribe to `res.on('finish', ...)` for status + duration (avoids tap timing issues with filters). Document choice.
- **Dependencies:** `rxjs`, Nest interceptor APIs, `MetricsService`, `normalizeHttpRoute`.

---

### Step 6: Controller + Module Wiring

- **Files:** `metrics.controller.ts`, `metrics.module.ts`
- **Controller:**

```typescript
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    res.setHeader('Content-Type', this.metricsService.getContentType());
    res.status(200).send(await this.metricsService.getMetricsText());
  }
}
```

- **Module:**
  1. Providers: `MetricsService`, `{ provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor }`.
  2. Controllers: `MetricsController`.
  3. **No** JWT guards.
- **AppModule:** import `MetricsModule`.
- **Notes:** Registering `APP_INTERCEPTOR` inside `MetricsModule` is enough when the module is imported; avoid double-registering in `AppModule`.

---

### Step 7: E2E / Smoke

- **File:** `apps/api/test/metrics.e2e-spec.ts`
- **Cases:**
  1. `GET /api/metrics` → 200; `Content-Type` includes `text/plain`; body includes `mecatrack_http_requests_total` and/or `mecatrack_process_` / default metric.
  2. Hit `GET /api/health/live` (if US-O1 present) or `GET /api/auth/login` with bad body, then scrape metrics — expect series for that route / status.
  3. Assert a UUID path that 404s does **not** create a unique label per id (only `unmatched` or template).
- **Bootstrap:** same as other e2e (`AppModule`, global prefix `api`, filter, pipes as needed).

---

### Step 8: Security Pass (Code Review Checklist in PR)

- [ ] Labels never include `licensePlate`, nationalId, email, tokens, passwords, bodies.
- [ ] README states: prod scrape only on Docker network `http://api:4000/api/metrics`; do not publish a host-only metrics port.
- [ ] DEV: `curl http://localhost:4010/api/metrics` documented.

---

### Step 9: Update Technical Documentation

- **Action:** Mandatory (English).
- **Files:**
  - `apps/api/README.md` — scrape URLs DEV/PROD, metric names, label policy, exclude-metrics decision.
  - `docs/api-spec.metrics.yml` — `GET /api/metrics` ops endpoint.
- **Verify:** Names match US-O4/O5 PromQL (`mecatrack_http_requests_total`, `mecatrack_http_request_duration_seconds_bucket`).

---

## Implementation Order

1. Step 0 — `feature/US-O2-backend`
2. Step 1 — Add `prom-client`
3. Step 2 — Route normalizer TDD
4. Step 3 — MetricsService tests (red)
5. Step 4 — MetricsService (green)
6. Step 5 — Interceptor (+ `finish` listener if needed)
7. Step 6 — Controller + Module + AppModule
8. Step 7 — E2E smoke
9. Step 8 — Security checklist
10. Step 9 — Documentation

---

## Testing Checklist

- [ ] Unit: normalizer UUID → unmatched / template
- [ ] Unit: counter increments; histogram observes
- [ ] Registry isolation in tests (no “metric already registered”)
- [ ] E2E: `/api/metrics` 200 + exposition format
- [ ] E2E: after traffic, expected series present
- [ ] Manual: 401/500 appear under `status_code`
- [ ] Docs updated

---

## Error Response Format

Metrics endpoint should not use business error envelopes. On unexpected failure:

```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

(via existing `HttpExceptionFilter`). Prefer not throwing during scrape; registry read should be reliable.

---

## Partial Update Support

Not applicable.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `prom-client` | Prometheus exposition + counters/histograms + default Node metrics |

No Prometheus server binary in the API image.

---

## Notes

- Cardinality is the main production risk — treat route normalization as a hard requirement, not a nice-to-have.
- Align metric names with US-O4 dashboard PromQL and US-O5 alert rules before merge; if names change, update those stories/files in the same epic.
- English-only technical artifacts.
- `PrismaModule` is `@Global()`; metrics module does not need Prisma.

---

## Next Steps After Implementation

1. Merge `feature/US-O2-backend` → `finalproject-RFM`.
2. Hand off to **US-O3** (Compose Prometheus scrape `http://api:4000/api/metrics`).
3. US-O4/O5 consume these series — no further Nest work expected for those IDs.

---

## Implementation Verification

- [ ] Code quality: typed, low-cardinality labels, testable registry
- [ ] Functionality: RED + defaults + `/api/metrics`
- [ ] Testing: unit + e2e green
- [ ] Integration: interceptor does not break auth/health flows
- [ ] Documentation completed
- [ ] Branch is `feature/US-O2-backend`
