# How to contribute

## Overview

This document explains how to work on this project, ensuring proper separation of concerns, maintainability, and adherence to Domain-Driven Design (DDD) principles.

## Prerequisites
- Docker and Docker Compose
- ASDF
- Git

## Setup Instructions

### 1. Clone the Repository
```bash
# Clone with submodules
git clone --recurse-submodules <repository-url>
cd AI4Devs-finalproject

# If already cloned without submodules, initialize them
git submodule update --init --recursive
```

### 2. Environment Configuration

Create `.env` files in the submodule directories, we suggest just copy the examples with the commands velow

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Running the Project

Docker will initialize all the services from all submodules

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## Working with Submodules

Git submodules allow you to keep a Git repository as a subdirectory of another Git repository. This lets you clone another repository into your project and keep your commits separate.

### Adding a New Submodule
```bash
git submodule add <repository-url> <path>
git submodule init
git submodule update
```

### Updating Submodules from Origin
```bash
# Update all submodules to their latest commits
git submodule update --remote

# Update a specific submodule
git submodule update --remote <submodule-name>
```

### Pushing Root Changes with Submodules

You can work on many submodules simultaneously using everyday git commands

```bash
# If you have to work on a feature in a submodule
cd <submodule-directory>
# Do the changes
git add .
git cm -m "feat: work is done"
git push origin main
```

The root module in origin also needs to be pushed

```bash
# The root repository needs to have the changes of the submodules added
cd .. #go back to the root
git add <submodule-directory-1>  <submodule-directory-2> 
git commit -m "Update submodules"
git push origin main
```

### Repository Structure
- **Root**: Contains main docker compose and project documentation
- **Backend**: NestJS API service with domain-driven design
- **Frontend**: Next.js application with TypeScript

### Development Workflow
1. **Root Level**: Use for overall project management, full-stack testing, and documentation spanning multiple apps
2. **Service Level**: Use for focused development and testing of individual services
3. **Cross-Service**: Implement vertical slices affecting multiple services simultaneously

### Submodule Independence
Each service can run independently (change ports accordingly)

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:3000`
- Database: `localhost:5432`

## Development Guidelines

### Architecture Principles
- **Domain-Driven Design (DDD)**: Strict adherence to domain boundaries
- **Vertical Slicing**: Features implemented end-to-end across all layers
- **SOLID Principles**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **Clean Architecture**: Clear separation of concerns between layers

### Testing Strategy
- **Test-Driven Development (TDD)**: Write tests before implementation
- **Behavior-Driven Development (BDD)**: User-focused test scenarios
- **Integration Tests**: Primary testing approach for business logic
- **Code Coverage**: >80% backend, >70% frontend

### Code Quality Standards
- **ESLint**: Consistent code style and best practices
- **TypeScript**: Strict type checking enabled
- **Modular Design**: Clear separation of business domains
- **Error Handling**: Comprehensive validation and user-friendly messages

### Database Management
- **Migrations**: Version-controlled schema changes
- **Seeding**: Test data population
- **Transactions**: Atomic operations for data integrity
- **Caching**: Redis implementation for performance optimization

### API Development
- **RESTful Design**: Consistent endpoint patterns
- **DTOs**: Input/output validation at boundaries
- **Swagger/OpenAPI**: Comprehensive API documentation
- **Rate Limiting**: Protection against abuse

### Frontend Development
- **Component Architecture**: Reusable, testable components
- **State Management**: React hooks and context
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## Module Structure

### Backend Modules
- **App Module**: Main application configuration
- **Transaction Module**: Financial transaction management
- **Category Module**: Transaction categorization
- **User Module**: Authentication and user management

### Frontend Components
- **TransactionForm**: Transaction creation and editing
- **TransactionList**: Transaction display and management
- **SummaryCards**: Financial overview and statistics
- **Layout**: Application structure and navigation

### Domain Entities
- **Transaction**: Core financial transaction entity
- **Category**: Transaction classification
- **User**: System user with authentication
- **Value Objects**: Money, Frequency, TransactionType

## Development Commands

Directly on the submodule, without docker

### Backend
```bash
cd backend

# Install dependencies
npm install

# Run tests
npm run test
npm run test:e2e
npm run test:integration

# Development mode
npm run start:dev

# Build
npm run build
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run tests
npm test

# Development mode
npm run dev

# Build
npm run build
```

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure ports are unique and available
2. **Database Connection**: Verify PostgreSQL container is running
3. **Environment Variables**: Check .env files are properly configured
4. **Docker Issues**: Restart Docker service if containers fail to start

### Debug Mode
```bash
# Backend debugging
docker compose logs backend

# Frontend debugging
docker compose logs frontend

# Database debugging
docker compose logs db
```

## Performance Requirements
- **API Response Time**: <500ms for 95% of requests
- **Frontend Load Time**: <2 seconds for page loads
- **Database Performance**: Optimized queries with >80% cache hit rate
- **Concurrent Operations**: Handle multiple users simultaneously

## Security Requirements
- **Data Encryption**: All sensitive financial data encrypted
- **JWT Authentication**: Secure session management
- **Role-Based Access**: RBAC implementation
- **Input Validation**: Comprehensive validation using DTOs
- **Session Security**: Protection against hijacking

## Contributing Guidelines
1. Follow vertical slice approach for feature development
2. Implement comprehensive testing before submitting
3. Update documentation for any architectural changes
4. Ensure cross-functional requirements compliance
5. Use conventional commit messages
6. Create feature branches from main
7. Submit pull requests with detailed descriptions

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
