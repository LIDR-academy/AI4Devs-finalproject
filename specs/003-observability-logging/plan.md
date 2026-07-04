# Implementation Plan: Application Observability (Structured Logging, Error Tracking & Metrics)

**Branch**: `003-observability-logging` | **Date**: 2026-07-04 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-observability-logging/spec.md`

## Summary

Replaces NestJS's default console logger with a structured JSON logger (`nestjs-pino`) wired through the existing `Logger` injection pattern already used across `back/src` (no call-site changes required), adds a request-scoped correlation ID via a global interceptor, forwards unhandled exceptions to Sentry, and extends the existing in-process `MetricsService` (`back/src/common/metrics/`) to also forward business-event counters to AWS CloudWatch in production. Business events are instrumented with direct `MetricsService.increment()` calls placed inside each owning service (`PantryService`, `AuthService`, `NotificationDeliveryService`, and the already-instrumented `ReceiptsService`) rather than a generic HTTP interceptor — a cross-artifact analysis found that a route-based interceptor cannot distinguish `item_consume`/`item_waste` (same endpoint, differentiated only by request body) and cannot observe events produced by `setInterval`-driven background passes (`item_waste` via auto-expiry, `notification_sent`); see `research.md` Decision 7. Because production runs on a single EC2 instance via Docker Compose (not ECS, as the source ticket assumed), CloudWatch log delivery is achieved by attaching the `awslogs` Docker logging driver to the containers in `infra/docker/docker-compose.prod.yml`, rather than by having the application ship logs itself.

## Technical Context

**Language/Version**: TypeScript, Node.js ≥ 20 (backend only — `back/`)

**Primary Dependencies**: NestJS 11 (`@nestjs/common`, `@nestjs/core`), `nestjs-pino` + `pino-http` (structured logger, implements Nest's `LoggerService`), `@sentry/nestjs` + `@sentry/node` (error tracking), `@aws-sdk/client-cloudwatch` (custom metrics — same SDK family already used for S3/SES/SNS/Textract); request IDs use Node's built-in `randomUUID()` (`node:crypto`), already the established pattern in this codebase — no new `uuid` package needed

**Storage**: N/A — no Prisma schema changes; this feature is process/infrastructure-level only

**Testing**: Jest (`back/test/jest-unit.json`), following the existing colocated `*.spec.ts` pattern (e.g. `ses.service.spec.ts`) — mock `CloudWatchClient`, Sentry, and the logger in unit tests

**Target Platform**: Single AWS EC2 instance running the API and frontend as Docker Compose containers (`infra/terraform/envs/prod`, `infra/docker/docker-compose.prod.yml`) — **not ECS**; this corrects an incorrect assumption in the source ticket (EXT-004), which assumed "CloudWatch reads stdout of ECS containers"

**Project Type**: Web service (backend-only change within the existing `back/` NestJS package)

**Performance Goals**: Logging and metric emission add negligible overhead to request handling (target: <5ms added p95 latency per request); all CloudWatch/Sentry calls are fire-and-forget and MUST NOT block the response

**Constraints**:
- `userId` MUST be masked in all log output (first 3 characters + `***`); email, receipt content, and item notes MUST NEVER appear in logs or Sentry events
- CloudWatch (`putMetricData`) and Sentry failures MUST be caught, logged as a warning, and MUST NOT throw or delay the request
- EC2 instance IAM role needs `cloudwatch:PutMetricData` added (currently scoped only to S3/Textract/SES/SNS — see `infra/terraform/envs/prod/main.tf`); log-group write access is handled by the Docker `awslogs` driver, not application code
- Local/development environments MUST print human-readable logs (`pino-pretty`) and MUST NOT call CloudWatch or Sentry (no-op below `NODE_ENV=production`)

**Scale/Scope**: Single EC2 instance, low request volume (early-stage product) — no log sampling or volume-based cost controls needed yet

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Verify against RealSaveFooding Constitution v1.0.0:

- [x] **I. TDD** — Tests scoped per task in tasks.md; each new service/interceptor gets a failing unit test before implementation (per ticket's own "Testing Requirements" table)
- [x] **II. Baby steps** — Each task (logger swap, correlation interceptor, CloudWatch adapter, metrics wiring, Sentry filter, docker-compose logging driver, IAM policy) is independently testable and shippable
- [x] **III. Type safety** — TypeScript strict; `CloudWatchMetricsService.emit()` fully typed; no `any`
- [x] **IV. English only** — All code, log field names, docs, and commit messages in English
- [x] **V. Clear naming** — `LoggingInterceptor`, `SentryExceptionFilter`, `CloudWatchMetricsService`, `requestId` — no vague names
- [x] **VI. Assumptions audited** — Ticket's ECS assumption corrected in Technical Context above; Sentry account and alert-routing assumptions carried from `spec.md` Assumptions section
- [x] **VII. Pattern scan** — Reuses existing `MetricsService` (`back/src/common/metrics/`) as the single call-site abstraction (extended internally to also call CloudWatch, rather than introducing a second, parallel metrics API); reuses the existing `new Logger(ClassName.name)` pattern already present in every service (swapping only the underlying implementation via `nestjs-pino`, so ~15 existing call sites need no changes); reuses the AWS SDK client-construction pattern from `SesService` (`new XClient({ region: process.env.AWS_REGION })`); reuses the existing direct-call metrics pattern from `ReceiptsService` (`this.metrics.increment(...)` at the point the event is known) for all 8 business events instead of a generic interceptor

*Post-design re-check: `/speckit-analyze` caught that a generic `MetricsInterceptor` (originally planned here) cannot correctly attribute `item_consume`/`item_waste` (same route, body-differentiated) or observe `setInterval`-driven background events (`item_waste` via auto-expiry, `notification_sent`) — see [research.md](./research.md) Decision 7. The design was corrected to direct service-layer calls before implementation began; no `MetricsInterceptor` file exists in the final Project Structure. All other gates remain green.

## Project Structure

### Documentation (this feature)

```text
specs/003-observability-logging/
├── plan.md                          # This file
├── research.md                      # Phase 0 — technical decisions
├── data-model.md                    # Phase 1 — log record & metric event shapes
├── quickstart.md                    # Phase 1 — validation scenarios
├── contracts/
│   ├── log-record.md                # Phase 1 — structured log contract
│   └── business-metrics.md          # Phase 1 — CloudWatch metric contract
└── tasks.md                         # Phase 2 — /speckit-tasks output (NOT created here)
```

### Source Code (repository root)

```text
back/
├── src/
│   ├── common/
│   │   ├── logger/
│   │   │   ├── logger.module.ts             # nestjs-pino LoggerModule.forRoot config
│   │   │   └── mask-user-id.ts              # userId masking helper, reused by logging + Sentry
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts       # requestId + request/response log
│   │   ├── filters/
│   │   │   └── sentry-exception.filter.ts   # captures unhandled exceptions
│   │   └── metrics/
│   │       ├── metrics.service.ts           # EXISTING — extended to forward to CloudWatch
│   │       ├── metrics.module.ts            # EXISTING — + CloudWatchMetricsService provider
│   │       └── metrics.controller.ts        # EXISTING — unchanged (GET /api/metrics)
│   ├── integrations/
│   │   └── aws-cloudwatch/
│   │       ├── cloudwatch-metrics.service.ts
│   │       └── cloudwatch-metrics.service.spec.ts
│   ├── modules/
│   │   ├── pantry/pantry.service.ts          # + direct increment() for item_create/consume/waste
│   │   ├── auth/auth.service.ts              # + direct increment() for login_success/failure
│   │   └── notifications/
│   │       └── notification-delivery.service.ts  # + #recordSent() -> increment("notification_sent")
│   ├── app.module.ts                        # wire APP_INTERCEPTOR (logging) + APP_FILTER (Sentry)
│   └── main.ts                              # app.useLogger(...), Sentry.init(...)
├── .env.example                             # + SENTRY_DSN, LOG_LEVEL, CLOUDWATCH_NAMESPACE
└── package.json                             # + nestjs-pino, pino-http, @sentry/nestjs,
                                              #   @sentry/node, @aws-sdk/client-cloudwatch

infra/
├── docker/docker-compose.prod.yml           # + logging: driver: awslogs (both containers)
└── terraform/envs/prod/main.tf              # + cloudwatch:PutMetricData, logs:* IAM statement
```

**Structure Decision**: Backend-only, additive changes inside the existing `back/` NestJS package plus a minimal Docker/Terraform diff for log shipping and IAM. No new top-level module or `frontend/` changes — matches the existing single-package-with-`integrations/`-and-`common/`-subfolders layout already used by every other backend feature in this repo.

## Complexity Tracking

*No constitution violations requiring justification — this feature adds one new integration folder (`aws-cloudwatch/`, following the exact shape of `aws-ses/`) and extends one existing service (`MetricsService`); no new cross-cutting abstraction beyond what NestJS interceptors/filters already provide.*
