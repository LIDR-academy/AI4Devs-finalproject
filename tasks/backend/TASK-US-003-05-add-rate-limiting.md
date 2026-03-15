# TASK-US-003-05: Add Rate Limiting

[Trello Card](https://trello.com/c/SjxegmK1)

## Parent User Story
[US-003: User Registration and Authentication](../../user-stories/backend/US-003-user-registration-authentication.md)

## Description
Protect the registration endpoint with per-IP rate limiting to reduce abuse and brute-force attempts.

## Priority
🔴 Critical

## Acceptance Criteria
- [x] Registration route limited to `5/hour` per IP
- [x] Exceeding limit returns `429 Too Many Requests`
- [x] Rate limit behavior covered by tests

## Completion Status
- [x] 100% - Completed
