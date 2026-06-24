## Context

The backend directory does not exist. The architecture docs define a 3-layer Clean Architecture pattern (Api, Core, Infrastructure) plus 3 separate worker projects. This change creates the .NET 10 solution foundation — the minimum viable backend that compiles, runs, and has one passing test.

## Goals / Non-Goals

**Goals:**
- Create a .NET 10 solution that builds without errors
- Minimal API that starts and responds to HTTP requests (GET / → 200 "OK")
- Proper project references following Clean Architecture (Api → Core + Infrastructure, Infrastructure → Core)
- One passing unit test to validate test infrastructure
- Stub appsettings.json with all configuration keys the app will need (connection strings, JWT, SMTP, Stripe, MinIO, Dragonfly, Google Maps)

**Non-Goals:**
- No domain entities (PSRP-002)
- No EF Core configuration (PSRP-002)
- No auth middleware, JWT, CSRF, rate limiting (PSRP-003)
- No repository implementations (PSRP-002)
- No worker business logic (PSRP-010, PSRP-012, PSRP-015)

## Decisions

### 1. 3-layer Core architecture (not 4-layer)
The architecture docs define Api, Core, Infrastructure — not the skill's 4-layer (domain/app/infra/api). Core combines domain entities + application services + interfaces. This matches the project structure in `conventions/technical-conventions.md`.

### 2. Minimal API over Controllers for bootstrap
Program.cs uses minimal API (`app.MapGet("/", () => "OK")`) rather than controllers. Controllers will be added in PSRP-003 when auth and real endpoints are needed.

### 3. File-scoped namespaces and C# 14 features
All files use file-scoped namespaces (`namespace Aura.Core.Models;`), nullable reference types enabled, and implicit usings — matching conventions.

### 4. xUnit + NSubstitute + AwesomeAssertions for tests
Standard .NET testing stack per `technical-documentation/architecture/06-testing.md`. One trivial passing test validates the test runner works.

### 5. appsettings.json has all keys, empty values
All configuration keys from the conventions doc are present with placeholder values. This prevents config-not-found errors when later phases add services that read these keys.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| .NET 10 SDK may not be on GitHub Actions runners | Use `dotnet-version: '10.0.x'` — confirmed available per Microsoft docs |
| Empty Infrastructure project has no package references yet | Will be populated in PSRP-002 with EF Core, Npgsql, etc. |
| appsettings.json has placeholder secrets | Values are stubs — real values come from K8s Secrets (PSRP-001E) or environment variables |
