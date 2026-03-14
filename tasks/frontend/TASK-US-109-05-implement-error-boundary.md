# TASK-US-109-05: Add Error Boundary, Retry Flows, and Rate Limit/Session Feedback

Introduce robust runtime error handling with retry options, session timeout notifications, and rate-limit countdown feedback.

[Trello Card](https://trello.com/c/676HhPvT)

## Parent User Story
[US-109: Error Handling and Feedback UI](../../user-stories/frontend/US-109-error-handling-feedback.md)

## Description
Implement a global/client error boundary strategy and consistent UX for network failures, 429 responses, and expired sessions so users can recover quickly.

## Priority
High

## Estimated Time
45 minutes

## Detailed Steps
1. Add app-level error boundary component(s) for unexpected runtime failures.
2. Provide retry actions for recoverable request failures.
3. Detect network/API connectivity failures and expose retry affordances.
4. Implement session timeout notification with a clear login re-entry action.
5. Handle `429 Too Many Requests` with user-friendly messaging and a countdown based on `Retry-After`.
6. Add tests for boundary fallback, retry interactions, and countdown rendering.

## Acceptance Criteria
- [x] Unhandled UI errors render a safe fallback via error boundary.
- [x] Network error states include retry options.
- [x] Session timeout feedback is clearly shown with next-step action.
- [x] Rate-limit message includes countdown/retry timing.
- [x] Error handling behavior is covered by tests.

## Notes
- Keep error logging hooks pluggable for future tracking tooling.
- Ensure retry logic does not create infinite request loops.

## Completion Status
- [x] 100% - Done (awaiting QA)
