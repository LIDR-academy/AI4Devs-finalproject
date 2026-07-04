# Data Model: Application Observability

No Prisma schema changes — this feature introduces no persisted entities. The "entities" below are in-memory/wire shapes only, matching `spec.md`'s Key Entities section.

## Log Record

Produced once per request (and once more per unhandled error within that request) by `LoggingInterceptor` via the `nestjs-pino` logger.

| Field | Type | Notes |
|---|---|---|
| `time` | ISO 8601 string | Added automatically by pino |
| `level` | `"info" \| "warn" \| "error" \| "debug"` | Standard pino levels |
| `requestId` | `string` (uuid v4, via `node:crypto` `randomUUID()`) | Shared across the request log and any error log for the same request |
| `method` | `string` | HTTP method |
| `url` | `string` | Request path |
| `statusCode` | `number` | Response status |
| `durationMs` | `number` | Request handling duration |
| `userId` | `string \| undefined` | Masked: first 3 characters + `***`; omitted entirely for unauthenticated requests |
| `module` | `string` | Present on error logs only — originating class name (matches existing `new Logger(ClassName.name)` context) |
| `message` | `string` | Human-readable summary |
| `err` | `{ name: string; stack?: string }` | Present on error logs only |

**Validation rules** (enforced in `LoggingInterceptor` and code review, not at runtime schema level):
- `userId` MUST never appear unmasked.
- `message`/`err` MUST never contain email addresses, receipt content, or item notes (FR-003).

## Business Metric Event

Every business-event counter is incremented via `MetricsService.increment(metricName, value?)`, called **directly from the owning service** at the exact point the event is unambiguously known (see `research.md` Decision 7 — a generic route-based interceptor cannot distinguish several of these events). `MetricsService.increment()` in turn forwards to `CloudWatchMetricsService.emit()` (see Decision 3) when `NODE_ENV=production`.

| Field | Type | Notes |
|---|---|---|
| `namespace` | `string` | `RealSaveFooding/{environment}` |
| `metricName` | `string` | One of: `item_create`, `item_consume`, `item_waste`, `receipt_upload_success_total`, `receipt_upload_failure_total`, `notification_sent`, `login_success`, `login_failure` — see [contracts/business-metrics.md](./contracts/business-metrics.md) for the exact instrumentation point of each |
| `value` | `number` | Defaults to `1`; bulk operations (`bulkWasteItems`, `autoWasteExpired`) pass the affected item count |
| `unit` | `"Count"` | Fixed for all current metrics |
| `dimensions` | `Record<string, string>` (optional) | e.g. `{ environment: "prod" }` |

**State/lifecycle**: Fire-and-forget — no retry, no persisted state. A failed `putMetricData` call is caught, logged as a warning (Log Record with `level: "warn"`), and discarded (FR-009). The in-process counter (visible at `GET /api/metrics`) always updates regardless of the CloudWatch call's outcome.

## Captured Exception (Sentry)

| Field | Type | Notes |
|---|---|---|
| `requestId` | `string` | Correlates back to the Log Record for the same request |
| `endpoint` | `string` | Method + URL |
| `userId` | `string \| undefined` | Masked, same rule as Log Record |
| `exception` | native `Error` | Captured via `SentryGlobalFilter`; stack trace included |

No new fields are added to any Prisma model; `back/prisma/schema.prisma` is untouched by this feature.
