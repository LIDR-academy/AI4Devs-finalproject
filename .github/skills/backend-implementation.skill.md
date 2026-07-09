# Skill: Backend Implementation

## Purpose

Implement backend features following the project's architecture, coding standards, and maintainability principles.

---

## Responsibilities

When implementing backend functionality:

- Respect architectural boundaries.
- Place business logic in the correct layer.
- Keep implementations modular and testable.
- Follow project conventions.
- Handle errors consistently.
- Keep code maintainable and scalable.

---

## Implementation Principles

Prioritize:

- Simplicity
- Readability
- Maintainability
- Separation of concerns
- Reusability
- Testability

Avoid:

- Overengineering
- Large monolithic services
- Tight coupling
- Business logic inside controllers
- Duplicated logic

---

## Layer Responsibilities

Controllers:

- Handle input/output only
- Delegate business logic

Services / Use Cases:

- Implement business rules
- Coordinate workflows

Repositories:

- Handle persistence
- Isolate database access

Entities / Domain:

- Represent business concepts and rules

---

## Validation Rules

Always validate:

- Required fields
- Input formats
- Business constraints
- Permissions
- External data when necessary

---

## Error Handling

Errors should:

- Be explicit
- Be predictable
- Be categorized correctly
- Avoid leaking internal details

Distinguish between:

- Validation errors
- Business errors
- Authorization errors
- Not found errors
- Unexpected errors

---

## Performance Considerations

Consider:

- Query optimization
- Pagination
- Caching when necessary
- Avoiding unnecessary computations
- Reducing external calls

---

## Output Format

```md
## Backend Implementation

### Analysis

[Short analysis]

### Proposed Approach

[Implementation approach]

### Affected Layers

- Controller
- Service
- Repository
- Database

### Risks

- [Risk]

### Suggested Implementation

```language
// Code if necessary