## PROMPT 1: Prompt execution (TKT-004)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** on the **RealSaveFooding** project.

Your task is to implement the ticket provided in the current context. The complete ticket definition, including objectives, scope, technical requirements, acceptance criteria, and definition of done, is available in the corresponding ticket file. Use that ticket as the authoritative source of requirements.

## Context Discovery

Before proposing or implementing any changes, review the existing project artifacts to understand the established patterns, constraints, and conventions.

### Architecture Documentation

Review all relevant documents under:

```text
docs/architecture/
```

Use these documents to understand:

* Architectural principles and constraints.
* Backend module organization.
* Frontend structure and conventions.
* Database design standards.
* Security requirements.
* Logging and observability approach.
* Testing strategy and quality expectations.

### Product Documentation

Review all relevant documents under:

```text
docs/product/
```

Use these documents to understand:

* User journeys.
* Functional requirements.
* MVP boundaries.
* Domain terminology.
* Product decisions that may affect implementation choices.

### Existing Frontend Implementation

Analyze the existing frontend code under:

```text
/front
```

Ensure that any frontend changes:

* Follow the established design language and UX patterns.
* Reuse existing components whenever possible.
* Respect the current folder structure and conventions.
* Avoid introducing unnecessary dependencies.

### Existing Backend Implementation

Analyze the existing backend code under:

```text
/ back
```

Assume that parts of the requested functionality may already exist. Before implementing anything:

* Identify existing modules, services, controllers, repositories, DTOs, guards, interceptors, utilities, and tests related to the ticket.
* Reuse and extend existing implementations whenever possible.
* Avoid duplicating logic that already exists in the codebase.
* Follow the established NestJS architecture, dependency injection patterns, and coding conventions.
* Respect existing database access patterns, Prisma usage, error handling mechanisms, and logging approaches.
* Refactor only when necessary to support the ticket requirements while minimizing the impact on unrelated areas.

---

## Ticket Processing Instructions

Use the referenced ticket file as the primary source of truth.

From the ticket, identify and analyze:

* Objectives.
* Functional requirements.
* Non-functional requirements.
* Scope boundaries.
* Technical tasks.
* Data requirements.
* API requirements.
* Security considerations.
* Acceptance criteria.
* Definition of done.

Do not infer additional requirements beyond what is explicitly documented unless necessary to resolve implementation gaps.

---

## Implementation Expectations

Approach the implementation as an experienced engineer working within an established codebase.

You should:

1. Understand the problem before proposing solutions.
2. Review existing implementations that may already solve similar concerns.
3. Extend the current implementation rather than replacing it unnecessarily.
4. Follow the project's architectural decisions and coding standards.
5. Prioritize maintainability, consistency, and simplicity.
6. Keep the implementation aligned with the MVP scope.
7. Avoid speculative development and future-only abstractions.

---

## Analysis Phase

Before generating implementation code, provide:

1. A summary of the ticket requirements.
2. An impact analysis describing which areas of the system will be affected.
3. A review of existing frontend and backend components that can be reused or extended.
4. Any assumptions identified during analysis.
5. Any ambiguities, inconsistencies, or missing requirements discovered.
6. A proposed implementation strategy covering:

   * Backend,
   * Frontend,
   * Database,
   * Infrastructure (if applicable),
   * Testing.
7. A list of files expected to be created or modified.
8. Any required schema changes or migrations.

If similar functionality already exists, explicitly explain:

* What was found.
* Whether it should be reused, extended, or refactored.
* Why the proposed approach is preferable.

---

## Implementation Phase

Once the analysis is complete, proceed with the implementation.

Ensure that:

* Changes are incremental and aligned with the ticket scope.
* Existing code is reused whenever appropriate.
* Code follows established project conventions.
* Appropriate error handling is implemented.
* Logging and instrumentation requirements from the ticket are satisfied.
* Security requirements are enforced consistently.
* Tests are implemented following the project's testing strategy.

For each significant implementation decision, explain the rationale behind it.

---

## Testing Requirements

Implement the tests required by the ticket and align them with the existing project standards.

Prefer reusing established testing patterns, fixtures, factories, and utilities already present in the codebase.

If additional testing infrastructure is required, justify why it is necessary.

---

## Handling Uncertainty

If any requirement is ambiguous, conflicting, or missing:

* Explicitly identify the uncertainty.
* Explain the available implementation options.
* Describe the trade-offs of each option.
* Ask focused clarification questions before making assumptions.

Avoid making arbitrary decisions when the expected behavior cannot be reasonably derived from:

* The ticket definition,
* Architecture documentation,
* Product documentation,
* Existing frontend implementation,
* Existing backend implementation.

The objective is to deliver a production-quality implementation that satisfies the ticket requirements while remaining consistent with the architecture, existing codebase, and constraints of the RealSaveFooding project.

~~~

## PROMPT 2: Testing and Manual Validation
Run backend and frontend tests for all edge cases and error handling paths. Pay attention to the following:
- Inconsistencies in validation rules.
- Error handling for invalid inputs.
- Inconsistencies in API responses.
- Not covering all edge cases in the tests.
- E2E tests for the entire flow, including user interactions and API calls.

 Keep the test suite running to allow for manual validation of the implemented feature, ensuring it works as expected.

## PROMPT 3: 
Based on the implementation of the current ticket, generate a comprehensive set of manual test cases to verify that the functionality works as expected.

For each test case, provide:

Test ID
Test objective
Preconditions
Test steps
Expected result
Priority (High / Medium / Low)
Ensure the tests cover:

All acceptance criteria defined in the ticket.
Positive scenarios (happy paths).
Negative scenarios and validation errors.
Edge cases.
Security and authorization checks relevant to the ticket.
Any user-facing behavior introduced by the implementation.
The output should be suitable for inclusion in the project's QA documentation and executable by a tester without prior knowledge of the implementation details.

Once the test cases are generated, generate the Playwright test code to automate the execution of these manual test cases, ensuring that the automated tests cover the same scenarios and validation checks as the manual tests.