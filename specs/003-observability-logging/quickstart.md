# Quickstart: Application Observability

Validation scenarios proving each user story in [spec.md](./spec.md) end-to-end once implemented. Assumes the standard local dev setup from [docs/local-development-setup.md](../../docs/local-development-setup.md).

## Prerequisites

- `back/.env` has `NODE_ENV=development` (default) so logs render human-readable and CloudWatch/Sentry calls no-op.
- `npm install && npm run start:dev` from `back/`.

## Scenario 1 — Correlated request/error logs (User Story 1)

1. Start the backend, then make a request: `curl -i http://localhost:3000/api/pantry/items -H "Authorization: Bearer <token>"`.
2. **Expected**: a single log line appears in the terminal (pino-pretty formatted) showing the request's method, url, status, duration, and a masked `userId`.
3. Trigger an error path (e.g. `curl http://localhost:3000/api/pantry/items/nonexistent-id`).
4. **Expected**: an error log line appears carrying the **same `requestId`** as the request log for that call. See [contracts/log-record.md](./contracts/log-record.md) for the exact field contract.

## Scenario 2 — Unhandled exception captured (User Story 2)

1. Set a valid `SENTRY_DSN` in `back/.env` (or a Sentry test project's DSN).
2. Trigger an unhandled exception (e.g. a route that throws an uncaught error).
3. **Expected**: the event appears in the Sentry project dashboard with the request's `requestId` and endpoint in its context.
4. Remove/blank `SENTRY_DSN`, restart the app, and repeat step 2.
5. **Expected**: the app does not crash; a `warn`-level log line about Sentry being unconfigured appears; the API request still gets its normal error response.

## Scenario 3 — Business metrics (User Story 3)

1. In development (`NODE_ENV=development`), perform a few tracked actions (create an item, log in successfully, log in with a wrong password).
2. `curl http://localhost:3000/api/metrics`.
3. **Expected**: the existing in-process counters (`item_create`, `login_success`, `login_failure`, etc.) increment — this validates `MetricsService` call sites are unchanged (see [research.md](./research.md) Decision 3).
4. In a deployed environment with `NODE_ENV=production` and CloudWatch IAM permissions in place, repeat step 1 and check the `RealSaveFooding/production` namespace in CloudWatch Metrics.
5. **Expected**: matching counters appear within 60 seconds (SC-003). See [contracts/business-metrics.md](./contracts/business-metrics.md).

## Scenario 4 — Failure isolation

1. Point `CLOUDWATCH_NAMESPACE`/AWS credentials at something invalid (or run with no network access) while `NODE_ENV=production`.
2. Perform a tracked business action.
3. **Expected**: the user-facing request still succeeds; a `warn`-level log records the CloudWatch failure; the app does not crash (FR-009, Edge Cases).

## Scenario 5 — No regressions on `console.*` (FR-011)

1. Run `grep -rn "console\." back/src` from the repo root.
2. **Expected**: no matches (already true today — see [research.md](./research.md) Decision 8). This same check is added to `.github/workflows/ci.yml` to prevent regressions.
