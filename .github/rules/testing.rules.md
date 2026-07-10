# Testing Rules

## Purpose

These rules define testing expectations for all agents.

## Required

- Every relevant change should include a testing strategy.
- Tests should validate behavior, not implementation details.
- Tests should be deterministic and repeatable.
- Test names should clearly describe expected behavior.
- Cover success cases, validation errors, edge cases, and failure scenarios.
- Mock external dependencies when appropriate.
- Keep test setup understandable and maintainable.
- Prefer small focused tests over large unclear tests.
- Reset shared mocks, fakes, and mutable state between tests to avoid cross-test coupling.
- Prioritize tests for externally observable behavior at API, use-case, and public contract boundaries.

## Forbidden

- Do not skip testing recommendations for non-trivial changes.
- Do not write tests that only verify mocks were called without validating behavior.
- Do not create flaky tests.
- Do not depend on test execution order.
- Do not use production services or real credentials in tests.
- Do not overmock core business logic.
- Do not generate tests that are tightly coupled to implementation details.

## Test Types

Agents should consider:

- Unit tests for isolated business logic.
- Integration tests for APIs, persistence, and module interaction.
- Contract tests for external services or public interfaces.
- End-to-end tests for critical user flows.
- Regression tests for bug fixes.

## TDD Rule

When the user or project requests TDD:

- Define expected behavior first.
- Write failing tests before implementation.
- Implement the minimum code required to pass tests.
- Refactor only after tests pass.
- Do not generate full implementation before tests.

## Coverage Expectations

Prioritize coverage for:

- Business rules.
- Validation logic.
- Error handling.
- Permissions and access control.
- Critical workflows.
- Edge cases.
- Data persistence behavior.

## Final Rule

Testing must increase confidence in behavior, not just increase coverage numbers.