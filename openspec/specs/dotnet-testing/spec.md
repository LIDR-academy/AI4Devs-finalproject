# .NET Testing

## Purpose
TBD

## Requirements

### Requirement: Test project uses xUnit with NSubstitute and AwesomeAssertions
The test project SHALL use xUnit as the test runner, NSubstitute for mocking, and AwesomeAssertions for assertions, per the testing strategy document.

#### Scenario: Test project references required packages
- **WHEN** Aura.Core.Tests.csproj is inspected
- **THEN** it references xunit, NSubstitute, and AwesomeAssertions packages

### Requirement: At least one passing test validates test infrastructure
The test project SHALL contain at least one passing test that confirms the test runner, mocking framework, and assertion library are correctly configured.

#### Scenario: dotnet test passes
- **WHEN** `dotnet test backend/tests/Aura.Core.Tests` is executed
- **THEN** at least one test passes with exit code 0
