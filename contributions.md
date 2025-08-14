# How to contribute

## Overview

This document explains how to work on this project, ensuring proper separation of concerns, maintainability, and adherence to Domain-Driven Design (DDD) principles.

## Module Structure

Each module follows a consistent structure with four distinct layers:

```
module-name/
├── domain/                    # Core business logic
│   ├── entities/             # Business entities with identity
│   ├── value-objects/        # Immutable value objects
│   ├── repositories/         # Abstract repository types
│   └── services/             # Domain services
├── application/              # Use cases and application logic
│   ├── dto/                  # Data transfer objects
│   ├── services/             # Application services
│   └── use-cases/            # Specific business operations
├── infrastructure/           # External concerns and implementations
│   ├── repositories/         # Concrete repository implementations
│   ├── external/             # Third-party service integrations
│   └── config/               # Module-specific configuration
├── presentation/             # API endpoints and controllers
│   ├── controllers/          # HTTP request handlers
│   ├── middlewares/          # Request processing middleware
│   └── guards/               # Route protection
├── module-name.module.ts     # NestJS module definition
├── index.ts                  # Public API exports
└── *.spec.ts                 # Test files (co-located)
```

## Layer Responsibilities

### 1. Domain Layer

**Purpose**: Contains the core business logic and rules.

**What goes here**:
- **Entities**: Business objects with identity and lifecycle
- **Value Objects**: Immutable objects representing concepts
- **Domain Services**: Business logic that doesn't belong to entities
- **Repository Interfaces**: Abstract data access contracts (prefer use type)

**Example**:
```typescript
// domain/entities/transaction.entity.ts
export class Transaction {
  constructor(
    private readonly id: TransactionId,
    private readonly amount: Money,
    private readonly category: Category,
    private readonly date: TransactionDate
  ) {}

  isExpense(): boolean {
    return this.amount.isNegative();
  }

  isIncome(): boolean {
    return this.amount.isPositive();
  }
}
```

**Rules**:
- No dependencies on external frameworks
- Pure business logic only
- No HTTP, database, or external service calls
- Use domain events for side effects

### 2. Application Layer

**Purpose**: Orchestrates domain objects to fulfill use cases.

**What goes here**:
- **DTOs**: Data structures for API communication
- **Application Services**: Coordinate domain objects
- **Use Cases**: Specific business operations

**Example**:
```typescript
// application/use-cases/create-transaction.use-case.ts
export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    const category = await this.categoryRepository.findById(dto.categoryId);
    const transaction = new Transaction(
      new TransactionId(dto.id),
      new Money(dto.amount, dto.currency),
      category,
      new TransactionDate(dto.date)
    );

    return this.transactionRepository.save(transaction);
  }
}
```

**Rules**:
- No direct HTTP handling
- Use dependency injection for repositories
- Handle business rule violations
- Return domain objects or DTOs

### 3. Infrastructure Layer

**Purpose**: Implements external concerns and data access.

**What goes here**:
- **Repository Implementations**: Concrete data access
- **External Services**: Third-party API integrations
- **Configuration**: Environment-specific settings

**Example**:
```typescript
// infrastructure/repositories/firestore-transaction.repository.ts
export class FirestoreTransactionRepository implements TransactionRepository {
  constructor(private readonly firestore: Firestore) {}

  async save(transaction: Transaction): Promise<Transaction> {
    const docRef = this.firestore
      .collection('transactions')
      .doc(transaction.id.value);
    
    await docRef.set({
      amount: transaction.amount.value,
      currency: transaction.amount.currency,
      categoryId: transaction.category.id.value,
      date: transaction.date.value
    });

    return transaction;
  }
}
```

**Rules**:
- Implement domain types
- Handle external service failures gracefully
- Use adapters for external APIs
- Implement caching strategies

### 4. Presentation Layer

**Purpose**: Handle HTTP requests and responses.

**What goes here**:
- **Controllers**: HTTP endpoint handlers
- **Middlewares**: Request processing
- **Guards**: Authentication and authorization

**Example**:
```typescript
// presentation/controllers/transaction.controller.ts
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase
  ) {}

  @Post()
  async createTransaction(@Body() dto: CreateTransactionDto) {
    try {
      const transaction = await this.createTransactionUseCase.execute(dto);
      return TransactionResponseDto.fromDomain(transaction);
    } catch (error) {
      if (error instanceof DomainError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
```

**Rules**:
- Handle HTTP-specific concerns only
- Validate input DTOs
- Transform domain objects to response DTOs
- Handle errors appropriately

## Module Dependencies

### Dependency Rules

1. **Domain Layer**: No dependencies on other layers
2. **Application Layer**: Depends only on Domain Layer
3. **Infrastructure Layer**: Depends on Domain Layer
4. **Presentation Layer**: Depends on Application Layer

### Cross-Module Dependencies

When modules need to communicate:

