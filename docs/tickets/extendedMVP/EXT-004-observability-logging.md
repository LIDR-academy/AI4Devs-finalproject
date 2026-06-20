# EXT-004 — Application Observability (Structured Logging + Metrics)

## Metadata
- **Type:** Backend
- **Priority:** P1
- **Phase:** 1 — GA Readiness (implement last, in parallel with EXT-003)
- **PRD Reference:** [P1-004](../../product/5_Extended-Non-MVP-PRD.md#p1-004-application-observability-structured-logging--metrics)
- **Effort:** Medium
- **Depends on:** EXT-003 (CloudWatch only exists once the infra is deployed)

---

## User Story

As an operator, I want structured logs and error tracking so that I can detect and diagnose production issues without SSH access.

---

## Context

The NestJS backend currently uses the default logger (`console.log`) with no structure. There is no:
- JSON log format.
- Request correlation IDs.
- Error tracking service.
- Business metric emission.

Adding structured logging, a request interceptor for correlation IDs, and CloudWatch metric emission requires only backend changes. No Prisma schema changes are needed.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Backend — common | `back/src/common/logger/` | New structured logger service |
| Backend — common | `back/src/common/interceptors/logging.interceptor.ts` | New request/response logger |
| Backend — common | `back/src/common/interceptors/metrics.interceptor.ts` | New business metric emitter |
| Backend — integrations | `back/src/integrations/aws-cloudwatch/` | New CloudWatch metrics adapter |
| Backend — app | `back/src/app.module.ts` | Wire interceptors globally |
| Backend — all modules | (all services) | Replace `console.log` with injected Logger |

---

## Logger Design

Use `pino` (via `nestjs-pino`) as the JSON logger — it is fast, structured by default, and integrates with NestJS's `LoggerService` interface.

```
npm install nestjs-pino pino-http
```

Log fields on every request log:
```json
{
  "time": "2026-06-20T10:00:00.000Z",
  "level": "info",
  "requestId": "uuid-v4",
  "method": "POST",
  "url": "/api/pantry/items",
  "statusCode": 201,
  "durationMs": 42,
  "userId": "usr_***masked***"
}
```

Error logs include:
```json
{
  "level": "error",
  "requestId": "uuid-v4",
  "module": "PantryService",
  "message": "Item not found",
  "err": { "name": "NotFoundException", "stack": "..." }
}
```

PII masking rule: `userId` is shown as first 3 chars + `***`. Email is never logged.

---

## Business Metrics (CloudWatch Custom Metrics)

Namespace: `RealSaveFooding/{environment}`

| Metric name | Unit | Emitted when |
|---|---|---|
| `item_create` | Count | `POST /pantry/items` → 201 |
| `item_consume` | Count | `POST /pantry/items/:id/events` type=CONSUMED |
| `item_waste` | Count | `POST /pantry/items/:id/events` type=WASTED |
| `receipt_processed` | Count | Receipt status → COMPLETED |
| `receipt_failed` | Count | Receipt status → FAILED |
| `notification_sent` | Count | `NotificationLog` status=SENT |
| `login_success` | Count | `POST /auth/login` → 200 |
| `login_failure` | Count | `POST /auth/login` → 401 |

---

## Technical Implementation Tasks

Follow TDD: unit-test each new service before wiring it globally.

1. **Install dependencies**
   ```bash
   cd back && npm install nestjs-pino pino-http @aws-sdk/client-cloudwatch
   ```

2. **Logger module** (`back/src/common/logger/logger.module.ts`)
   - Configure `LoggerModule.forRoot` from `nestjs-pino`.
   - In production: JSON format to stdout (CloudWatch reads stdout of ECS containers).
   - In development: `pino-pretty` for human-readable output.
   - Set as `app.useLogger` in `main.ts`.

3. **Request logging interceptor** (`back/src/common/interceptors/logging.interceptor.ts`)
   - Implements `NestInterceptor`.
   - Generates a `requestId` (`uuid`) on each incoming request.
   - Attaches `requestId` to `request` object and logs method, url, userId, status, duration.
   - Unit test: mock `Logger`, assert log is called with correct fields.

4. **CloudWatch metrics adapter** (`back/src/integrations/aws-cloudwatch/cloudwatch-metrics.service.ts`)
   - Injects `@aws-sdk/client-cloudwatch`.
   - `emit(metricName: string, value = 1, dimensions?: Record<string, string>): void` — fire-and-forget (`putMetricData`); errors are logged but never thrown.
   - In local dev: no-op when `NODE_ENV !== 'production'`.
   - Unit test: mock `CloudWatchClient`, assert `PutMetricDataCommand` is called with correct namespace and metric name.

5. **Metrics interceptor** (`back/src/common/interceptors/metrics.interceptor.ts`)
   - Reads `request.method`, `request.url`, response status.
   - Calls `CloudWatchMetricsService.emit` for the mapped metrics.
   - Unit test: verify correct metric name emitted for each endpoint.

6. **Wire globally** (`back/src/app.module.ts`)
   - `APP_INTERCEPTOR` providers for `LoggingInterceptor` and `MetricsInterceptor`.
   - Apply in order: logging first, metrics second.

7. **Replace `console.log` across all modules**
   - Inject `Logger` from `@nestjs/common` in each service/controller.
   - Search and replace: `grep -r "console\." back/src/` — fix all occurrences.

8. **Error tracking (Sentry)**
   ```bash
   npm install @sentry/nestjs @sentry/node
   ```
   - Initialize in `main.ts` with `SENTRY_DSN` env var.
   - Add `SentryGlobalFilter` to capture unhandled exceptions.
   - Unit test: mock Sentry, assert `captureException` called on unhandled error.

9. **CloudWatch alarm** (Terraform in EXT-003 or manual for now)
   - `ErrorRate > 1%` over 5 minutes → SNS alert.
   - `p95Latency > 500ms` over 5 minutes → SNS alert.
   - Document alarm creation in `docs/local-development-setup.md`.

---

## Environment Variables

```
# back/.env.example additions
SENTRY_DSN=
LOG_LEVEL=info         # debug | info | warn | error
CLOUDWATCH_NAMESPACE=RealSaveFooding
NODE_ENV=production    # controls JSON vs pretty logging
```

---

## Error Handling

- CloudWatch `putMetricData` failures are logged as warnings but never thrown — metric loss is acceptable; application flow is not.
- Sentry initialization failure (bad DSN) logs a warning but does not crash the app.
- If `requestId` generation fails (impossible but defensive), fall back to `'unknown'`.

---

## Security

- `userId` is masked in logs (first 3 chars + `***`).
- Email, receipt content, and item notes are never logged.
- `SENTRY_DSN` is in env vars; Sentry project should be configured to scrub PII.
- CloudWatch IAM permissions are scoped to `cloudwatch:PutMetricData` only (not read/admin).

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — CloudWatch adapter | putMetricData called, error swallowed |
| Unit — logging interceptor | requestId generated, log fields correct |
| Unit — metrics interceptor | correct metric per route |
| Unit — Sentry filter | captureException called on error |
| Integration — smoke | start app, make request, verify JSON log line in stdout |

---

## Acceptance Criteria

1. All backend log output is structured JSON with at minimum: `time`, `level`, `requestId`, `userId` (masked), `module`, `message`.
2. `item_create`, `login_success`, `login_failure`, `notification_sent` metrics appear in CloudWatch within 60 seconds of the event.
3. Unhandled exceptions are captured in Sentry with request context.
4. No `console.log` calls remain in `back/src/` (verified by lint rule or grep in CI).
5. In local development, logs are human-readable (pino-pretty).

---

## Non-Goals

- Frontend error tracking (separate Sentry project if needed later).
- Log aggregation service (OpenSearch, Datadog) — CloudWatch is sufficient for current scale.
- Distributed tracing (X-Ray) — deferred until microservices need it.

---

## Open Questions

1. Is a Sentry account/project already available, or does one need to be created?
2. Should CloudWatch alarms notify via the existing SNS topic or a new ops-only topic?

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is backend-only, no schema changes
- [x] Dependencies identified (EXT-003 for CloudWatch target, Sentry account)
