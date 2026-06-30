## 1. Domain Entities & Enums

- [x] 1.1 Create `ISoftDeletable.cs` interface in `Aura.Core/Interfaces/`
- [x] 1.2 Define Enums (`RsvpStatus`, `GuestCategory`, `PaymentStatus`, etc.) in `Aura.Core/Enums/`
- [x] 1.3 Implement the 13 Domain Entities in `Aura.Core/Models/` with primary keys and `Guid` IDs.
- [x] 1.4 Configure navigation properties (collections and foreign keys) in the entities.

## 2. Core Repository Interfaces

- [x] 2.1 Define a generic `IRepository<T>` interface in `Aura.Core/Interfaces/Repositories/`
- [x] 2.2 Define the 13 specific repository interfaces (e.g., `IEventRepository`, `IGuestRepository`)

## 3. Infrastructure & EF Core Setup

- [x] 3.1 Create `ApplicationDbContext.cs` in `Aura.Infrastructure/Data/` with `DbSet` properties.
- [x] 3.2 Create an EF Core `ValueConverter` for PII Encryption (e.g., `EncryptedStringConverter`).
- [x] 3.3 Register `ApplicationDbContext` in the DI container (in `Aura.Infrastructure/DependencyInjection.cs`).

## 4. Entity Configurations

- [x] 4.1 Create `UserConfiguration` and `UserConsentConfiguration` (indices, UNIQUE constraints).
- [x] 4.2 Create `EventConfiguration` (computed column for `EventEndDate`, FK to `User`).
- [x] 4.3 Create `TemplateConfiguration` and add `HasData()` seed for the 3 default templates.
- [x] 4.4 Create `GuestConfiguration` (Global query filter for `IsDeleted`, PII converter for Email/Phone).
- [x] 4.5 Create `InvitationConfiguration` and `RsvpConfiguration` (PII converter for DietaryRestrictions/Message).
- [x] 4.6 Create configurations for `Accomplice`, `MessageTemplate`, `LiveMessage`, `Payment`, `DataRetentionJob`, `DeliveryLog`.

## 5. Repository Implementations

- [x] 5.1 Create `Repository<T>` in `Aura.Infrastructure/Repositories/` (implements `IRepository<T>`).
- [x] 5.2 Implement specific repositories (e.g., `EventRepository` to include related entities like `Guests` and `MessageTemplates` when retrieving by Slug).
- [x] 5.3 Register all repositories in the DI container.

## 6. EF Core Migrations

- [x] 6.1 Create the initial EF Core Migration (`dotnet ef migrations add InitialSchema`).
- [x] 6.2 Apply the migration to the local database to verify schema correctness (`dotnet ef database update`).
- [x] 6.3 Verify tables, constraints, and indices in the local PostgreSQL instance.
