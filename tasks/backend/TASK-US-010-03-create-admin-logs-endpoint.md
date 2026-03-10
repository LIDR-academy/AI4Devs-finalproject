# TASK-US-010-03: Create Admin Logs Endpoint

Add the administrator-only API endpoint for retrieving audit logs with pagination and raw-IP access control.

[Trello Card](https://trello.com/c/qGyF6Ney)

## Parent User Story
[US-010: Audit Logging System](../../user-stories/backend/US-010-audit-logging.md)

## Description
Create `GET /admin/audit-logs` so administrators can inspect recorded audit events safely. The endpoint should enforce admin-only access, return paginated results, and control whether raw or masked IP values are returned based on authorization and retention state.

## Priority
🟠 High

## Estimated Time
1 hour

## Detailed Steps
1. Define the admin route and integrate it into the existing admin-protected routing surface.
2. Enforce administrator-only access using the existing auth and admin controls.
3. Implement paginated audit-log retrieval with the project response format.
4. Support `include_raw_ip` while ensuring expired retained values are still redacted.
5. Return masked or raw IP representations according to authorization and retention rules.
6. Add tests for authorized admin access, unauthorized access, pagination, and raw-IP behavior.

## Acceptance Criteria
- [x] `GET /admin/audit-logs` exists
- [x] Only administrators can access the endpoint
- [x] Responses are paginated and follow the project API response structure
- [x] `include_raw_ip` is honored only for authorized admin access
- [x] Redacted records never expose expired raw IP data
- [x] Automated tests cover success and access-control scenarios

## Notes
- Keep response behavior aligned with the API specification in the user story.
- Reuse existing admin decorators and error-response conventions.
- Do not bypass retention/redaction rules when `include_raw_ip=true` is requested.

## Completion Status
- [x] 100% - Completed