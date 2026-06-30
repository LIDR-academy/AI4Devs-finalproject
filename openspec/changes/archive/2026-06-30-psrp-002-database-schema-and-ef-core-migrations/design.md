## Context

We are establishing the core data model for the Aura Planning application. The backend uses Clean Architecture, so entities reside in `Aura.Core/Models` without dependencies on infrastructure, while the database configuration (EF Core) resides in `Aura.Infrastructure/Data`. This change establishes all 13 core domain entities and creates the PostgreSQL database schema.

## Goals / Non-Goals

**Goals:**
- Implement all 13 domain entities (`User`, `Event`, `Guest`, `Invitation`, `Rsvp`, `Accomplice`, `MessageTemplate`, `LiveMessage`, `Payment`, `Template`, `DataRetentionJob`, `UserConsent`, `DeliveryLog`).
- Configure EF Core EntityTypeConfigurations with rigorous constraints, indices, foreign keys, and soft deletes.
- Ensure PII compliance by implementing transparent EF Core Value Converters for Emails, Phones, and Messages.
- Produce the `InitialSchema` migration.

**Non-Goals:**
- Implementing the CQRS Handlers or MediatR logic.
- Building API endpoints or frontend components.
- Setting up the authentication/JWT flow (this will be a separate PR).

## Decisions

- **Primary Keys**: We will use `Guid` mapped to PostgreSQL `uuid` using the `uuid-ossp` extension to avoid ID guessing and sequential ID vulnerabilities.
- **Entity Config Separation**: Instead of bloating `ApplicationDbContext`, we will use the `IEntityTypeConfiguration<T>` pattern for each entity in `Aura.Infrastructure/Data/Configurations`.
- **Soft Deletes**: Implemented via a boolean `IsDeleted` property and an EF Core Global Query Filter on entities like `Guest` and `Invitation`.
- **PII Encryption**: We will use an EF Core `ValueConverter` attached to PII string columns (like `Email`, `Phone`) to automatically AES-encrypt data on save and decrypt on read, abstracting this from the domain layer.
- **Computed Columns**: `EventEndDate` will be configured as a database-level computed column (`EventDate + interval '1 day'`) within the EF Core configuration.

## Risks / Trade-offs

- **Risk**: PII Encryption overhead slowing down queries.
  **Mitigation**: We will not index directly on the encrypted values if we need to search by them (or we will use deterministic encryption for searchable PII fields like Email).
- **Risk**: Global query filters hiding data when doing administrative reporting.
  **Mitigation**: Repositories can use `IgnoreQueryFilters()` explicitly for admin data dumps.
