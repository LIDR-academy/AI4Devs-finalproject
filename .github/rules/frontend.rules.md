# Frontend Rules

## Purpose

These rules define frontend engineering standards for all agents working on frontend applications, user interfaces, and client-side behavior.

The goal is to ensure maintainable, scalable, accessible, and consistent frontend implementations.

---

## Required

- Keep UI components focused and reusable.
- Separate presentation logic from business logic when possible.
- Respect the frontend architecture defined in `architecture.md`.
- Keep state management predictable and maintainable.
- Handle loading, empty, and error states explicitly.
- Validate user input appropriately.
- Keep API integration isolated when possible.
- Respect existing design system or UI conventions.
- Ensure responsive behavior when required.
- Consider accessibility requirements.

---

## Forbidden

- Do not place backend business logic inside frontend components.
- Do not tightly couple UI components to API implementation details.
- Do not create excessively large components.
- Do not duplicate UI logic unnecessarily.
- Do not hardcode environment-specific values.
- Do not ignore accessibility considerations without justification.
- Do not manipulate global state unnecessarily.
- Do not bypass existing frontend architecture or routing conventions.

---

## Component Rules

Components should:

- Have a clear responsibility.
- Be easy to understand.
- Be easy to test.
- Avoid unnecessary side effects.
- Keep props and dependencies explicit.

Prefer:

- composition over inheritance
- reusable patterns
- modular UI structure

Avoid:

- deeply nested logic
- massive shared utility files
- hidden component dependencies

---

## State Management Rules

- Keep local state local whenever possible.
- Use global state only when shared coordination is required.
- Separate UI state from domain/business state.
- Avoid duplicated state sources.
- Avoid unpredictable state mutations.

---

## API Integration Rules

Frontend integrations should:

- Handle loading states.
- Handle error states.
- Handle empty states.
- Validate critical responses when necessary.
- Avoid exposing backend implementation details directly in the UI.

---

## Accessibility Rules

Frontend implementations should consider:

- keyboard navigation
- semantic HTML
- accessible labels
- color contrast
- focus visibility
- screen reader compatibility when relevant

Do not sacrifice accessibility unnecessarily for visual convenience.

---

## Performance Rules

When relevant, consider:

- bundle size
- unnecessary re-renders
- lazy loading
- memoization
- rendering bottlenecks
- expensive computations

Do not optimize prematurely without evidence.

---

## Frontend Testing Expectations

Frontend changes should consider:

- component testing
- interaction testing
- validation testing
- state behavior testing
- critical user flow testing
- accessibility-critical flow validation

---

## Final Rule

Frontend code should prioritize maintainability, usability, accessibility, consistency, and predictable behavior over fast but fragile implementations.