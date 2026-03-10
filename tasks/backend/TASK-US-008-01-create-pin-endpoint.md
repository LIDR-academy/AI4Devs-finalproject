# TASK-US-008-01: Create Pin Endpoint

Implement the POST /api/v1/files/pin/:cid endpoint for asynchronous content pinning.

[Trello Card](https://trello.com/c/OkQhuAHa)

## Parent User Story
[US-008: Content Pinning Management](../../user-stories/backend/US-008-content-pinning-management.md)

## Description
Create a REST API endpoint that allows authenticated users to pin their content on IPFS. The endpoint validates the user's API key, verifies ownership of the content, checks the current pin status, and queues the pinning operation as an asynchronous Celery task for reliability.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Create new route in `core/files/routes/pinning.py` or similar module
2. Define `POST /api/v1/files/pin/<cid>` endpoint with API key authentication
3. Validate that the CID exists in the database
4. Verify that the requesting user owns the file (match user_id from API key to file.user_id)
5. Check if content is already pinned (return 409 if already pinned)
6. Queue the `pin_content_async` Celery task with the file CID and user context
7. Return 202 Accepted with task_id and status_url for tracking
8. Add audit logging for the pin request
9. Implement proper error handling (404 for missing CID, 403 for unauthorized, 409 for conflict)
10. Write unit tests for all success and error cases

## Acceptance Criteria
- [ ] `POST /api/v1/files/pin/<cid>` endpoint is implemented
- [ ] API key authentication is required and validated
- [ ] User ownership is verified before queueing the task
- [ ] Returns 404 when CID doesn't exist
- [ ] Returns 403 when user doesn't own the content
- [ ] Returns 409 when content is already pinned
- [ ] Returns 202 with task_id and status_url on successful queueing
- [ ] Pin request is logged to AuditLog
- [ ] Endpoint handles Celery task queueing failures gracefully
- [ ] Unit tests achieve >90% code coverage

## Notes
- This endpoint only queues the pin operation; actual pinning happens in the Celery task (TASK-US-008-03)
- Consider rate limiting for pin operations if not already in place
- The pin status check should use the File model's `pinned` boolean field
- Use the existing `@require_api_key` decorator for authentication
- Follow the same async pattern as file upload (return task_id, not immediate result)

## Completion Status
- [x] 100% - Completed
