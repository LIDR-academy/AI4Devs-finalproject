---
description: Backend development standards, best practices, and conventions for the INK-LINK .NET Core 10/C#/ASP.NET Core application including Domain-Driven Design, SOLID principles, architecture patterns, API design, and testing practices
globs: ["backend/src/**/*.cs", "backend/Migrations/**/*.cs", "backend/backend.csproj", "backend/appsettings*.json", "backend/Program.cs"]
alwaysApply: true
---

# Backend Project Standards and Best Practices

## Table of Contents

- [Backend Project Standards and Best Practices](#backend-project-standards-and-best-practices)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Technology Stack](#technology-stack)
    - [Core Technologies](#core-technologies)
    - [Database \& ORM](#database--orm)
    - [Testing Framework](#testing-framework)
    - [Development Tools](#development-tools)
  - [Architecture Overview](#architecture-overview)
    - [Domain-Driven Design (DDD)](#domain-driven-design-ddd)
    - [Layered Architecture](#layered-architecture)
    - [Project Structure](#project-structure)
  - [Domain-Driven Design Principles](#domain-driven-design-principles)
    - [Entities](#entities)
    - [Value Objects](#value-objects)
    - [Aggregates](#aggregates)
    - [Repositories](#repositories)
    - [Domain Services](#domain-services)
    - [Additional Recommendations](#additional-recommendations)
  - [SOLID and DRY Principles](#solid-and-dry-principles)
    - [SOLID Principles](#solid-principles)
      - [Single Responsibility Principle (SRP)](#single-responsibility-principle-srp)
      - [Open/Closed Principle (OCP)](#openclosed-principle-ocp)
      - [Liskov Substitution Principle (LSP)](#liskov-substitution-principle-lsp)
      - [Interface Segregation Principle (ISP)](#interface-segregation-principle-isp)
      - [Dependency Inversion Principle (DIP)](#dependency-inversion-principle-dip)
    - [DRY (Don't Repeat Yourself)](#dry-dont-repeat-yourself)
  - [Coding Standards](#coding-standards)
    - [Naming Conventions](#naming-conventions)
    - [C# Usage](#c-usage)
    - [Error Handling](#error-handling)
    - [Validation Patterns](#validation-patterns)
    - [Logging Standards](#logging-standards)
  - [API Design Standards](#api-design-standards)
    - [REST Endpoints](#rest-endpoints)
    - [Request/Response Patterns](#requestresponse-patterns)
    - [Error Response Format](#error-response-format)
    - [CORS Configuration](#cors-configuration)
  - [Database Patterns](#database-patterns)
    - [EF Core DbContext](#ef-core-dbcontext)
    - [Migrations](#migrations)
    - [Repository Pattern](#repository-pattern)
  - [Testing Standards](#testing-standards)
    - [Test File Structure](#test-file-structure)
    - [Test Organization Pattern](#test-organization-pattern)
    - [Test Case Naming Convention](#test-case-naming-convention)
    - [Test Structure (AAA Pattern)](#test-structure-aaa-pattern)
    - [Mocking Standards](#mocking-standards)
    - [Test Coverage Requirements](#test-coverage-requirements)
    - [Error Testing](#error-testing)
    - [Controller Testing Specifics](#controller-testing-specifics)
    - [Service Testing Specifics](#service-testing-specifics)
    - [Database Testing](#database-testing)
    - [Async Testing](#async-testing)
    - [Test Data Management](#test-data-management)
    - [Integration Testing](#integration-testing)
    - [Code Quality Standards](#code-quality-standards)
      - [C# Usage](#c-usage-1)
      - [Documentation](#documentation)
      - [Performance Considerations](#performance-considerations)
    - [Integration with Development Workflow](#integration-with-development-workflow)
    - [Common Anti-Patterns to Avoid](#common-anti-patterns-to-avoid)
  - [Performance Best Practices](#performance-best-practices)
    - [Database Query Optimization](#database-query-optimization)
    - [Async/Await Patterns](#asyncawait-patterns)
    - [Error Handling Performance](#error-handling-performance)
  - [Security Best Practices](#security-best-practices)
    - [Input Validation](#input-validation)
    - [Environment Variables](#environment-variables)
    - [Dependency Injection](#dependency-injection)
  - [Development Workflow](#development-workflow)
    - [Git Workflow](#git-workflow)
    - [Development Scripts](#development-scripts)
    - [Code Quality](#code-quality)
  - [Serverless Deployment](#serverless-deployment)
    - [AWS Lambda Configuration](#aws-lambda-configuration)
    - [Serverless Framework](#serverless-framework)

---

## Overview

This document outlines the best practices, conventions, and standards used in the INK-LINK backend application. The backend follows Domain-Driven Design (DDD) principles and implements a layered architecture to ensure code consistency, maintainability, and scalability.

## Technology Stack

### Core Technologies
- **.NET Core 10**: Runtime environment
- **C#**: Type-safe development with nullable reference types enabled
- **ASP.NET Core**: Web application framework

### Database & ORM
- **PostgreSQL**: Relational database (Docker container)
- **Entity Framework Core**: Type-safe ORM for database access
- **EF Core Migrations**: Database migration tool

### Testing Framework
- **xUnit**: Testing framework with .NET support
- **Moq**: Mocking library for unit tests
- **Coverage Threshold**: 90% for branches, functions, lines, and statements
- **Test Location**: `Tests/Unit/` and `Tests/Integration/` directories

### Development Tools
- **Roslyn Analyzers**: Code analysis and linting
- **dotnet-format**: Code formatting
- **Serverless Framework**: AWS Lambda deployment support

## Architecture Overview

### Domain-Driven Design (DDD)

Domain-Driven Design is a methodology that focuses on modeling software according to business logic and domain knowledge. By centering development on a deep understanding of the domain, DDD facilitates the creation of complex systems.

**Benefits:**
- **Improved Communication**: Promotes a common language between developers and domain experts, improving communication and reducing interpretation errors.
- **Clear Domain Models**: Helps build models that accurately reflect business rules and processes.
- **High Maintainability**: By dividing the system into subdomains, it facilitates maintenance and software evolution.

### Layered Architecture

The backend follows a layered DDD architecture:

**Presentation Layer** (`src/Presentation/`)
- Controllers handle HTTP requests/responses
- Routes defined via ASP.NET Core route attributes
- Controllers use services from Application layer

**Application Layer** (`src/Application/`)
- Services contain business logic and orchestration
- Validators handle input validation
- Services use repositories from Domain layer

**Domain Layer** (`src/Domain/`)
- Models define core business entities (Candidate, Position, Application, Interview, etc.)
- Repository interfaces define data access contracts
- Pure business logic without external dependencies

**Infrastructure Layer** (`src/Infrastructure/`)
- Entity Framework Core handles database operations
- Repository implementations satisfy domain interfaces
- ApplicationDbContext manages the database session

### Project Structure

```
backend/
├── src/
│   ├── Domain/
│   │   ├── Models/          # Domain entities
│   │   └── Repositories/    # Repository interfaces
│   ├── Application/
│   │   ├── Services/        # Business logic services
│   │   └── Validators/      # Input validation
│   ├── Presentation/
│   │   └── Controllers/     # ASP.NET Core controllers
│   └── Infrastructure/
│       ├── Persistence/
│       │   ├── ApplicationDbContext.cs
│       │   └── Repositories/ # EF Core implementations
│       └── Logging/
│           └── Logger.cs
├── Migrations/              # EF Core migrations
├── Tests/
│   ├── Unit/
│   └── Integration/
├── Program.cs               # Application entry point
├── appsettings.json         # Configuration
├── appsettings.Development.json
└── backend.csproj           # Project file
```

## Domain-Driven Design Principles

### Entities

Entities are objects with a distinct identity that persists over time.

**Before:**
```csharp
// Previously, candidate data might have been handled as a simple anonymous object without methods.
var candidate = new
{
    Id = 1,
    FirstName = "John",
    LastName = "Doe",
    Email = "john.doe@example.com"
};
```

**After:**
```csharp
public class Candidate
{
    public int? Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

    // Constructor and methods that encapsulate business logic
    public Candidate(CandidateData data)
    {
        Id = data.Id;
        FirstName = data.FirstName;
        LastName = data.LastName;
        Email = data.Email;
    }
}
```

**Explanation**: `Candidate` is an entity because it has a unique identifier (`Id`) that distinguishes it from other candidates, even if other properties are identical.

**Best Practice**: Entities should encapsulate business logic related to their domain concept and maintain consistency of their internal state.

### Value Objects

Value Objects describe aspects of the domain without conceptual identity. They are defined by their attributes rather than an identifier.

**Before:**
```csharp
// Handling education information as a simple anonymous object
var education = new
{
    Institution = "University",
    Degree = "Bachelor",
    StartDate = "2010-01-01",
    EndDate = "2014-01-01"
};
```

**After:**
```csharp
public class Education
{
    public string Institution { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    public Education(EducationData data)
    {
        Institution = data.Institution;
        Title = data.Title;
        StartDate = DateTime.Parse(data.StartDate);
        EndDate = data.EndDate != null ? DateTime.Parse(data.EndDate) : null;
    }
}
```

**Explanation**: `Education` can be considered a Value Object in some contexts, as it describes a candidate's education without needing a unique identifier. However, in the current model, it has been assigned an id, which could contradict the pure definition of a Value Object in DDD.

**Recommendation**: Classes like `Education` and `WorkExperience` currently have unique identifiers, classifying them as entities. In many cases, these could be treated as Value Objects within the context of a `Candidate` aggregate. Consider removing unique identifiers from classes that should be Value Objects, or incorporating them as part of the Candidate document if using a NoSQL database.

### Aggregates

Aggregates are clusters of objects that must be treated as a unit. They have a root entity that enforces invariants and consistency boundaries.

**Before:**
```csharp
// Candidate and education data handled separately
var candidate = new { Id = 1, Name = "John Doe" };
var educations = new[] { new { CandidateId = 1, Institution = "University" } };
```

**After:**
```csharp
public class Candidate
{
    public int? Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public List<Education> Educations { get; set; } = new();

    public Candidate(CandidateData data)
    {
        Id = data.Id;
        FirstName = data.FirstName;
        LastName = data.LastName;
        Email = data.Email;
        Educations = data.Educations?.Select(edu => new Education(edu)).ToList() ?? new List<Education>();
    }
}
```

**Explanation**: `Candidate` acts as an aggregate root that contains `Education`, `WorkExperience`, `Resume`, and `Application`. `Candidate` is the root of the aggregate, as the other entities only make sense in relation to a candidate.

**Recommendation**: Aggregates should be carefully designed to ensure that all operations within the aggregate boundary maintain consistency. Operations that affect `Education` and `WorkExperience` should be handled through the aggregate root, `Candidate`, to maintain integrity and encapsulation.

### Repositories

Repositories provide interfaces for accessing aggregates and entities, encapsulating data access logic.

**Before:**
```csharp
// Direct database access without abstraction
Candidate GetCandidateById(int id)
{
    return database.Query<Candidate>("SELECT * FROM candidates WHERE id = @id", new { id });
}
```

**After:**
```csharp
public interface ICandidateRepository
{
    Task<Candidate?> FindByIdAsync(int id);
    Task<Candidate> SaveAsync(Candidate candidate);
    Task<IEnumerable<Candidate>> FindAllAsync();
}

public class CandidateRepository : ICandidateRepository
{
    private readonly ApplicationDbContext _context;

    public CandidateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Candidate?> FindByIdAsync(int id)
    {
        return await _context.Candidates.FindAsync(id);
    }

    public async Task<Candidate> SaveAsync(Candidate candidate)
    {
        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();
        return candidate;
    }
}
```

**Explanation**: `CandidateRepository` provides a clear interface for accessing candidate data, encapsulating database access logic.

**Recommendation**:
- Develop complete repository interfaces for each entity and aggregate, ensuring all database interactions for those entities pass through the repository
- Implement repository methods that handle collections of entities, such as lists of Candidates, that can be filtered or modified in bulk
- Use dependency injection to inject `ApplicationDbContext` into repositories

### Domain Services

Domain Services contain business logic that doesn't naturally belong to an entity or value object.

**Before:**
```csharp
// Loose functions to handle business logic
int CalculateAge(dynamic candidate)
{
    var today = DateTime.Today;
    var birthDate = DateTime.Parse(candidate.BirthDate);
    int age = today.Year - birthDate.Year;
    if (birthDate.Date > today.AddYears(-age)) age--;
    return age;
}
```

**After:**
```csharp
public class CandidateService
{
    public static int CalculateAge(Candidate candidate)
    {
        var today = DateTime.Today;
        var birthDate = candidate.BirthDate;
        int age = today.Year - birthDate.Year;
        if (birthDate.Date > today.AddYears(-age)) age--;
        return age;
    }
}
```

**Explanation**: `CandidateService` encapsulates business logic related to candidates, such as calculating age, providing a centralized and coherent point for handling these operations.

### Additional Recommendations

**Use of Factories**

Factories are useful in DDD to encapsulate the logic of creating complex objects, ensuring that all created objects comply with domain rules from the moment of creation.

**Recommendation**: Implement factories for the creation of entities and aggregates, especially those that are complex and require specific initial configuration that complies with business rules.

**Improvement in Relationship Modeling**

Relationships between entities and aggregates must be clear and consistent with business rules.

**Recommendation**: Review and possibly redesign relationships between entities to ensure they accurately reflect domain needs and rules. This may include removing unnecessary relationships or adding new relationships that facilitate business operations.

**Domain Events Integration**

Domain events are an important part of DDD and can be used to handle side effects of domain operations in a decoupled manner.

**Recommendation**: Implement a domain event system that allows entities and aggregates to publish events that other system components can handle without being tightly coupled to the entities that generate them.

## SOLID and DRY Principles

### SOLID Principles

SOLID principles are five object-oriented design principles that help create more understandable, flexible, and maintainable systems.

#### Single Responsibility Principle (SRP)

Each class should have a single responsibility or reason to change.

**Before:**
```csharp
// A method that handles multiple responsibilities: validation and data storage
void ProcessCandidate(dynamic candidate)
{
    if (!candidate.Email.Contains('@'))
    {
        Console.Error.WriteLine("Invalid email");
        return;
    }
    database.Save(candidate);
    Console.WriteLine("Candidate saved");
}
```

**After:**
```csharp
public class Candidate
{
    // The class now only handles logic related to the candidate
    public void ValidateEmail()
    {
        if (!Email.Contains('@'))
            throw new InvalidOperationException("Invalid email");
    }
}

public class CandidateRepository
{
    public async Task<Candidate> SaveAsync(Candidate candidate)
    {
        candidate.ValidateEmail();
        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();
        return candidate;
    }
}
```

**Explanation**: The `Candidate` class now has separate methods for validation, while the repository handles data persistence, complying with the single responsibility principle.

**Observation**: The `Candidate` class in `backend/src/Domain/Models/Candidate.cs` handles both business logic and data access logic.

**Recommendation**: Separate data access logic into a repository layer to adhere more closely to SRP.

#### Open/Closed Principle (OCP)

Software entities should be open for extension but closed for modification.

**Before:**
```csharp
// Direct modification of the class to add functionality
public class Candidate
{
    public void SaveToDatabase() { /* code to save to database */ }
    // To add new functionality, we modify the class directly
    public void SendEmail() { /* code to send an email */ }
}
```

**After:**
```csharp
public class Candidate
{
    public void SaveToDatabase() { /* code to save to database */ }
}

// Extend functionality without modifying the existing class
public class CandidateWithEmail : Candidate
{
    public void SendEmail() { /* code to send an email */ }
}
```

**Explanation**: The email sending functionality is extended in a subclass, keeping the original class closed for modifications but open for extensions.

**Observation**: The `AddCandidate` method in `backend/src/Application/Services/CandidateService.cs` directly instantiates `Candidate`, `Education`, `WorkExperience`, and `Resume` classes.

**Recommendation**: Use factory methods to create instances, allowing for easier extension without modifying existing code.

#### Liskov Substitution Principle (LSP)

Objects of a derived class should be replaceable with objects of the base class without altering the program's functionality.

**Before:**
```csharp
// Subclass that cannot completely replace its base class
public class TemporaryCandidate : Candidate
{
    public override void SaveToDatabase()
    {
        throw new NotSupportedException("Temporary candidates can't be saved.");
    }
}
```

**After:**
```csharp
public class TemporaryCandidate : Candidate
{
    public override void SaveToDatabase()
    {
        // Appropriate implementation that allows temporary handling
        Console.WriteLine("Handled temporarily");
        // Alternative: Save to temporary storage
    }
}
```

**Explanation**: `TemporaryCandidate` now provides an appropriate implementation that respects the base class contract, allowing substitution without errors.

**Observation**: Currently, there is no inheritance in use where LSP could be violated. The project uses composition over inheritance, which generally supports LSP.

**Recommendation**: Continue using composition to avoid LSP violations and ensure that any future inheritance structures allow derived classes to substitute their base classes without altering how the program works.

#### Interface Segregation Principle (ISP)

Many specific interfaces are better than a single general interface.

**Before:**
```csharp
// A large interface that small clients don't fully use
public interface ICandidateOperations
{
    void Save();
    void Validate();
    void SendEmail();
    void GenerateReport();
}
```

**After:**
```csharp
public interface ISaveOperation
{
    void Save();
}

public interface IEmailOperations
{
    void SendEmail();
}

public interface IReportOperations
{
    void GenerateReport();
}

public class Candidate : ISaveOperation, IEmailOperations
{
    public void Save() { /* implementation */ }
    public void SendEmail() { /* implementation */ }
}
```

**Explanation**: Interfaces are segregated into smaller operations, allowing classes to implement only the interfaces they need.

**Observation**: The project does not currently use C# interfaces extensively to enforce contracts for classes.

**Recommendation**: Define more granular interfaces for service classes to ensure they only implement the methods they need.

#### Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules; both should depend on abstractions.

**Before:**
```csharp
// Direct dependency on a concrete implementation
public class Candidate
{
    private readonly ApplicationDbContext _context = new ApplicationDbContext();

    public async Task SaveAsync()
    {
        _context.Candidates.Add(this);
        await _context.SaveChangesAsync();
    }
}
```

**After:**
```csharp
public interface IDatabase
{
    Task<Candidate> SaveAsync(Candidate candidate);
}

public class Candidate
{
    private readonly IDatabase _database;

    public Candidate(IDatabase database)
    {
        _database = database;
    }

    public async Task<Candidate> SaveAsync()
    {
        return await _database.SaveAsync(this);
    }
}
```

**Explanation**: `Candidate` now depends on an abstraction (`IDatabase`), not a concrete implementation, which facilitates flexibility and code testing.

**Observation**: Classes like `Candidate` directly depend on the concrete `ApplicationDbContext` for database operations.

**Recommendation**: Use dependency injection to invert the dependency, relying on abstractions rather than concrete implementations. Inject `ApplicationDbContext` through the constructor.

### DRY (Don't Repeat Yourself)

The DRY principle focuses on reducing duplication in code. Each piece of knowledge should have a single, unambiguous, and authoritative representation within a system.

**Before:**
```csharp
// Repeated code to validate emails in multiple methods
void SaveCandidate(Candidate candidate)
{
    if (!candidate.Email.Contains('@'))
        throw new InvalidOperationException("Invalid email");
    // save logic
}

void UpdateCandidate(Candidate candidate)
{
    if (!candidate.Email.Contains('@'))
        throw new InvalidOperationException("Invalid email");
    // update logic
}
```

**After:**
```csharp
public class Candidate
{
    public void ValidateEmail()
    {
        if (!Email.Contains('@'))
            throw new InvalidOperationException("Invalid email");
    }

    public async Task SaveAsync()
    {
        ValidateEmail();
        // save logic
    }

    public async Task UpdateAsync()
    {
        ValidateEmail();
        // update logic
    }
}
```

**Explanation**: Email validation is centralized in a single `ValidateEmail` method, eliminating code duplication in the save and update methods.

**Observation**: The methods for saving entities like `Candidate`, `Education`, `WorkExperience`, and `Resume` contain repetitive logic for handling database operations.

**Recommendation**: Abstract common database operation logic into a reusable base repository class or helper.

## Coding Standards

### Naming Conventions

- **Variable Naming**: Use camelCase for local variables and parameters (e.g., `candidateId`, `findCandidateById`)
- **Class Naming**: Use PascalCase for classes and interfaces (e.g., `Candidate`, `CandidateRepository`)
- **Interface Naming**: Use PascalCase with "I" prefix (e.g., `ICandidateRepository`, `ICandidateService`)
- **Constants Naming**: Use UPPER_SNAKE_CASE for constants (e.g., `MAX_CANDIDATES_PER_PAGE`)
- **Private Fields**: Use camelCase with underscore prefix (e.g., `_candidateRepository`, `_context`)
- **File Naming**: Use PascalCase for file names (e.g., `CandidateService.cs`, `CandidateController.cs`)

**Examples:**

```csharp
// Good: All in English
public class CandidateRepository : ICandidateRepository
{
    private readonly ApplicationDbContext _context;

    public async Task<Candidate?> FindByIdAsync(int candidateId)
    {
        // Find candidate by ID in the database
        return await _context.Candidates.FindAsync(candidateId);
    }
}

// Avoid: Non-English comments or names
public class RepositorioCandidato
{
    public async Task<Candidato?> BuscarPorIdAsync(int idCandidato)
    {
        // Buscar candidato por ID en la base de datos
        return await _context.Candidates.FindAsync(idCandidato);
    }
}
```

**Error Messages and Logs:**

```csharp
// Good: English error messages
throw new NotFoundException("Candidate not found with the provided ID");
_logger.LogError("Failed to create candidate: {Error}", error.Message);

// Avoid: Non-English messages
throw new NotFoundException("Candidato no encontrado con el ID proporcionado");
_logger.LogError("Error al crear candidato: {Error}", error.Message);
```

### C# Usage

- **Nullable Reference Types**: Always enable nullable reference types in the project file
- **Type Definitions**: Use explicit types for method parameters and return values
- **Interfaces**: Define interfaces for complex data access and service contracts
- **Avoid `dynamic`**: Use specific types or generics instead of `dynamic` when possible

```csharp
// Good: Explicit types
public async Task<Candidate?> FindCandidateByIdAsync(int id)
{
    return await _context.Candidates.FindAsync(id);
}

// Avoid: Using dynamic
public dynamic ProcessData(dynamic data)
{
    return data;
}
```

### Error Handling

- **Custom Exception Classes**: Create domain-specific exception classes
- **Exception Middleware**: Use global exception middleware for consistent error responses
- **Error Messages**: Provide descriptive error messages for debugging

```csharp
public class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message) { }
}

// In controller
try
{
    var candidate = await _candidateService.FindByIdAsync(id);
    if (candidate == null)
        throw new NotFoundException("Candidate not found");
    return Ok(candidate);
}
catch (NotFoundException ex)
{
    return NotFound(new { message = ex.Message });
}
catch (Exception ex)
{
    _logger.LogError(ex, "Unexpected error");
    return StatusCode(500, new { message = "An unexpected error occurred" });
}
```

### Validation Patterns

- **Input Validation**: Validate all inputs at the application layer
- **Use Validator Classes**: Centralize validation logic in `src/Application/Validators/`
- **Validate Before Processing**: Always validate before executing business logic

```csharp
using FluentValidation;

public class CandidateValidator : AbstractValidator<CreateCandidateRequest>
{
    public CandidateValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(100);
    }
}

// In controller
[HttpPost]
public async Task<IActionResult> AddCandidate([FromBody] CreateCandidateRequest request)
{
    var validationResult = await _validator.ValidateAsync(request);
    if (!validationResult.IsValid)
        return BadRequest(validationResult.Errors);

    var candidate = await _candidateService.CreateAsync(request);
    return CreatedAtAction(nameof(GetById), new { id = candidate.Id }, candidate);
}
```

### Logging Standards

- **Use ILogger**: Use the built-in `ILogger<T>` from ASP.NET Core
- **Log Levels**: Use appropriate log levels (Information, Error, Warning, Debug)
- **Structured Logging**: Include relevant context in log messages

```csharp
public class CandidateService
{
    private readonly ILogger<CandidateService> _logger;

    public CandidateService(ILogger<CandidateService> logger)
    {
        _logger = logger;
    }

    public async Task<Candidate> CreateAsync(CreateCandidateRequest request)
    {
        _logger.LogInformation("Creating candidate with email {Email}", request.Email);
        // ...
        _logger.LogError("Failed to create candidate: {Error}", ex.Message);
    }
}
```

## API Design Standards

### REST Endpoints

- **RESTful Naming**: Use RESTful conventions for endpoint naming
- **HTTP Methods**: Use appropriate HTTP methods (GET, POST, PUT, DELETE, PATCH)
- **Resource-Based URLs**: URLs should represent resources, not actions

```
GET    /candidates          // List candidates
GET    /candidates/{id}     // Get candidate by ID
POST   /candidates          // Create new candidate
PUT    /candidates/{id}     // Update candidate
DELETE /candidates/{id}     // Delete candidate
```

### Request/Response Patterns

- **JSON Format**: Use JSON for request and response bodies
- **Consistent Structure**: Maintain consistent response structure across all endpoints
- **Status Codes**: Use appropriate HTTP status codes

```json
// Success response
{
    "success": true,
    "data": { },
    "message": "Operation completed successfully"
}

// Error response
{
    "success": false,
    "error": {
        "message": "Error description",
        "code": "ERROR_CODE"
    }
}
```

### Error Response Format

- **Consistent Format**: All errors should follow the same response structure
- **Error Codes**: Use meaningful error codes for different error types
- **HTTP Status Codes**: Map errors to appropriate HTTP status codes

```json
// 400 Bad Request
{
    "success": false,
    "error": {
        "message": "Validation failed",
        "code": "VALIDATION_ERROR",
        "details": []
    }
}

// 404 Not Found
{
    "success": false,
    "error": {
        "message": "Resource not found",
        "code": "NOT_FOUND"
    }
}
```

### CORS Configuration

- **Enable CORS**: Configure CORS to allow frontend origin
- **Secure Configuration**: Only allow specific origins in production
- **Credentials**: Configure credentials handling appropriately

```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins(builder.Configuration["FrontendUrl"] ?? "http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("FrontendPolicy");
```

## Database Patterns

### EF Core DbContext

- **Single Source of Truth**: `ApplicationDbContext.cs` is the single source of truth for database structure
- **Relationships**: Define relationships using EF Core Fluent API or Data Annotations
- **Naming Conventions**: Use consistent naming conventions (snake_case for table/column names via conventions, PascalCase for C# properties)

```csharp
public class ApplicationDbContext : DbContext
{
    public DbSet<Candidate> Candidates => Set<Candidate>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<Position> Positions => Set<Position>();

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Candidate>(entity =>
        {
            entity.ToTable("candidates");
            entity.HasKey(c => c.Id);
            entity.HasMany(c => c.Educations)
                  .WithOne(e => e.Candidate)
                  .HasForeignKey(e => e.CandidateId);
        });
    }
}
```

### Migrations

- **Version Control**: All database changes must be version-controlled through migrations
- **Migration Naming**: Use descriptive names for migrations
- **Review Migrations**: Review migration files before applying

```bash
# Create migration
dotnet ef migrations add DescriptiveMigrationName

# Apply migrations in development
dotnet ef database update

# Apply migrations in production
dotnet ef database update --connection "your-connection-string"
```

### Repository Pattern

- **Repository Interfaces**: Define repository interfaces in the domain layer
- **EF Core Implementation**: Implement repositories using EF Core in the infrastructure layer
- **Dependency Injection**: Inject `ApplicationDbContext` into repositories

```csharp
// Domain layer interface
public interface ICandidateRepository
{
    Task<Candidate?> FindByIdAsync(int id);
    Task<Candidate> SaveAsync(Candidate candidate);
    Task<IEnumerable<Candidate>> FindAllAsync();
}

// Infrastructure layer implementation
public class CandidateRepository : ICandidateRepository
{
    private readonly ApplicationDbContext _context;

    public CandidateRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Candidate?> FindByIdAsync(int id)
    {
        return await _context.Candidates.FindAsync(id);
    }

    public async Task<Candidate> SaveAsync(Candidate candidate)
    {
        _context.Candidates.Add(candidate);
        await _context.SaveChangesAsync();
        return candidate;
    }
}
```

## Testing Standards

The project has strict requirements for code quality and maintainability. These are the unit testing standards and best practices that must be applied.

### Test File Structure
- Use descriptive test file names: `[ComponentName]Tests.cs`
- Place test files in `Tests/Unit/` mirroring the source structure
- Use xUnit as the testing framework with Moq for mocking
- Maintain 90% coverage threshold for branches, functions, lines, and statements


### Test Organization Pattern
Template:
```csharp
public class ComponentNameMethodNameTests
{
    private readonly Mock<IDependency> _dependencyMock;
    private readonly ComponentName _sut;

    public ComponentNameMethodNameTests()
    {
        _dependencyMock = new Mock<IDependency>();
        _sut = new ComponentName(_dependencyMock.Object);
    }

    [Fact]
    public async Task MethodName_ShouldExpectedBehavior_WhenCondition()
    {
        // Arrange
        // Act
        // Assert
    }
}
```

Real example:
```csharp
public class CandidateServiceFindByIdTests
{
    private readonly Mock<ICandidateRepository> _repositoryMock;
    private readonly CandidateService _sut;

    public CandidateServiceFindByIdTests()
    {
        _repositoryMock = new Mock<ICandidateRepository>();
        _sut = new CandidateService(_repositoryMock.Object);
    }

    [Fact]
    public async Task FindByIdAsync_ShouldReturnCandidate_WhenFound()
    {
        // Arrange
        var candidateId = 1;
        var mockCandidate = new Candidate { Id = 1, FirstName = "John" };
        _repositoryMock.Setup(r => r.FindByIdAsync(candidateId))
            .ReturnsAsync(mockCandidate);

        // Act
        var result = await _sut.FindByIdAsync(candidateId);

        // Assert
        Assert.Equal(mockCandidate, result);
        _repositoryMock.Verify(r => r.FindByIdAsync(candidateId), Times.Once);
    }
}
```


### Test Case Naming Convention
- Use descriptive, behavior-driven naming: `MethodName_ShouldExpectedBehavior_WhenCondition`
- Group related test cases under descriptive test classes
- Use PascalCase for test method names

### Test Structure (AAA Pattern)
Always follow the Arrange-Act-Assert pattern:
```csharp
[Fact]
public async Task UpdateCandidateStage_ShouldSucceed_WhenValidDataProvided()
{
    // Arrange - Set up test data and mocks
    var candidateId = 1;
    var applicationId = 1;
    var newInterviewStep = 2;

    // Act - Execute the function under test
    var result = await _sut.UpdateCandidateStageAsync(candidateId, applicationId, newInterviewStep);

    // Assert - Verify the expected behavior
    Assert.Equal(expectedResult, result);
}
```

Assertion pattern:
- Use specific assertions: `Assert.Equal()`, `Assert.NotNull()`, `Assert.Throws<>()`
- Verify both successful operations and error conditions
- Use Moq `Verify()` to check that mocks were called with correct parameters
- Assert on return values and side effects




### Mocking Standards

- Mock all external dependencies (repositories, services, database contexts)
- Mock repository layers in service tests
- Mock service layers in controller tests
- Use `Mock<T>` from Moq at the constructor level for class-level mocking
- Create mock setups with realistic data structures
- Use `MockBehavior.Strict` where all calls must be set up explicitly


### Test Coverage Requirements

- **Comprehensive test coverage**: Include these test categories for each method:
1. **Happy Path Tests**: Valid inputs producing expected outputs
2. **Error Handling Tests**: Invalid inputs, missing data, database errors
3. **Edge Cases**: Boundary values, null inputs, empty collections
4. **Validation Tests**: Input validation, business rule enforcement
5. **Integration Points**: External service calls, database operations

- **Threshold**: 90% for branches, functions, lines, and statements
- **Coverage Reports**: Generate coverage reports with `dotnet test --collect:"XPlat Code Coverage"`
- **Coverage Files**: Coverage reports in `coverage/` directory adding the date, like YYYYMMDD-backend-coverage.md


### Error Testing
- Test both expected exceptions and unexpected exceptions
- Verify exception messages are descriptive and helpful
- Test error propagation through service layers
- Ensure proper HTTP status codes in controller tests

### Controller Testing Specifics
- Mock the service layer completely
- Test HTTP request/response handling
- Verify parameter parsing and validation
- Test error response formatting
- Use `ControllerContext` or `WebApplicationFactory` for controller tests

### Service Testing Specifics
- Mock domain models and repositories
- Test business logic in isolation
- Verify data transformation and validation
- Test error handling and edge cases
- Mock external dependencies (DbContext, validators)

### Database Testing
- Mock `ApplicationDbContext` and all database operations using Moq or an in-memory provider
- Test both successful and failed database operations
- Verify correct EF Core queries and parameters
- Test transaction handling and rollback scenarios

### Async Testing
- Always use `async Task` for asynchronous test methods
- Use `Task.WhenAll()` for testing concurrent operations
- Properly handle exception assertions with `await Assert.ThrowsAsync<>()`
- Test timeout scenarios where applicable

### Test Data Management
- Use factory methods for creating test data
- Keep test data consistent and realistic
- Avoid hardcoded values in multiple places
- Use meaningful test data that reflects real-world scenarios

### Integration Testing

- **Controller Testing**: Test HTTP request/response handling
- **Database Testing**: Test repository implementations with an in-memory or test database
- **End-to-End Flow**: Test complete request flows


### Code Quality Standards

#### C# Usage
- Use strict nullable reference types for all test parameters and return values
- Define proper interfaces for mock data
- Use type assertions sparingly and with proper justification
- Leverage C#'s type system for better test reliability

#### Documentation
- Write clear, descriptive test names that explain the scenario
- Add comments for complex test setups
- Document any special test conditions or edge cases
- Keep test code as readable as production code

#### Performance Considerations
- Keep tests fast and focused
- Avoid unnecessary async operations in tests
- Use appropriate mock strategies to avoid real I/O
- Group related tests to minimize setup/teardown overhead

### Integration with Development Workflow
- Run tests before every commit
- Ensure all tests pass before merging
- Use test-driven development when appropriate
- Update tests when modifying existing functionality

### Common Anti-Patterns to Avoid
- Don't test implementation details, test behavior
- Don't create overly complex test setups
- Don't ignore failing tests or skip error scenarios
- Don't use real database connections in unit tests
- Don't create tests that depend on external services
- Don't write tests that are too tightly coupled to implementation

## Performance Best Practices

### Database Query Optimization

- **Select Specific Fields**: Only select fields that are needed
- **Use Indexes**: Ensure proper database indexes for frequently queried fields
- **Avoid N+1 Queries**: Use EF Core's `Include()` to fetch related data efficiently

```csharp
// Good: Fetch related data efficiently
var candidate = await _context.Candidates
    .Include(c => c.Educations)
    .Include(c => c.WorkExperiences)
    .FirstOrDefaultAsync(c => c.Id == id);

// Avoid: N+1 queries
var candidate = await _context.Candidates.FindAsync(id);
var educations = await _context.Educations.Where(e => e.CandidateId == id).ToListAsync();
```

### Async/Await Patterns

- **Always Use Async/Await**: Use async/await instead of blocking calls
- **Error Handling**: Properly handle errors in async operations
- **Parallel Operations**: Use `Task.WhenAll()` for parallel operations when appropriate

```csharp
// Good: Parallel operations
var (candidates, positions) = await (
    _candidateService.FindAllAsync(),
    _positionService.FindAllAsync()
).WhenBoth();

// or using Task.WhenAll
var results = await Task.WhenAll(
    _candidateService.FindAllAsync(),
    _positionService.FindAllAsync()
);
```

### Error Handling Performance

- **Early Returns**: Return early to avoid unnecessary processing
- **Error Propagation**: Let errors propagate naturally through the call stack
- **Avoid Over-Wrapping**: Don't wrap exceptions unnecessarily

## Security Best Practices

### Input Validation

- **Validate All Inputs**: Validate all user inputs before processing
- **Sanitize Data**: Sanitize data to prevent injection attacks
- **Type Checking**: Use C# strict typing and validation to ensure type safety

### Environment Variables

- **Never Commit Secrets**: Never commit `appsettings.Development.json` with real secrets to version control
- **Use Configuration**: Use `appsettings.json` and environment variables for configuration
- **Validate Configuration**: Validate required configuration at startup

```csharp
// Validate required configuration at startup
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Missing required configuration: ConnectionStrings:DefaultConnection");
```

### Dependency Injection

- **Use ASP.NET Core DI**: Register services in `Program.cs` using the built-in DI container
- **Avoid Global State**: Avoid static state for database connections
- **Testability**: Use dependency injection to improve testability

```csharp
// Program.cs - Register services
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ICandidateRepository, CandidateRepository>();
builder.Services.AddScoped<ICandidateService, CandidateService>();

// Use in controllers via constructor injection
[ApiController]
[Route("api/[controller]")]
public class CandidatesController : ControllerBase
{
    private readonly ICandidateService _candidateService;

    public CandidatesController(ICandidateService candidateService)
    {
        _candidateService = candidateService;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CandidateDto>> GetById(int id)
    {
        var candidate = await _candidateService.FindByIdAsync(id);
        return Ok(candidate);
    }
}
```

## Development Workflow

### Git Workflow

- **Feature Branches**: Develop features in separate branches using clear descriptive names to allow working in parallel and avoid conflicts or collisions
- **Descriptive Commits**: Write descriptive commit messages in English
- **Code Review**: Code review before merging
- **Small Branches**: Keep branches small and focused

### Development Scripts

```bash
dotnet run                                      # Development server
dotnet build                                    # Build for production
dotnet test                                     # Run tests
dotnet test --collect:"XPlat Code Coverage"     # Run tests with coverage
dotnet ef migrations add MigrationName          # Create migration
dotnet ef database update                       # Apply migrations
dotnet ef database update --connection "..."    # Apply in production
```

### Code Quality

- **Roslyn Analyzers**: Run static analysis before commits
- **dotnet build**: Ensure project compiles without errors or warnings
- **All Tests Passing**: Ensure all tests pass before deployment
- **Code Review**: Review code for adherence to standards

## Serverless Deployment

### AWS Lambda Configuration

- **Lambda Handler**: Entry point is configured in `Program.cs` with `Amazon.Lambda.AspNetCoreServer`
- **Lambda Serializer**: Use `DefaultLambdaJsonSerializer` for JSON handling
- **Environment Variables**: Configure environment variables in `serverless.yml`

### Serverless Framework

- **Configuration File**: `serverless.yml` defines Lambda configuration
- **Build Command**: Use `dotnet publish` for Lambda builds
- **Deployment**: Deploy using Serverless Framework CLI

```csharp
// LambdaEntryPoint.cs
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]
public class LambdaEntryPoint : Amazon.Lambda.AspNetCoreServer.APIGatewayProxyFunction
{
    protected override void Init(IWebHostBuilder builder)
    {
        builder.UseStartup<Startup>();
    }

    protected override void Init(IHostBuilder builder) { }
}
```

This document serves as the foundation for maintaining code quality and consistency across the INK-LINK backend application. All team members should follow these practices to ensure a maintainable, scalable, and testable codebase.
