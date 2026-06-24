---
name: dotnet-cqrs-command-generator
description: "Generates CQRS Commands with Handlers, Validators, and Request DTOs following Clean Architecture patterns. Commands represent actions that modify state and return Result types for proper error handling."
version: 1.0.0
language: C#
framework: .NET 8+
dependencies: MediatR, FluentValidation
---

# CQRS Command Generator

## Overview

This skill generates Commands following the CQRS (Command Query Responsibility Segregation) pattern. Commands represent intentions to change system state. Each command has:

- **Command Record** - Immutable data structure with request parameters
- **Validator** - FluentValidation rules for input validation
- **Handler** - Business logic implementation returning Result
- **Request DTO** (optional) - API layer request model

## Quick Reference

| Command Type | Returns | Use Case |
|--------------|---------|----------|
| `ICommand` | `Result` | Operations without return value (Update, Delete) |
| `ICommand<T>` | `Result<T>` | Operations returning data (Create returns Id) |

---

## Command Structure

```
/Application/{Feature}/
├── Create{Entity}/
│   ├── Create{Entity}Command.cs        # Record + Validator + Handler
│   └── Create{Entity}Request.cs        # Optional API DTO
├── Update{Entity}/
│   ├── Update{Entity}Command.cs
│   └── Update{Entity}Request.cs
└── Delete{Entity}/
    └── Delete{Entity}Command.cs
```

---

## Template: Command with Return Value (Create)

Use for operations that return data (typically entity ID after creation).

```csharp
// src/{name}.application/{Feature}/Create{Entity}/Create{Entity}Command.cs
using FluentValidation;
using {name}.application.abstractions.clock;
using {name}.application.abstractions.messaging;
using {name}.domain.abstractions;
using {name}.domain.{entities};

namespace {name}.application.{feature}.Create{Entity};

// ═══════════════════════════════════════════════════════════════
// COMMAND RECORD
// ═══════════════════════════════════════════════════════════════
public sealed record Create{Entity}Command(
    string Name,
    string? Description,
    Guid? ParentId) : ICommand<Guid>;

// ═══════════════════════════════════════════════════════════════
// VALIDATOR
// ═══════════════════════════════════════════════════════════════
internal sealed class Create{Entity}CommandValidator : AbstractValidator<Create{Entity}Command>
{
    public Create{Entity}CommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("{Entity} name is required")
            .MaximumLength(100)
            .WithMessage("{Entity} name must not exceed 100 characters");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => x.Description is not null);
    }
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════
internal sealed class Create{Entity}CommandHandler 
    : ICommandHandler<Create{Entity}Command, Guid>
{
    private readonly I{Entity}Repository _{entity}Repository;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public Create{Entity}CommandHandler(
        I{Entity}Repository {entity}Repository,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _{entity}Repository = {entity}Repository;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<Guid>> Handle(
        Create{Entity}Command request,
        CancellationToken cancellationToken)
    {
        // 1. Validate business rules
        var existingEntity = await _{entity}Repository
            .GetByNameAsync(request.Name, cancellationToken);

        if (existingEntity is not null)
        {
            return Result.Failure<Guid>({Entity}Errors.AlreadyExists);
        }

        // 2. Create domain entity using factory method
        var {entity}Result = {Entity}.Create(
            request.Name,
            request.Description,
            _dateTimeProvider.UtcNow);

        if ({entity}Result.IsFailure)
        {
            return Result.Failure<Guid>({entity}Result.Error);
        }

        // 3. Persist to repository
        _{entity}Repository.Add({entity}Result.Value);

        // 4. Save changes (via Unit of Work)
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Return created entity ID
        return {entity}Result.Value.Id;
    }
}
```

---

## Template: Command without Return Value (Update)

Use for operations that don't return data.

```csharp
// src/{name}.application/{Feature}/Update{Entity}/Update{Entity}Command.cs
using FluentValidation;
using {name}.application.abstractions.clock;
using {name}.application.abstractions.messaging;
using {name}.domain.abstractions;
using {name}.domain.{entities};

namespace {name}.application.{feature}.Update{Entity};

// ═══════════════════════════════════════════════════════════════
// COMMAND RECORD
// ═══════════════════════════════════════════════════════════════
public sealed record Update{Entity}Command(
    Guid Id,
    string Name,
    string? Description) : ICommand;

// ═══════════════════════════════════════════════════════════════
// VALIDATOR
// ═══════════════════════════════════════════════════════════════
internal sealed class Update{Entity}CommandValidator : AbstractValidator<Update{Entity}Command>
{
    public Update{Entity}CommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("{Entity} ID is required");

        RuleFor(x => x.Name)
            .NotEmpty()
            .MaximumLength(100);
    }
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════
internal sealed class Update{Entity}CommandHandler 
    : ICommandHandler<Update{Entity}Command>
{
    private readonly I{Entity}Repository _{entity}Repository;
    private readonly IDateTimeProvider _dateTimeProvider;
    private readonly IUnitOfWork _unitOfWork;

    public Update{Entity}CommandHandler(
        I{Entity}Repository {entity}Repository,
        IDateTimeProvider dateTimeProvider,
        IUnitOfWork unitOfWork)
    {
        _{entity}Repository = {entity}Repository;
        _dateTimeProvider = dateTimeProvider;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        Update{Entity}Command request,
        CancellationToken cancellationToken)
    {
        // 1. Retrieve existing entity
        var {entity} = await _{entity}Repository
            .GetByIdAsync(request.Id, cancellationToken);

        if ({entity} is null)
        {
            return Result.Failure({Entity}Errors.NotFound);
        }

        // 2. Call domain method to update
        var updateResult = {entity}.Update(
            request.Name,
            request.Description,
            _dateTimeProvider.UtcNow);

        if (updateResult.IsFailure)
        {
            return Result.Failure(updateResult.Error);
        }

        // 3. Save changes
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
```

