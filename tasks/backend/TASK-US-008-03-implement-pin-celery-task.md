# TASK-US-008-03: Implement Pin Celery Task

Create the asynchronous Celery task that performs the actual IPFS content pinning operation.

[Trello Card](https://trello.com/c/R9S3zyHp)

## Parent User Story
[US-008: Content Pinning Management](../../user-stories/backend/US-008-content-pinning-management.md)

## Description
Implement the async Celery task that communicates with Filebase/IPFS to pin content. This task should include circuit breaker protection, exponential backoff retry logic, database updates, progress reporting, and comprehensive error handling to ensure reliable pinning operations.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps
1. Create or update `core/tasks/pinning_tasks.py` module
2. Define `pin_content_async` Celery task with `bind=True` for progress updates
3. Accept parameters: `cid`, `file_id`, and `user_id` for context
4. Retrieve the File record from database by CID or file_id
5. Call `ipfs_service.pin_content(cid)` with circuit breaker protection
6. Implement retry logic with exponential backoff (max 3 retries, 2-10s delays)
7. Update File model's `pinned` field to True and set `pinned_at` timestamp
8. Update task progress metadata (10%, 50%, 100%) for client polling
9. Create AuditLog entry for successful pin operation
10. Handle errors: log failures, update task state, ensure proper exception propagation
11. Write unit tests for successful pinning, retries, circuit breaker, and failures

## Acceptance Criteria
- [ ] `pin_content_async` Celery task is implemented and registered
- [ ] Task accepts CID/file_id and user_id parameters
- [ ] Calls `ipfs_service.pin_content()` method with circuit breaker
- [ ] Implements exponential backoff retry (max 3 attempts)
- [ ] Updates File model `pinned=True` and `pinned_at` timestamp on success
- [ ] Reports progress metadata (10%, 50%, 100%) during execution
- [ ] Creates AuditLog entry with action="pin", resource_type="file"
- [ ] Handles circuit breaker open state gracefully (return appropriate error)
- [ ] Properly propagates exceptions to Celery for failed task tracking
- [ ] Task is routed to the `pinning` queue as configured in US-007
- [ ] Unit tests cover success, retry, circuit breaker, and failure scenarios

## Notes
- Reuse the circuit breaker and retry patterns from `core/tasks/file_tasks.py` upload task
- The `ipfs_service.pin_content(cid)` method may need to be implemented or verified
- Use the same Flask app context integration pattern from `core/celery_worker.py`
- Consider idempotency - what if the task runs twice for the same CID?
- Task should be atomic - either fully succeeds or fully fails with rollback
- Progress updates help users track long-running pin operations

## Completion Status
- [x] 100% - Completed
