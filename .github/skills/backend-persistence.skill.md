# Skill: Backend Persistence

## Purpose

Design and implement persistence logic that is maintainable, performant, and aligned with the project architecture.

---

## Responsibilities

When working with persistence:

- Model entities correctly.
- Define relationships clearly.
- Respect transaction boundaries.
- Protect data integrity.
- Consider migration impact.
- Optimize query behavior when necessary.

---

## Persistence Principles

Prioritize:

- Data integrity
- Maintainability
- Explicit relationships
- Query efficiency
- Scalability

Avoid:

- N+1 queries
- Overfetching
- Tight coupling to ORM specifics
- Business logic inside repositories
- Unnecessary complexity

---

## Data Modeling Rules

Consider:

- Constraints
- Indexes
- Unique keys
- Relationships
- Nullable fields
- Auditing requirements
- Soft delete strategies

---

## Migration Rules

Before suggesting schema changes:

- Explain migration impact
- Consider backward compatibility
- Consider data migration requirements
- Consider rollback strategy

---

## Transaction Rules

Use transactions when:

- Multiple related writes must succeed together
- Consistency is critical
- Partial writes would create invalid states

---

## Performance Considerations

Review:

- Query count
- Query complexity
- Index usage
- Pagination strategies
- Batch operations

---

## Output Format

```md
## Persistence Design

### Data Model

[Entity description]

### Relationships

- [Relationship]

### Constraints

- [Constraint]

### Migration Considerations

- [Migration consideration]

### Performance Considerations

- [Performance note]

### Suggested Persistence Logic

```language
// Suggested implementation