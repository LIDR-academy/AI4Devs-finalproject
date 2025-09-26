# Salary Tracker

## Project Overview

A comprehensive personal finance management application designed to help individuals track income, manage expenses, create budgets, and achieve financial goals. The application follows Domain-Driven Design (DDD) principles and is built with a modern tech stack for scalability and maintainability.

### Tech Stack
- **Frontend**: Next.js configured as SPA with TypeScript
- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT-based authentication
- **Deployment**: Docker containers with docker-compose


## Architecture Principles

### Domain-Driven Design (DDD)
- **Bounded Contexts**: Clear separation between User, Transaction, and Financial Planning domains
- **Aggregate Roots**: Well-defined entities that maintain consistency boundaries
- **Domain Services**: Business logic encapsulated within domain boundaries
- **Repository Pattern**: Data access abstraction for each aggregate

### Layered Architecture
- **Presentation Layer**: Next.js components and pages
- **Application Layer**: Use cases and application services
- **Domain Layer**: Business entities, value objects, and domain services
- **Infrastructure Layer**: External services, database access, and cross-cutting concerns

### Testing Strategy
- **Unit Tests**: Test individual components and services
- **Integration Tests**: Test module interactions and data flow
- **E2E Tests**: Test complete user workflows
- **Test Location**: Test files co-located with source code

## Project Structure

```
AI4Devs-finalproject/
├── backend/                          # NestJS Backend
│   ├── src/
│   │   ├── main.ts                   # Application entry point
│   │   ├── app.module.ts             # Root module
│   │   ├── app.controller.ts         # Root controller
│   │   ├── app.service.ts            # Root service
│   │   ├── shared/                   # Shared utilities and interfaces
│   │   │   ├── interfaces/
│   │   │   ├── dto/
│   │   │   ├── exceptions/
│   │   │   └── utils/
│   │   ├── modules/                  # Feature modules
│   │   │   ├── users/                # User management module
│   │   │   │   ├── domain/           # Domain layer
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── value-objects/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   └── services/
│   │   │   │   ├── application/      # Application layer
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── services/
│   │   │   │   │   └── use-cases/
│   │   │   │   ├── infrastructure/   # Infrastructure layer
│   │   │   │   │   ├── repositories/
│   │   │   │   │   ├── external/
│   │   │   │   │   └── config/
│   │   │   │   ├── presentation/     # Presentation layer
│   │   │   │   │   ├── controllers/
│   │   │   │   │   ├── middlewares/
│   │   │   │   │   └── guards/
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.spec.ts
│   │   │   │   ├── users.service.spec.ts
│   │   │   │   └── index.ts
│   │   │   ├── transactions/         # Transaction management module
│   │   │   │   ├── domain/
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── transaction.entity.ts
│   │   │   │   │   │   ├── category.entity.ts
│   │   │   │   │   │   ├── frequency.entity.ts
│   │   │   │   │   │   ├── currency.entity.ts
│   │   │   │   │   │   ├── bank-account.entity.ts
│   │   │   │   │   │   └── composition.entity.ts
│   │   │   │   │   ├── value-objects/
│   │   │   │   │   ├── repositories/
│   │   │   │   │   └── services/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── presentation/
│   │   │   │   ├── transactions.module.ts
│   │   │   │   └── index.ts
│   │   │   ├── financial-planning/   # Budget and goals module
│   │   │   │   ├── domain/
│   │   │   │   ├── application/
│   │   │   │   ├── infrastructure/
│   │   │   │   ├── presentation/
│   │   │   │   ├── financial-planning.module.ts
│   │   │   │   └── index.ts
│   │   │   └── auth/                 # Authentication module
│   │   │       ├── domain/
│   │   │       ├── application/
│   │   │       ├── infrastructure/
│   │   │       ├── presentation/
│   │   │       ├── auth.module.ts
│   │   │       └── index.ts
│   │   ├── config/                   # Configuration files
│   │   │   ├── database.config.ts
│   │   │   ├── firebase.config.ts
│   │   │   └── app.config.ts
│   │   └── database/                 # Database configuration
│   │       ├── migrations/
│   │       ├── seeds/
│   │       └── connection.ts
│   ├── test/                         # Test configuration
│   │   └── setup.ts
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
├── frontend/                         # Next.js Frontend
│   ├── src/
│   │   ├── app/                      # App router (Next.js 13+)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── (auth)/               # Route groups
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   └── goals/
│   │   ├── components/               # Reusable components
│   │   │   ├── ui/                   # Base UI components
│   │   │   │   ├── button/
│   │   │   │   ├── input/
│   │   │   │   ├── modal/
│   │   │   │   └── index.ts
│   │   │   ├── forms/                # Form components
│   │   │   │   ├── transaction-form/
│   │   │   │   ├── budget-form/
│   │   │   │   └── index.ts
│   │   │   ├── charts/               # Chart components
│   │   │   │   ├── spending-chart/
│   │   │   │   ├── budget-chart/
│   │   │   │   └── index.ts
│   │   │   └── layout/               # Layout components
│   │   │       ├── header/
│   │   │       ├── sidebar/
│   │   │       └── index.ts
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-budgets.ts
│   │   │   └── use-auth.ts
│   │   ├── services/                 # API service layer
│   │   │   ├── api/
│   │   │   │   ├── transactions.ts
│   │   │   │   ├── budgets.ts
│   │   │   │   └── auth.ts
│   │   │   ├── firebase/
│   │   │   │   ├── config.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── firestore.ts
│   │   │   └── index.ts
│   │   ├── stores/                   # State management
│   │   │   ├── auth-store.ts
│   │   │   ├── transaction-store.ts
│   │   │   └── index.ts
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── transaction.types.ts
│   │   │   ├── budget.types.ts
│   │   │   ├── user.types.ts
│   │   │   └── index.ts
│   │   ├── utils/                    # Utility functions
│   │   │   ├── currency.ts
│   │   │   ├── date.ts
│   │   │   ├── validation.ts
│   │   │   └── index.ts
│   │   └── constants/                # Application constants
│   │       ├── categories.ts
│   │       ├── currencies.ts
│   │       └── index.ts
│   ├── public/                       # Static assets
│   ├── tests/                        # Test files
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── Dockerfile
│   └── package.json
├── shared/                           # Shared code between frontend and backend
│   ├── types/                        # Shared TypeScript types
│   ├── constants/                    # Shared constants
│   ├── utils/                        # Shared utility functions
│   └── validation/                   # Shared validation schemas
├── docker-compose.yml                # Root docker-compose for full stack
├── .github/                          # GitHub Actions workflows
│   └── workflows/
│       ├── backend-tests.yml
│       ├── frontend-tests.yml
│       └── e2e-tests.yml
├── docs/                             # Project documentation
│   ├── api/
│   ├── architecture/
│   └── deployment/
└── README.md
```