---

## Template: Delete Command

```csharp
// src/{name}.application/{Feature}/Delete{Entity}/Delete{Entity}Command.cs
using FluentValidation;
using {name}.application.abstractions.messaging;
using {name}.domain.abstractions;
using {name}.domain.{entities};

namespace {name}.application.{feature}.Delete{Entity};

public sealed record Delete{Entity}Command(Guid Id) : ICommand;

internal sealed class Delete{Entity}CommandValidator : AbstractValidator<Delete{Entity}Command>
{
    public Delete{Entity}CommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
    }
}

internal sealed class Delete{Entity}CommandHandler 
    : ICommandHandler<Delete{Entity}Command>
{
    private readonly I{Entity}Repository _{entity}Repository;
    private readonly IUnitOfWork _unitOfWork;

    public Delete{Entity}CommandHandler(
        I{Entity}Repository {entity}Repository,
        IUnitOfWork unitOfWork)
    {
        _{entity}Repository = {entity}Repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(
        Delete{Entity}Command request,
        CancellationToken cancellationToken)
    {
        var {entity} = await _{entity}Repository
            .GetByIdAsync(request.Id, cancellationToken);

        if ({entity} is null)
        {
            return Result.Failure({Entity}Errors.NotFound);
        }

        // Check business rules before deletion
        if ({entity}.HasActiveRelationships())
        {
            return Result.Failure({Entity}Errors.CannotDeleteWithActiveRelationships);
        }

        _{entity}Repository.Remove({entity});

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
```

---

## Validation Rules Reference

### Common Validators

```csharp
// String validations
RuleFor(x => x.Name)
    .NotEmpty().WithMessage("Name is required")
    .NotNull().WithMessage("Name cannot be null")
    .MaximumLength(100).WithMessage("Name too long")
    .MinimumLength(3).WithMessage("Name too short")
    .Matches("^[a-zA-Z]+$").WithMessage("Only letters allowed");

// Numeric validations
RuleFor(x => x.Amount)
    .GreaterThan(0).WithMessage("Must be positive")
    .LessThanOrEqualTo(1000).WithMessage("Max 1000")
    .InclusiveBetween(1, 100).WithMessage("Must be 1-100");

// GUID validations
RuleFor(x => x.Id)
    .NotEmpty().WithMessage("ID is required")
    .NotEqual(Guid.Empty).WithMessage("Invalid ID");

// Email validation
RuleFor(x => x.Email)
    .NotEmpty()
    .EmailAddress().WithMessage("Invalid email format");

// Conditional validation
RuleFor(x => x.ParentId)
    .NotEmpty()
    .When(x => x.RequiresParent);

// Collection validation
RuleFor(x => x.Items)
    .NotEmpty().WithMessage("At least one item required")
    .Must(items => items.Count <= 10).WithMessage("Max 10 items");
```

---

## Critical Rules

1. **Commands are records** - Immutable, value equality
2. **One handler per command** - No shared handlers
3. **Validators are internal** - Not exposed outside Application layer
4. **Use Result pattern** - Never throw exceptions for business errors
5. **Inject IUnitOfWork** - Don't call SaveChanges in repository
6. **Always use CancellationToken** - Pass through all async calls
7. **Domain logic in Domain** - Handler orchestrates, doesn't contain business rules
8. **Return IDs from Create** - Use `ICommand<Guid>` for creation
9. **Validate in order** - Check existence before creating, then validate business rules
10. **Keep handlers focused** - One responsibility per handler

---

## Anti-Patterns to Avoid

```csharp
// ❌ WRONG: Throwing exceptions for business errors
if (entity is null)
    throw new NotFoundException("Entity not found");

// ✅ CORRECT: Return Result
if (entity is null)
    return Result.Failure<Guid>(EntityErrors.NotFound);

// ❌ WRONG: Saving in repository
public void Add(Entity entity)
{
    _dbContext.Add(entity);
    _dbContext.SaveChanges(); // Don't do this!
}

// ✅ CORRECT: Handler calls SaveChanges via UnitOfWork
_repository.Add(entity);
await _unitOfWork.SaveChangesAsync(ct);
```

---

## Related Skills

- `dotnet-cqrs-query-generator` - Generate read-side queries
- `dotnet-domain-entity-generator` - Generate domain entities with factory methods
- `dotnet-result-pattern` - Complete Result pattern implementation
- `dotnet-pipeline-behaviors` - Validation and logging behaviors