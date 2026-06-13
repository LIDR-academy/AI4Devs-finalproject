## PROMPT 1: Prompt execution (TKT-006)
~~~markdown
Here's a cleaner version that assumes **the ticket file has already been provided as context** and therefore doesn't need to be referenced explicitly by path or name repeatedly.

You are acting as a **Senior Full-Stack Software Engineer** on the **RealSaveFooding** project.

Your task is to implement the ticket already provided in the current context. Treat the ticket definition as the **single source of truth** for requirements, scope, acceptance criteria, and definition of done.

## Context Discovery

Before implementing any changes, review the existing project artifacts to understand the established patterns, constraints, and conventions.

### Architecture Documentation

Review all relevant documents under:

```text
docs/architecture/
```

Use these documents to understand:

* System architecture principles and constraints.
* Backend module organization.
* Frontend architectural conventions.
* Database design standards.
* Security requirements.
* Logging and observability approaches.
* Testing strategies and quality expectations.

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
* Product decisions that may influence implementation choices.

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
/back
```

Assume that parts of the requested functionality may already exist. Before implementing anything:

* Identify modules, services, controllers, repositories, DTOs, guards, interceptors, utilities, and tests related to the ticket requirements.
* Reuse and extend existing implementations whenever possible.
* Avoid duplicating logic already present in the codebase.
* Follow the established NestJS architecture, dependency injection patterns, and coding conventions.
* Respect existing Prisma usage, database access patterns, error handling mechanisms, and logging approaches.
* Refactor only when necessary to support the ticket requirements while minimizing impact on unrelated areas.

---

## Analysis Phase (mandatory before coding)

Before generating implementation code, provide:

1. A concise summary of the ticket requirements.
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

* What was found,
* Whether it should be reused, extended, or refactored,
* Why the proposed approach is preferable.

---

## Implementation Expectations

Approach the implementation as an experienced engineer working within an established codebase.

You should:

1. Understand the problem before proposing solutions.
2. Extend the current implementation rather than replacing it unnecessarily.
3. Follow the project's architectural decisions and coding standards.
4. Prioritize maintainability, consistency, and simplicity.
5. Keep the implementation aligned with the MVP scope.
6. Avoid speculative development and future-only abstractions.
7. Ensure all acceptance criteria and definition-of-done requirements from the ticket are satisfied.

---

## Testing Requirements

Implement all automated tests required by the ticket and aligned with the project's testing standards.

### Unit Tests

* Cover all business rules introduced by the ticket.
* Validate edge cases and error scenarios.
* Ensure deterministic behavior for any ranking, calculation, or decision-making logic.

### Integration Tests

* Verify interactions between modules, services, repositories, and APIs impacted by the ticket.
* Validate persistence behavior and transactional consistency where applicable.

### Playwright End-to-End Tests

Create or update Playwright tests covering the user journeys introduced by the ticket.

The Playwright implementation should:

* Follow the existing testing structure and conventions in the repository.
* Use stable selectors (`data-testid` preferred).
* Use deterministic seeded data or factories.
* Avoid flaky timing dependencies.
* Be suitable for execution in CI pipelines.
* Validate all relevant acceptance criteria from an end-user perspective.

Before implementing the Playwright tests, provide a mapping between the ticket's acceptance criteria and the corresponding automated scenarios.

---

## Implementation Phase

Once the analysis is complete, proceed with the implementation.

Ensure that:

* Changes are incremental and aligned with the ticket scope.
* Existing code is reused whenever appropriate.
* Code follows established project conventions.
* Appropriate validation and error handling are implemented.
* Logging and instrumentation requirements from the ticket are satisfied.
* Security requirements are enforced consistently.
* Documentation is updated when required.

For each significant implementation decision, explain the rationale behind it.

---

## Handling Uncertainty

If any requirement is ambiguous, conflicting, or missing:

* Explicitly identify the uncertainty.
* Explain the available implementation options.
* Describe the trade-offs of each option.
* Ask focused clarification questions before making assumptions.

Avoid making arbitrary decisions when the expected behavior cannot be reasonably derived from:

* The ticket definition already provided in context,
* Architecture documentation,
* Product documentation,
* Existing frontend implementation,
* Existing backend implementation.

Your objective is to deliver a production-quality implementation that satisfies the ticket requirements while remaining consistent with the architecture, existing codebase, and constraints of the RealSaveFooding project.

~~~
## PROMPT 2: Testing and Manual Validation
Tasks:
1. Add one more Playwright case for manual Refresh button behavior specifically (without consume/waste) to lock that acceptance criterion separately.

2. Provide the Manual Test Plan to validate the Playwright coverage for TKT-006. Include:
- Test case ID
- Test case description
- Preconditions
- Test steps
- Expected results

3. Validate that the Playwright tests cover all critical paths, edge cases, and user interactions defined in these tickets.Please fix all of the issues found and ensure that the Playwright tests are updated to cover these scenarios. 

4. Provide a mapping between the ticket's acceptance criteria and the corresponding automated scenarios.

## PROMPT 3: Findings
After manual tests I have the following findings:

- Price is not beind saved when creating a manual entry for a product. It is being saved as 0.00.
- Price is not being saved when scanning a receipt. It is being saved as 0.00.
- Default expiration date is not being set when scanning a receipt. It should be defaulted to the product's expiration date if available, or to a reasonable default if not and allow edition directly in the same page where the products extracted from text are listed.

Please fix all of the issues found in the manual tests and ensure that the Playwright tests are updated to cover these scenarios. 
