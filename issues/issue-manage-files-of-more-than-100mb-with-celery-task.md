# [Enhancement] Manage files larger than 100MB with Celery task

| Field | Value |
|-------|-------|
| **Status** | Backlog |
| **Type** | Enhancement |
| **Labels** | backend, frontend, celery, uploads |
| **Trello** | https://trello.com/c/Ti7h3yi7/269-enhancement-async-upload-for-files-larger-than-100mb-via-celery |
| **GitHub issue** | https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/issues/20 |

---

## Summary

Uploads larger than 100MB should be handled asynchronously through Celery workers. The API should avoid long blocking requests by returning immediately with task metadata, while the frontend tracks upload status until completion.

---

## Problem

Large file uploads can keep request/response cycles open for too long, creating poor user experience and increasing the chance of timeouts or transient failures in the synchronous flow.

---

## Proposed behavior

- Detect files larger than 100MB at upload entry point.
- Route these uploads to a Celery task.
- Return an immediate async response (for example `202 Accepted`) with task metadata (`task_id`, status endpoint, initial state).
- Keep current synchronous upload behavior for files at or below 100MB.
- Provide consistent error/status mapping so frontend can show progress and failure reasons clearly.

---

## Acceptance Criteria

- [ ] Backend detects uploads over 100MB and dispatches them to Celery.
- [ ] Upload API returns immediately for async uploads with task metadata.
- [ ] A status endpoint (or equivalent mechanism) is available to query task progress and result.
- [ ] Frontend upload UI supports polling/refreshing task status and renders pending, success, and error states.
- [ ] Existing synchronous upload path for files up to 100MB remains unchanged.
- [ ] Unit and integration tests cover size threshold routing and async status flow.

---

## Implementation notes

- Reuse existing Celery patterns in the backend where possible.
- Consider chunking/streaming safeguards for memory pressure in worker processes.
- Ensure idempotency strategy for retries and duplicate task dispatches.
- Add observability logs for task lifecycle: queued, running, success, failure.
