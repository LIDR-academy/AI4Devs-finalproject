## ADDED Requirements

### Requirement: Worker projects as .NET 10 BackgroundService applications
The backend SHALL have three worker projects under `backend/workers/` — Aura.Workers.Email, Aura.Workers.WhatsApp, Aura.Workers.SSG — each implemented as a minimal .NET 10 BackgroundService.

#### Scenario: Worker projects build without errors
- **WHEN** `dotnet build backend/workers/Aura.Workers.Email` is executed
- **THEN** exit code is 0

#### Scenario: Worker projects reference shared libraries
- **WHEN** each worker .csproj is inspected
- **THEN** it references Aura.Core and Aura.Infrastructure

#### Scenario: Worker Program.cs creates a minimal host
- **WHEN** each worker Program.cs is inspected
- **THEN** it creates a Host with at least one BackgroundService registered

### Requirement: Workers are separate .csproj projects
Each worker SHALL be a separate .NET project with its own `.csproj` file, `Program.cs`, and directory under `backend/workers/`.

#### Scenario: Three worker project directories exist
- **WHEN** `backend/workers/` is listed
- **THEN** it contains: Aura.Workers.Email/, Aura.Workers.WhatsApp/, Aura.Workers.SSG/

#### Scenario: Each worker has its own .csproj
- **WHEN** each worker directory is inspected
- **THEN** it contains a `.csproj` file targeting `net10.0`
