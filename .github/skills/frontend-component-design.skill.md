# Skill: Frontend Component Design

## Purpose

Design maintainable, reusable, scalable, and understandable frontend components aligned with the project's frontend architecture and UI patterns.

This skill helps agents create components with clear responsibilities, predictable behavior, and good long-term maintainability.

---

## Responsibilities

When using this skill:

- Design reusable UI components.
- Define clear component responsibilities.
- Separate presentation from business logic when appropriate.
- Design maintainable component composition.
- Improve readability and scalability of UI structures.
- Reduce duplication across the frontend.
- Improve testability and predictability.
- Support accessibility and responsive behavior when relevant.

---

## Component Design Principles

Always prioritize:

- Simplicity
- Reusability
- Readability
- Separation of concerns
- Explicit data flow
- Testability
- Predictable behavior
- Accessibility awareness

Avoid:

- Massive components
- Deeply nested logic
- Tight coupling
- Hidden dependencies
- Repeated UI logic
- Business logic inside presentation components
- Excessive prop drilling without justification
- Premature abstraction

---

## Component Responsibility Rules

Components should:

- Have a single clear purpose.
- Be easy to understand in isolation.
- Have explicit inputs and outputs.
- Avoid unrelated responsibilities.
- Avoid hidden side effects.

Prefer:

- composition over inheritance
- small focused components
- container/presentation separation when appropriate

---

## State Management Awareness

When designing components:

- Keep local state local.
- Avoid unnecessary global state.
- Separate UI state from domain state.
- Avoid duplicated state sources.
- Keep state predictable and easy to debug.

Use local component state by default; escalate to shared state only when complexity clearly requires it.

---

## Props and Data Flow Rules

Props should:

- be explicit
- be typed when possible
- avoid ambiguity
- avoid unnecessary coupling

Avoid:

- passing unrelated data
- large uncontrolled prop objects
- hidden dependencies through context without justification

---

## UI Consistency Rules

Components should:

- follow existing design system patterns
- respect visual consistency
- maintain interaction consistency
- reuse shared UI primitives when appropriate

Avoid inventing new patterns unnecessarily.

---

## Accessibility Considerations

Consider:

- semantic structure
- keyboard navigation
- accessible labels
- focus management
- screen reader compatibility when relevant

Accessibility should not be treated as optional when the feature requires user interaction.

---

## Performance Awareness

When relevant, consider:

- unnecessary re-renders
- expensive rendering
- large lists
- memoization opportunities
- lazy loading opportunities

Do not optimize prematurely without evidence.

---

## Testing Considerations

Frontend components should support:

- component testing
- interaction testing
- validation testing
- state behavior testing
- accessibility-critical flow testing

Avoid tightly coupling tests to implementation details.

---

## Collaboration Guidelines

Recommend involving:

- Frontend Developer Agent → implementation details.
- Product Owner Agent → unclear UI behavior or workflows.
- QA Engineer Agent → edge-case and interaction validation.
- Test Automation Engineer Agent → automated UI coverage.
- Tech Lead Agent → frontend architecture or scalability concerns.
- Security Reviewer Agent → authentication or sensitive frontend flows.

---

## Output Format

```md
## Component Design Analysis

### Component Purpose

[Purpose]

### Responsibilities

- [Responsibility]

### Suggested Structure

- Parent Component
- Child Components
- Hooks
- Shared UI Components

### State Considerations

- [State consideration]

### Props Considerations

- [Props consideration]

### Accessibility Considerations

- [Accessibility consideration]

### Performance Considerations

- [Performance consideration]

### Risks / Concerns

- [Risk]

### Testing Recommendations

- [Testing recommendation]

### Recommended Next Agents

- [Agent] → [Reason]