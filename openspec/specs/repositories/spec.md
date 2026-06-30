## Purpose
TBD

## Requirements

### Requirement: Repository Interfaces
The system SHALL define abstract repository interfaces in the Aura.Core project to decouple domain logic from EF Core.

#### Scenario: Dependency inversion
- **WHEN** the application requires data access
- **THEN** it injects an IUserRepository instead of the ApplicationDbContext.

### Requirement: Repository Implementations
The system SHALL provide concrete EF Core repository implementations in the Aura.Infrastructure project.

#### Scenario: Concrete persistence
- **WHEN** a repository method is called
- **THEN** it interacts with PostgreSQL via the ApplicationDbContext.
