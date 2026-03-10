# TASK-US-007-04: Implement Task Status Endpoint

Expose API endpoint(s) to query asynchronous task status and results.
[Trello Card](https://trello.com/c/cfLLta02)

## Parent User Story
[US-007: Celery Task Queue Setup](../../user-stories/backend/US-007-celery-task-queue.md)

## Description
Implement status endpoint(s) that query Celery result backend by task ID and return normalized state, progress, messages, and result payloads.

## Priority
🟠 High

## Estimated Time
1 hour

## Detailed Steps
1. Create route module for task status retrieval (for example `core/tasks/routes/status.py`).
2. Implement `GET /tasks/<task_id>/status` with API key protection.
3. Query Celery `AsyncResult` and map Celery states to API response contract.
4. Include progress/message fields for in-progress tasks.
5. Return result payload for successful tasks and meaningful error details for failures.
6. Add input validation for malformed task IDs.
7. Add tests for `PENDING`, `STARTED/PROGRESS`, `SUCCESS`, and `FAILURE` states.

## Acceptance Criteria
- [ ] Endpoint returns consistent status schema for all task states
- [ ] API key authorization is enforced
- [ ] Progress and messages are exposed for running tasks
- [ ] Success and failure payloads are returned in a predictable format
- [ ] Endpoint tests cover major state transitions and error cases

## Notes
- Keep response format aligned with US-007 API examples.
- Avoid leaking sensitive stack traces in failure responses.
- Consider rate limiting for frequent polling clients.

## Completion Status
- [x] 100% - Completed
