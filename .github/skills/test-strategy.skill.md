# Skill: Test Strategy

## Purpose

Define a clear, balanced, and maintainable testing strategy for features, fixes, refactors, integrations, and releases.

This skill helps agents decide what should be tested, at which level, and why.

---

## Responsibilities

When using this skill:

- Identify critical behaviors to validate.
- Define appropriate test levels.
- Identify edge cases and failure scenarios.
- Identify regression risks.
- Recommend manual and automated coverage.
- Avoid overtesting low-value scenarios.
- Avoid relying only on end-to-end tests.
- Align testing strategy with project risk.

---

## Testing Principles

Always prioritize:

- Behavior validation
- Regression protection
- Maintainability
- Reliability
- Determinism
- Fast feedback
- Clear expected results

Avoid:

- Testing implementation details
- Flaky tests
- Excessive mocking
- Overly broad test cases
- Large unclear test suites
- Coverage percentage as the only goal

---

## Test Levels

### Unit Tests

Use for:

- business rules
- validations
- pure functions
- isolated logic

### Integration Tests

Use for:

- API behavior
- persistence behavior
- module interaction
- external service boundaries with mocks/fakes

### Contract Tests

Use for:

- public APIs
- provider/consumer contracts
- third-party integration expectations

### End-to-End Tests

Use for:

- critical user flows
- high-risk workflows
- release confidence

---

## Scenario Categories

Always consider:

### Success Scenarios

- expected valid behavior
- common user flows
- standard system paths

### Validation Scenarios

- missing required fields
- invalid formats
- invalid states
- invalid permissions

### Edge Cases

- empty values
- duplicated data
- boundary values
- expired sessions
- missing resources
- concurrent usage when relevant

### Failure Scenarios

- external service unavailable
- timeout
- database failure
- partial operation failure
- unexpected server error

---

## Regression Strategy

Prioritize regression coverage for:

- business-critical flows
- authentication and authorization
- payments or sensitive operations
- complex business rules
- historically unstable areas
- shared components
- shared APIs

---

## Automation Strategy

Recommend automation when:

- the flow is repeated frequently
- the flow is business-critical
- regression risk is high
- validation is deterministic
- manual testing is costly or error-prone

Avoid automation when:

- the behavior is unstable or undefined
- the flow changes frequently
- automation cost exceeds value
- exploratory testing is more appropriate

---

## Output Format

```md
## Test Strategy

### Scope

[What will be tested]

### Test Levels

- Unit Tests:
- Integration Tests:
- Contract Tests:
- End-to-End Tests:

### Suggested Scenarios

#### Success Scenarios

- [Scenario]

#### Validation Scenarios

- [Scenario]

#### Edge Cases

- [Scenario]

#### Failure Scenarios

- [Scenario]

### Regression Risks

- [Risk]

### Automation Recommendations

- [Recommendation]

### Manual Testing Recommendations

- [Recommendation]

### Recommended Next Agents

- [Agent] → [Reason]