# Feature Specification: Application Observability (Structured Logging, Error Tracking & Metrics)

**Feature Branch**: `003-observability-logging`

**Created**: 2026-07-04

**Status**: Draft

**Input**: User description: "docs/tickets/extendedMVP/EXT-004-observability-logging.md — As an operator, I want structured logs and error tracking so that I can detect and diagnose production issues without SSH access."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Diagnose an issue from structured request/error logs (Priority: P1)

As an operator, when a user reports an error, I want to search the application's logs by a request identifier and immediately see what happened — which endpoint was called, by whom (in a privacy-safe form), how long it took, and what error (if any) occurred — so I can diagnose the problem without needing shell access to any server.

**Why this priority**: This is the foundational capability. Without structured, correlatable logs, every other observability capability (error tracking, metrics) has nothing to point back to. It directly removes the operator's current blind spot (unstructured console output with no way to trace a single request).

**Independent Test**: Can be fully tested by making a request to the running application (success and failure cases) and confirming a single, structured log record is produced containing a shared request identifier, timing, outcome, and a masked user identifier — deliverable and verifiable without any other observability feature in place.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** a user makes any API request, **Then** a single structured log record is produced containing a unique request identifier, the endpoint, the outcome (status), the duration, and the acting user's identifier in masked form.
2. **Given** an API request results in an unhandled error, **When** the error occurs, **Then** the resulting error log record includes the same request identifier as the request log, the failing component, and enough detail to identify the cause, without exposing personal data.
3. **Given** the application is running in a local/development environment, **When** an operator views the console output, **Then** log records are presented in a human-readable form rather than raw structured data.

---

### User Story 2 - Get notified when unhandled errors occur in production (Priority: P2)

As an operator, I want unhandled application errors to be automatically captured and surfaced to an error-tracking view (rather than only appearing in logs I have to go looking for), so I find out about production problems proactively instead of waiting for a user complaint.

**Why this priority**: Builds directly on P1's log correlation, but adds proactive awareness — the operator no longer has to already know something is wrong to find it. This is the second most valuable capability because it shortens time-to-detection.

**Independent Test**: Can be fully tested by triggering an unhandled exception in the running application and confirming it appears in the error-tracking view with the originating request's context, independent of whether metrics (User Story 3) are implemented.

**Acceptance Scenarios**:

1. **Given** an unhandled exception occurs anywhere in the application, **When** the exception propagates, **Then** it is automatically captured by the error-tracking service along with the request context (request identifier, endpoint, masked user identifier).
2. **Given** the error-tracking service is misconfigured or unreachable, **When** an unhandled exception occurs, **Then** the application continues serving other requests normally (the capture failure does not crash or block the app), and a warning is logged locally.

---

### User Story 3 - Monitor business activity and system health trends (Priority: P3)

As an operator/product owner, I want key business events (items added, consumed, or wasted; receipts processed; notifications sent; login attempts) and system health indicators (error rate, response latency) tracked over time, so I can monitor adoption/health trends and be alerted automatically when error rate or latency crosses an unacceptable threshold.

**Why this priority**: This is valuable for longer-term operational and product visibility but is not required to diagnose an individual incident (P1) or to be notified of a crash (P2) — it rounds out the observability picture rather than being blocking.

**Independent Test**: Can be fully tested by performing each tracked business action (e.g., creating an item, a successful and a failed login) and confirming a corresponding counter increments in the monitoring platform, independent of the logging and error-tracking stories.

**Acceptance Scenarios**:

1. **Given** a user creates a pantry item, consumes an item, wastes an item, has a receipt processed or fail processing, receives a notification, or attempts to log in (success or failure), **When** each of these events completes, **Then** a corresponding counter is incremented in the operational monitoring platform within 60 seconds.
2. **Given** the error rate across requests exceeds 1% over a 5-minute window, or the 95th-percentile response latency exceeds 500ms over a 5-minute window, **When** either threshold is crossed, **Then** an alert is triggered to notify operators.
3. **Given** the monitoring platform is temporarily unavailable, **When** a business event occurs, **Then** the event's metric emission fails silently (logged as a warning) without affecting the user-facing request.

---

### Edge Cases

