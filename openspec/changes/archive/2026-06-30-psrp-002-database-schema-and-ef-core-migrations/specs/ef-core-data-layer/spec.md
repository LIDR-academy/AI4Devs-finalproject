## ADDED Requirements

### Requirement: Entity Framework Core DbContext
The system SHALL define an `ApplicationDbContext` in `Aura.Infrastructure` with `DbSet` properties for all entities.

#### Scenario: Context Initialization
- **WHEN** the `ApplicationDbContext` is instantiated
- **THEN** it exposes access to all 13 domain entities.

### Requirement: Entity Configurations
The system SHALL define separate `IEntityTypeConfiguration<T>` classes for every entity to enforce database constraints, foreign keys, and indices.

#### Scenario: Applied configurations
- **WHEN** the context builds the model
- **THEN** all configurations from the assembly are automatically applied.

### Requirement: Soft Delete Query Filters
The system SHALL apply global query filters for soft deletes on relevant entities.

#### Scenario: Filtering soft-deleted records
- **WHEN** a query is made against `Guests`
- **THEN** EF Core automatically appends `WHERE "IsDeleted" = false`.

### Requirement: PII Encryption Value Converters
The system SHALL encrypt sensitive string columns transparently.

#### Scenario: Saving PII data
- **WHEN** a `Guest.Email` is saved to the database
- **THEN** the value stored in PostgreSQL is an AES-encrypted string.

### Requirement: Database Seeding
The system SHALL seed default application data during migrations.

#### Scenario: Seeding templates
- **WHEN** the database schema is generated
- **THEN** 3 default templates are inserted into the `Templates` table.
