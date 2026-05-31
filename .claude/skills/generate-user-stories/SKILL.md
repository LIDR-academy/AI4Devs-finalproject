---
name: generate-user-stories
description: Generate MVP-oriented User Stories from PRDs, use cases, epics or business requirements following INVEST criteria
---

# Generate User Stories

## Purpose

Generate a set of MVP-oriented User Stories from:

- PRDs
- Feature specifications
- Epics
- Business requirements
- Use cases

The objective is to produce implementation-ready backlog items.

---

## Analysis Process

For each use case:

1. Identify the user goal.
2. Identify the minimum capability required.
3. Identify the business value.
4. Identify the involved entities.
5. Split the capability into the smallest valuable stories.
6. Verify that each story satisfies INVEST.
7. Remove non-essential functionality.
8. Generate acceptance criteria.
9. Estimate complexity.
10. Assign MVP priority.

---

## Story Granularity

Stories must:

- Deliver a single user-visible capability.
- Be independently testable.
- Be implementable within a sprint.
- Avoid combining multiple workflows.

If a story contains multiple business goals, split it.

If complexity would be XL, split it.

Avoid technical stories unless explicitly requested.

---

## Acceptance Criteria

Always generate:

- Main scenario
- Alternative scenario(s)
- Validation or error scenario(s)

Criteria must be observable and testable.

---

## Complexity Estimation

Use:

| Size | Description |
|--------|--------|
| S | Small, low risk, minimal business logic |
| M | Moderate complexity, UI + business rules |
| L | Significant rules, states or interactions |
| XL | Too large, must be split |

Never output XL stories.

Split them instead.

---

## Priority Rules

Use:

### MVP Critical

Required for the main user journey.

Without it, the product cannot validate its value proposition.

### MVP Important

Strong value but simplification is possible.

### Nice to Have

Improves usability but is not required.

### Out of Scope

Explicitly excluded from MVP.

Do not generate stories with this priority unless explaining exclusions.

---

## Traceability

Every story must be traceable to:

- a PRD requirement
- a use case
- a user goal

---

## Output

Always follow us-template.md.