## Why

PSRP-001 bundles the entire .NET solution scaffolding (6 projects) into one ticket alongside Angular, Docker, K8s, and CI/CD. This change isolates the backend foundation so it can be built, validated, and merged independently. Once merged, the backend team can start PSRP-002 (database schema) without waiting for frontend or infrastructure.

## What Changes

- Creates the .NET 10 solution structure following Clean Architecture conventions
- Scaffolds 3 projects: Aura.Api (minimal webapi), Aura.Core (classlib), Aura.Infrastructure (classlib)
- Adds test project: Aura.Core.Tests (xUnit, 1 passing test)
- Configures project references: Api → Core + Infrastructure, Infrastructure → Core
- Sets up appsettings.json with stub configuration (connection strings, JWT, SMTP, Stripe, MinIO, Dragonfly, Google Maps)
- Minimal API endpoint: GET / returns 200 "OK"
- CI pipeline adds `dotnet build` and `dotnet test` steps

## Capabilities

### New Capabilities
- `dotnet-solution`: .NET 10 solution file with Clean Architecture project structure (Api, Core, Infrastructure) and proper project references.
- `api-bootstrap`: Minimal ASP.NET Core Web API that starts, responds to health checks, and serves as the foundation for PSRP-003 (base API infrastructure).
- `dotnet-testing`: xUnit test project infrastructure with NSubstitute and AwesomeAssertions, ready for PSRP-022 (comprehensive testing suite).

### Modified Capabilities
- `ci-pipeline`: Adds dotnet build and dotnet test jobs to the CI workflow.

## Impact

- **New directory**: `backend/` with solution, 3 source projects, 1 test project
- **CI**: Adds .NET 10 SDK setup, build, and test steps to GitHub Actions
- **Dependencies**: PSRP-002 (database schema) and PSRP-003 (base API infrastructure) can now start
- **No breaking changes**: Purely additive
