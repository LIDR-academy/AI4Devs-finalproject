## PROMPT 1: What's missing in the ticket. Update the ticket
According to the current project status, some of the features mentioned in the ticket docs/tickets/TKT-012-frontend-pantry-add-item-flow.md are already implemented in the repo. Tell me what we're missing and adapt the ticket with the remaining things to implement.

## PROMPT 2: 
~~~markdown
Here's a prompt following the same style as the previous tickets. It assumes the ticket already exists in the repository and has been added to the current context, so the content should **not** be duplicated.

I'd use something like this:

You are acting as a **Senior Frontend Engineer** on the **RealSaveFooding** project.

Your task is to implement the ticket described in:

```text
docs/tickets/TKT-012-frontend-pantry-add-item-flow.md
```

Treat the ticket as the **single source of truth** for requirements, scope, acceptance criteria, and definition of done. Do not duplicate the ticket contents unless you need to highlight ambiguities or implementation trade-offs.

## Context Discovery

Before implementing anything, review and understand the existing project structure and documentation.

### Architecture

Review all relevant documents under:

```text
docs/architecture/
```

Use them to understand:

* Frontend architectural principles,
* State management patterns,
* Routing conventions,
* Testing standards,
* Accessibility expectations,
* Analytics and observability guidelines.

### Product Documentation

Review:

```text
docs/product/
```

to understand the intended pantry experience, user journeys, and MVP constraints.

### Existing Frontend Implementation

Analyze the frontend implementation under:

```text
/front
```

Assume that most of the manual add-item flow already exists.

Before writing code:

* Identify the existing routes, pages, components, hooks, API clients, schemas, and utilities involved in the add-item flow.
* Determine which pieces should be reused, extended, or refactored.
* Avoid introducing duplicate logic.
* Follow the established React, TypeScript, Vite, and UI conventions already present in the project.
* Preserve backwards compatibility with existing functionality and tests.

---

## Analysis Phase (mandatory before coding)

Before generating implementation code, provide:

1. A summary of the remaining work required by the ticket.
2. An impact analysis describing which frontend areas will be affected.
3. Existing components, hooks, utilities, or patterns that can be reused.
4. Any assumptions or ambiguities discovered.
5. A proposed implementation strategy covering:

   * Analytics,
   * Validation,
   * Form handling,
   * Accessibility,
   * Navigation behavior,
   * State persistence,
   * Testing.
6. A list of files expected to be created or modified.
7. Any dependencies that need to be introduced or configured.

If a requested capability already exists, explain whether it should be reused, extended, or refactored, and justify the decision.

---

## Implementation Expectations

Implement the ticket incrementally while minimizing regressions.

You should:

* Follow the existing frontend architecture and folder conventions.
* Reuse existing components whenever possible.
* Keep the implementation aligned with MVP scope.
* Avoid introducing unnecessary abstractions.
* Ensure all acceptance criteria and definition-of-done requirements are satisfied.
* Preserve existing end-to-end flows unless explicitly changed by the ticket.

---

## Frontend Requirements

Implement all functionality required by the ticket, including but not limited to:

* Analytics event tracking,
* Field-level validation improvements,
* Accessibility enhancements,
* Input sanitization,
* Success feedback mechanisms,
* Pantry navigation experience improvements,
* Filter/search/sort preservation,
* Household-access warning handling,
* Automated test coverage.

When multiple implementation approaches exist, explain the trade-offs and choose the option most consistent with the current architecture.

---

## Automated Testing Requirements

Implement all automated tests required by the ticket.

### Unit and Component Tests

Configure and implement the required unit/component testing approach according to the ticket requirements.

Cover all business rules and UI behaviors introduced or modified by this ticket, including validation behavior, payload construction, submission states, analytics invocation, error handling, and accessibility expectations.

Ensure the proposed testing setup integrates cleanly with the existing Vite application.

---

## Playwright End-to-End Tests

Create or extend Playwright tests validating the complete user journeys impacted by this ticket.

Use stable selectors (`data-testid`) and deterministic fixtures.

At minimum, implement scenarios covering:

### Scenario 1 – Complete add-item journey

* User opens the pantry screen.
* User navigates to the manual add flow using the expected entry point.
* User completes the form successfully.
* User returns to the pantry.
* The newly created item appears in the pantry list.

### Scenario 2 – Inline validation behavior

* User attempts to submit invalid values.
* Field-level validation messages are displayed.
* Accessible validation attributes are correctly applied.

### Scenario 3 – Submit loading protection

* User submits the form.
* The submit action becomes unavailable while the request is in progress.
* Duplicate submissions are prevented.

### Scenario 4 – Success feedback

* User successfully creates an item.
* Success feedback is displayed.
* The newly added pantry item receives the expected highlight treatment.

### Scenario 5 – Filter and sort preservation

* User applies pantry filters, search terms, or sorting preferences.
* User navigates through the add-item flow.
* Upon returning, the previously selected state is preserved.

### Scenario 6 – API failure handling

* Simulate server-side failures.
* Verify that retry-friendly messaging is displayed.
* Verify that the appropriate warning is shown for authorization-related failures.

### Scenario 7 – Analytics verification

* Verify that the expected analytics events are emitted at the correct moments.
* Confirm that no sensitive information is included in the event payloads.

---

## Deliverables

Provide:

1. Analysis summary,
2. Implementation plan,
3. File modification plan,
4. Frontend implementation,
5. Unit/component tests,
6. Playwright tests,
7. Accessibility considerations,
8. Documentation updates required by the ticket.

---

## Handling Uncertainty

If any requirement is ambiguous:

* Explicitly identify the uncertainty,
* Describe the available implementation options,
* Explain the trade-offs,
* Ask focused clarification questions before proceeding.

Avoid making assumptions that cannot be justified by:

* The ticket definition,
* Architecture documentation,
* Product documentation,
* Existing frontend implementation.

Your objective is to deliver a **production-quality frontend implementation** that satisfies the ticket requirements while preserving existing behavior, improving usability and accessibility, and providing comprehensive automated test coverage aligned with the RealSaveFooding architecture.

~~~

## PROMPT 2 - Findings after Manual Review
After a Manual review I want these changes:
- When editing an item we can't chage where the item is placed: Pantry, Fridge or Freezer. Add that options.
- When editing an item we can't see and change the price per unit. Add that options.
- When I re-add an item from pantry list (Consumed or Wasted) the emoji is lost and is defaulted to 🍽️. Fix it

Work on these findings and update / create the related automated tests.