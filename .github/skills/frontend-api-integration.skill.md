# Skill: Frontend API Integration

## Purpose

Design and implement reliable, maintainable, and predictable frontend integrations with backend APIs and external services.

This skill helps agents handle async communication, loading states, error handling, authentication flows, and API consistency correctly from the frontend.

---

## Responsibilities

When using this skill:

- Design frontend API interaction patterns.
- Handle loading, success, empty, and error states.
- Improve reliability of async flows.
- Reduce coupling between UI and backend implementation details.
- Handle authentication and authorization flows correctly.
- Improve maintainability of API integrations.
- Identify integration risks and inconsistencies.
- Improve API-related frontend testability.

---

## Integration Principles

Always prioritize:

- Predictability
- Reliability
- Explicit state handling
- Maintainability
- Error resilience
- Separation of concerns
- Consistent data handling
- Testability

Avoid:

- tightly coupling UI to API responses
- hidden async behavior
- duplicated API logic
- inconsistent error handling
- silent failures
- unhandled loading states
- direct API calls scattered across components

---

## API Communication Rules

Frontend integrations should:

- centralize API access when appropriate
- isolate transport concerns
- handle retries intentionally
- validate critical assumptions
- normalize responses when necessary
- expose predictable frontend-friendly structures

Avoid exposing raw backend implementation details directly to UI components.

---

## State Handling Rules

All integrations should explicitly handle:

### Loading State

Examples:

- initial fetch
- background refresh
- optimistic updates when applicable

---

### Success State

Examples:

- valid data rendering
- successful mutation feedback

---

### Empty State

Examples:

- no results
- no available data

---

### Error State

Examples:

- network failures
- validation failures
- authorization failures
- timeout scenarios

---

## Authentication Awareness

When authentication exists, consider:

- token expiration
- session invalidation
- unauthorized responses
- refresh flows
- permission-aware UI behavior

Never assume frontend validation alone is sufficient security.

---

## Async Behavior Guidelines

When handling async flows:

- avoid race conditions
- avoid duplicated requests
- handle cancellation when relevant
- handle stale state intentionally
- avoid hidden side effects

Consider:

- caching
- invalidation
- optimistic updates
- retry strategies
- polling only when justified

---

## Error Handling Guidelines

Frontend integrations should:

- provide meaningful user feedback
- avoid exposing internal backend details
- distinguish validation errors from system errors
- support recoverable flows when possible

Avoid generic silent failures.

---

## Performance Considerations

When relevant, consider:

- request duplication
- unnecessary fetching
- large payloads
- caching opportunities
- pagination strategies
- lazy loading opportunities

Do not optimize prematurely without evidence.

---

## Testing Considerations

API integrations should support:

- integration testing
- loading-state testing
- error-state testing
- authentication-flow testing
- retry/failure testing
- edge-case testing

Avoid coupling tests tightly to implementation details.

---

## Collaboration Guidelines

Recommend involving:

- Backend Developer Agent → API contract clarification.
- Frontend Developer Agent → implementation details.
- QA Engineer Agent → edge-case and error-flow validation.
- Test Automation Engineer Agent → integration automation strategy.
- Security Reviewer Agent → authentication or sensitive data concerns.
- Tech Lead Agent → architectural integration concerns.

---

## Output Format

```md
## Frontend API Integration Analysis

### Integration Purpose

[Purpose]

### API Interaction Flow

- [Step]

### State Handling

#### Loading State

- [Behavior]

#### Success State

- [Behavior]

#### Empty State

- [Behavior]

#### Error State

- [Behavior]

### Authentication Considerations

- [Authentication consideration]

### Async Risks

- [Risk]

### Performance Considerations

- [Performance consideration]

### Testing Recommendations

- [Testing recommendation]

### Recommended Improvements

- [Improvement]

### Recommended Next Agents

- [Agent] → [Reason]