```typescript
// Use domain events for loose coupling
export class TransactionCreatedEvent {
  constructor(public readonly transaction: Transaction) {}
}

// In the application layer
export class CreateTransactionUseCase {
  async execute(dto: CreateTransactionDto): Promise<Transaction> {
    // ... business logic ...
    
    // Publish domain event
    this.eventBus.publish(new TransactionCreatedEvent(transaction));
    
    return transaction;
  }
}
```

## Testing Strategy

### Test Organization

- **Unit Tests**: Co-located with source files (`.spec.ts`)
- **Integration Tests**: Test module interactions
- **E2E Tests**: Complete workflow testing

### Test Examples

```typescript
// domain/entities/transaction.entity.spec.ts
describe('Transaction', () => {
  it('should identify expense transactions', () => {
    const transaction = new Transaction(
      new TransactionId('1'),
      new Money(-100, 'USD'),
      new Category('Food'),
      new TransactionDate(new Date())
    );

    expect(transaction.isExpense()).toBe(true);
    expect(transaction.isIncome()).toBe(false);
  });
});

// application/use-cases/create-transaction.use-case.spec.ts
describe('CreateTransactionUseCase', () => {
  it('should create a transaction successfully', async () => {
    const mockRepo = createMockTransactionRepository();
    const useCase = new CreateTransactionUseCase(mockRepo);
    
    const result = await useCase.execute(validDto);
    
    expect(result).toBeInstanceOf(Transaction);
    expect(mockRepo.save).toHaveBeenCalledWith(result);
  });
});
```

## Creating New Modules

### 1. Generate Module Structure

```bash
# Create module directory structure
mkdir -p src/modules/new-module/{domain,application,infrastructure,presentation}/{entities,value-objects,repositories,services,dto,use-cases,config,controllers,middlewares,guards}

# Create module files
touch src/modules/new-module/new-module.module.ts
touch src/modules/new-module/index.ts
```

### 2. Define Domain Model

```typescript
// Start with entities and value objects
export class NewEntity {
  constructor(
    private readonly id: EntityId,
    private readonly name: EntityName
  ) {}
}

// Define repository type
export type NewEntityRepository = {
  findById(id: EntityId): Promise<NewEntity | null>;
  save(entity: NewEntity): Promise<NewEntity>;
}
```

### 3. Implement Application Layer

```typescript
// Define use cases
export class CreateNewEntityUseCase {
  constructor(private readonly repo: INewEntityRepository) {}
  
  async execute(dto: CreateNewEntityDto): Promise<NewEntity> {
    // Business logic here
  }
}
```

### 4. Add Infrastructure Implementation

```typescript
// Implement repository
export class FirestoreNewEntityRepository implements INewEntityRepository {
  // Implementation here
}
```

### 5. Create Presentation Layer

```typescript
// Add controller
@Controller('new-entities')
export class NewEntityController {
  // HTTP handlers here
}
```

### 6. Wire Up Module

```typescript
// new-module.module.ts
@Module({
  imports: [],
  controllers: [NewEntityController],
  providers: [
    CreateNewEntityUseCase,
    { provide: INewEntityRepository, useClass: FirestoreNewEntityRepository }
  ],
  exports: [CreateNewEntityUseCase]
})
export class NewModule {}
```

## Best Practices

### 1. **Single Responsibility**
- Each class has one reason to change
- Keep methods focused and small
- Extract complex logic to separate services

### 2. **Dependency Inversion**
- Depend on abstractions, not concretions
- Use types for external dependencies
- Inject dependencies through constructors

### 3. **Error Handling**
- Use domain-specific exceptions
- Handle errors at appropriate layers
- Provide meaningful error messages

### 4. **Validation**
- Validate input at boundaries
- Use DTOs for data transfer
- Implement business rule validation

### 5. **Documentation**
- Document complex business rules
- Use clear naming conventions
- Add JSDoc for public APIs

## Common Patterns

### 1. **Repository Pattern**
```typescript
export type Repository<T> = {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### 2. **Factory Pattern**
```typescript
export class TransactionFactory {
  static createExpense(dto: CreateTransactionDto): Transaction {
    return new Transaction(
      new TransactionId(dto.id),
      new Money(-Math.abs(dto.amount), dto.currency),
      // ... other properties
    );
  }
}
```

### 3. **Specification Pattern**
```typescript
export class TransactionSpecification {
  static isExpense(): Specification<Transaction> {
    return new Specification<Transaction>(
      transaction => transaction.amount.isNegative()
    );
  }
}
```

## Troubleshooting

### Common Issues

1. **Circular Dependencies**: Use domain events or types
2. **Tight Coupling**: Extract to types and use DI
3. **Large Controllers**: Move logic to application services
4. **Mixed Concerns**: Separate business logic from infrastructure

### Performance Considerations

1. **Lazy Loading**: Load related entities on demand
2. **Caching**: Implement caching at infrastructure layer
3. **Pagination**: Handle large datasets efficiently
4. **Async Operations**: Use proper async/await patterns

This modular approach ensures maintainable, testable, and scalable code while following DDD principles and modern development practices.
