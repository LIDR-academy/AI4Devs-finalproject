---
name: dotnet-fluent-validation
description: "Generates FluentValidation validators for commands and queries. Includes common validation rules, custom validators, async validation, and integration with MediatR pipeline behaviors."
version: 1.0.0
language: C#
framework: .NET 8+
dependencies: FluentValidation, FluentValidation.DependencyInjectionExtensions
---

# FluentValidation Rules Generator

## Overview

FluentValidation provides a fluent interface for building strongly-typed validation rules:

- **Declarative rules** - Readable, maintainable validation logic
- **Separation of concerns** - Validation separate from domain
- **Integration with MediatR** - Automatic validation via pipeline behavior
- **Custom validators** - Reusable validation components

## Quick Reference

| Validator Type | Purpose | Example |
|----------------|---------|---------|
| Built-in | Common validations | `NotEmpty()`, `MaximumLength()` |
| Custom | Reusable rules | `Must(BeValidEmail)` |
| Async | Database checks | `MustAsync(BeUniqueEmail)` |
| Child | Nested objects | `SetValidator(new AddressValidator())` |
| Collection | List items | `RuleForEach(x => x.Items)` |

---

## Template: Inline Validator (Preferred Pattern)

```csharp
// src/{name}.application/{Feature}/Create{Entity}/Create{Entity}Command.cs
using FluentValidation;
using {name}.application.abstractions.messaging;
using {name}.domain.abstractions;

namespace {name}.application.{feature}.Create{Entity};

public sealed record Create{Entity}Command(
    string Name,
    string? Description,
    Guid OrganizationId,
    string Email,
    decimal Amount) : ICommand<Guid>;

internal sealed class Create{Entity}CommandValidator : AbstractValidator<Create{Entity}Command>
{
    public Create{Entity}CommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress();

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .LessThanOrEqualTo(1_000_000);
    }
}
```

---

## Common Validators Reference

### String Validators

```csharp
RuleFor(x => x.Name)
    .NotEmpty()
    .MaximumLength(100)
    .MinimumLength(2)
    .Matches("^[a-zA-Z]+$")
    .EmailAddress();
```

### Numeric Validators

```csharp
RuleFor(x => x.Amount)
    .GreaterThan(0)
    .InclusiveBetween(1, 100);
```

### Collection Validators

```csharp
RuleFor(x => x.Items)
    .NotEmpty()
    .Must(items => items.Count <= 100);

RuleForEach(x => x.Items)
    .ChildRules(item =>
    {
        item.RuleFor(i => i.Name).NotEmpty();
    });
```

### Conditional Validation

```csharp
When(x => x.PaymentMethod == PaymentMethod.CreditCard, () =>
{
    RuleFor(x => x.CardNumber)
        .NotEmpty()
        .CreditCard();
});
```

---

## Registering Validators

```csharp
// src/{name}.application/DependencyInjection.cs
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace {name}.application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        return services;
    }
}
```

---

## Critical Rules

1. **Validators are internal** - Not exposed outside Application layer
2. **Sync rules first** - Fast validations before database calls
3. **Use async sparingly** - Prefer checking in handler
4. **One validator per command** - Keep validation focused
5. **Clear error messages** - User-friendly, actionable

---

## Anti-Patterns to Avoid

```csharp
// ❌ WRONG: Business logic in validator
RuleFor(x => x.Amount)
    .MustAsync(async (amount, ct) =>
    {
        var balance = await _accountService.GetBalance();
        return balance >= amount;
    });

// ✅ CORRECT: Only input validation in validator
RuleFor(x => x.Amount)
    .GreaterThan(0)
    .LessThanOrEqualTo(1_000_000);
```

---

## Related Skills

- `dotnet-cqrs-command-generator` - Commands with validators
- `dotnet-pipeline-behaviors` - ValidationBehavior integration
- `dotnet-result-pattern` - ValidationResult type