---
name: dotnet-result-pattern
description: "Implements the Result pattern for explicit error handling without exceptions. Provides Result, Result<T>, and Error types for clean, predictable control flow in domain-driven applications."
version: 1.0.0
language: C#
framework: .NET 8+
pattern: Railway-Oriented Programming
---

# Result Pattern Implementation

## Overview

The Result pattern provides explicit error handling without exceptions:

- **No exceptions for business errors** - Exceptions for truly exceptional cases only
- **Explicit success/failure** - Compiler forces handling of both cases
- **Composable errors** - Chain operations, fail fast
- **Self-documenting** - Method signatures show possible outcomes

## Quick Reference

| Type | Purpose | Usage |
|------|---------|-------|
| `Result` | Operation without return value | Update, Delete operations |
| `Result<T>` | Operation with return value | Create, Get operations |
| `Error` | Error information | Code + Description |

---

## Template: Core Result Types

```csharp
// src/{name}.domain/Abstractions/Error.cs
namespace {name}.domain.abstractions;

public record Error(string Code, string Description)
{
    public static readonly Error None = new(string.Empty, string.Empty);
    public static readonly Error NullValue = new("Error.NullValue", "A null value was provided");

    public static Error FromException(Exception exception) => new("Error.Exception", exception.Message);

    public static implicit operator string(Error error) => error.Code;
}
```

```csharp
// src/{name}.domain/Abstractions/Result.cs
namespace {name}.domain.abstractions;

public class Result
{
    protected Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
            throw new InvalidOperationException("Cannot create successful result with an error");
        if (!isSuccess && error == Error.None)
            throw new InvalidOperationException("Cannot create failed result without an error");

        IsSuccess = isSuccess;
        Error = error;
    }

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public Error Error { get; }

    public static Result Success() => new(true, Error.None);
    public static Result Failure(Error error) => new(false, error);
    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);
    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);
}

public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, Error error) : base(isSuccess, error)
    {
        _value = value;
    }

    public TValue Value => IsSuccess ? _value! : throw new InvalidOperationException($"Cannot access value of a failed result");

    public static implicit operator Result<TValue>(TValue? value) =>
        value is not null ? Success(value) : Failure<TValue>(Error.NullValue);
}
```

---

## Template: Result Extensions

```csharp
// src/{name}.domain/Abstractions/ResultExtensions.cs
namespace {name}.domain.abstractions;

public static class ResultExtensions
{
    public static Result<TOut> Map<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, TOut> mapper)
    {
        return result.IsSuccess
            ? Result.Success(mapper(result.Value))
            : Result.Failure<TOut>(result.Error);
    }

    public static Result<TOut> Bind<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, Result<TOut>> binder)
    {
        return result.IsSuccess
            ? binder(result.Value)
            : Result.Failure<TOut>(result.Error);
    }

    public static async Task<Result<TOut>> Bind<TIn, TOut>(
        this Result<TIn> result,
        Func<TIn, Task<Result<TOut>>> binder)
    {
        return result.IsSuccess
            ? await binder(result.Value)
            : Result.Failure<TOut>(result.Error);
    }

    public static T Match<T>(
        this Result result,
        Func<T> onSuccess,
        Func<Error, T> onFailure)
    {
        return result.IsSuccess ? onSuccess() : onFailure(result.Error);
    }

    public static Result<T> Ensure<T>(
        this Result<T> result,
        Func<T, bool> predicate,
        Error error)
    {
        if (result.IsFailure) return result;
        return predicate(result.Value) ? result : Result.Failure<T>(error);
    }
}
```

---

## Usage Examples

### Basic Usage in Domain Entity

```csharp
public sealed class User : Entity
{
    public static Result<User> Create(string email, string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<User>(UserErrors.NameRequired);

        var emailResult = Email.Create(email);
        if (emailResult.IsFailure)
            return Result.Failure<User>(emailResult.Error);

        return new User(Guid.NewGuid(), emailResult.Value, name);
    }
}
```

### Usage in Command Handler

```csharp
internal sealed class CreateUserCommandHandler
    : ICommandHandler<CreateUserCommand, Guid>
{
    public async Task<Result<Guid>> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var existingUser = await _userRepository.GetByEmailAsync(request.Email, ct);
        if (existingUser is not null)
            return Result.Failure<Guid>(UserErrors.EmailAlreadyExists);

        var userResult = User.Create(request.Email, request.Name);
        if (userResult.IsFailure)
            return Result.Failure<Guid>(userResult.Error);

        _userRepository.Add(userResult.Value);
        await _unitOfWork.SaveChangesAsync(ct);
        return userResult.Value.Id;
    }
}
```

### Chaining with Bind

```csharp
public async Task<Result<OrderConfirmation>> PlaceOrder(Guid userId, CreateOrderRequest request, CancellationToken ct)
{
    return await GetUser(userId, ct)
        .Bind(user => ValidateUserCanOrder(user))
        .Bind(user => CreateOrder(user, request))
        .Bind(order => ProcessPayment(order, ct));
}
```

---

## Domain Errors Pattern

```csharp
// src/{name}.domain/Users/UserErrors.cs
namespace {name}.domain.users;

public static class UserErrors
{
    public static readonly Error NotFound = new("User.NotFound", "User not found");
    public static readonly Error EmailAlreadyExists = new("User.EmailExists", "Email already exists");
    public static readonly Error NameRequired = new("User.NameRequired", "User name is required");
    public static readonly Error InvalidCredentials = new("User.InvalidCredentials", "Invalid credentials");

    public static Error NotFoundById(Guid id) => new("User.NotFound", $"User with ID '{id}' not found");
}
```

---

## Critical Rules

1. **Never throw for business errors** - Return `Result.Failure`
2. **Always check IsSuccess/IsFailure** - Before accessing Value
3. **Use factory methods** - `Result.Success()`, `Result.Failure()`
4. **Errors are immutable** - `record Error(...)`
5. **Error codes are unique** - Follow `{Entity}.{ErrorType}` pattern
6. **Chain with Bind** - For sequential operations
7. **Use Match in controllers** - Clean response mapping

---

## Anti-Patterns to Avoid

```csharp
// ❌ WRONG: Throwing for business errors
if (user is null)
    throw new NotFoundException("User not found");

// ✅ CORRECT: Return Result
if (user is null)
    return Result.Failure<User>(UserErrors.NotFound);

// ❌ WRONG: Accessing Value without checking
var user = result.Value;

// ✅ CORRECT: Check first
if (result.IsFailure)
    return Result.Failure(result.Error);
var user = result.Value;
```

---

## Related Skills

- `dotnet-domain-entity-generator` - Use Result in factory methods
- `dotnet-cqrs-command-generator` - Commands return Result
- `dotnet-cqrs-query-generator` - Queries return Result