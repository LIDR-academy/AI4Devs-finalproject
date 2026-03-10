# TASK-US-007-01: Configure Celery and Redis Backend

Set up the Celery foundation for async processing in the backend.
[Trello Card](https://trello.com/c/AptLG67m)
[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/7)

## Parent User Story
[US-007: Celery Task Queue Setup](../../user-stories/backend/US-007-celery-task-queue.md)

## Description
Configure Celery with Redis broker and result backend, define shared defaults, queue routes, and startup entrypoints for worker and beat.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps
1. Add Celery dependencies and verify import paths used by the backend app.
2. Create Celery application bootstrap module (for example `core/celery_app.py`) with app discovery and configuration loading.
3. Configure Redis broker/result backend using environment variables (`CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`).
4. Set serializer/content/timezone/task tracking settings from US-007.
5. Define queue routing for upload and pinning tasks.
6. Add worker and beat startup commands to developer documentation.
7. Validate worker startup locally and ensure tasks can be discovered.

## Acceptance Criteria
- [ ] Celery app initializes correctly from backend configuration
- [ ] Redis broker/result backend are used and validated at startup
- [ ] Worker can be started independently
- [ ] Task routes/queues for upload and pinning are configured
- [ ] Beat startup command is documented for future scheduled tasks

## Notes
- Keep all Celery config in backend config modules to avoid drift.
- Prefer explicit queue names (`upload`, `pinning`) for observability.
- Ensure configuration is environment-driven and production-safe.

## Completion Status
- [x] 100% - Completed
