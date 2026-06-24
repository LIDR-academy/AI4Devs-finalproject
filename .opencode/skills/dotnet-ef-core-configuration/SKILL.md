---
name: dotnet-ef-core-configuration
description: "Generates Entity Framework Core configurations using Fluent API. Maps domain entities to database tables with proper relationships, constraints, and conventions."
version: 1.0.0
language: C#
framework: .NET 8+
dependencies: Entity Framework Core, Npgsql (PostgreSQL)
---

# EF Core Configuration Generator

## Overview

This skill generates Entity Framework Core configurations using Fluent API:

- **IEntityTypeConfiguration<T>** - Per-entity configuration classes
- **Fluent API over attributes** - Keep domain clean
- **Snake case naming** - PostgreSQL convention
- **Relationships** - One-to-Many, Many-to-Many, One-to-One
- **Value Objects** - Owned types mapping

## Quick Reference

| Configuration | Use |
|---------------|-----|
| `ToTable()` | Table name |
| `HasKey()` | Primary key |
| `Property()` | Column configuration |
| `HasOne/HasMany()` | Relationships |
| `OwnsOne()` | Value objects |
| `HasIndex()` | Database indexes |

---

## Template: Basic Entity Configuration

```csharp
// src/{name}.infrastructure/Configurations/{Entity}Configuration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using {name}.domain.{aggregate};

namespace {name}.infrastructure.configurations;

internal sealed class {Entity}Configuration : IEntityTypeConfiguration<{Entity}>
{
    public void Configure(EntityTypeBuilder<{Entity}> builder)
    {
        // ═══════════════════════════════════════════════════════════════
        // TABLE MAPPING
        // ═══════════════════════════════════════════════════════════════
        builder.ToTable("{entity}");  // snake_case table name

        // ═══════════════════════════════════════════════════════════════
        // PRIMARY KEY
        // ═══════════════════════════════════════════════════════════════
        builder.HasKey(e => e.Id);
        
        builder.Property(e => e.Id)
            .ValueGeneratedNever();  // App generates GUIDs

        // ═══════════════════════════════════════════════════════════════
        // PROPERTIES
        // ═══════════════════════════════════════════════════════════════
        builder.Property(e => e.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(e => e.Description)
            .HasColumnType("text");

        builder.Property(e => e.IsActive)
            .HasDefaultValue(true)
            .IsRequired();

        builder.Property(e => e.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");

        builder.Property(e => e.UpdatedAt)
            .IsRequired()
            .HasDefaultValueSql("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'");

        // ═══════════════════════════════════════════════════════════════
        // INDEXES
        // ═══════════════════════════════════════════════════════════════
        builder.HasIndex(e => e.Name)
            .IsUnique();

        builder.HasIndex(e => e.OrganizationId);

        builder.HasIndex(e => new { e.OrganizationId, e.Name })
            .IsUnique();
    }
}
```

---

## Template: Entity with Relationships

```csharp
// src/{name}.infrastructure/Configurations/{Entity}Configuration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using {name}.domain.{aggregate};

namespace {name}.infrastructure.configurations;

internal sealed class {Entity}Configuration : IEntityTypeConfiguration<{Entity}>
{
    public void Configure(EntityTypeBuilder<{Entity}> builder)
    {
        builder.ToTable("{entity}");
        builder.HasKey(e => e.Id);

        // ═══════════════════════════════════════════════════════════════
        // FOREIGN KEY PROPERTIES
        // ═══════════════════════════════════════════════════════════════
        builder.Property(e => e.OrganizationId)
            .IsRequired();

        builder.Property(e => e.ParentId);

        // ═══════════════════════════════════════════════════════════════
        // ONE-TO-MANY: Parent has many children
        // ═══════════════════════════════════════════════════════════════
        builder.HasMany(e => e.{ChildEntities})
            .WithOne(c => c.{Entity})
            .HasForeignKey(c => c.{Entity}Id)
            .OnDelete(DeleteBehavior.Cascade);

        // ═══════════════════════════════════════════════════════════════
        // MANY-TO-ONE: Entity belongs to Organization
        // ═══════════════════════════════════════════════════════════════
        builder.HasOne(e => e.Organization)
            .WithMany(o => o.{Entities})
            .HasForeignKey(e => e.OrganizationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

---

## Template: Value Object as Owned Type

```csharp
// src/{name}.infrastructure/Configurations/{Entity}Configuration.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using {name}.domain.{aggregate};

namespace {name}.infrastructure.configurations;