- What happens when the metric-emission call fails or times out? The user-facing request MUST NOT fail or slow down as a result; the failure is logged and swallowed.
- What happens when the error-tracking service has an invalid or missing configuration at startup? The application MUST still start and serve requests; a warning is logged.
- What happens when request identifier generation fails? The system MUST fall back to a placeholder identifier rather than failing the request.
- How does the system prevent personal data (email, receipt contents, item notes) from ever appearing in a log or error record?
- What happens to existing unstructured log statements throughout the codebase during the transition — are any left over after this feature ships?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST produce one structured log record per incoming request, containing at minimum: timestamp, severity level, a unique request identifier, the endpoint called, the outcome/status, the duration, and the acting user's identifier in a masked, non-reversible-to-plain-text form.
- **FR-002**: System MUST allow every log record related to a single request (the request-level record and any error records) to be correlated via a shared request identifier.
- **FR-003**: System MUST NOT include email addresses, receipt contents, or item notes in any log or error-tracking record.
- **FR-004**: System MUST mask the acting user's identifier in all log output (showing only a non-identifying partial form).
- **FR-005**: System MUST present logs in a human-readable form in local/development environments and in a machine-parseable structured form in production.
- **FR-006**: System MUST automatically capture unhandled exceptions to an error-tracking service, including the correlated request identifier and enough context to diagnose the failure.
- **FR-007**: System MUST continue normal operation when the error-tracking service is unavailable or misconfigured, logging a local warning instead of failing the request or crashing the application.
- **FR-008**: System MUST emit a counter to the operational monitoring platform for each of the following business events: item created, item consumed, item wasted, receipt processed successfully, receipt processing failed, notification sent, login succeeded, login failed.
- **FR-009**: System MUST continue normal operation when the operational monitoring platform is unavailable, logging a local warning instead of failing the request.
- **FR-010**: System MUST support alerting operators when the request error rate exceeds 1% or the 95th-percentile response latency exceeds 500ms, each measured over a rolling 5-minute window.
- **FR-011**: System MUST NOT contain any remaining unstructured, ad hoc console output once this feature is complete — all application output goes through the structured logging capability.

### Key Entities

- **Log Record**: A single structured entry representing one request or one error event. Attributes: timestamp, severity level, request identifier, endpoint/method, outcome/status, duration, masked user identifier, originating module (for errors), message, and error detail (for errors).
- **Business Metric Event**: A named, countable occurrence of a business action (e.g., item created, login failed) sent to the monitoring platform, optionally with dimensions (e.g., environment).
- **Captured Exception**: An unhandled error sent to the error-tracking service, carrying the correlated request identifier and surrounding request context.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can locate the full lifecycle of any single request (start, outcome, and any error) using only its request identifier, without server shell access, in under 2 minutes.
- **SC-002**: 100% of unhandled application errors in production are visible in the error-tracking view within 1 minute of occurring.
- **SC-003**: Key business events are reflected in the monitoring platform within 60 seconds of occurring, for at least 99% of events.
- **SC-004**: Zero instances of personal data (email, receipt contents, item notes, unmasked user identifiers) appear in logs or error-tracking records, verified by audit.
- **SC-005**: Operators are alerted automatically within 5 minutes of the error rate or latency crossing its defined threshold, without needing to manually check dashboards.
- **SC-006**: Zero unstructured/ad hoc log statements remain in the backend codebase after this feature ships, verified by an automated repository check.

## Assumptions

- This feature is backend-only; no changes to data storage schemas are required.
- The application already runs in an environment (AWS-hosted, per existing infrastructure) that can host an operational monitoring platform and receive metric/log data — provisioning of that underlying infrastructure is covered by the related infrastructure feature (EXT-003) and is a dependency, not part of this feature's scope.
- An error-tracking service account/project is available or will be provisioned before this feature is deployed to production (flagged as an open question in the source ticket).
- Alert notification routing (who/where alerts are sent) reuses the project's existing operational notification channel; establishing a brand-new channel is out of scope.
- "Operator" refers to the internal team member(s) responsible for running and maintaining the application (DevOps/on-call), not an end user of the product.
- Frontend error tracking, third-party log aggregation services, and distributed tracing are explicitly out of scope for this feature (may be considered separately in the future).
