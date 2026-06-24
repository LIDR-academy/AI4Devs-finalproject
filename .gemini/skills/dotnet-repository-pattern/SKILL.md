---
name: dotnet-repository-pattern
description: "Generates Repository interfaces and implementations following the Repository pattern. Provides data access abstraction for aggregate roots with EF Core implementations."
version: 1.0.0
language: C#
framework: .NET 8+
dependencies: Entity Framework Core
---

# Repository Pattern Generator

## Overview

This skill generates Repositories that provide an abstraction over data access:

- **Interface in Domain layer** - Defines data access contract
- **Implementation in Infrastructure** - Uses EF Core
- **Per Aggregate Root** - Not per entity
- **Unit of Work integration** - SaveChanges via IUnitOfWork

## Quick Reference

| Repository Method | Purpose | Returns |
|-------------------|---------|---------|
| `GetByIdAsync` | Retrieve by primary key | `Entity?` |
| `GetByXxxAsync` | Retrieve by business key | `Entity?` |
| `GetAllAsync` | Retrieve all (use sparingly) | `IReadOnlyList<Entity>` |
| `Add` | Track new entity | `void` |
| `Update` | Track modified entity | `void` |
| `Remove` | Track deleted entity | `void` |
| `ExistsAsync` | Check existence | `bool` |

---

## Template: Repository Interface (Domain Layer)

```csharp
// src/{name}.domain/{Aggregate}/I{Entity}Repository.cs
namespace {name}.domain.{aggregate};

public interface I{Entity}Repository
{
    // ═══════════════════════════════════════════════════════════════
    // QUERY METHODS
    // ═══════════════════════════════════════════════════════════════
    
    Task<{Entity}?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<{Entity}?> GetByIdWithDetailsAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<{Entity}?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<{Entity}>> GetByOrganizationIdAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<{Entity}>> GetAllActiveAsync(
        CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByNameAsync(
        string name,
        CancellationToken cancellationToken = default);

    // ═══════════════════════════════════════════════════════════════
    // COMMAND METHODS (tracking only, no SaveChanges)
    // ═══════════════════════════════════════════════════════════════
    
    void Add({Entity} {entity});
    void AddRange(IEnumerable<{Entity}> {entities});
    void Update({Entity} {entity});
    void Remove({Entity} {entity});
    void RemoveRange(IEnumerable<{Entity}> {entities});
}
```

---

## Template: Repository Implementation (Infrastructure Layer)

```csharp
// src/{name}.infrastructure/Repositories/{Entity}Repository.cs
using Microsoft.EntityFrameworkCore;
using {name}.domain.{aggregate};

namespace {name}.infrastructure.repositories;

internal sealed class {Entity}Repository : I{Entity}Repository
{
    private readonly ApplicationDbContext _dbContext;

    public {Entity}Repository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    // ═══════════════════════════════════════════════════════════════
    // QUERY METHODS
    // ═══════════════════════════════════════════════════════════════

    public async Task<{Entity}?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<{Entity}?> GetByIdWithDetailsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .Include(e => e.{ChildEntities})
            .FirstOrDefaultAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<{Entity}?> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .FirstOrDefaultAsync(
                e => e.Name.ToLower() == name.ToLower(),
                cancellationToken);
    }

    public async Task<IReadOnlyList<{Entity}>> GetByOrganizationIdAsync(
        Guid organizationId,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .Where(e => e.OrganizationId == organizationId)
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<{Entity}>> GetAllActiveAsync(
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .Where(e => e.IsActive)
            .OrderBy(e => e.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .AnyAsync(e => e.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByNameAsync(
        string name,
        CancellationToken cancellationToken = default)
    {
        return await _dbContext
            .Set<{Entity}>()
            .AnyAsync(
                e => e.Name.ToLower() == name.ToLower(),
                cancellationToken);
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND METHODS
    // ═══════════════════════════════════════════════════════════════

    public void Add({Entity} {entity})
    {
        _dbContext.Set<{Entity}>().Add({entity});
    }

    public void AddRange(IEnumerable<{Entity}> {entities})
    {
        _dbContext.Set<{Entity}>().AddRange({entities});
    }

    public void Update({Entity} {entity})
    {
        _dbContext.Set<{Entity}>().Update({entity});
    }

    public void Remove({Entity} {entity})
    {
        _dbContext.Set<{Entity}>().Remove({entity});
    }

    public void RemoveRange(IEnumerable<{Entity}> {entities})
    {
        _dbContext.Set<{Entity}>().RemoveRange({entities});
    }
}
```

---

## Registering Repositories

```csharp
// src/{name}.infrastructure/DependencyInjection.cs
private static void AddPersistence(IServiceCollection services, IConfiguration configuration)
{
    var connectionString = configuration.GetConnectionString("Database")
        ?? throw new ArgumentNullException(nameof(configuration));

    services.AddDbContext<ApplicationDbContext>(options =>
    {
        options.UseNpgsql(connectionString)
               .UseSnakeCaseNamingConvention();
    });

    // Register Unit of Work
    services.AddScoped<IUnitOfWork>(sp => 
        sp.GetRequiredService<ApplicationDbContext>());

    // Register Repositories
    services.AddScoped<IUserRepository, UserRepository>();
    services.AddScoped<IOrganizationRepository, OrganizationRepository>();
    
    // Register SQL Connection Factory for Dapper queries
    services.AddSingleton<ISqlConnectionFactory>(_ => 
        new SqlConnectionFactory(connectionString));
}
```

---

## Query Optimization Patterns

### AsNoTracking for Read-Only Queries

```csharp
public async Task<IReadOnlyList<{Entity}>> GetAllForDisplayAsync(
    CancellationToken cancellationToken = default)
{
    return await _dbContext
        .Set<{Entity}>()
        .AsNoTracking()
        .Where(e => e.IsActive)
        .OrderBy(e => e.Name)
        .ToListAsync(cancellationToken);
}
```

---

## Critical Rules

1. **Repository per aggregate root** - Not per entity
2. **No SaveChanges in repository** - That's IUnitOfWork's job
3. **Interface in Domain** - Implementation in Infrastructure
4. **Use CancellationToken** - All async methods
5. **Return null for not found** - Let handler decide what to do
6. **AsNoTracking for reads** - When not modifying
7. **Selective Include** - Don't over-fetch
8. **Internal class for implementation** - Hide implementation details

---

## Anti-Patterns to Avoid

```csharp
// ❌ WRONG: SaveChanges in repository
public void Add({Entity} {entity})
{
    _dbContext.Set<{Entity}>().Add({entity});
    _dbContext.SaveChanges();  // Don't do this!
}

// ✅ CORRECT: Only track, save via UnitOfWork
public void Add({Entity} {entity})
{
    _dbContext.Set<{Entity}>().Add({entity});
}

// ❌ WRONG: Exposing IQueryable
public IQueryable<{Entity}> GetAll() => _dbContext.Set<{Entity}>();

// ✅ CORRECT: Return materialized lists
public async Task<IReadOnlyList<{Entity}>> GetAllAsync(CancellationToken ct)
{
    return await _dbContext.Set<{Entity}>().ToListAsync(ct);
}
```

---

## Related Skills

- `dotnet-domain-entity-generator` - Generate entities for repositories
- `dotnet-ef-core-configuration` - Configure entity mappings
- `dotnet-cqrs-command-generator` - Use repositories in handlers
- `dotnet-clean-architecture` - Overall project structure