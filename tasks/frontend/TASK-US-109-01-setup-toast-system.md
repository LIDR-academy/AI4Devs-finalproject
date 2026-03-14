# TASK-US-109-01: Setup Toast Notification System

Implement a centralized toast feedback system with success, error, warning, and info variants for consistent user messaging.

[Trello Card](https://trello.com/c/6sZmPgt3)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/25)

## Parent User Story
[US-109: Error Handling and Feedback UI](../../user-stories/frontend/US-109-error-handling-feedback.md)

## Description
Create a reusable toast layer used across forms, API actions, and background events. Standardize style, duration, and dismissal behavior by toast type to match story requirements.

## Priority
High

## Estimated Time
1 hour

## Detailed Steps
1. Configure a global toast provider in the app root layout.
2. Create helper utilities for `success`, `error`, `warning`, and `info` toasts.
3. Apply type-specific defaults:
   - Success: green, auto-dismiss in 3s
   - Error: red, manual dismiss
   - Warning: yellow, auto-dismiss in 5s
   - Info: blue, auto-dismiss in 3s
4. Add accessibility support (`aria-live`, focus-safe rendering).
5. Replace ad-hoc notifications in key flows (login, register, upload, retrieval) with the shared toast helpers.
6. Add tests for rendering and behavior (auto-dismiss vs manual dismiss).

## Acceptance Criteria
- [x] All four toast types are implemented and styled consistently.
- [x] Toast duration and dismissal behavior match US-109 requirements.
- [x] Toast API is reusable from any component/page.
- [x] Error toast supports explicit manual dismissal.
- [x] No duplicate provider instances exist in the app tree.

## Notes
- Prefer the existing `react-hot-toast` stack already used in the project.
- Keep helper APIs simple to reduce repetitive configuration per call site.

## Completion Status
- [x] 100% - Done (awaiting QA)
