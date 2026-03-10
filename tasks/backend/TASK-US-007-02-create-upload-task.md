# TASK-US-007-02: Create Async Upload Task

Implement the asynchronous upload task used for large file operations.
[Trello Card](https://trello.com/c/oKAw3jfA)
[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/7)

## Parent User Story
[US-007: Celery Task Queue Setup](../../user-stories/backend/US-007-celery-task-queue.md)

## Description
Create a Celery task for file uploads that reports progress, retries transient failures with exponential backoff, and returns structured results compatible with status polling APIs.

## Priority
🔴 Critical

## Estimated Time
1.5 hours

## Detailed Steps
1. Create upload task module (for example `core/tasks/upload_tasks.py`).
2. Implement task signature with validated payload (file reference, user id, metadata).
3. Integrate existing `IPFSService` upload flow in task execution.
4. Add progress updates (`STARTED`, custom `PROGRESS`) during upload lifecycle.
5. Configure retry policy with exponential backoff for transient failures.
6. Return normalized success result including `cid`, filename, size, and timestamps.
7. Add unit tests for success, retry, and terminal failure paths.

## Acceptance Criteria
- [ ] Upload task can be queued and executed by Celery worker
- [ ] Task reports progress state while running
- [ ] Retry/backoff behavior works for transient errors
- [ ] Success result payload includes expected upload metadata
- [ ] Unit tests cover happy path and failure/retry paths

## Notes
- Keep task idempotency in mind to avoid duplicate upload side effects.
- Reuse existing validation and audit logging components when possible.
- Avoid passing raw file bytes through broker; use file references or persisted temp paths.

## Completion Status
- [x] 100% - Completed
