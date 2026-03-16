# TASK-US-010-01: Create Audit Service

Create a reusable backend service for writing structured, append-only audit events.

[Trello Card](https://trello.com/c/FBjMTNzy)

## Parent User Story
[US-010: Audit Logging System](../../user-stories/backend/US-010-audit-logging.md)

## Description
Implement a dedicated audit service that centralizes how significant user and administrator actions are recorded. The service should produce consistent `AuditLog` entries, capture relevant request context, and be easy to call from registration, file, and admin flows without duplicating logging logic across route handlers.

## Priority
🟠 High

## Estimated Time
1 hour

## Detailed Steps
1. Review existing places where `AuditLog` records are already created and identify duplicated patterns.
2. Design a shared audit service interface for action name, actor, request metadata, and structured details.
3. Ensure the service can record user and admin actions without changing append-only behavior.
4. Include request ID, IP-related context, and domain-specific details where available.
5. Update existing flows such as register, upload, retrieve, pin, unpin, revoke, and reactivate to use the shared service.
6. Add or update tests to confirm events are persisted with the expected fields and details payload.

## Acceptance Criteria
- [x] A reusable audit service exists for backend event logging
- [x] User actions and admin actions can be recorded through the same service abstraction
- [x] Audit events include `user_id`, `action`, `timestamp`, and structured `details`
- [x] Request correlation data such as request ID can be attached to events
- [x] Existing audit-writing paths are consolidated or aligned with the new service
- [x] Automated tests cover service usage from representative endpoints

## Notes
- Keep the write model append-only.
- Prefer one service entry point over scattered helper functions inside route modules.
- Reuse the existing `AuditLog` model instead of introducing parallel persistence structures.

## Completion Status
- [x] 100% - Completed