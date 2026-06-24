---
name: dotnet-unit-testing
description: "Generates unit tests for command and query handlers using xUnit and NSubstitute. Implements Arrange-Act-Assert pattern with comprehensive test coverage for success and failure scenarios."
version: 1.0.0
language: C#
framework: .NET 8+
dependencies: xUnit, NSubstitute, FluentAssertions
pattern: Arrange-Act-Assert, Test Doubles
---

# Unit Test Generator

## Overview

Unit tests for Clean Architecture handlers:

- **xUnit** - Test framework
- **NSubstitute** - Mocking library
- **FluentAssertions** - Readable assertions
- **AAA pattern** - Arrange, Act, Assert

## Quick Reference

| Test Type | Purpose | Example |
|-----------|---------|---------|
| Success test | Verify happy path | `Should_ReturnSuccess_When_ValidRequest` |
| Failure test | Verify error handling | `Should_ReturnFailure_When_NotFound` |

---

## Test Project Structure

```
tests/
└── {name}.Application.UnitTests/
    ├── {Feature}/
    │   └── Create{Entity}/
    │       └── Create{Entity}CommandHandlerTests.cs
    └── Abstractions/
        └── BaseTest.cs
```

---

## Template: Test Project File

```xml
<!-- tests/{name}.Application.UnitTests/{name}.Application.UnitTests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <ImplicitUsings>enable</ImplicitUsings>
    <Nullable>enable</Nullable>
    <IsPackable>false</IsPackable>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="FluentAssertions" Version="6.12.0" />
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageReference Include="NSubstitute" Version="5.1.0" />
    <PackageReference Include="xunit" Version="2.6.2" />
    <PackageReference Include="xunit.runner.visualstudio" Version="2.5.4" />
  </ItemGroup>

  <ItemGroup>
    <ProjectReference Include="..\..\src\{name}.application\{name}.application.csproj" />
  </ItemGroup>
</Project>
```

---

## Template: Base Test Class

```csharp
// tests/{name}.Application.UnitTests/Abstractions/BaseTest.cs
using NSubstitute;
using {name}.domain.abstractions;

namespace {name}.Application.UnitTests.Abstractions;

public abstract class BaseTest
{
    protected static CancellationToken CancellationToken => CancellationToken.None;

    protected static T CreateMock<T>() where T : class => Substitute.For<T>();

    protected static Result<T> SuccessResult<T>(T value) => Result.Success(value);
    protected static Result<T> FailureResult<T>(Error error) => Result.Failure<T>(error);
}
```

---

## Template: Command Handler Tests

```csharp
// tests/{name}.Application.UnitTests/{Feature}/Create{Entity}/Create{Entity}CommandHandlerTests.cs
using FluentAssertions;
using NSubstitute;
using {name}.application.{feature}.Create{Entity};
using {name}.domain.{aggregate};
using {name}.domain.abstractions;
using {name}.Application.UnitTests.Abstractions;

namespace {name}.Application.UnitTests.{Feature}.Create{Entity};

public sealed class Create{Entity}CommandHandlerTests : BaseTest
{
    private readonly I{Entity}Repository _{entity}Repository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Create{Entity}CommandHandler _handler;

    public Create{Entity}CommandHandlerTests()
    {
        _{entity}Repository = CreateMock<I{Entity}Repository>();
        _unitOfWork = CreateMock<IUnitOfWork>();
        _handler = new Create{Entity}CommandHandler(_{entity}Repository, _unitOfWork);
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_ValidRequest()
    {
        // Arrange
        var command = new Create{Entity}Command("Test Entity", null, Guid.NewGuid());
        _{entity}Repository.GetByNameAsync(command.Name, CancellationToken).Returns((Domain.{Aggregate}.{Entity}?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeEmpty();
    }

    [Fact]
    public async Task Handle_Should_ReturnFailure_When_NameAlreadyExists()
    {
        // Arrange
        var command = new Create{Entity}Command("Existing", null, Guid.NewGuid());
        var existing = Domain.{Aggregate}.{Entity}.Create("Existing", null, Guid.NewGuid()).Value;
        _{entity}Repository.GetByNameAsync(command.Name, CancellationToken).Returns(existing);

        // Act
        var result = await _handler.Handle(command, CancellationToken);

        // Assert
        result.IsFailure.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_AddEntity_When_ValidRequest()
    {
        // Arrange
        var command = new Create{Entity}Command("Test Entity", null, Guid.NewGuid());
        _{entity}Repository.GetByNameAsync(command.Name, CancellationToken).Returns((Domain.{Aggregate}.{Entity}?)null);

        // Act
        await _handler.Handle(command, CancellationToken);

        // Assert
        _{entity}Repository.Received(1).Add(Arg.Any<Domain.{Aggregate}.{Entity}>());
    }
}
```

---

## NSubstitute Quick Reference

```csharp
// Create mock
var repository = Substitute.For<IRepository>();

// Setup return value
repository.GetByIdAsync(Arg.Any<Guid>(), Arg.Any<CancellationToken>()).Returns(entity);

// Verify method was called
repository.Received(1).Add(Arg.Any<Entity>());

// Verify with argument matching
repository.Received().Add(Arg.Is<Entity>(e => e.Name == "Test"));
```

---

## FluentAssertions Quick Reference

```csharp
// Basic assertions
result.Should().BeTrue();
result.Should().BeFalse();
result.Should().BeNull();
result.Should().NotBeNull();

// Equality
result.Should().Be(expected);
result.Should().NotBe(unexpected);

// Collections
list.Should().BeEmpty();
list.Should().NotBeEmpty();
list.Should().HaveCount(3);
list.Should().Contain(item);

// Exceptions
action.Should().Throw<InvalidOperationException>();
```

---

## Critical Rules

1. **One assert concept per test** - Focus on single behavior
2. **Descriptive test names** - `Should_{ExpectedBehavior}_When_{Condition}`
3. **Arrange-Act-Assert** - Clear structure in every test
4. **Mock only dependencies** - Don't mock the SUT
5. **Test behavior, not implementation** - Focus on outcomes

---

## Related Skills

- `dotnet-cqrs-command-generator` - Commands to test
- `dotnet-cqrs-query-generator` - Queries to test
- `dotnet-domain-entity-generator` - Domain entities to test