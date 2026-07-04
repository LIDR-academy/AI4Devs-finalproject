# Tasks: Application Observability (Structured Logging, Error Tracking & Metrics)

**Input**: Design documents from `specs/003-observability-logging/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/log-record.md](./contracts/log-record.md) · [contracts/business-metrics.md](./contracts/business-metrics.md) · [quickstart.md](./quickstart.md)

**TDD**: Tests are mandatory per the RealSaveFooding Constitution (Principle I). Every implementation task is preceded by a failing test task. Write the test, confirm it fails, then implement.

**Revision note**: Phase 5 (User Story 3) was rewritten after `/speckit-analyze` found the original single-`MetricsInterceptor` design could not correctly attribute `item_consume`/`item_waste` (same route, body-differentiated) or observe `setInterval`-driven background events (`item_waste` via auto-expiry, `notification_sent`). See `research.md` Decision 7. Tasks T006/T007/T011/T012 also gained explicit PII-absence assertions (spec.md FR-003/SC-004 previously had no task verifying it).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other tasks at the same level (touches different files, no incomplete dependency)
- **[US#]**: Which user story this task delivers (maps to spec.md)

---

## Phase 1: Setup

**Purpose**: Install dependencies and scaffold environment configuration. Blocks all subsequent phases.

- [X] T001 Install backend dependencies from `back/`: `npm install nestjs-pino pino-http pino-pretty @sentry/nestjs @sentry/node @aws-sdk/client-cloudwatch`
- [X] T002 [P] Add `SENTRY_DSN=`, `LOG_LEVEL=info`, `CLOUDWATCH_NAMESPACE=RealSaveFooding` to `back/.env.example` (below the existing `NODE_ENV` line)

**Checkpoint**: `back/package.json` lists the new dependencies; `npm install` completes with no errors.

---

## Phase 2: Foundational — Global Structured Logger

**Purpose**: Swap NestJS's default console logger for a `nestjs-pino`-backed structured logger. Every existing service already injects `Logger` via `new Logger(ClassName.name)` (15 call sites, e.g. `back/src/integrations/aws-ses/ses.service.ts:7`) — this phase changes only the underlying implementation those call sites use, so no other file needs to change.

**⚠️ CRITICAL**: Must be complete before Phase 3 — structured logging underpins User Story 1 directly, and the warning logs used by User Stories 2 and 3's failure paths.

- [X] T003 Write failing unit test for the logger configuration in `back/src/common/logger/logger.module.spec.ts`: assert the `pinoHttp` level reads from `process.env.LOG_LEVEL` (default `"info"`); assert a `pino-pretty` transport is configured when `NODE_ENV !== "production"`; assert no transport (raw JSON to stdout) when `NODE_ENV === "production"`
- [X] T004 Create `LoggerModule` in `back/src/common/logger/logger.module.ts` using `LoggerModule.forRoot` from `nestjs-pino`, satisfying T003
- [X] T005 Import `LoggerModule` in `back/src/app.module.ts` and call `app.useLogger(app.get(Logger))` in `back/src/main.ts` before any other middleware is registered

**Checkpoint**: `cd back && npm test logger.module` passes T003; `npm run start:dev` prints pino-pretty formatted output in the terminal.

---

## Phase 3: User Story 1 — Diagnose an issue from structured request/error logs (Priority: P1) 🎯 MVP

**Goal**: Every request produces one structured, correlated log record (and a matching error record on failure) with a masked user identifier, readable in dev and machine-parseable in production — and never leaks email, receipt content, or item notes (FR-003).

**Independent Test**: Make a request (success and failure cases) against the running application and confirm a single structured log record is produced containing a shared `requestId`, timing, outcome, and masked `userId` — verifiable without Sentry (US2) or CloudWatch metrics (US3) in place.

### Tests (write first — must FAIL before T009–T010)

- [X] T006 [P] [US1] Write failing unit test for the `maskUserId` helper in `back/src/common/logger/mask-user-id.spec.ts`: assert `"usr_12345"` → `"usr***"` (first 3 chars + `***`); assert `undefined`/`null` input passes through as `undefined`; assert strings shorter than 3 chars are still suffixed with `***` rather than throwing
- [X] T007 [US1] Write failing unit test for `LoggingInterceptor` in `back/src/common/interceptors/logging.interceptor.spec.ts`: assert a `requestId` (uuid) is generated per request and attached to the request object; assert the completion log includes `method`, `url`, `statusCode`, `durationMs`, and masked `userId`; assert an error thrown during handling produces an error log with the **same** `requestId`, a `module` field, and `err.stack`; **assert the logged object contains only the allow-listed fields** (`time`, `level`, `requestId`, `method`, `url`, `statusCode`, `durationMs`, `userId`, `module`, `message`, `err`) even when the request body/response contains an `email` or `notes` field — proving FR-003 by construction, not by convention

### Implementation

- [X] T008 [P] [US1] Implement `maskUserId(userId?: string): string | undefined` in `back/src/common/logger/mask-user-id.ts` (plain string slicing — first 3 characters + `"***"`), satisfying T006
- [X] T009 [US1] Implement `LoggingInterceptor` (`NestInterceptor`) in `back/src/common/interceptors/logging.interceptor.ts`: generate `requestId` via `randomUUID()` from `node:crypto` (matching the existing pattern in `back/src/integrations/aws-s3/aws-s3-receipt-storage.service.ts`), attach it to the request, log via the injected `PinoLogger`/`Logger` on completion and on error using `maskUserId` from T008 — build the logged object from an **explicit allow-list of fields only** (never spread the raw request body, response body, or exception object), satisfying T007
- [X] T010 [US1] Register `LoggingInterceptor` as a global `APP_INTERCEPTOR` provider in `back/src/app.module.ts`

**Checkpoint**: `cd back && npm test logging.interceptor mask-user-id` — T006 and T007 pass. Quickstart Scenario 1 validated manually.

---

## Phase 4: User Story 2 — Get notified when unhandled errors occur in production (Priority: P2)

**Goal**: Unhandled exceptions are automatically captured by Sentry with the correlated request context (never email/receipt/notes content), and a misconfigured/unreachable Sentry never crashes the app or blocks a request.

**Independent Test**: Trigger an unhandled exception in the running application and confirm it appears in the Sentry project dashboard with the originating request's `requestId` and endpoint — independent of whether User Story 3's metrics are implemented.

### Tests (write first — must FAIL before T012–T013)

- [X] T011 [US2] Write failing unit test for `SentryExceptionFilter` in `back/src/common/filters/sentry-exception.filter.spec.ts`: assert `Sentry.captureException` is called with the exception and a request context built from an **explicit allow-list** (`requestId`, endpoint, masked `userId` via `maskUserId`) — never the raw request/exception object spread wholesale, proving FR-003 for Sentry payloads; assert the filter still returns a normal error response to the client when `Sentry.captureException` itself throws (mocked to throw), i.e. capture failure never breaks the response

### Implementation

- [X] T012 [US2] Implement `SentryExceptionFilter` (`ExceptionFilter`) in `back/src/common/filters/sentry-exception.filter.ts`, reusing `maskUserId` from T008 and building the Sentry context from the same allow-list as T011, satisfying T011
- [X] T013 [US2] Initialize Sentry in `back/src/main.ts` guarded by `process.env.SENTRY_DSN` being set, wrapped so an init failure is caught and logged as a `warn` (never thrown); register `SentryExceptionFilter` as a global `APP_FILTER` provider in `back/src/app.module.ts`

**Checkpoint**: `cd back && npm test sentry-exception.filter` passes T011. Quickstart Scenario 2 validated manually (both with and without `SENTRY_DSN` set).

---

## Phase 5: User Story 3 — Monitor business activity and system health trends (Priority: P3)

**Goal**: Key business events emit counters to CloudWatch in production (in addition to the existing in-process counters), via direct calls at each event's actual origin — not a generic HTTP interceptor, which `research.md` Decision 7 shows cannot correctly attribute `item_consume`/`item_waste` or observe `setInterval`-driven events.

**Independent Test**: Perform each tracked business action (create an item, log in successfully, log in with a wrong password) and confirm the corresponding counter increments in `GET /api/metrics` (dev) and, in a deployed environment, in the CloudWatch `RealSaveFooding/production` namespace — independent of User Stories 1 and 2.

### Tests (write first — must FAIL before T019–T023)

- [X] T014 [P] [US3] Write failing unit test for `CloudWatchMetricsService` in `back/src/integrations/aws-cloudwatch/cloudwatch-metrics.service.spec.ts`: mock `CloudWatchClient`, assert `emit(name, value, dimensions)` sends a `PutMetricDataCommand` with the configured namespace, metric name, value, and `Unit: "Count"`; assert a rejected `send()` call is caught and logged as a `warn`, never thrown; assert `emit()` is a no-op (no `send()` call) when `NODE_ENV !== "production"`
- [X] T015 [P] [US3] Write failing unit test for the extended `MetricsService` in `back/src/common/metrics/metrics.service.spec.ts`: assert `increment()` still updates the existing in-process counter unconditionally (no regression to current `GET /api/metrics` behavior); assert `increment()` additionally calls the injected `CloudWatchMetricsService.emit()` only when `NODE_ENV === "production"`; assert a `CloudWatchMetricsService.emit()` rejection does not prevent the in-process counter from updating
- [X] T016 [P] [US3] Write failing unit tests for pantry metric instrumentation in `back/src/modules/pantry/pantry.service.spec.ts`: assert `metrics.increment("item_create")` is called once when `create()` succeeds; assert `metrics.increment("item_consume")` is called when `registerEvent()` is called with `type=CONSUMED`; assert `metrics.increment("item_waste")` is called when `registerEvent()` is called with `type=WASTED`; assert `metrics.increment("item_waste", items.length)` is called in `bulkWasteItems()`; assert `metrics.increment("item_waste", items.length)` is called in `autoWasteExpired()`
- [X] T017 [P] [US3] Write failing unit test for login metric instrumentation in `back/src/modules/auth/auth.service.spec.ts`: assert `metrics.increment("login_success")` is called exactly once when `login()` succeeds; assert `metrics.increment("login_failure")` is called exactly once on the unknown-email branch and exactly once on the wrong-password branch (no double counting, no call on the success path)
- [X] T018 [P] [US3] Write failing unit test for notification metric instrumentation in `back/src/modules/notifications/notification-delivery.service.spec.ts`: assert `metrics.increment("notification_sent")` is called exactly once for each of the 6 `NotificationLog` `status: "SENT"` code paths (expiry email, expiry push, badge, digest email, digest push, digest summary) and is **not** called on any of the corresponding `status: "FAILED"` paths

### Implementation

- [X] T019 [P] [US3] Implement `CloudWatchMetricsService` in `back/src/integrations/aws-cloudwatch/cloudwatch-metrics.service.ts` with `emit(metricName: string, value?: number, dimensions?: Record<string, string>): void`, reading `CLOUDWATCH_NAMESPACE` and `AWS_REGION` from env, satisfying T014
- [X] T020 [US3] Extend `MetricsService.increment()` and `observeDuration()` in `back/src/common/metrics/metrics.service.ts` to also call the injected `CloudWatchMetricsService.emit()` when `process.env.NODE_ENV === "production"`, satisfying T015; register `CloudWatchMetricsService` as a provider in `back/src/common/metrics/metrics.module.ts` (same direct-provider pattern already used for `SesService` in `notifications.module.ts` — no new module file)
- [X] T021 [US3] Inject `MetricsService` into `PantryService` (`back/src/modules/pantry/pantry.service.ts`) and add the direct `increment()` calls described in T016 at the end of `create()`, inside `registerEvent()` branched on `dto.type`, and in `bulkWasteItems()`/`autoWasteExpired()` after their transactions commit
- [X] T022 [US3] Inject `MetricsService` into `AuthService` (`back/src/modules/auth/auth.service.ts`) and add the direct `increment()` calls described in T017 at the success return and at both `UnauthorizedException` throw sites in `login()`
- [X] T023 [US3] Inject `MetricsService` into `NotificationDeliveryService` (`back/src/modules/notifications/notification-delivery.service.ts`), add a private `#recordSent(): void` helper that calls `metrics.increment("notification_sent")`, and call it at each of the 6 `status: "SENT"` `notificationLog.create` sites per T018

