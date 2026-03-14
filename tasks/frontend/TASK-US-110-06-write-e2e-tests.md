# TASK-US-110-06: Write End-to-End Tests

Implement end-to-end Playwright tests for critical user journeys.

[Trello Card](https://trello.com/c/pXz9sCsI)

## Parent User Story
[US-110: Frontend Testing Suite](../../user-stories/frontend/US-110-frontend-testing.md)

## Description
Implement and stabilize E2E test scenarios for the most critical frontend paths: auth, upload, retrieve, and files management.

## Priority
🟠 High

## Estimated Time
2 hours

## Detailed Steps
1. Implement/expand tests for authentication flow.
2. Implement/expand tests for upload and files listing flow.
3. Implement/expand tests for retrieve-by-CID flow.
4. Cover critical file actions (download, pin/unpin, delete where applicable).
5. Reduce flakiness with robust waiting and scoped selectors.

## Acceptance Criteria
- [x] Critical user journeys are covered by E2E tests.
- [x] Tests pass reliably in local and CI environments.
- [x] Flaky selectors/timings are minimized.
- [x] Failures provide clear diagnostic output.

## Notes
- Focus on high-value journeys over exhaustive permutations.
- Keep tests independent to simplify debugging.

## Completion Status
- [x] 100% - Completed