internal sealed class {Entity}Configuration : IEntityTypeConfiguration<{Entity}>
{
    public void Configure(EntityTypeBuilder<{Entity}> builder)
    {
        builder.ToTable("{entity}");
        builder.HasKey(e => e.Id);

        // ═══════════════════════════════════════════════════════════════
        // VALUE OBJECT: Email (stored in same table)
        // ═══════════════════════════════════════════════════════════════
        builder.OwnsOne(e => e.Email, emailBuilder =>
        {
            emailBuilder.Property(email => email.Value)
                .HasColumnName("email")
                .HasMaxLength(255)
                .IsRequired();

            emailBuilder.HasIndex(email => email.Value)
                .IsUnique();
        });

        // ═══════════════════════════════════════════════════════════════
        // VALUE OBJECT: Address (multiple columns)
        // ═══════════════════════════════════════════════════════════════
        builder.OwnsOne(e => e.Address, addressBuilder =>
        {
            addressBuilder.Property(a => a.Street)
                .HasColumnName("address_street")
                .HasMaxLength(200);

            addressBuilder.Property(a => a.City)
                .HasColumnName("address_city")
                .HasMaxLength(100);
        });
    }
}
```

---

## Template: Soft Delete Configuration

```csharp
// src/{name}.infrastructure/Configurations/{Entity}Configuration.cs
internal sealed class {Entity}Configuration : IEntityTypeConfiguration<{Entity}>
{
    public void Configure(EntityTypeBuilder<{Entity}> builder)
    {
        builder.ToTable("{entity}");

        // Soft delete property
        builder.Property(e => e.IsDeleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.Property(e => e.DeletedAt);

        // ═══════════════════════════════════════════════════════════════
        // GLOBAL QUERY FILTER (excludes soft-deleted)
        // ═══════════════════════════════════════════════════════════════
        builder.HasQueryFilter(e => !e.IsDeleted);

        // Index for soft delete queries
        builder.HasIndex(e => e.IsDeleted);
    }
}
```

---

## PostgreSQL Specific Configurations

### Snake Case Naming Convention

```csharp
// In DependencyInjection.cs
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString)
           .UseSnakeCaseNamingConvention();
});
```

### Column Types Reference

| C# Type | PostgreSQL Type | Configuration |
|---------|-----------------|---------------|
| `string` | `text` | `.HasColumnType("text")` |
| `string` (limited) | `varchar(n)` | `.HasMaxLength(n)` |
| `decimal` | `numeric(p,s)` | `.HasColumnType("numeric(18,2)")` |
| `DateTime` | `timestamp` | `.HasColumnType("timestamp")` |
| `DateTimeOffset` | `timestamptz` | `.HasColumnType("timestamptz")` |
| `Guid` | `uuid` | (automatic) |
| `bool` | `boolean` | (automatic) |

---

## ApplicationDbContext Setup

```csharp
// src/{name}.infrastructure/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using {name}.domain.abstractions;

namespace {name}.infrastructure;

public sealed class ApplicationDbContext : DbContext, IUnitOfWork
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(ApplicationDbContext).Assembly);

        base.OnModelCreating(modelBuilder);
    }
}
```

---

## Critical Rules

1. **Use Fluent API, not attributes** - Keep domain clean
2. **Configuration per entity** - One file per `IEntityTypeConfiguration<T>`
3. **Snake case for PostgreSQL** - Use naming convention package
4. **ValueGeneratedNever for GUIDs** - App generates IDs
5. **Explicit column types** - Don't rely on conventions
6. **Configure relationships from one side** - Avoid duplication
7. **Use delete behaviors thoughtfully** - Cascade vs Restrict
8. **Index foreign keys** - EF Core doesn't auto-index FKs
9. **Use query filters for soft delete** - Consistent filtering

---

## Anti-Patterns to Avoid

```csharp
// ❌ WRONG: Data annotations on domain
public class User
{
    [Key]
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
}

// ✅ CORRECT: Fluent API in configuration
builder.Property(u => u.Name).HasMaxLength(100).IsRequired();

// ❌ WRONG: Not specifying string length
builder.Property(e => e.Name);

// ✅ CORRECT: Always specify max length
builder.Property(e => e.Name).HasMaxLength(100);
```

---

## Related Skills

- `dotnet-domain-entity-generator` - Generate entities to configure
- `dotnet-repository-pattern` - Use configurations with repositories
- `dotnet-clean-architecture` - Infrastructure layer placement