**Note**: No module-registration task is needed for T021–T023 — `MetricsModule` is already `@Global()` (`back/src/common/metrics/metrics.module.ts:5`) and imported once in `app.module.ts`, so `MetricsService` injects into `PantryService`/`AuthService`/`NotificationDeliveryService` with no changes to their respective `.module.ts` files.

**Checkpoint**: `cd back && npm test cloudwatch-metrics.service metrics.service pantry.service auth.service notification-delivery.service` — T014–T018 all pass. Quickstart Scenario 3 validated manually via `GET /api/metrics`. `receipt_upload_success_total`/`receipt_upload_failure_total` require no new tests — they already forward to CloudWatch automatically once T020 lands (per `contracts/business-metrics.md`).

---

## Final Phase: Cross-Cutting Infra & Polish

**Purpose**: Wire production log/metric delivery (Docker + Terraform), close the FR-011 regression gap, and run full validation. Not independently user-testable — required for Stories 1 and 3 to reach CloudWatch in a deployed environment, per `research.md` Decision 4.

- [X] T024 [P] Add `logging: { driver: awslogs, options: { awslogs-group: /realsavefooding/prod, awslogs-region: eu-west-1, awslogs-stream-prefix: <service> } }` to both the `api` and `frontend` services in `infra/docker/docker-compose.prod.yml`
- [X] T025 [P] Add a `cloudwatch:PutMetricData` statement (`Resource: "*"` — CloudWatch does not support resource-level restriction on this action) and `logs:CreateLogGroup` / `logs:CreateLogStream` / `logs:PutLogEvents` statements scoped to the `/realsavefooding/prod` log group ARN to `aws_iam_role_policy.ec2_app_access` in `infra/terraform/envs/prod/main.tf`
- [X] T026 Add two CloudWatch alarms in `infra/terraform/envs/prod/main.tf`: `ErrorRate > 1%` over a 5-minute window and `p95Latency > 500ms` over a 5-minute window, both notifying `aws_sns_topic.expiration_alerts` (reusing the existing topic per the Assumptions in `spec.md`) — depends on T025 (same file)
- [X] T027 [P] Add a regression-check step to the `back` job in `.github/workflows/ci.yml`: `! grep -rn "console\." src` (run after `npm run build`), enforcing FR-011
- [X] T028 [P] Document the CloudWatch log group name, the two alarm thresholds, and the `SENTRY_DSN`/`LOG_LEVEL`/`CLOUDWATCH_NAMESPACE` env vars in `docs/local-development-setup.md`
- [X] T029 [P] Run `cd back && npx tsc --noEmit` — assert zero TypeScript errors
- [X] T030 Run full backend test suite: `cd back && npm test` — assert all tests pass, including the new logger/interceptor/filter/CloudWatch/pantry/auth/notification-delivery specs
- [X] T031 Run `quickstart.md` Scenarios 1–5 end-to-end against a locally running instance and confirm each expected outcome

