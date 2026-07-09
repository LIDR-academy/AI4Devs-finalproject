# Workflow: Test-Driven Development (TDD)

## Purpose

Define the standard multi-agent workflow for implementing features and fixes using a Test-Driven Development approach.

This workflow ensures behavior is defined before implementation, regression protection is built incrementally, and software remains maintainable and testable.

---

## Workflow Goals

The workflow aims to:

- define behavior before implementation
- improve regression protection
- improve design quality
- reduce implementation ambiguity
- improve testability
- improve maintainability
- encourage incremental development

---

## TDD Principles

All agents participating in this workflow should prioritize:

- behavior-first thinking
- small incremental steps
- failing tests before implementation
- minimal implementation
- continuous refactoring
- regression protection
- maintainable tests

Avoid:

- implementing features before defining expected behavior
- large uncontrolled implementations
- brittle tests
- testing implementation details
- skipping refactoring after passing tests

---

## 1. Requirement and Behavior Definition

## Primary Agents

- Product Owner Agent
- QA Engineer Agent

## Responsibilities

- Define expected behavior.
- Define acceptance criteria.
- Define validation scenarios.
- Define edge cases.
- Define failure scenarios.

## Outputs

- acceptance criteria
- behavior definition
- validation scenarios
- edge cases

---

## 2. Technical Design Review

## Primary Agents

- Tech Lead Agent
- Software Architect Agent when needed

## Responsibilities

- Define implementation boundaries.
- Define impacted modules.
- Define testing strategy.
- Identify architectural constraints.

## Outputs

- implementation strategy
- architectural constraints
- testing scope
- identified risks

---

## 3. Test Definition (Red Phase)

## Primary Agents

- Test Automation Engineer Agent
- Backend Developer Agent
- Frontend Developer Agent

## Responsibilities

- Write failing automated tests first.
- Define expected behavior through tests.
- Validate that tests fail correctly.
- Avoid overtesting implementation details.

## Outputs

- failing tests
- expected behavior validation
- test structure

---

## 4. Minimal Implementation (Green Phase)

## Primary Agents

- Backend Developer Agent
- Frontend Developer Agent

## Responsibilities

- Implement the minimal code required to satisfy tests.
- Avoid premature optimization.
- Avoid unrelated refactors.
- Preserve architectural consistency.

## Outputs

- minimal working implementation
- passing tests

---

## 5. Refactoring (Refactor Phase)

## Primary Agents

- Code Reviewer Agent
- Backend Developer Agent
- Frontend Developer Agent

## Responsibilities

- Improve readability.
- Improve maintainability.
- Remove duplication.
- Improve separation of concerns.
- Preserve behavior correctness.

## Outputs

- refactored implementation
- preserved passing tests
- maintainability improvements

---

## 6. Regression and Edge-Case Validation

## Primary Agents

- QA Engineer Agent
- Test Automation Engineer Agent

## Responsibilities

- Validate edge cases.
- Validate regression protection.
- Validate failure scenarios.
- Validate acceptance criteria coverage.

## Outputs

- regression validation
- edge-case validation
- missing coverage findings

---

## 7. Security and Operational Validation

## Primary Agents

- Security Reviewer Agent
- DevOps Engineer Agent when relevant

## Responsibilities

- Validate authorization behavior.
- Validate sensitive data handling.
- Validate deployment/runtime concerns.
- Validate operational impact.

## Outputs

- security findings
- operational considerations
- deployment concerns

## Optional

Required only when security or operational impact exists.

---

## 8. Final Review

## Primary Agents

- Code Reviewer Agent
- Tech Lead Agent

## Responsibilities

- Validate maintainability.
- Validate architecture alignment.
- Validate test quality.
- Validate implementation scope.
- Validate long-term sustainability.

## Outputs

- review findings
- final recommendations
- approval status

---

## Completion Criteria

A TDD workflow is complete when:

- behavior is clearly defined
- tests were written before implementation
- tests initially failed
- implementation satisfies tests
- refactoring preserves behavior
- regression protection exists
- edge cases are validated
- architecture remains consistent
- code review is completed

---

## Final Rule

TDD should improve software design, maintainability, regression protection, and confidence in behavior — not become a rigid ceremony or an excuse for excessive testing complexity.