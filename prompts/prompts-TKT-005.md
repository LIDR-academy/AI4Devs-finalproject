## PROMPT 1: Prompt execution (TKT-005)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** on the **RealSaveFooding** project.

Your task is to implement a ticket provided in the current context as a file. The ticket includes full requirements (metadata, scope, API, data model, testing, and acceptance criteria) and must be treated as the **single source of truth**.

---

## Context Sources (Authoritative)

Before implementing anything, review:

### Architecture

```text
docs/architecture/
```

### Product Specification

```text
docs/product/
```

### Frontend Implementation

```text
/front
```

### Backend Implementation

```text
/back
```

---

## Ticket Reference

Implement strictly based on:

> **TKT-005 - Expiring Soon Notifications**

Do not invent requirements beyond what is defined in the ticket unless required for integration with the existing system.

---

## Implementation Goal

Deliver a **3-day expiration notification system** with:

* Preference-based notification control
* Scheduler-driven evaluation
* Event-based notification emission
* Frontend settings toggle integration

---

# Required Engineering Approach

## 1. Analysis Phase (mandatory before coding)

Provide:

* Summary of the ticket
* Existing system components that can be reused
* Backend + frontend impact analysis
* Event flow (scheduler → evaluation → notification emission)
* Required database changes
* Assumptions and ambiguities

---

## 2. Implementation Plan

Include:

* Backend implementation plan
* Frontend implementation plan
* Scheduler strategy
* Event design
* Testing strategy

---

## 3. Implementation Rules

* Reuse existing modules where possible
* Follow NestJS and Prisma conventions
* Ensure idempotency in notification generation
* Ensure preference checks are enforced server-side
* Keep MVP scope constraints

---

# 4. Testing Requirements (UPDATED)

Implement the required automated testing strategy, including:

## Unit Tests

* 3-day expiration threshold evaluator
* notification preference logic
* duplicate prevention logic

---

## Integration Tests

* Scheduler execution with real database state
* Notification emission based on expiring items
* Preference persistence and enforcement

---

## E2E Tests

* User disables notifications → no notifications generated
* User re-enables notifications → notifications resume
* Pantry items at boundary (exactly 3 days) trigger notifications
* End-to-end flow from item creation → expiration evaluation → notification event

---

## 🧪 NEW REQUIREMENT: Playwright E2E Suite

Create a dedicated **Playwright test suite** for this feature.

### Scope of Playwright tests

Implement tests that simulate real user behavior in the frontend:

#### Test Suite: Notification Preferences

* Navigate to settings page
* Disable notifications
* Verify backend does not emit notifications (via UI or mocked event log view)
* Re-enable notifications
* Verify system resumes correct behavior

---

#### Test Suite: Expiring Items Behavior

* Create or seed pantry item expiring in 3 days
* Trigger or wait for scheduler execution (mock or test hook)
* Verify notification appears in UI or notification center
* Confirm behavior is consistent with backend state

---

#### Test Suite: Boundary Conditions

* Item expiring in 4 days → no notification
* Item expiring exactly in 3 days → notification shown
* Item expiring in 2 days → no duplicate or incorrect triggering

---

### Playwright Requirements

* Use existing frontend structure under `/front`
* Follow existing test utilities and patterns (if any)
* Use stable selectors (data-testid preferred)
* Tests must be deterministic and not flaky
* Mock external services (OCR, scheduler triggers, AWS events) if required
* Ensure tests run in CI environment

---

## 5. Playwright Test Deliverables

You must create:

* `e2e/notifications/preferences.spec.ts`
* `e2e/notifications/expiring-items.spec.ts`
* `e2e/notifications/boundary-cases.spec.ts`

If the structure differs in the repo, align with existing conventions.

---

## 6. Output Expectations

Before coding, provide:

1. Full test strategy for Playwright
2. Mapping between manual test cases and automated tests
3. Required test utilities or mocks
4. Integration strategy with backend events
5. List of files to be created or modified

---

## 7. Implementation Constraints

* Tests must not depend on external real services
* Tests must be repeatable and isolated
* No shared state between test runs
* Use seeded or factory-based data setup
* Keep tests aligned with MVP scope

---

## 8. Handling Uncertainty

If any behavior is unclear:

* Explicitly state uncertainty
* Propose alternative interpretations
* Ask clarification questions before implementing

---

Your goal is to ensure **full confidence in the notification system through automated Playwright coverage**, validating both backend logic and frontend behavior in an end-to-end manner.

~~~
## PROMPT 2: Manual Test to validate Playwright coverage (TKT-005)
Provide the Manual Test Plan to validate the Playwright coverage for TKT-005. Include:
- Test case ID
- Test case description
- Preconditions
- Test steps
- Expected results

Validate that the Playwright tests cover all critical paths, edge cases, and user interactions defined in these tickets.

## PROMPT 3: Findings
After manual tests I have the following findings:

- Price drop Notification cannot be disabled.
- "Food consumed by others" Notification cannot be disabled.

Please fix all of the issues found in the manual tests and ensure that the Playwright tests are updated to cover these scenarios. 