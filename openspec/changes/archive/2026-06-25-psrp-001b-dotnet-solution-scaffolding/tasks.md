### Phase 1: Project Structure
- [x] 1.1 Create `backend/AuraPlanning.sln`
- [x] 1.2 Create `backend/src/Aura.Core/Aura.Core.csproj` (classlib, net10.0, nullable enabled, implicit usings)
- [x] 1.3 Create `backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj` (classlib, net10.0, references Aura.Core)
- [x] 1.4 Create `backend/src/Aura.Api/Aura.Api.csproj` (webapi, net10.0, references Aura.Core + Aura.Infrastructure)
- [x] 1.5 Create `backend/tests/Aura.Core.Tests/Aura.Core.Tests.csproj` (xUnit, net10.0, references Aura.Core, includes NSubstitute + AwesomeAssertions)
- [x] 1.6 Add all projects to solution: `dotnet sln add` for each

### Phase 2: API Bootstrap
- [x] 2.1 Create `backend/src/Aura.Api/Program.cs` with minimal API: `app.MapGet("/", () => "OK")`
- [x] 2.2 Create `backend/src/Aura.Api/appsettings.json` with stub sections: ConnectionStrings, Jwt, MagicLink, WhatsApp, Smtp, Minio, Dragonfly, Stripe, GoogleMaps
- [x] 2.3 Create `backend/src/Aura.Api/appsettings.Development.json` with localhost overrides
- [x] 2.4 Verify `dotnet build backend/AuraPlanning.sln` succeeds with 0 errors
- [x] 2.5 Verify `dotnet run --project backend/src/Aura.Api` starts and GET / returns 200

### Phase 3: Testing Configuration
- [x] 3.1 Create `backend/tests/Aura.Core.Tests/UnitTest1.cs` with one passing test using AwesomeAssertions
- [x] 3.2 Verify `dotnet test backend/tests/Aura.Core.Tests` passes

### Phase 4: CI Pipeline Updates
- [x] 4.1 Add `dotnet-build` job to `.github/workflows/ci.yml`: setup .NET 10 SDK, `dotnet build`, `dotnet test`
- [x] 4.2 Verify CI passes with dotnet build + test steps