## Module Organization Principles

### 1. **Domain Layer** (Core Business Logic)
- **Entities**: Core business objects with identity and lifecycle
- **Value Objects**: Immutable objects without identity
- **Domain Services**: Business logic that doesn't belong to entities
- ** Repositories**: Abstract interfaces for data access

### 2. **Application Layer** (Use Cases)
- **DTOs**: Data transfer objects for API communication
- **Application Services**: Orchestrate domain objects for use cases
- **Use Cases**: Specific business operations

### 3. **Infrastructure Layer** (External Concerns)
- **Repository Implementations**: Concrete data access implementations
- **External Services**: Third-party API integrations
- **Configuration**: Environment-specific settings

### 4. **Presentation Layer** (User Interface)
- **Controllers**: Handle HTTP requests and responses
- **Middlewares**: Cross-cutting concerns like authentication
- **Guards**: Route protection and authorization

## Testing Strategy

### Test File Organization
- **Unit Tests**: Co-located with source files (`.spec.ts`)
- **Integration Tests**: In dedicated `test/` directories
- **E2E Tests**: End-to-end workflow testing

### Test Coverage
- **Domain Logic**: 100% coverage for business rules
- **Application Services**: Test use case orchestration
- **Infrastructure**: Mock external dependencies
- **Presentation**: Test API contracts and validation

## Development Workflow

### 1. **Feature Development**
- Create feature branch from `main`
- Implement domain logic with tests
- Add application layer with use cases
- Implement infrastructure layer
- Create presentation layer (API endpoints)
- Update frontend components and services

### 2. **Testing Strategy**
- Write tests before implementation (TDD)
- Ensure all tests pass before merging
- Maintain high test coverage
- Use integration tests for module interactions

### 3. **Code Quality**
- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Implement pre-commit hooks for quality checks
- Regular code reviews and pair programming

## Deployment Strategy

### Development Environment
- Local development with Docker Compose
- Hot reload for both frontend and backend
- Local database with seeded data

### Staging Environment
- Automated deployment from feature branches
- Integration testing with real services
- Performance and security testing

### Production Environment
- Blue-green deployment strategy
- Automated rollback on failures
- Monitoring and alerting setup
- Database migration strategies

This structure ensures a clean separation of concerns, maintainable code, and scalable architecture while following DDD principles and modern development practices.
