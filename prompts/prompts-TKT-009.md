## PROMPT 1: Prompt execution (TKT-009)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** on the **RealSaveFooding** project.

Your task is to implement the ticket already provided in the current context. The ticket is located at:

```text
docs/tickets/TKT-009-consumption-waste-events.md
```

Treat the ticket definition as the **single source of truth** for requirements, scope, acceptance criteria, and definition of done.

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
* Existing aggregation and insights patterns.

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
* Remain aligned with the MVP scope.

### Existing Backend Implementation

Analyze the existing backend code under:

```text
/back
```

Assume that parts of the requested functionality may already exist. Before implementing anything:

* Identify modules, services, controllers, repositories, DTOs, guards, interceptors, utilities, and tests related to the ticket requirements.
* Identify existing event, insights, dashboard, pantry, and validation mechanisms that can be reused.
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
4. A proposed domain model interpretation and how it aligns with the current implementation.
5. Any assumptions identified during analysis.
6. Any ambiguities, inconsistencies, or missing requirements discovered.
7. A proposed implementation strategy covering:

   * Backend,
   * Frontend,
   * Database,
   * Insights aggregation,
   * Testing.
8. A list of files expected to be created or modified.
9. Any required schema changes or migrations.

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

## Event and Insights Requirements

When implementing the ticket:

* Ensure all event creation operations are auditable.
* Persist actor and timestamp information consistently.
* Enforce strict validation rules around quantities and values.
* Ensure metrics derived from events remain accurate and deterministic.
* Keep aggregation logic isolated from presentation concerns.
* Prevent accidental duplicate submissions from creating inconsistent state.
* Reuse existing insights and dashboard aggregation mechanisms whenever possible.

If new domain services or utilities are required:

* Clearly justify why they are necessary,
* Keep them focused on a single responsibility,
* Ensure they are independently testable.

---

## Testing Requirements

Implement all automated tests required by the ticket and aligned with the project's testing standards.

### Unit Tests

* Cover all business rules introduced by the ticket.
* Validate DTOs and event input validation.
* Verify value estimation logic.
* Ensure event deduplication mechanisms behave correctly.
* Validate edge cases and boundary conditions.

### Integration Tests

* Verify interactions between modules, services, repositories, and APIs impacted by the ticket.
* Validate persistence behavior and transactional consistency.
* Ensure insights and dashboard metrics update correctly after event creation.
* Verify duplicate submissions do not produce inconsistent data.

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

At minimum, include Playwright coverage for:

#### Consumption Event Flow

* User navigates to a pantry item.
* User registers a consumption event.
* The event is persisted successfully.
* Relevant dashboard and insights data are updated accordingly.

#### Waste Event Flow

* User navigates to a pantry item.
* User registers a waste event.
* Required quantity and value information are captured correctly.
* The event is persisted successfully.
* Relevant metrics are updated accordingly.

#### Waste Suggestion Confirmation Flow

* User receives or initiates a waste suggestion workflow.
* User explicitly confirms the waste action.
* The waste event is created only after confirmation.
* Cancelling the confirmation prevents event creation.

#### Insights Verification Flow

* User opens the insights area.
* Waste-related metrics are displayed correctly.
* Metrics reflect newly created consume or waste events.
* Values remain consistent after page refresh.

#### Duplicate Submission Protection

* User attempts to submit the same event multiple times in quick succession.
* The system prevents duplicate event creation.
* Metrics remain consistent.

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
## PROMPT 2: Findings
After manual tests I have the following findings:
- At /add the list title "RECENTLY ADDED" is static it's not reflecting the reality. Make it real.
- Right now there is no way to rollback when something is marked as consumed or wasted. I'd like to have 2 more filters at /pantry to show them. Once I have them there should be a button at edit to add it back to the pantry (rollback waste / consume action).
- When adding a manual entry /add/manual I want to have the "Estimate expiration" functionality that already exists at item edit.
- At /add when a new receipt is scanned and we receive back the text extracted, we are showing the title and total price, but if found we need to show also the price and price per unit (always if available). Also add labels to identify these values. All of them must be editable.
- When "Photo of product" or "Voice add" is clicked nothing happens as we are in MVP phase we need to show an alert or text advising the is not available in MVP.

Please fix all of the issues found in the manual tests and ensure that the Playwright tests are updated to cover these scenarios. 

## PROMPT 3:  More Findings 
After tryinh to re-add a consumed or Wasted item it Shows: "xxx added back to the pantry" but the item is not removed from the "Consumed" or "Wasted" list and it not shown in the other lists (All, Expiring, Fridge...). If i do a Hard refresh it's being shown. Fix this

## PROMPT 4: More Findings 
- Ok, now it works but the icons are being defaulted to 🍽️ which is wrong
- At /add when a new receipt is scanned and we receive back the text extracted, add the number of units. If the price per unit or the number of unit is changed, the total price should be calculated too.
- Add at /add receipte an option to choose the icon for each element.
- At /pantry none of the lists (All, Expiring, Fridge, Pantry, Freezer) are showing the correct emoji, always the default 🍽️. Fix it
- At entry edit the emoji can't be updated, fix it
- "Mark as consumed" across all pages sould be green backround not red.