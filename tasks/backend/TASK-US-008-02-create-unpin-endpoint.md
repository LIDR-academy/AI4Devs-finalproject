# TASK-US-008-02: Create Unpin Endpoint

Implement the POST /api/v1/files/unpin/:cid endpoint for asynchronous content unpinning.

[Trello Card](https://trello.com/c/pCDlUsq8)
[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/8)

## Parent User Story
[US-008: Content Pinning Management](../../user-stories/backend/US-008-content-pinning-management.md)

## Description
Create a REST API endpoint that allows authenticated users to unpin their content from IPFS. The endpoint validates the user's API key, verifies ownership of the content, checks the current pin status, and queues the unpinning operation as an asynchronous Celery task for reliability. Unpinning does not delete the file record from the database.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps
1. Create new route in `core/files/routes/pinning.py` or similar module
2. Define `POST /api/v1/files/unpin/<cid>` endpoint with API key authentication
3. Validate that the CID exists in the database
4. Verify that the requesting user owns the file (match user_id from API key to file.user_id)
5. Check if content is already unpinned (return 409 if already unpinned)
6. Queue the `unpin_content_async` Celery task with the file CID and user context
7. Return 202 Accepted with task_id and status_url for tracking
8. Add audit logging for the unpin request
9. Implement proper error handling (404 for missing CID, 403 for unauthorized, 409 for conflict)
10. Write unit tests for all success and error cases

## Acceptance Criteria
- [ ] `POST /api/v1/files/unpin/<cid>` endpoint is implemented
- [ ] API key authentication is required and validated
- [ ] User ownership is verified before queueing the task
- [ ] Returns 404 when CID doesn't exist
- [ ] Returns 403 when user doesn't own the content
- [ ] Returns 409 when content is already unpinned
- [ ] Returns 202 with task_id and status_url on successful queueing
- [ ] Unpin request is logged to AuditLog
- [ ] Endpoint handles Celery task queueing failures gracefully
- [ ] Unit tests achieve >90% code coverage
- [ ] File record remains in database after unpinning

## Notes
- This endpoint only queues the unpin operation; actual unpinning happens in the Celery task (TASK-US-008-04)
- Unpinning is a soft operation - the file record stays in the database with `pinned=False`
- The unpin status check should use the File model's `pinned` boolean field
- Use the existing `@require_api_key` decorator for authentication
- Follow the same async pattern as pin endpoint (return task_id, not immediate result)
- Consider what happens if a user tries to retrieve an unpinned file

## Completion Status
- [x] 100% - Completed
