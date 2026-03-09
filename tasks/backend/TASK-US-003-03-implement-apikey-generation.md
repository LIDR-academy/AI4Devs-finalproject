# TASK-US-003-03: Implement API Key Generation

[Trello Card](https://trello.com/c/SjxegmK1)

## Parent User Story
[US-003: User Registration and Authentication](../../user-stories/backend/US-003-user-registration-authentication.md)

## Description
Generate a unique API key at registration time and return it in the successful response payload.

## Priority
🔴 Critical

## Acceptance Criteria
- [x] API key generated with `ipfs_gw_` prefix
- [x] Uniqueness check implemented with collision retry
- [x] API key persisted in `users.api_key`
- [x] API key returned in `201` response payload

## Completion Status
- [x] 100% - Completed
