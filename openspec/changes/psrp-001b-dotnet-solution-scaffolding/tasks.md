## 1. .NET Solution Structure

- [ ] 1.1 Create `backend/AuraPlanning.sln`
- [ ] 1.2 Create `backend/src/Aura.Core/Aura.Core.csproj` (classlib, net10.0, nullable enabled, implicit usings)
- [ ] 1.3 Create `backend/src/Aura.Infrastructure/Aura.Infrastructure.csproj` (classlib, net10.0, references Aura.Core)
- [ ] 1.4 Create `backend/src/Aura.Api/Aura.Api.csproj` (webapi, net10.0, references Aura.Core + Aura.Infrastructure)
- [ ] 1.5 Create `backend/tests/Aura.Core.Tests/Aura.Core.Tests.csproj` (xUnit, net10.0, references Aura.Core, includes NSubstitute + AwesomeAssertions)
- [ ] 1.6 Add all projects to solution: `dotnet sln add` for each

## 2. API Bootstrap

- [ ] 2.1 Create `backend/src/Aura.Api/Program.cs` with minimal API: `app.MapGet("/", () => "OK")`
- [ ] 2.2 Create `backend/src/Aura.Api/appsettings.json` with stub sections: ConnectionStrings, Jwt, MagicLink, WhatsApp, Smtp, Minio, Dragonfly, Stripe, GoogleMaps
- [ ] 2.3 Create `backend/src/Aura.Api/appsettings.Development.json` with localhost overrides
- [ ] 2.4 Verify `dotnet build backend/AuraPlanning.sln` succeeds with 0 errors
- [ ] 2.5 Verify `dotnet run --project backend/src/Aura.Api` starts and GET / returns 200

## 3. Test Infrastructure

- [ ] 3.1 Create `backend/tests/Aura.Core.Tests/UnitTest1.cs` with one passing test using AwesomeAssertions
- [ ] 3.2 Verify `dotnet test backend/tests/Aura.Core.Tests` passes

## 4. CI Pipeline Update

- [ ] 4.1 Add `dotnet-build` job to `.github/workflows/ci.yml`: setup .NET 10 SDK, `dotnet build`, `dotnet test`
- [ ] 4.2 Verify CI passes with dotnet build + test steps
