# TASK-US-010-02: Implement Async Logging

Add asynchronous audit-log writing and retention/redaction controls for stored IP data.

[Trello Card](https://trello.com/c/PbdkPRA7)

## Parent User Story
[US-010: Audit Logging System](../../user-stories/backend/US-010-audit-logging.md)

## Description
Implement the lower-impact audit writing path required by US-010 and add configurable IP retention and redaction handling. This task covers asynchronous logging mechanics, retention-window configuration, redaction behavior after the window expires, and append-only redaction events for compliance tracking.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Review the current request and task architecture to choose the least disruptive async logging approach.
2. Implement asynchronous or deferred audit-log persistence so request latency remains low.
3. Add configuration for IP retention duration and redaction mode.
4. Implement IP redaction rules for IPv4, IPv6, and irreversible hash-based modes as required by configuration.
5. Ensure expired raw IP values are not mutated destructively; instead, mark records as redacted and write an explicit redaction event.
6. Log configuration changes affecting retention and redaction for compliance visibility.
7. Add tests for async write behavior, retention expiry handling, and append-only redaction events.

## Acceptance Criteria
- [x] Audit logging can execute asynchronously or through a deferred write path
- [x] IP retention duration is configurable
- [x] Expired IP values are redacted according to configured mode
- [x] Redaction is append-only and produces an explicit audit event
- [x] Retention or redaction configuration changes are also logged
- [x] Tests cover retention expiry and redaction behavior

## Notes
- Keep compliance behavior explicit and testable.
- Avoid designs that delete historical audit rows.
- If a background mechanism is introduced, document its operational dependency clearly.

## Completion Status
- [x] 100% - Completed