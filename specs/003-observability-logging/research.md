# Research: Application Observability

All Technical Context unknowns are resolved below; there were no unresolved `NEEDS CLARIFICATION` markers carried over from `spec.md`, so this phase focuses on validating the source ticket's technical assumptions against the actual codebase and infrastructure, per Constitution Principle VII (pattern scan before adding code).

## Decision 1: Structured logging library

**Decision**: `nestjs-pino` + `pino-http`, installed as the global logger via `app.useLogger(app.get(Logger))` in `main.ts`.

**Rationale**: `nestjs-pino` implements Nest's `LoggerService` interface, which every existing service already depends on through `private readonly logger = new Logger(ClassName.name)` (confirmed present in 15 files, e.g. `back/src/integrations/aws-ses/ses.service.ts:7`, `back/src/modules/receipts/receipts.service.ts:48`). Swapping the global logger implementation makes all of them emit structured JSON automatically — zero call-site changes. `pino-pretty` provides the human-readable dev-mode output required by FR-005.

**Alternatives considered**: `winston` (more config surface, no built-in Nest `LoggerService` adapter as clean as pino's); hand-rolled JSON logger (would require touching all 15 existing call sites — rejected, violates Principle II baby-steps/low-blast-radius and Principle VII pattern reuse).

**Addendum (found during manual verification, not by unit tests)**: `pino-http`'s request-scoped child logger binds the *full raw* `req` object (headers — including `Authorization` — query, params) onto whatever logger `LoggingInterceptor` obtains via nestjs-pino's ambient/storage-based injection, regardless of the `autoLogging` setting. `autoLogging` only controls whether pino-http *itself* fires an extra completion log — it does not control what gets bound onto logs your own code emits through that same request-scoped logger. Running the app locally and inspecting real output (not just mocked unit tests) surfaced this: `LoggingInterceptor`'s own allow-listed log line was silently getting the raw `req` object merged in underneath it, leaking the bearer token. Fixed by also setting `pinoHttp.quietReqLogger: true` and `quietResLogger: true`, which make pino-http bind only a small internal `reqId` integer instead of the full `req`/`res` objects (see `contracts/log-record.md` Guarantees). Covered by a `logger.module.spec.ts` regression test, but the root cause was only discoverable by actually running the app end-to-end.

## Decision 2: Request correlation

**Decision**: A single global `LoggingInterceptor` (`NestInterceptor`) generates a `requestId` via Node's built-in `randomUUID()` (`node:crypto`) per request, attaches it to the request object, and logs method/url/status/duration/masked userId on completion via `pino-http`'s request-scoped child logger (so any `this.logger.error(...)` call made deeper in the stack during that request automatically inherits the same `requestId`).

**Rationale**: `pino-http`'s AsyncLocalStorage-backed request context is the standard mechanism for this in the Nest+pino ecosystem and avoids manually threading a correlation ID through every service method signature. `randomUUID()` is already the established uuid-generation pattern in this codebase (`back/src/integrations/aws-s3/aws-s3-receipt-storage.service.ts`, `local-receipt-storage.service.ts`) — reusing it avoids adding the `uuid` npm package the source ticket proposed, which would duplicate functionality Node already provides.

**Alternatives considered**: Passing `requestId` explicitly through method parameters (rejected — would require changing every service/controller signature across the codebase, far outside this feature's blast radius); the `uuid` npm package as the ticket suggested (rejected — `node:crypto`'s `randomUUID()` is already used elsewhere in this codebase and requires no new dependency).

## Decision 3: Business metrics — extend existing `MetricsService`, do not add a parallel API

**Decision**: `back/src/common/metrics/metrics.service.ts` already exists as the project's in-process metrics registry (its own doc comment: *"Minimal in-process metrics registry... can be replaced by a Prometheus-backed implementation later without changing call sites"*) and is already called from `receipts.service.ts` (`this.metrics.increment(RECEIPT_METRICS.uploadSuccess)`, etc.). `MetricsService.increment()`/`observeDuration()` will be extended internally to also forward to the new `CloudWatchMetricsService` when `NODE_ENV=production`, keeping the existing public API (`increment`, `observeDuration`, `getCounter`, `snapshot`) and the existing `GET /api/metrics` endpoint completely unchanged.

**Rationale**: The ticket's proposed design (services call a new `CloudWatchMetricsService.emit()` directly) would create a second, competing metrics call site alongside the existing `MetricsService`, which is exactly the duplication Constitution Principle VII forbids. Extending the existing service is a smaller, safer diff and preserves the local `/api/metrics` visibility this project already relies on in dev/local environments.

**Alternatives considered**: New standalone `CloudWatchMetricsService` injected directly into each business-event call site, as the ticket describes (rejected — duplicate abstraction); replacing `MetricsService` entirely with a CloudWatch-only client (rejected — would remove the working local/dev `/api/metrics` visibility with no CloudWatch access needed).

## Decision 4: Log delivery to CloudWatch — Docker `awslogs` driver, not ECS

**Decision**: Add `logging: { driver: awslogs, options: { awslogs-group: /realsavefooding/prod, awslogs-region: eu-west-1, awslogs-stream-prefix: api|frontend } }` to both services in `infra/docker/docker-compose.prod.yml`. The application itself only needs to print JSON to stdout (which `nestjs-pino` already does in production mode) — Docker ships it to CloudWatch Logs, no application-level log-shipping code needed.

**Rationale**: The source ticket (EXT-004, line 109) assumes *"CloudWatch reads stdout of ECS containers"*. This project's production infrastructure (`infra/terraform/envs/prod/main.tf`) provisions a **single EC2 instance** running both containers via Docker Compose (`infra/docker/docker-compose.prod.yml`) — there is no ECS task definition anywhere in this repo. On plain EC2 + Docker Compose, stdout is not automatically captured by CloudWatch; the two standard, low-effort options are the `awslogs` Docker logging driver (chosen) or installing the CloudWatch Agent on the host. The Docker driver is preferred because it requires no additional host-level agent installation or configuration outside files this repo already manages (`docker-compose.prod.yml`).

**Alternatives considered**: CloudWatch Agent on the EC2 host (rejected — adds an out-of-repo host configuration step with no corresponding IaC in this project, harder to reproduce/version); application-level CloudWatch Logs SDK calls (rejected — adds latency-sensitive network calls into the request path for something Docker can do for free).

## Decision 5: Error tracking

**Decision**: `@sentry/nestjs` + `@sentry/node`, initialized in `main.ts` guarded by `SENTRY_DSN` being set, with `SentryGlobalFilter` registered as a global exception filter to capture unhandled exceptions with request context (including `requestId` from Decision 2).

**Rationale**: Matches the ticket's design; `@sentry/nestjs` is Sentry's official Nest integration and requires minimal wiring. Init failure (missing/invalid DSN) is caught and logged as a warning per FR-007/spec Edge Cases, never crashing the app.

**Alternatives considered**: Rolling a custom unhandled-exception filter that just logs (rejected — the spec's P2 user story explicitly requires a proactive error-tracking *view*, not just a log line the operator has to search for).

## Decision 6: IAM changes

**Decision**: Add a scoped `cloudwatch:PutMetricData` statement (Resource `*`, since CloudWatch's API does not support resource-level restriction on this action) and a `logs:CreateLogGroup` / `logs:CreateLogStream` / `logs:PutLogEvents` statement scoped to the `/realsavefooding/prod` log group ARN, to `aws_iam_role_policy.ec2_app_access` in `infra/terraform/envs/prod/main.tf`.

**Rationale**: The existing EC2 role (`infra/terraform/envs/prod/main.tf`) is scoped only to S3/Textract/SES/SNS today — confirmed by reading the policy directly. Both new permissions are required for this feature to function in production and are a direct, minimal extension of the existing inline-policy pattern already used for the other four AWS integrations.

**Alternatives considered**: A separate IAM policy resource (rejected — the project consistently uses one inline `ec2_app_access` policy per environment; splitting it out is an unrelated structural change).

## Decision 7: Business metric instrumentation — direct service-layer calls, not a generic interceptor

**Decision**: Reject a generic "route+status → metric name" `MetricsInterceptor` for the 8 business events entirely. Instead, each event is emitted by a direct `this.metrics.increment("<name>")` call placed exactly where the owning service already knows the event unambiguously — the same pattern `ReceiptsService` already uses successfully for `RECEIPT_METRICS.uploadSuccess`/`uploadFailure`. Concretely:

- `item_create` — `PantryService.create()`, after the `pantryItem.create` call.
- `item_consume` / `item_waste` — `PantryService.registerEvent()`, branched on `dto.type` after the transaction commits.
- `item_waste` (bulk) — `PantryService.bulkWasteItems()`, with `value = items.length`.
- `item_waste` (auto-expiry) — `PantryService.autoWasteExpired()`, with `value = items.length`.
- `login_success` / `login_failure` — `AuthService.login()`, at the success return and at each `UnauthorizedException` throw site.
- `notification_sent` — `NotificationDeliveryService`, via a private `#recordSent()` helper called at each of its 6 `NotificationLog` `status: "SENT"` write sites.
- `receipt_processed` / `receipt_failed` — **no new call needed**; `ReceiptsService` already calls `this.metrics.increment(RECEIPT_METRICS.uploadSuccess / uploadFailure)` at the point `ocrStatus` transitions to `COMPLETED`/`FAILED`. Decision 3's `MetricsService.increment()` extension makes this forward to CloudWatch automatically, with no receipts-specific code change.

**Rationale**: A cross-artifact analysis (`/speckit-analyze`) surfaced, and this decision confirms against the actual code, that a generic interceptor cannot correctly emit these metrics:
1. `POST /pantry/items/:id/events` is a **single route** handling both `item_consume` and `item_waste`, distinguished only by the request body's `type` field — a route+status mapping cannot tell them apart.
2. `item_waste` is also produced by `PantryService.autoWasteExpired()`, invoked exclusively from `AutoExpiryCronService`'s hourly `setInterval` loop — never through an HTTP request an interceptor could observe.
3. `notification_sent` is produced exclusively by `NotificationDeliveryService`, invoked only from `NotificationsScheduler`'s 60-second `setInterval` loop and `AutoExpiryCronService` — again never via a controller-invoked request.
4. `receipt_processed`/`receipt_failed` already exist as `receipt_upload_success_total`/`receipt_upload_failure_total` in `ReceiptsService`; a second, route-keyed interceptor covering the same endpoint would double-count the same real-world event under a different name.

Direct calls at the service layer sidestep all four problems at once and match the one proven pattern already in this codebase, per Constitution Principle VII.

**Alternatives considered**: The source ticket's single global `MetricsInterceptor` (rejected — provably wrong for 3 of 8 events, not just the 2 the initial pattern scan caught); a hybrid interceptor for the 4 genuinely HTTP-synchronous events (`item_create`, `login_success`, `login_failure`, and one branch of `registerEvent`) plus direct calls for the rest (rejected — having two different instrumentation mechanisms for events in the same table is more confusing than one consistent direct-call convention, for no real benefit since every event already has an unambiguous service-layer call site).

## Decision 8: `console.log` migration (FR-011)

**Decision**: No migration needed — a repo-wide search (`grep -rn "console\." back/src`) found **zero** existing `console.*` calls; every service already uses NestJS's injectable `Logger`. FR-011 is satisfied as a *regression check*, not a migration: add a CI grep step to `.github/workflows/ci.yml`'s `back` job (`! grep -rn "console\." src` after `npm run build`) so the codebase can't regress. No ESLint `no-console` rule is added, since `back/` currently has no ESLint config file at all (the `lint` script in `package.json` references `eslint` but no config exists) — adding one is out of scope for this feature.

**Rationale**: Avoids inventing implementation work (a codebase migration) that the actual code doesn't need, and avoids introducing an unrelated ESLint config as a side effect of this ticket.

**Alternatives considered**: Adding a full ESLint flat config just to get `no-console` (rejected — meaningfully out of scope; a plain CI grep step achieves the same regression protection with a two-line diff).
