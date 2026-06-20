## PROMPT 1: Prompt execution (TKT-006)
~~~markdown
You are acting as a **Senior Full-Stack Software Engineer** on the **RealSaveFooding** project.

Your task is to implement a ticket provided in the current context as a file. The ticket contains the full specification (metadata, scope, API, data model, acceptance criteria, and definition of done) and must be treated as the **single source of truth**.

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

> **TKT-006 - Price Comparison with MVP Dataset**

Do not assume requirements beyond what is defined in the ticket unless required for integration with the existing system.

---

## Implementation Goal

Build a **price comparison feature** based on an internal dataset that allows users to compare pantry items against reference prices using normalized product names.

Key behaviors:

* Query price reference data using normalized names
* Show comparison results in UI
* Handle missing data gracefully with clear UX states
* Avoid any external API integrations (MVP constraint)

---

# Required Engineering Approach

## 1. Analysis Phase (mandatory before coding)

Provide:

* Summary of ticket requirements
* Relevant existing backend/frontend components
* Required data mapping strategy (normalized name matching)
* API design interpretation
* UI behavior breakdown (match vs no-match states)
* Assumptions and ambiguities

---

## 2. Implementation Plan

Include:

* Backend implementation (endpoint logic + data access)
* Frontend implementation (compare view + entry point from pantry item)
* Data handling strategy (fallbacks, missing data)
* Testing strategy

---

## 3. Implementation Rules

* Follow existing NestJS + Prisma patterns
* Reuse existing frontend components from `/front`
* Keep logic deterministic and testable
* Do not introduce external APIs
* Ensure consistent handling of normalized product names
* Keep MVP simplicity as priority

---

# 4. Testing Requirements (UPDATED)

Implement full automated test coverage aligned with the ticket scope.

---

## Unit Tests

* Normalized name matching logic
* Latest-effective-date selection logic
* Fallback behavior when no data exists

---

## Integration Tests

* GET `/api/insights/price-comparison`
* Matched dataset response correctness
* No-match response behavior

---

## E2E Tests

* User opens pantry item
* Clicks “Compare Price”
* Sees comparison results when data exists
* Sees “no data available” state when dataset is missing

---

## 🧪 NEW REQUIREMENT: Playwright E2E Tests

Create a dedicated Playwright test suite to validate full user behavior.

### Test Suite: Price Comparison Feature

#### File structure

* `e2e/insights/price-comparison-matched.spec.ts`
* `e2e/insights/price-comparison-unmatched.spec.ts`

---

### Test Case 1: Matched Item Flow

* Open pantry item with known normalized name
* Click “Compare Price”
* Verify comparison UI renders reference price data
* Validate correct mapping of product name
* Ensure UI shows comparison section correctly

---

### Test Case 2: Unmatched Item Flow

* Open pantry item with unknown normalized name
* Click “Compare Price”
* Verify “No data available” state is displayed
* Ensure user guidance message is visible
* Confirm no broken UI or empty table is rendered

---

### Playwright Requirements

* Use existing `/front` structure and routing
* Use stable selectors (`data-testid`)
* Avoid flaky timing dependencies
* Mock backend responses if necessary for deterministic tests
* Ensure tests are CI-safe and repeatable

---

## 5. Output Expectations

Before coding, provide:

1. Full analysis of the ticket
2. Backend + frontend implementation strategy
3. Data matching strategy for normalized names
4. UI behavior specification
5. Test strategy mapping manual → automated
6. List of files to be created or modified

---

## 6. Constraints

* No external APIs allowed
* Must rely entirely on internal dataset
* Must support graceful degradation (no-match state is required)
* Must follow MVP simplicity principles

---

## 7. Handling Uncertainty

If any requirement is unclear:

* Explicitly identify ambiguity
* Provide multiple implementation options
* Explain trade-offs
* Ask clarification questions before proceeding

---

Your goal is to deliver a **production-quality, test-driven implementation** of a price comparison feature with full Playwright coverage ensuring correctness across matched and unmatched scenarios.
~~~~

## PROMPT 2: Testing and Manual Validation
Provide the Manual Test Plan to validate the Playwright coverage for TKT-006. Include:
- Test case ID
- Test case description
- Preconditions
- Test steps
- Expected results

Validate that the Playwright tests cover all critical paths, edge cases, and user interactions defined in these tickets.Please fix all of the issues found and ensure that the Playwright tests are updated to cover these scenarios. 

## PROMPT 3: Manual Test Findings
After manual tests I have the following findings:

- I don't see the purpose of the button "Change Expiration Date" at item details. Maybe it should be removed or clarified in the UI as we can change the expiration in the section below it (Expiration intelligence).

Please fix all of the issues found in the manual tests and ensure that the Playwright tests are updated to cover these scenarios. 

## PROMPT 4: Price, Quantity, and Unit Editability
I have noticed that the price, quantity, and unit fields are not editable in the item details view. Please make these fields editable and ensure that the changes are persisted correctly in the backend. Update the Playwright tests to cover these scenarios and validate that the edits are reflected in the UI and backend.