**Checkpoint**: CI green on a pushed branch; all quickstart scenarios pass; `infra/terraform` plan (`terraform plan`) shows only the expected IAM/alarm diff.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Final Phase
```

- **Phase 1**: No dependencies — start immediately
- **Phase 2**: Requires Phase 1 (dependencies must be installed before the logger module compiles)
- **Phase 3**: Requires Phase 2 (the interceptor logs through the pino-backed `Logger`)
- **Phase 4**: Requires Phase 2 (Sentry warning logs use the structured logger); does not require Phase 3, but reuses `maskUserId` from T008
- **Phase 5**: Requires Phase 2 (CloudWatch warning logs use the structured logger); does not require Phase 3 or 4; T021–T023 are independent of each other (three different services)
- **Final Phase**: T024–T026 (infra) require Phase 5 conceptually (metrics/log shape must be final) but touch only `infra/`; T027–T031 require all prior phases

### User Story Dependencies

| Story | Blocking dependency | Independently testable? |
|-------|--------------------|-----------------------|
| US1 | Phase 2 (structured logger) | Yes — interceptor unit tests validate correlation/masking/PII-absence independently |
| US2 | Phase 2 (structured logger); reuses `maskUserId` from US1 (T008) | Yes — filter unit tests validate capture/failure-isolation/PII-absence independently |
| US3 | Phase 2 (structured logger) | Yes — per-service unit tests validate emission/no-op/failure-isolation independently, and `GET /api/metrics` already proves in-process behavior without any AWS access |

### Within Each Phase

1. Write test → confirm it FAILS → implement → confirm it PASSES
2. Helpers/services before interceptors/filters/instrumented call sites that use them
3. Register as global provider (`APP_INTERCEPTOR`/`APP_FILTER`) last, once the class itself is tested
4. Commit after each task

### Parallel Opportunities

- T001 and T002 can run in parallel (dependency install vs. env file edit — different files)
- Within Phase 3, T006 and T007 (both test files) can run in parallel; T008 can start as soon as T006 is failing, independent of T007/T009
- Within Phase 5, T014–T018 (five independent spec files across three services) can all run in parallel; T019 can start as soon as T014 is failing; T021, T022, T023 touch three different services and can proceed in parallel once T020 lands
- Within the Final Phase, T024, T025, T027, T028, T029 can all run in parallel (five independent files); T026 must follow T025 (same `main.tf` file)

---

## Parallel Execution Example: Phase 5

```
# Run these in parallel — independent spec files, no shared dependency:
T014: Write failing test for CloudWatchMetricsService
T015: Write failing test for extended MetricsService
T016: Write failing test for pantry metric instrumentation (item_create/consume/waste)
T017: Write failing test for login metric instrumentation
T018: Write failing test for notification_sent instrumentation

