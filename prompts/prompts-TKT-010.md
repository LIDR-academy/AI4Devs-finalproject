## PROMPT 1: Prompt execution (TKT-010)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** on the **RealSaveFooding** project.

Your task is to implement the ticket already provided in the current context. Treat the ticket definition as the **single source of truth** for requirements, scope, acceptance criteria, and definition of done.

## Context Discovery

Before implementing any changes, review the existing project artifacts:

* `docs/architecture/`
* `docs/product/`
* `/front`
* `/back`

Assume that parts of the required functionality may already exist. Identify opportunities to **reuse or extend existing code** before introducing new implementations.

---

## Analysis Phase (mandatory before coding)

Before generating any code, provide:

1. A concise summary of the ticket requirements.
2. An impact analysis describing affected backend and frontend modules.
3. Existing components/services that can be reused.
4. Assumptions and ambiguities discovered during analysis.
5. The proposed implementation strategy covering:

   * Backend
   * Frontend
   * Database
   * Testing
6. A list of files expected to be created or modified.

If similar prioritization functionality already exists, explain whether it should be reused, extended, or refactored.

---

## Implementation Expectations

Implement the ticket following the project's established conventions.

You should:

* Follow the existing NestJS, Prisma, React, and TypeScript patterns.
* Prioritize maintainability and simplicity.
* Keep the implementation aligned with MVP scope.
* Avoid introducing recipe-related dependencies.
* Ensure all acceptance criteria and definition-of-done requirements are satisfied.

---

## Prioritization Requirements

The use-next ranking must be:

* Deterministic,
* Explainable,
* Shared consistently between pantry and dashboard views.

Implement and document:

### Scoring strategy

Define a scoring formula primarily based on expiration risk.

If additional signals are introduced from the ticket context (such as consumption recency), clearly explain how they affect the ranking.

### Tie-break strategy

Define deterministic tie-break rules.

Examples may include:

* Earlier expiration date,
* Higher quantity,
* Older creation date,
* Stable identifier ordering.

Document the final decision and justify it.

The same ranking behavior must be used everywhere the use-next feature appears.

---

## Backend Requirements

Implement the backend functionality required by the ticket.

Ensure that:

* Ranking logic is isolated into a dedicated service.
* The prioritization endpoint returns items in the expected order.
* Ordering behavior remains deterministic across executions.
* Queries remain performant and easy to maintain.

---

## Frontend Requirements

Implement a reusable consume-next list component that can be used from multiple screens.

Ensure that:

* Pantry and dashboard views consume the same prioritization source.
* The component follows the existing design patterns.
* Loading, empty, and error states are handled appropriately.
* Ordering appears identical across screens.

---

## Automated Testing Requirements

Implement all automated tests required by the ticket.

### Unit Tests

Cover:

* Scoring formula calculations,
* Tie-break behavior,
* Deterministic ordering guarantees,
* Boundary and edge cases.

### Integration Tests

Cover:

* Endpoint responses,
* Ordering correctness,
* Fixture-based ranking validation,
* Cross-module consistency.

---

## Playwright End-to-End Tests

Create Playwright tests covering the complete user journeys introduced by the ticket.

Use stable selectors (`data-testid`) and deterministic seed data.

At minimum, implement the following scenarios:

### Scenario 1 – Pantry use-next ordering

* User opens the pantry screen.
* The use-next list is displayed.
* Items appear in the expected priority order.

### Scenario 2 – Dashboard use-next ordering

* User opens the dashboard.
* The use-next list is displayed.
* The ordering matches the pantry ordering.

### Scenario 3 – Cross-screen consistency

* Capture the ordered list from the pantry view.
* Navigate to the dashboard.
* Verify that the same ordering is presented.

### Scenario 4 – Tie-break validation

* Seed items with identical prioritization scores.
* Verify that the documented tie-break strategy is consistently applied.

### Scenario 5 – Empty state

* User has no eligible pantry items.
* Appropriate empty-state messaging is displayed.

### Scenario 6 – Refresh behavior

* Modify a pantry item's state so that its priority changes.
* Verify that the use-next list refreshes and reflects the updated order.

---

## Expected Deliverables

Provide:

1. Analysis summary,
2. Implementation plan,
3. Ranking formula specification,
4. Tie-break specification,
5. Backend implementation,
6. Frontend implementation,
7. Unit tests,
8. Integration tests,
9. Playwright tests,
10. Updated documentation describing the prioritization behavior.

If requirements are unclear, explicitly identify ambiguities and ask clarification questions before implementing.

~~~

## Prompt 2: Changes after Manual Review
After a Manual review I want these changes:
- I don't want the USE NEXT section in Pantry page (It's not meaningful and it takes the whole screen) just leave it in the Insights. Adapt the tests accordingly.
- Update the USE NEXT in insights adding the emoji.
- The label MEDIUM / LOW / HIGH is not meaningful, can we add something to explain it?
- Add a label when hover (in mobile needs to be when pressed) the Riks badge with this:
🔴 Use today (≤1 day, red)
🟡 Use soon (≤3 days, amber)
🟢 Still fresh (>3 days, muted)

