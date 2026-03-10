# TASK-US-011-01: Create Exception Classes

Define a custom exception hierarchy to standardize how API failures are represented across the backend.

[Trello Card](https://trello.com/c/BmOvcGoz)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/11)

## Parent User Story
[US-011: Error Handling and Standardized Responses](../../user-stories/backend/US-011-error-handling-responses.md)

## Description
Create and align custom exception classes for validation, authentication, authorization, not found, conflict, rate limiting, and service/internal failures. Ensure these exceptions carry response-safe messages and optional structured details that global handlers can convert into consistent API responses.

## Priority
🟠 High

## Estimated Time
1 hour

## Detailed Steps
1. Review current exception classes and scattered error patterns in routes/services.
2. Define a coherent base exception and domain-specific subclasses with explicit status intent.
3. Ensure each class supports safe client-facing message and optional details payload.
4. Replace ad-hoc generic exceptions in key modules with the new custom exceptions.
5. Add/update tests validating raised exception types and mapped status semantics.

## Acceptance Criteria
- [x] A custom exception hierarchy exists and is documented in code
- [x] Validation/auth/not-found/conflict/rate-limit/server error categories are covered
- [x] Exceptions carry response-safe messages and optional details
- [x] Existing routes/services raise the standardized exceptions
- [x] Tests verify exception behavior and intended status mapping

## Notes
- Keep internal/debug details out of client messages.
- Avoid creating overlapping exception types with ambiguous intent.

## Completion Status
- [x] 100% - Completed