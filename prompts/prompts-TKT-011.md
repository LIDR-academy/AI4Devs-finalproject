## PROMPT 1: What's missing in the ticket. Update the ticket
According to the current project status, some of the features mentioned in the ticket TKT-011-backend-receipt-ocr-pipeline.md are already implemented in the repo. Tell me what we're missing and adapt the ticket with the remaining things to implement.

## PROMPT 2 - Prompt execution (TKT-011)
~~~markdown
You are acting as a **Senior Backend Engineer** on the **RealSaveFooding** project.

Your task is to implement the ticket described in:

```text
docs/tickets/TKT-011-backend-receipt-upload-and-ocr-pipeline.md
```

Treat the ticket as the **single source of truth**. Do not restate or reinterpret the requirements unless you identify ambiguities that require clarification.

## Context Discovery

Before implementing anything, review and understand the existing codebase and documentation.

### Architecture

Review all relevant documents under:

```text
docs/architecture/
```

Use these documents to understand:

* Backend architectural principles,
* Module boundaries,
* Integration patterns,
* Security and authorization conventions,
* Testing standards,
* Observability and metrics approaches.

### Product Documentation

Review:

```text
docs/product/
```

to understand the intended receipt processing workflow and household-sharing behavior.

### Existing Backend Implementation

Analyze the backend implementation under:

```text
/back
```

Assume that substantial portions of the receipt pipeline already exist.

Before writing code:

* Identify all receipt-related modules, services, DTOs, repositories, Prisma models, mappers, adapters, guards, and tests.
* Determine which components should be reused, extended, or refactored.
* Avoid duplicating existing logic.
* Follow established NestJS, Prisma, and TypeScript conventions.
* Preserve backwards compatibility whenever possible.

---

## Analysis Phase (mandatory before coding)

Before generating implementation code, provide:

1. A summary of the outstanding work required by the ticket.
2. An impact analysis describing which backend areas will be affected.
3. Existing components that can be reused or extended.
4. Any assumptions or ambiguities discovered.
5. A proposed implementation strategy covering:

   * Prisma schema changes,
   * Service-layer modifications,
   * Access-control updates,
   * Adapter implementations,
   * Metrics instrumentation,
   * Testing strategy.
6. A list of files expected to be created or modified.
7. A list of required Prisma migrations.

If any requested capability already exists, explain whether it should be reused, extended, or refactored and justify the decision.

---

## Implementation Expectations

Implement the ticket incrementally while minimizing regressions.

You should:

* Follow existing NestJS architecture patterns.
* Keep migrations backwards compatible.
* Reuse existing guards and authorization mechanisms.
* Preserve existing receipt flows unless explicitly modified by the ticket.
* Keep local-development support simple and maintainable.
* Ensure all acceptance criteria and definition-of-done requirements are satisfied.

---

## Backend Requirements

Implement all requirements defined in the ticket, including but not limited to:

* Prisma schema evolution,
* Receipt lifecycle state handling,
* Household-scoped access control,
* Conflict handling,
* Local development adapters,
* Metrics instrumentation,
* Missing unit and contract tests.

Where multiple implementation options exist, explain the trade-offs and select the approach most aligned with the current architecture.

---

## Automated Testing Requirements

Implement all automated tests required by the ticket and aligned with the project's testing standards.

### Unit Tests

Create or extend unit tests covering all business rules introduced or modified by this ticket.

Focus especially on:

* Validation behavior,
* OCR-related helper logic,
* Confirmation conflict scenarios,
* Receipt lifecycle transitions,
* Local adapter behavior,
* Metrics instrumentation where feasible.

### Integration Tests

Implement integration tests validating:

* Household-scoped receipt access,
* Upload and confirmation workflows,
* Persistence behavior,
* Error handling,
* Backwards compatibility with existing flows.

### Contract Tests

Ensure response payloads continue to comply with the documented API contracts and OpenAPI schemas.

Validate all endpoints affected by the ticket.

---

## Playwright End-to-End Tests

Even though this is a backend-focused ticket, create or update Playwright tests validating the end-to-end user journeys impacted by the backend changes.

Use stable selectors (`data-testid`) and deterministic test data.

At minimum, implement scenarios covering:

### Scenario 1 – Household receipt visibility

* User A uploads a receipt.
* User B belongs to the same household.
* User B retrieves the receipt successfully.

### Scenario 2 – Household confirmation flow

* User B confirms receipt items uploaded by User A.
* Confirmation succeeds when household membership permits access.

### Scenario 3 – Confirmation conflict handling

* A receipt is finalized successfully.
* A subsequent confirmation attempt is made.
* The user receives the expected conflict response and appropriate UI feedback.

### Scenario 4 – Local development adapters

* Execute the upload flow using local adapters enabled through configuration.
* Verify that uploads and OCR extraction complete successfully without AWS credentials.

### Scenario 5 – Receipt lifecycle progression

* Verify that the receipt transitions through the expected processing states during the upload workflow.
* Confirm that the final state reflects the processing outcome.

### Scenario 6 – Existing workflow regression validation

* Execute the existing receipt upload and confirmation flow.
* Verify that previously supported behavior continues to work after the changes introduced by this ticket.

---

## Deliverables

Provide:

1. Analysis summary,
2. Implementation plan,
3. Schema migration plan,
4. File modification plan,
5. Backend implementation,
6. Unit tests,
7. Integration tests,
8. Contract tests,
9. Playwright tests,
10. Documentation updates required by the ticket.

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
* Existing backend implementation.

Your objective is to deliver a **production-quality backend implementation** that satisfies the ticket requirements while preserving existing functionality, maintaining backwards compatibility, supporting local development, and providing comprehensive automated test coverage.

~~~

## PROMPT 3 - Findings after Manual Review
After a Manual review I want these changes:
- The behaviour in /add when scanning a receipt is getting a LOT less products than before this looks like to be an issue (testing with .docs/tests/e2e/Test-Ticket.png).
- The unit price in /add when scanning a receipt is now always cero (It was working before the last changes).
- Price per unit is not available in add/manual.

Fix these findings and update / create automated tests.