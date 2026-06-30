## ADDED Requirements

### Requirement: 13 Core Domain Entities
The system SHALL define the 13 core domain entities in the `Aura.Core` project with appropriate properties and data types.

#### Scenario: Entities represent the domain
- **WHEN** the domain models are compiled
- **THEN** all 13 entities (`User`, `Event`, `Guest`, `Invitation`, `Rsvp`, `Accomplice`, `MessageTemplate`, `LiveMessage`, `Payment`, `Template`, `DataRetentionJob`, `UserConsent`, `DeliveryLog`) exist as C# classes.

### Requirement: Soft Delete Interface
The system SHALL define an `ISoftDeletable` interface to standardize soft deletion across the domain.

#### Scenario: Entities support soft delete
- **WHEN** an entity implements `ISoftDeletable`
- **THEN** it exposes an `IsDeleted` boolean property.
