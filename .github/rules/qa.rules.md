# QA Rules

## Purpose

These rules define quality assurance expectations for all agents involved in testing, validation, and software quality analysis.

The goal is to ensure software behavior is validated consistently, edge cases are considered, and regression risks are minimized.

---

## Required

- Validate expected behavior against acceptance criteria.
- Consider edge cases and failure scenarios.
- Consider regression risks for every relevant change.
- Validate both positive and negative flows.
- Ensure test scenarios are reproducible and understandable.
- Identify missing validations and ambiguous behavior.
- Validate loading, empty, and error states when applicable.
- Verify permissions and authorization behavior when relevant.
- Validate business rules independently from implementation details.

---

## Forbidden

- Do not validate only happy paths.
- Do not assume functionality is correct because the implementation looks correct.
- Do not ignore missing acceptance criteria.
- Do not ignore invalid inputs or unexpected states.
- Do not rely exclusively on manual validation for critical flows.
- Do not tightly couple tests to implementation details.
- Do not ignore regression impact.
- Do not treat lack of bugs as proof of quality.

---

## Functional Validation Rules

QA analysis should validate:

- expected workflows
- invalid workflows
- edge cases
- error handling
- permission behavior
- state consistency
- navigation consistency
- data consistency

---

## Edge Case Rules

Always consider:

- empty inputs
- invalid formats
- duplicated data
- missing data
- unauthorized access
- expired sessions
- slow responses
- external service failures
- concurrent usage scenarios when relevant

---

## Regression Rules

When reviewing changes, consider:

- impacted workflows
- impacted integrations
- impacted permissions
- impacted validations
- impacted shared components
- impacted APIs
- impacted business rules

Regression risk should always be explicitly identified.

---

## Acceptance Criteria Rules

Acceptance criteria must be:

- clear
- testable
- observable
- behavior-focused
- implementation-independent

If requirements are unclear, recommend involving the Product Owner Agent.

---

## Test Coverage Rules

Testing strategies should prioritize:

- business-critical flows
- high-risk functionality
- authentication and authorization
- payment or sensitive operations
- complex business rules
- historically unstable areas

---

## Bug Reporting Rules

Bug analysis should include:

- reproduction steps
- expected behavior
- actual behavior
- impact assessment
- severity estimation
- regression risk
- environment information when relevant

---

## Automation Awareness Rules

When automation is relevant:

- identify automation opportunities
- identify flaky test risks
- identify repetitive manual validation
- recommend involving the Test Automation Engineer Agent

---

## Collaboration Rules

Recommend involving other agents when necessary:

- Product Owner Agent → unclear requirements or missing acceptance criteria.
- Backend Developer Agent → backend behavior clarification.
- Frontend Developer Agent → frontend behavior clarification.
- Test Automation Engineer Agent → automated coverage strategy.
- Security Reviewer Agent → permission validation or abuse-case concerns.
- Tech Lead Agent → technical complexity or architectural impact.

---

## Final Rule

Quality validation must focus on real system behavior, edge cases, regression prevention, and user impact — not only on whether the feature appears to work in ideal conditions.