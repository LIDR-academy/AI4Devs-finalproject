# Research: Level System & Role-Based UI

## Unknowns from Technical Context

All Technical Context fields were resolvable from the existing codebase. No NEEDS CLARIFICATION markers remain.

## Authorization Pattern Analysis

**Decision**: Use existing `authenticate` + `requireRole` middleware pattern

**Rationale**: The middleware chain already supports multi-role checks (e.g., `requireRole(ADMIN, COACH)`). The PATCH /coachees/:id/level endpoint already uses this pattern, granting both Admin and Coach access. Per the spec clarification, Coach scope is global (all Coachees), so no additional ownership filtering is needed.

**Alternatives considered**: Role-based ownership filter (Coach can only modify assigned Coachees) — rejected per spec clarification Q1 (option A).

## Level Immutability

**Decision**: Levels are seeded-once, read-only

**Rationale**: No create/update/delete endpoints exist for levels in the routes. The seed script uses `upsert` for idempotent seeding. The Level entity exposes no mutation methods. Per spec clarification Q2 (option A), levels are immutable.

**Alternatives considered**: Admin CRUD UI for levels — rejected per clarification; deferred to future sprint if needed.

## Audit Logging Pattern

**Decision**: Reuse existing `AuditLogger` class with `SecurityAuditLog` model

**Rationale**: The `AuditLogger` already writes to `SecurityAuditLog` with actor_id, action, resource, resource_id, and outcome fields. Other use cases (UpdateCoacheeStatus) use this pattern. The `container.ts` already instantiates `auditLogger` — it just needs to be injected into `UpdateCoacheeLevel`.

**Alternatives considered**: Using generic `logger.info` — rejected because FR-012 requires structured audit records, not just log lines.

## Frontend Patterns

**Decision**: Follow existing React Query + hook patterns

**Rationale**: useLevels and useUpdateCoacheeLevel hooks already exist. The AuthContext provides user data including role and level_id. CoacheeHomePage can consume useAuth + useLevels to display current level.
