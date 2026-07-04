# Contract: CloudWatch Business Metrics

Interface exposed to the operational monitoring platform (AWS CloudWatch). Shape defined in [data-model.md](../data-model.md#business-metric-event).

**Namespace**: `RealSaveFooding/{environment}` (e.g. `RealSaveFooding/production`)

**Instrumentation model**: Every metric is emitted by a **direct `this.metrics.increment(...)` call inside the owning service**, at the exact line where the business event is unambiguously known — not by a generic HTTP route/status interceptor. This corrects an initial design (caught by `/speckit-analyze`) where a route-based interceptor could not actually distinguish several of these events: `item_consume`/`item_waste` share one endpoint (`POST /pantry/items/:id/events`, differentiated only by request-body `type`), and `item_waste` and `notification_sent` are also produced by hourly/60-second `setInterval` background passes that never go through an HTTP request an interceptor could observe. See `research.md` Decision 7 for the full rationale.

| Metric name | Unit | Emitted when | Instrumentation point |
|---|---|---|---|
| `item_create` | Count | A pantry item is created | `PantryService.create()` — `back/src/modules/pantry/pantry.service.ts` |
| `item_consume` | Count | `registerEvent` is called with `type=CONSUMED` | `PantryService.registerEvent()` — `back/src/modules/pantry/pantry.service.ts` |
| `item_waste` | Count | `registerEvent` with `type=WASTED`, a bulk-waste action, or the hourly auto-expiry pass wastes items | `PantryService.registerEvent()`, `PantryService.bulkWasteItems()` (value = item count), `PantryService.autoWasteExpired()` (value = item count) — all in `back/src/modules/pantry/pantry.service.ts` |
| `receipt_upload_success_total` | Count | Receipt OCR processing completes | **Already instrumented** — `ReceiptsService.uploadAndProcess()`, `back/src/modules/receipts/receipts.service.ts:110` (existing `RECEIPT_METRICS.uploadSuccess` call; no new code needed, only forwarded to CloudWatch by the `MetricsService` extension) |
| `receipt_upload_failure_total` | Count | Receipt OCR processing fails | **Already instrumented** — `back/src/modules/receipts/receipts.service.ts:125` (existing `RECEIPT_METRICS.uploadFailure` call) |
| `notification_sent` | Count | Any notification (expiry email/push, badge, digest email/push, digest summary) is recorded with `NotificationLog.status = "SENT"` | `NotificationDeliveryService` — a private `#recordSent()` helper called at each of its 6 `status: "SENT"` write sites, `back/src/modules/notifications/notification-delivery.service.ts` |
| `login_success` | Count | A login attempt succeeds | `AuthService.login()` — `back/src/modules/auth/auth.service.ts` |
| `login_failure` | Count | A login attempt is rejected (unknown email or wrong password) | `AuthService.login()` — both `UnauthorizedException` throw sites, `back/src/modules/auth/auth.service.ts` |

**Naming note**: `receipt_processed`/`receipt_failed` in the source ticket (EXT-004) and `spec.md`'s business-language description ("receipt processed successfully" / "receipt processing failed") map to the **existing** `RECEIPT_METRICS.uploadSuccess`/`uploadFailure` constants (`receipt_upload_success_total`/`receipt_upload_failure_total`). The contract uses the existing, already-tested names rather than renaming working production code or introducing a second, differently-named counter for the same event.

## Guarantees

- Each metric is delivered as `putMetricData` with `Value: 1` (or the item/notification count for bulk operations), `Unit: "Count"`, within 60 seconds of the triggering event (SC-003), best-effort.
- Emission is fire-and-forget: a CloudWatch API failure is caught, logged as a `warn`-level Log Record, and does not affect the triggering request or background pass (FR-009).
- In any non-production environment, metric emission is a no-op at the CloudWatch layer — the existing in-process `MetricsService` counters (visible at `GET /api/metrics`) still increment normally, so local/dev behavior is unchanged.
- Every metric has exactly one direct call site per logical event (no shared route/status inference), so background-triggered events (auto-expiry waste, scheduled notifications) are captured just as reliably as HTTP-triggered ones.
- Alarms (`ErrorRate > 1%` / `p95 latency > 500ms` over 5 minutes, per FR-010) are provisioned in Terraform (`infra/terraform/envs/prod`), are independent of the business counters in this table, and route to the project's existing SNS notification topic.
