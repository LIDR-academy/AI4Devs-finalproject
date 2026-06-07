# TKT-013 - Database Core Schema for Household, Pantry and Events

## 1. Ticket metadata
- Type: Database
- Priority: P0
- Related user stories: US-002, US-008, US-009, US-010
- Related FR: FR-18, FR-19, FR-21, FR-22, FR-24, FR-25
- Owner profile: Database engineer

## 2. Objective
Design and implement the MVP relational schema and migrations for household collaboration, pantry items, and event tracking with strong integrity and performance defaults.

## 3. Business value
Creates a reliable data foundation for shared pantry workflows, auditability, analytics, and future evolution without destructive redesign.

## 4. Scope
In scope:
- Tables and relations for household membership and invitations.
- Pantry item lifecycle structure.
- Event tracking structure for consume/waste.
- Expiration assessment metadata structure.
- Essential indexes and constraints.
- Prisma schema alignment with SQL migrations.

Out of scope:
- Warehouse or BI models.
- Advanced partitioning.
- Recipe data model.

## 5. Target entities
- USER
- HOUSEHOLD
- HOUSEHOLD_MEMBER
- HOUSEHOLD_INVITATION
- PANTRY_ITEM
- EXPIRATION_ASSESSMENT
- CONSUMPTION_EVENT
- NOTIFICATION_PREFERENCE

## 6. Data model requirements
1. Stable PKs using UUID.
2. Explicit FKs for all ownership/collaboration relations.
3. Enum/check constraints for domain states.
4. Numeric precision for quantity and money.
5. Timezone-aware timestamps for auditable events.

## 7. Migration plan
Phase 1 - collaboration core:
- Create HOUSEHOLD, HOUSEHOLD_MEMBER, HOUSEHOLD_INVITATION.
- Add unique(household_id, user_id) for membership.

Phase 2 - pantry and expiry:
- Create PANTRY_ITEM and EXPIRATION_ASSESSMENT.
- Add constraints for quantity, status, and expiration source/method.

Phase 3 - events and notifications:
- Create CONSUMPTION_EVENT and NOTIFICATION_PREFERENCE.
- Add uniqueness on NOTIFICATION_PREFERENCE.user_id.

Phase 4 - hardening:
- Add FK indexes and composite query-path indexes.
- Validate migration rollback strategy in dev.

## 8. Index and performance requirements
Mandatory indexes:
- FK indexes for all foreign keys.
- Composite pantry query index:
  - (household_id, status, expiration_date).
- Event timeline index:
  - (pantry_item_id, event_at desc).
- Invitation lookup index:
  - (lower(invitee_email), status).

Performance targets:
- Pantry list query p95 under 250ms in dev baseline dataset.
- Event insertion under 100ms p95.

## 9. Prisma alignment requirements
- Keep Prisma models synchronized with SQL migrations.
- Use model-level indexes and unique constraints in Prisma schema.
- Enforce enum values consistently between Prisma and DB checks.
- Use Decimal mapping for quantity and monetary fields.

## 10. Data integrity and lifecycle policies
- User identity uses case-insensitive unique email index.
- User soft-delete policy must preserve event history.
- Household access enforced by membership relation.
- Event records are append-only for auditability.

## 11. Validation and verification plan
Schema tests:
- FK and unique constraints behavior.
- Check constraints for enum-like values.
- Soft-delete compatibility with relation integrity.

Query tests:
- Pantry list query with status and expiration filter.
- Event timeline retrieval ordered by newest.

Migration tests:
- Up/down migration behavior in isolated dev database.
- Prisma generate and migration status validation.

## 12. Risks and mitigations
- Constraint drift between Prisma and SQL:
  - Mitigation: migration checklist requiring both layers update.
- Slow queries under collaboration scenarios:
  - Mitigation: enforce index plan and run explain analyze for critical queries.
- Deletion edge cases:
  - Mitigation: explicit delete/soft-delete policy per relation.

## 13. Acceptance criteria
1. Core tables and constraints are created and validated.
2. Prisma schema and generated client match migrated schema.
3. Required indexes exist and are used in critical query plans.
4. Membership/invitation integrity rules enforce collaboration boundaries.
5. Event and expiration metadata support audit and dashboard needs.

## 14. Definition of done
- All migrations applied successfully in dev.
- Prisma migration history committed.
- DB validation test suite passes.
- Performance checks for pantry/event baseline queries documented.
- Documentation updated in docs/db/database-model.md if schema details changed.
