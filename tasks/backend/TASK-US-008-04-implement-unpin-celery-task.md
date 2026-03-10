# TASK-US-008-04: Implement Unpin Celery Task

Create the asynchronous Celery task that performs the actual IPFS content unpinning operation.

[Trello Card](https://trello.com/c/IVMoiDEP)

## Parent User Story
[US-008: Content Pinning Management](../../user-stories/backend/US-008-content-pinning-management.md)

## Description
Implement the async Celery task that communicates with Filebase/IPFS to unpin content. This task should include circuit breaker protection, exponential backoff retry logic, database updates, progress reporting, and comprehensive error handling to ensure reliable unpinning operations.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps
1. Create or update `core/tasks/pinning_tasks.py` module
2. Define `unpin_content_async` Celery task with `bind=True` for progress updates
3. Accept parameters: `cid`, `file_id`, and `user_id` for context
4. Retrieve the File record from database by CID or file_id
5. Call `ipfs_service.unpin_content(cid)` with circuit breaker protection
6. Implement retry logic with exponential backoff (max 3 retries, 2-10s delays)
7. Update File model's `pinned` field to False and set `unpinned_at` timestamp (if field exists)
8. Update task progress metadata (10%, 50%, 100%) for client polling
9. Create AuditLog entry for successful unpin operation
10. Handle errors: log failures, update task state, ensure proper exception propagation
11. Write unit tests for successful unpinning, retries, circuit breaker, and failures

## Acceptance Criteria
- [ ] `unpin_content_async` Celery task is implemented and registered
- [ ] Task accepts CID/file_id and user_id parameters
- [ ] Calls `ipfs_service.unpin_content()` method with circuit breaker
- [ ] Implements exponential backoff retry (max 3 attempts)
- [ ] Updates File model `pinned=False` on success (does not delete record)
- [ ] Reports progress metadata (10%, 50%, 100%) during execution
- [ ] Creates AuditLog entry with action="unpin", resource_type="file"
- [ ] Handles circuit breaker open state gracefully (return appropriate error)
- [ ] Properly propagates exceptions to Celery for failed task tracking
- [ ] Task is routed to the `pinning` queue as configured in US-007
- [ ] Unit tests cover success, retry, circuit breaker, and failure scenarios

## Notes
- Reuse the circuit breaker and retry patterns from `core/tasks/pinning_tasks.py` pin task
- The `ipfs_service.unpin_content(cid)` method may need to be implemented or verified
- Use the same Flask app context integration pattern from `core/celery_worker.py`
- Unpinning should be idempotent - calling unpin on already unpinned content should succeed
- File record must remain in database after unpinning (soft operation)
- Consider what Filebase/IPFS does with unpinned content (may become unavailable over time)
- Progress updates help users track long-running unpin operations

## Completion Status
- [x] 100% - Completed
