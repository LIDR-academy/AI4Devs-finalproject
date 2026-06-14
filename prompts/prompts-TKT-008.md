## PROMPT 1: Prompt execution (TKT-008)
~~~markdown

TKT-008-household-sharing-invite-accept.md#1-52
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
* Security and access control requirements.
* Logging and observability approaches.
* Testing strategies and quality expectations.
* Existing approaches for multi-user or shared data scenarios.

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
* Expected household-sharing behavior.

### Existing Frontend Implementation

Analyze the existing frontend code under:

```text
/ front
```

Ensure that any frontend changes:

* Follow the established design language and UX patterns.
* Reuse existing components whenever possible.
* Respect the current folder structure and conventions.
* Avoid introducing unnecessary dependencies.
* Remain simple and aligned with the MVP scope.

### Existing Backend Implementation

Analyze the existing backend code under:

```text
/ back
```

Assume that parts of the requested functionality may already exist. Before implementing anything:

* Identify modules, services, controllers, repositories, DTOs, guards, interceptors, utilities, and tests related to the ticket requirements.
* Identify any existing household, sharing, invitation, membership, or access-control mechanisms that can be reused.
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
4. A proposed domain model interpretation and how it aligns with the existing implementation.
5. Any assumptions identified during analysis.
6. Any ambiguities, inconsistencies, or missing requirements discovered.
7. A proposed implementation strategy covering:

   * Backend,
   * Frontend,
   * Database,
   * Security and access control,
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

## Household and Access Control Requirements

The implementation must ensure that household behavior is enforced consistently across the application.

When implementing the ticket:

* Apply household-level authorization checks wherever required.
* Ensure users can only access data they own or data shared with their household according to the business rules defined in the ticket.
* Prevent unauthorized users from viewing, modifying, accepting, or acting upon household-related resources.
* Keep the authorization model simple and aligned with the MVP scope.
* Reuse existing guards, decorators, middleware, or authorization utilities whenever possible.

If new authorization mechanisms are required:

* Clearly justify why they are necessary,
* Ensure they remain extensible,
* Minimize their impact on unrelated modules.

---

## Testing Requirements

Implement all automated tests required by the ticket and aligned with the project's testing standards.

### Unit Tests

* Cover all business rules introduced by the ticket.
* Validate lifecycle transitions and state changes.
* Verify authorization and validation logic where applicable.
* Ensure deterministic behavior for invitation and membership operations.

### Integration Tests

* Verify interactions between modules, services, repositories, and APIs impacted by the ticket.
* Validate persistence behavior and transactional consistency.
* Ensure membership synchronization behaves correctly.
* Validate access-control enforcement across shared scenarios.

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

#### Household Invitation Flow

* User A signs in.
* User A navigates to the household management area.
* User A invites User B using an email address.
* User A can see the invitation in the expected state.

#### Invitation Acceptance Flow

* User B signs in.
* User B views the pending invitation.
* User B accepts the invitation.
* Membership information is updated correctly.

#### Shared Pantry Visibility

* User A adds or updates pantry items.
* User B accesses the shared pantry.
* User B can view the shared data according to the rules defined by the ticket.
* Both users observe a consistent household state.

#### Access Control Validation

* Users outside the household cannot access shared household resources.
* Invalid invitation actions are rejected appropriately.
* Household boundaries are enforced consistently.

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
- When I click on "Send Invite" one message in red apperas sayinh: "No registered user found with that email". This is normal. Lets change the message mentioning something like: MVP Mode, no Email sending available, please choose one email already registered
- If I sent the invite to an email already registered, one red message appears: "You already belong to an active household". It should allow join the other one and abandon yours if it's empty. If it's not empty the system should ask who should be the Owner, and assign the ownership to him. Then before confirmation should join the other Household.
- Mark as consumed button is not enabled in item edit.

Please fix all of the issues found in the manual tests and ensure that the Playwright tests are updated to cover these scenarios. 

## PROMPT 4: After manual tests I have the following findings:
- When Clicked on Mark as consumed, the item still appearing in the pantry list.
Please fix the issue found in the manual tests and ensure that the Playwright tests are updated to cover these scenarios.