# Then, once each corresponding test is failing:
T019 (needs T014) → T020 (needs T015, T019)
T021 (needs T016, T020) | T022 (needs T017, T020) | T023 (needs T018, T020)  # three services, parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (structured logger — CRITICAL, blocks all stories)
3. Complete Phase 3: User Story 1 (correlated request/error logs)
4. **STOP and VALIDATE**: Run quickstart.md Scenario 1; confirm a `requestId` ties a request log to its error log, and confirm no PII field appears in a log with an email/notes-bearing payload
5. Ship — an operator can now diagnose issues from logs without SSH access, even before Sentry or CloudWatch metrics exist

### Incremental Delivery

1. Setup + Foundational → structured logging foundation ready
2. Phase 3 (US1) → validate Scenario 1 → deploy/demo (MVP!)
3. Phase 4 (US2) → validate Scenario 2 → deploy/demo
4. Phase 5 (US3) → validate Scenario 3 → deploy/demo
5. Final Phase → CloudWatch/Sentry actually reachable in production, CI regression guard in place, full validation pass

---

## Notes

- `[P]` tasks touch different files — safe to parallelize within the same developer's session
- The TDD constraint (Constitution Principle I) is non-negotiable: every `.spec.ts` test must be confirmed FAILING before its matching implementation task begins
- No `console.log` migration task exists because none are present in `back/src` today (verified in `research.md` Decision 8) — T027 only guards against regression
- No new `uuid` npm dependency — `randomUUID()` from `node:crypto` is already the established pattern in this codebase (`research.md` Decision 2 addendum)
- `CloudWatchMetricsService` is registered as a direct provider in `MetricsModule`, matching the existing `SesService`-in-`NotificationsModule` pattern — no new per-integration module file
- Business metrics use **direct service-layer calls**, not a generic interceptor — see `research.md` Decision 7 for why a route-based interceptor cannot correctly attribute `item_consume`/`item_waste` or observe the `setInterval`-driven `item_waste` (auto-expiry) and `notification_sent` events
- `receipt_upload_success_total`/`receipt_upload_failure_total` need no new instrumentation — `ReceiptsService` already calls `this.metrics.increment(...)` at the right points; T020 alone makes that reach CloudWatch
