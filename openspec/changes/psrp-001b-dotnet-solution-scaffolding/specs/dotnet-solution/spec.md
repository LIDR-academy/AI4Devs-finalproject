## ADDED Requirements

### Requirement: .NET 10 solution with Clean Architecture structure
The backend SHALL have a .NET 10 solution file at `backend/AuraPlanning.sln` containing projects organized in Clean Architecture layers.

#### Scenario: Solution contains required projects
- **WHEN** the solution is loaded in an IDE or CLI
- **THEN** it contains: Aura.Api, Aura.Core, Aura.Infrastructure, Aura.Core.Tests

#### Scenario: Solution builds without errors
- **WHEN** `dotnet build backend/AuraPlanning.sln --configuration Release` is executed
- **THEN** exit code is 0 with no errors

### Requirement: Project references follow Clean Architecture dependency rules
Project references SHALL follow inward dependency direction: Api references Core and Infrastructure; Infrastructure references Core; Core has no project references.

#### Scenario: Aura.Api references Aura.Core
- **WHEN** Aura.Api.csproj is inspected
- **THEN** it has a ProjectReference to Aura.Core.csproj

#### Scenario: Aura.Api references Aura.Infrastructure
- **WHEN** Aura.Api.csproj is inspected
- **THEN** it has a ProjectReference to Aura.Infrastructure.csproj

#### Scenario: Aura.Infrastructure references Aura.Core
- **WHEN** Aura.Infrastructure.csproj is inspected
- **THEN** it has a ProjectReference to Aura.Core.csproj

#### Scenario: Aura.Core has no project references
- **WHEN** Aura.Core.csproj is inspected
- **THEN** it has no ProjectReference elements

### Requirement: All projects use .NET 10 and file-scoped namespaces
All .NET projects SHALL target `net10.0`, use file-scoped namespaces, and have nullable reference types enabled.

#### Scenario: Projects target .NET 10
- **WHEN** any .csproj file is inspected
- **THEN** `<TargetFramework>net10.0</TargetFramework>` is present

#### Scenario: Files use file-scoped namespaces
- **WHEN** any .cs file is inspected
- **THEN** it uses `namespace X.Y;` syntax (not `namespace X.Y { }`)
