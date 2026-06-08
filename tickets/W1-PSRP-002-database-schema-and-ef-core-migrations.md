## PSRP-002: feat(data): database-schema-and-ef-core-migrations

**Type:** feat
**Priority:** P0 (Must)
**Estimated Effort:** L (4-5d)
**Sprint Week:** W1
**Dependencies:** PSRP-001

## Feature Summary
Implement all 13 domain entities as EF Core models with full entity type configurations, create the initial PostgreSQL migration, and seed the 3 preset wedding templates. This covers the complete data model as specified in the data model documentation, including all columns, constraints, indexes, foreign keys, soft delete filters, computed columns, and PII encryption via Value Converters.

## Requirements
- [ ] Create all 13 domain entity models in Aura.Core/Models/: User, UserConsent, Event, Template, Guest, Invitation, Rsvp, Accomplice, MessageTemplate, LiveMessage, Payment, DataRetentionJob, DeliveryLog
- [ ] Create EF Core EntityTypeConfigurations for all entities in Aura.Infrastructure/Data/Configurations/
- [ ] Configure all columns, types, constraints (CHECK, UNIQUE, NOT NULL), and defaults per data model specification
- [ ] Configure all foreign key relationships and cascade rules per data model specification
- [ ] Configure all 32+ indexes per indexing strategy in data model
- [ ] Configure soft delete global query filters for Guest, Invitation, MessageTemplate
- [ ] Configure computed column for Event.EventEndDate (EventDate + 1 day)
- [ ] Configure PII encryption via EF Core Value Converters for: Guest.Email, Guest.Phone, Rsvp.DietaryRestrictions, Rsvp.Message, Accomplice.Email
- [ ] Seed 3 preset wedding templates (Classic Elegance, Modern Minimal, Rustic Charm) with LayoutJson
- [ ] Create ApplicationDbContext with all DbSets and OnModelCreating configurations
- [ ] Generate initial EF Core migration `InitialSchema`
- [ ] Create repository interfaces in Aura.Core/Interfaces/Repositories/ for all entities
- [ ] Create repository implementations in Aura.Infrastructure/Repositories/ for all entities

## Technical Notes
- **Backend:** All entity models use `Guid` for Id (PostgreSQL uuid). File-scoped namespaces, primary constructors, collection expressions (C# 12+)
- **Frontend:** N/A
- **Database:** PostgreSQL 16 with `uuid-ossp` extension, `timestamptz` for all timestamps, `jsonb` for Permissions and LayoutJson, `decimal(10,2)` for payments, `decimal(9,6)` for coordinates
- **Integrations:** N/A
- **Key files:**
  - `backend/src/Aura.Core/Models/User.cs`
  - `backend/src/Aura.Core/Models/Event.cs`
  - `backend/src/Aura.Core/Models/Guest.cs`
  - `backend/src/Aura.Core/Models/Invitation.cs`
  - `backend/src/Aura.Core/Models/Rsvp.cs`
  - `backend/src/Aura.Core/Models/Accomplice.cs`
  - `backend/src/Aura.Core/Models/MessageTemplate.cs`
  - `backend/src/Aura.Core/Models/LiveMessage.cs`
  - `backend/src/Aura.Core/Models/Payment.cs`
  - `backend/src/Aura.Core/Models/Template.cs`
  - `backend/src/Aura.Core/Models/DataRetentionJob.cs`
  - `backend/src/Aura.Core/Models/UserConsent.cs`
  - `backend/src/Aura.Core/Models/DeliveryLog.cs`
  - `backend/src/Aura.Infrastructure/Data/ApplicationDbContext.cs`
  - `backend/src/Aura.Infrastructure/Data/Configurations/*.cs`
  - `backend/src/Aura.Infrastructure/Migrations/*_InitialSchema.cs`
  - `backend/src/Aura.Core/Interfaces/Repositories/I*Repository.cs`
  - `backend/src/Aura.Infrastructure/Repositories/*Repository.cs`

## Acceptance Criteria
- [ ] AC1: Given the solution builds, when `dotnet ef migrations add InitialSchema` is run, then the migration is generated with all 13 tables, all indexes, all foreign keys, and all CHECK constraints
- [ ] AC2: Given the migration is applied to PostgreSQL, when `dotnet ef database update` is run, then all tables are created and 3 template seed rows are inserted
- [ ] AC3: Given the application is running, when a new Guest is created and then soft-deleted (IsDeleted = true), then `context.Guests.ToListAsync()` does not return the deleted guest (global query filter works)
- [ ] AC4: Given a Guest with Email "test@example.com", when the entity is saved and re-read from the database, then the stored column value is encrypted (not plaintext) but the entity property returns "test@example.com" (Value Converter works)
- [ ] AC5: Given an Event is created with EventDate, when the entity is read from the database, then EventEndDate equals EventDate + 1 day (computed column works)
- [ ] AC6: Given the migration has run, when `SELECT * FROM "Templates"` is executed, then 3 rows exist with Name "Classic Elegance", "Modern Minimal", "Rustic Charm"

## Related Items
- **PRD section:** 06-mvp-features.md (all features reference these entities)
- **Architecture:** 03-project-structure.md (Aura.Core/Models, Aura.Infrastructure/Data)
- **Data model:** README.md (ER diagram, entity definitions, indexing strategy, GDPR strategy, soft delete pattern, token security), entities.md (all 13 entity specifications)

## Blockers
Blocked by: PSRP-001

## Branch Name
`feature/PSRP-002-database-schema-and-ef-core-migrations`
