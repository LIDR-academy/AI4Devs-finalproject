## Why

The underlying database schema and core domain entities are the foundational layer required before any business logic or UI can be built. This change establishes the complete data model for the Aura Planning application, enabling the backend to store and retrieve data securely with proper constraints, indexing, and GDPR compliance (PII encryption and soft deletes).

## What Changes

- Creation of 13 Core Domain Entities (`User`, `UserConsent`, `Event`, `Template`, `Guest`, `Invitation`, `Rsvp`, `Accomplice`, `MessageTemplate`, `LiveMessage`, `Payment`, `DataRetentionJob`, `DeliveryLog`).
- Implementation of Entity Framework Core `ApplicationDbContext`.
- Creation of EF Core EntityTypeConfigurations mapping the domain models to PostgreSQL with strict constraints (CHECK, UNIQUE, NOT NULL).
- Configuration of over 32 database indices for query performance optimization.
- Implementation of GDPR compliance features: PII encryption via Value Converters and Soft Deletes via global query filters.
- Seeding of 3 default wedding templates (`Classic Elegance`, `Modern Minimal`, `Rustic Charm`).
- Generation of the `InitialSchema` EF Core migration.
- Implementation of the Repository Pattern interfaces and concrete EF Core implementations for all entities.

## Capabilities

### New Capabilities
- `domain-entities`: Core domain models, enums, and properties representing the business data.
- `ef-core-data-layer`: The EF Core database context, entity configurations, constraints, indexing, value converters for PII encryption, and initial schema migration.
- `repositories`: Abstract data access interfaces and their EF Core concrete implementations.

### Modified Capabilities
- None

## Impact

- **Backend Code:** Establishes the `Aura.Core/Models`, `Aura.Core/Interfaces/Repositories`, `Aura.Infrastructure/Data`, and `Aura.Infrastructure/Repositories` folders.
- **Database:** Creates the initial PostgreSQL schema with all tables, constraints, and seeded data.
- **Dependencies:** Introduces reliance on `Microsoft.EntityFrameworkCore.PostgreSQL` and its design tools.
