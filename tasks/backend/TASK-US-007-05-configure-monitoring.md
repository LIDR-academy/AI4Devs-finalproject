# TASK-US-007-05: Configure Failed Task Queue and Monitoring

Implement failed-task capture/replay flow and operator monitoring for Celery.
[Trello Card](https://trello.com/c/samR9pAo)

## Parent User Story
[US-007: Celery Task Queue Setup](../../user-stories/backend/US-007-celery-task-queue.md)

## Description
Set up application-level failed-task capture in Redis (via `task_failure` signal or `on_failure` hook), provide inspection/replay endpoints, and add monitoring via Flower.

## Priority
🟡 Medium

## Estimated Time
1 hour

## Detailed Steps
1. Implement failure capture hook (`task_failure` signal or task `on_failure`) in Celery integration layer.
2. Persist failed task payload/metadata to dedicated Redis key (`celery:failed_tasks`) and DB index.
3. Implement endpoint to list failed task entries with pagination/filtering.
4. Implement endpoint to replay selected failed tasks safely.
5. Add Flower configuration and startup command for task monitoring.
6. Document operational commands and troubleshooting steps in backend README.
7. Add tests for failed-task capture and replay flow.

## Acceptance Criteria
- [ ] Failed tasks are captured to Redis-backed failed-task queue
- [ ] Failed-task inspection endpoint is available
- [ ] Failed-task replay endpoint is available and validated
- [ ] Flower monitoring can be started and connected to broker
- [ ] Documentation includes monitoring and failed-task operations

## Notes
- This replaces native broker DLQ assumptions with app-level failure handling.
- Ensure replay endpoint prevents accidental duplicate side effects.
- Keep failed-task payloads minimal and redact sensitive values.

## Completion Status
- [x] 100% - Completed
