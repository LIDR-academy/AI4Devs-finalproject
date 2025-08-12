# Developer Stories - Personal Finance Management System (User-Story Centric)

## Overview

This document outlines the developer stories organized by user stories (vertical
slices) for the personal finance management system.

---

## ✅ TDD + BDD Working Agreement

To apply test-driven development across all stories, every Developer Story (DS)
must deliver its behavior with tests first and keep the shared BDD specs up to
date.

- Definition of Done (per DS):

  - BDD scenarios in `prompts/11-bdd.md` are created or updated to cover the DS
    behavior.
  - Tests are written first and initially fail; then minimal implementation;
    then refactor with tests green.
  - Include appropriate test types:
    - Value Objects and utilities: unit tests
    - Services and domain logic: unit and integration tests
    - Repositories and database interactions: integration tests
    - Controllers and HTTP API: e2e tests
  - Coverage for files touched by the DS ≥ 80% (exceptions must be justified).
  - CI green: tests, lint, and type checks pass locally and in CI.

- Per-story TDD/BDD checklist:

  - Update or add relevant BDD scenarios in `prompts/11-bdd.md`
  - Write failing tests (unit/integration/e2e as applicable)
  - Implement minimal code to pass; refactor
  - Ensure coverage and CI gates

- Epic mapping for BDD reference:
  - Epic 1: User (Mock) → BDD Epic 1 in `prompts/11-bdd.md`
  - Epic 2: Transactions (2.1–2.5) → BDD Epic 2 in `prompts/11-bdd.md`
  - Epic 3: Reporting (3.1–3.2) → BDD Epic 3 in `prompts/11-bdd.md`

---

## 🎯 Implementation Strategy: Vertical Slices

All Developer Stories must comply with the TDD + BDD Working Agreement below.

**Development Priority Order:**

1. **User Story 2.1: Basic Transaction Creation** → Complete transaction module
   with mock user
2. **User Story 2.2: Transaction Categories** → Category management system
3. **User Story 2.3: Transaction Frequency** → Recurring transaction system
4. **User Story 2.4: Transaction Composition** → Complex transaction
   calculations
5. **User Story 2.5: Bank Account Integration** → Bank account management
6. **User Story 3.1: Transaction Overview** → Reporting and analytics
7. **User Story 3.2: Category Analysis** → Advanced reporting features
8. **User Story 1.1: Basic User Setup** → User module (implemented last)
9. **User Story 1.2: User Profile Management** → User profile features
   (implemented last)

---

## 💰 User Story 2.1: Basic Transaction Creation (Week 1)

**Goal**: Implement complete transaction module with basic CRUD operations using
mock user

### **DS-1: Project Foundation Setup**

**Priority**: Critical  
**Estimate**: 1 day  
**Dependencies**: None

**As a developer**, I want to set up the basic project structure and Docker
environment so that we can start implementing the transaction module with a
uniform development experience.

**Acceptance Criteria**:

- [x] Create NestJS project with TypeScript configuration
- [x] Set up ESLint and Prettier
- [x] Configure Jest testing framework
- [x] Set up basic folder structure
- [x] Create Dockerfile for NestJS application
- [x] Create docker-compose.yml for development environment
- [ ] Set up PostgreSQL database container
- [x] Configure environment variables
- [ ] Add health checks for services
- [x] Document Docker usage in README
- [ ] Verify Docker environment is working

**Technical Tasks**:

- [x] Initialize NestJS project with `nest new`
- [x] Configure `tsconfig.json` for strict TypeScript
- [x] Set up ESLint with DDD-friendly rules
- [x] Create basic folder structure
- [x] Create multi-stage Dockerfile for development and production
- [x] Set up docker-compose.yml with PostgreSQL, Redis (optional), and app
      services
- [x] Configure database connection with environment variables
- [ ] Add health check endpoints and container health checks
- [x] Create .dockerignore file
- [x] Add Docker development commands to package.json scripts
- [x] Document Docker setup and usage in README.md
- [ ] Test Docker setup with `docker-compose up`
- [ ] Verify database connection in Docker environment

**TDD and BDD Deliverables**:

- [ ] Add/validate BDD scenarios for application health/readiness in
      `prompts/11-bdd.md` (Epic 2 scaffolding)
- [ ] Write e2e test for health and readiness endpoints
- [ ] Add minimal e2e test to verify app boots and connects to DB (when DB is
      introduced)
- [ ] Ensure CI runs tests and linters on every commit

---

### **DS-2: Transaction Database Schema**

**Priority**: Critical  
**Estimate**: 0.5 day  
**Dependencies**: DS-1

**As a developer**, I want to create the transaction database schema so that we
can store transaction data.

**Acceptance Criteria**:

- [ ] Create Transaction entity with all properties
- [ ] Create Category entity with hierarchical support
- [ ] Add validation decorators
- [ ] Implement soft delete
- [ ] Add audit fields (createdAt, updatedAt)

**Technical Tasks**:

- [ ] Define Transaction entity with TypeORM decorators
- [ ] Define Category entity with self-referencing relationship
- [ ] Add validation using class-validator
- [ ] Implement BaseEntity inheritance
- [ ] Add database indexes

**TDD and BDD Deliverables**:

- [ ] Ensure BDD coverage indirectly via Epic 2.1 creation scenarios
- [ ] Write unit tests for entity validation rules and transformations
- [ ] Write integration tests that persist and retrieve entities with the test
      DB

---

### **DS-3: Transaction Value Objects**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-2

**As a developer**, I want to implement transaction-related value objects so
that we have type-safe domain objects.

**Acceptance Criteria**:

- [ ] Implement Money value object with currency support
- [ ] Implement TransactionType enum
- [ ] Add comprehensive validation for all value objects
- [ ] Write unit tests for all value objects

**Technical Tasks**:

- [ ] Create `Money` class with amount and currency
- [ ] Create `TransactionType` enum
- [ ] Implement validation decorators
- [ ] Write unit tests for each value object

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.1 "Validate transaction data"
- [ ] Write tests first for `Money`, `TransactionType`, and validations (invalid
      amounts/currencies)
- [ ] Cover edge cases before implementation

---

### **DS-4: Transaction Repository Layer**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-3

**As a developer**, I want to implement the transaction repository layer so that
we can abstract database operations.

**Acceptance Criteria**:

- [ ] Create TransactionRepository interface and implementation
- [ ] Create CategoryRepository interface and implementation
- [ ] Implement basic CRUD operations
- [ ] Add query methods for common operations
- [ ] Write integration tests for repositories

**Technical Tasks**:

- [ ] Define repository interfaces
- [ ] Implement TypeORM-based repositories
- [ ] Add custom query methods
- [ ] Create repository tests with test database

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.1 storage expectations
- [ ] Write integration tests first for CRUD and common queries
- [ ] Use transactions/fixtures for test isolation

---

### **DS-5: Mock User Service (Simple)**

**Priority**: High  
**Estimate**: 0.25 day  
**Dependencies**: DS-4

**As a developer**, I want to implement a simple mock user service so that we
can develop without authentication.

**Acceptance Criteria**:

- [ ] Create MockUserService that returns a hardcoded user ID
- [ ] Implement getCurrentUserId method
- [ ] Configure service to be injectable
- [ ] Write tests for mock user service

**Technical Tasks**:

- [ ] Create MockUserService class
- [ ] Define hardcoded user ID
- [ ] Implement getCurrentUserId method
- [ ] Add dependency injection configuration
- [ ] Write unit tests for mock service

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 1.1 mock user availability
- [ ] Write tests to guarantee a stable mock user id is returned and injectable

---

### **DS-6: Transaction Service Implementation**

**Priority**: Critical  
**Estimate**: 1 day  
**Dependencies**: DS-5

**As a developer**, I want to implement the TransactionService so that we can
manage transaction operations.

**Acceptance Criteria**:

- [ ] Implement createTransaction method
- [ ] Implement updateTransaction method
- [ ] Implement deleteTransaction method
- [ ] Implement getTransaction method
- [ ] Add proper validation
- [ ] Write integration tests

**Technical Tasks**:

- [ ] Create TransactionService class
- [ ] Implement CRUD operations
- [ ] Add validation logic
- [ ] Create DTOs for transaction operations
- [ ] Add audit logging
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.1 (create income/expense, validation)
- [ ] Write unit tests for service rules and integration tests against
      repositories
- [ ] Add tests for validation and error cases before implementing logic

---

### **DS-7: Transaction Controller and DTOs**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-6

**As a developer**, I want to create transaction controller and DTOs so that we
can expose transaction APIs.

**Acceptance Criteria**:

- [ ] Create CreateTransactionDto
- [ ] Create UpdateTransactionDto
- [ ] Create TransactionResponseDto
- [ ] Implement TransactionController
- [ ] Add proper HTTP status codes
- [ ] Add Swagger documentation

**Technical Tasks**:

- [ ] Create DTOs with validation decorators
- [ ] Implement TransactionController
- [ ] Add proper HTTP status codes
- [ ] Add Swagger documentation
- [ ] Write controller tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.1 scenarios
- [ ] Write e2e tests for HTTP endpoints, including success and validation
      errors
- [ ] Assert proper HTTP status codes in tests

---

## 🏷️ User Story 2.2: Transaction Categories (Week 1-2)

**Goal**: Implement category management system for organizing transactions

### **DS-8: Category Service Implementation**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-7

**As a developer**, I want to implement category management so that users can
organize transactions.

**Acceptance Criteria**:

- [ ] Create CategoryService
- [ ] Implement CRUD operations for categories
- [ ] Add hierarchical category support
- [ ] Add default categories seeder
- [ ] Write integration tests

**Technical Tasks**:

- [ ] Create CategoryService class
- [ ] Implement CRUD operations
- [ ] Add hierarchical category logic
- [ ] Create default categories seeder
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.2 (list/create/assign/edit/delete categories)
- [ ] Write unit tests for service logic and integration tests with repositories

---

### **DS-9: Category Controller and DTOs**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: DS-8

**As a developer**, I want to create category controller and DTOs so that we can
expose category APIs.

**Acceptance Criteria**:

- [ ] Create CreateCategoryDto
- [ ] Create UpdateCategoryDto
- [ ] Create CategoryResponseDto
- [ ] Implement CategoryController
- [ ] Add proper validation
- [ ] Add Swagger documentation

**Technical Tasks**:

- [ ] Create DTOs with validation decorators
- [ ] Implement CategoryController
- [ ] Add request validation
- [ ] Add Swagger documentation
- [ ] Write controller tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.2 scenarios
- [ ] Write e2e tests for category endpoints, including validation

---

## 🔄 User Story 2.3: Transaction Frequency (Week 2)

**Goal**: Implement recurring transaction system with cron-based scheduling

### **DS-10: Frequency Value Object Enhancement**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-9

**As a developer**, I want to enhance the Frequency value object so that it can
handle recurring transactions.

**Acceptance Criteria**:

- [ ] Add cron expression support
- [ ] Add next occurrence calculation
- [ ] Add frequency validation
- [ ] Add frequency parsing
- [ ] Write comprehensive tests

**Technical Tasks**:

- [ ] Enhance Frequency class with cron support
- [ ] Add next occurrence calculation
- [ ] Add frequency validation
- [ ] Add frequency parsing methods
- [ ] Write unit tests for all operations

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.3 recurring frequencies
- [ ] Write unit tests first for cron parsing, validation, and next occurrence

---

### **DS-11: Recurrence Handler Service**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-10

**As a developer**, I want to implement a recurrence handler so that we can
manage recurring transactions.

**Acceptance Criteria**:

- [ ] Create RecurrenceHandler service
- [ ] Implement generateNextOccurrence method
- [ ] Implement validateRecurrencePattern method
- [ ] Add cron expression validation
- [ ] Write unit tests

**Technical Tasks**:

- [ ] Create RecurrenceHandler class
- [ ] Implement recurrence logic
- [ ] Add cron expression validation
- [ ] Add date calculation methods
- [ ] Write unit tests for recurrence logic

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.3 (daily/weekly/monthly/yearly, cancel/edit)
- [ ] Write unit tests first for recurrence generation and validation

---

### **DS-12: Recurring Transaction Service**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-11

**As a developer**, I want to implement recurring transaction management so that
we can handle scheduled transactions.

**Acceptance Criteria**:

- [ ] Create RecurringTransactionService
- [ ] Implement processRecurringTransactions method
- [ ] Implement createRecurringTransaction method
- [ ] Add scheduled job support
- [ ] Write integration tests

**Technical Tasks**:

- [ ] Create RecurringTransactionService class
- [ ] Implement recurring transaction logic
- [ ] Add scheduled job using node-cron
- [ ] Add recurring transaction validation
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.3 (process and create recurring transactions)
- [ ] Write integration tests for scheduled processing and creation

---

## 🧮 User Story 2.4: Transaction Composition (Week 2-3)

**Goal**: Implement complex transaction calculations with mathematical
expressions

### **DS-13: Calculation Parser Service**

**Priority**: High  
**Estimate**: 1 day  
**Dependencies**: DS-12

**As a developer**, I want to implement a calculation parser so that we can
handle transaction composition.

**Acceptance Criteria**:

- [ ] Create CalculationParser service
- [ ] Implement parseCalculation method
- [ ] Implement validateCalculation method
- [ ] Add mathematical expression parsing
- [ ] Add transaction ID resolution
- [ ] Add circular reference detection

**Technical Tasks**:

- [ ] Create CalculationParser class
- [ ] Implement mathematical expression parsing
- [ ] Add transaction ID resolution
- [ ] Add circular reference detection
- [ ] Add calculation validation
- [ ] Write unit tests for parsing logic

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.4 (composed transactions, validation)
- [ ] Write unit tests for parsing, reference resolution, and circular detection

---

### **DS-14: Transaction Calculator Service**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-13

**As a developer**, I want to implement a transaction calculator so that we can
perform complex calculations.

**Acceptance Criteria**:

- [ ] Create TransactionCalculator service
- [ ] Implement calculateComposition method
- [ ] Implement calculateNetAmount method
- [ ] Add tax calculation support
- [ ] Write unit tests

**Technical Tasks**:

- [ ] Create TransactionCalculator class
- [ ] Implement calculation methods
- [ ] Add tax calculation logic
- [ ] Add deduction calculation logic
- [ ] Write unit tests for calculation logic

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.4 calculation scenarios
- [ ] Write unit tests for composition and net amount calculations

---

### **DS-15: Composition Validation Service**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: DS-14

**As a developer**, I want to implement composition validation so that we can
ensure calculation integrity.

**Acceptance Criteria**:

- [ ] Create CompositionValidator service
- [ ] Implement validateComposition method
- [ ] Add circular reference detection
- [ ] Add transaction existence validation
- [ ] Add mathematical expression validation

**Technical Tasks**:

- [ ] Create CompositionValidator class
- [ ] Implement validation methods
- [ ] Add circular reference detection
- [ ] Add transaction existence validation
- [ ] Write unit tests for validation logic

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.4 validation scenarios
- [ ] Write tests for circular reference and existence checks

---

## 🏦 User Story 2.5: Bank Account Integration (Week 3)

**Goal**: Implement bank account management and linking with transactions

### **DS-16: Bank Account Database Schema**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-15

**As a developer**, I want to create the bank account database schema so that we
can store bank account data.

**Acceptance Criteria**:

- [ ] Create BankAccount entity with all properties
- [ ] Add validation decorators
- [ ] Implement soft delete
- [ ] Add audit fields

**Technical Tasks**:

- [ ] Define BankAccount entity with TypeORM decorators
- [ ] Add validation using class-validator
- [ ] Implement BaseEntity inheritance
- [ ] Add database indexes

**TDD and BDD Deliverables**:

- [ ] Align indirectly with BDD Epic 2.5 (no direct user behavior)
- [ ] Write unit tests for entity validation and integration tests for
      persistence

---

### **DS-17: Bank Account Service Implementation**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-16

**As a developer**, I want to implement the BankAccountService so that we can
manage bank account operations.

**Acceptance Criteria**:

- [ ] Create BankAccountService
- [ ] Implement CRUD operations
- [ ] Add balance calculation
- [ ] Add proper validation
- [ ] Write integration tests

**Technical Tasks**:

- [ ] Create BankAccountService class
- [ ] Implement CRUD operations
- [ ] Add balance calculation logic
- [ ] Add validation logic
- [ ] Create DTOs for bank account operations
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.5 (create/link/balance)
- [ ] Write unit tests for balance logic and integration tests for repository
      interactions

---

### **DS-18: Bank Account Controller**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: DS-17

**As a developer**, I want to create bank account controller so that we can
expose bank account APIs.

**Acceptance Criteria**:

- [ ] Create BankAccountController
- [ ] Implement CRUD endpoints
- [ ] Add proper validation
- [ ] Add Swagger documentation
- [ ] Write controller tests

**Technical Tasks**:

- [ ] Create BankAccountController
- [ ] Implement CRUD endpoints
- [ ] Add request validation
- [ ] Add Swagger documentation
- [ ] Write controller tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 2.5 scenarios
- [ ] Write e2e tests first for account endpoints, including linking to
      transactions

---

## 📊 User Story 3.1: Transaction Overview (Week 3-4)

**Goal**: Implement basic reporting and transaction overview functionality

### **DS-19: Transaction Query Service**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-18

**As a developer**, I want to implement a transaction query service so that we
can filter and search transactions.

**Acceptance Criteria**:

- [ ] Create TransactionQueryService
- [ ] Implement filterByDateRange method
- [ ] Implement filterByType method
- [ ] Implement filterByCategory method
- [ ] Add sorting capabilities
- [ ] Add pagination support

**Technical Tasks**:

- [ ] Create TransactionQueryService class
- [ ] Implement filtering methods
- [ ] Add sorting logic
- [ ] Add pagination logic
- [ ] Create query DTOs
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 3.1 (filters, sorting, pagination)
- [ ] Write unit tests for query building and integration tests against the DB

---

### **DS-20: Transaction Aggregation Service**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-19

**As a developer**, I want to implement transaction aggregation so that we can
calculate summaries.

**Acceptance Criteria**:

- [ ] Create TransactionAggregationService
- [ ] Implement calculateTotalIncome method
- [ ] Implement calculateTotalExpenses method
- [ ] Implement calculateNetIncome method
- [ ] Add date range aggregation
- [ ] Write unit tests

**Technical Tasks**:

- [ ] Create TransactionAggregationService class
- [ ] Implement aggregation methods
- [ ] Add date range aggregation
- [ ] Optimize aggregation queries
- [ ] Write unit tests for aggregation logic

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 3.1 totals/net income
- [ ] Write tests for totals and date range aggregation

---

### **DS-21: Transaction Overview Controller**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: DS-20

**As a developer**, I want to create transaction overview controller so that we
can expose overview APIs.

**Acceptance Criteria**:

- [ ] Create TransactionOverviewController
- [ ] Implement getOverview endpoint
- [ ] Implement getSummary endpoint
- [ ] Add date range filtering
- [ ] Add proper validation
- [ ] Add Swagger documentation

**Technical Tasks**:

- [ ] Create TransactionOverviewController
- [ ] Implement overview endpoints
- [ ] Add request validation
- [ ] Add Swagger documentation
- [ ] Write controller tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 3.1 overview scenarios
- [ ] Write e2e tests first for overview and summary endpoints

---

## 📈 User Story 3.2: Category Analysis (Week 4)

**Goal**: Implement advanced reporting with category-based insights

### **DS-22: Category Analysis Service**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-21

**As a developer**, I want to implement category analysis so that we can provide
spending insights.

**Acceptance Criteria**:

- [ ] Create CategoryAnalysisService
- [ ] Implement getCategoryTotals method
- [ ] Implement getCategoryPercentages method
- [ ] Implement getCategoryTrends method
- [ ] Add date range filtering
- [ ] Add sorting capabilities

**Technical Tasks**:

- [ ] Create CategoryAnalysisService class
- [ ] Implement analysis methods
- [ ] Add percentage calculations
- [ ] Add trend calculations
- [ ] Optimize analysis queries
- [ ] Write unit tests for analysis logic

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 3.2 (totals, percentages, trends)
- [ ] Write tests for percentage and trend calculations

---

### **DS-23: Category Analysis Controller**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: DS-22

**As a developer**, I want to create category analysis controller so that we can
expose analysis APIs.

**Acceptance Criteria**:

- [ ] Create CategoryAnalysisController
- [ ] Implement getCategoryAnalysis endpoint
- [ ] Implement getCategoryTrends endpoint
- [ ] Add date range filtering
- [ ] Add proper validation
- [ ] Add Swagger documentation

**Technical Tasks**:

- [ ] Create CategoryAnalysisController
- [ ] Implement analysis endpoints
- [ ] Add request validation
- [ ] Add Swagger documentation
- [ ] Write controller tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 3.2 scenarios
- [ ] Write e2e tests first for analysis endpoints and validate sorting and
      ranges

---

## 🔧 Infrastructure & Quality (Parallel Development)

### **DS-24: Docker Production Configuration**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: DS-1

**As a developer**, I want to have production-ready Docker configuration so that
we can deploy the application consistently.

**Acceptance Criteria**:

- [ ] Create production Dockerfile
- [ ] Set up production docker-compose.yml
- [ ] Configure environment-specific settings
- [ ] Add Docker security best practices
- [ ] Create Docker deployment scripts

**Technical Tasks**:

- [ ] Create production-optimized Dockerfile
- [ ] Set up production docker-compose.yml
- [ ] Configure environment variables for production
- [ ] Add Docker security scanning
- [ ] Create deployment scripts
- [ ] Document production deployment process

**TDD and BDD Deliverables**:

- [ ] Add a smoke e2e test profile to validate app boots in production mode
- [ ] Add CI job to build and run minimal production container and run smoke
      tests

---

### **DS-26: Error Handling Middleware**

**Priority**: High  
**Estimate**: 0.5 day  
**Dependencies**: None (can be developed in parallel)

**As a developer**, I want to implement comprehensive error handling so that we
can provide meaningful error messages.

**Acceptance Criteria**:

- [ ] Create global exception filter
- [ ] Handle validation errors
- [ ] Handle database errors
- [ ] Handle business logic errors
- [ ] Add proper HTTP status codes

**Technical Tasks**:

- [ ] Create GlobalExceptionFilter
- [ ] Add validation error handling
- [ ] Add database error handling
- [ ] Add business logic error handling
- [ ] Write middleware tests

**TDD and BDD Deliverables**:

- [ ] Align with "Additional Scenarios → Error Handling" in `prompts/11-bdd.md`
- [ ] Write e2e tests first for validation/database/business errors with proper
      status codes

---

### **DS-27: Logging Service**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: None (can be developed in parallel)

**As a developer**, I want to implement a logging service so that we can track
application events.

**Acceptance Criteria**:

- [ ] Create LoggingService
- [ ] Implement info, warn, error methods
- [ ] Add structured logging
- [ ] Add request logging
- [ ] Write service tests

**Technical Tasks**:

- [ ] Create LoggingService class
- [ ] Implement logging methods
- [ ] Add structured logging
- [ ] Add request logging middleware
- [ ] Write service tests

**TDD and BDD Deliverables**:

- [ ] Non-user-facing; ensure unit tests cover structured logging and request
      logging middleware
- [ ] Add integration test that logs around a controller request path

---

### **DS-28: Integration Test Suite**

**Priority**: High  
**Estimate**: 1 day  
**Dependencies**: DS-23

**As a developer**, I want to create comprehensive integration tests so that we
can ensure system reliability.

**Acceptance Criteria**:

- [ ] Create test database setup
- [ ] Write transaction module integration tests
- [ ] Write category module integration tests
- [ ] Write bank account module integration tests
- [ ] Achieve >80% code coverage

**Technical Tasks**:

- [ ] Set up test database configuration
- [ ] Create test data factories
- [ ] Write transaction integration tests
- [ ] Write category integration tests
- [ ] Write bank account integration tests
- [ ] Configure code coverage

**TDD and BDD Deliverables**:

- [ ] Ensure every BDD scenario in `prompts/11-bdd.md` has at least one
      corresponding test
- [ ] Gate merges on test pass and coverage thresholds

---

### **DS-27: API Documentation**

**Priority**: Medium  
**Estimate**: 0.5 day  
**Dependencies**: DS-23

**As a developer**, I want to create comprehensive API documentation so that the
API is well-documented.

**Acceptance Criteria**:

- [ ] Configure Swagger/OpenAPI
- [ ] Document all endpoints
- [ ] Add request/response examples
- [ ] Add error response documentation
- [ ] Generate API documentation

**Technical Tasks**:

- [ ] Configure Swagger/OpenAPI
- [ ] Add API documentation decorators
- [ ] Add request/response examples
- [ ] Add error response documentation
- [ ] Generate API documentation

**TDD and BDD Deliverables**:

- [ ] Add e2e tests to verify Swagger/OpenAPI route renders and required tags
      exist
- [ ] Ensure request/response example schemas match e2e responses

---

## �� User Stories 1.1 & 1.2: User Management (Week 5 - LAST)

**Goal**: Implement user authentication and management system (implemented last)

### **DS-28: User Database Schema**

**Priority**: Low (implemented last)  
**Estimate**: 0.5 day  
**Dependencies**: DS-27

**As a developer**, I want to create the user database schema so that we can
store user data.

**Acceptance Criteria**:

- [ ] Create User entity with all required fields
- [ ] Create UserProfile entity for extended user information
- [ ] Set up proper relationships between entities
- [ ] Implement soft delete functionality
- [ ] Create database migrations

**Technical Tasks**:

- [ ] Define User entity with TypeORM decorators
- [ ] Define UserProfile entity with user preferences
- [ ] Set up foreign key relationships
- [ ] Implement BaseEntity with soft delete
- [ ] Generate and test database migrations

**TDD and BDD Deliverables**:

- [ ] Align indirectly with BDD Epic 1.1/1.2 (no direct endpoints yet)
- [ ] Write unit tests for entity validation and relationships
- [ ] Write integration tests for persistence and soft delete

---

### **DS-29: User Value Objects**

**Priority**: Low (implemented last)  
**Estimate**: 0.5 day  
**Dependencies**: DS-28

**As a developer**, I want to implement user-related value objects so that we
have type-safe domain objects.

**Acceptance Criteria**:

- [ ] Implement Email value object with validation
- [ ] Implement Currency value object
- [ ] Implement Timezone value object
- [ ] Add comprehensive validation for all value objects

**Technical Tasks**:

- [ ] Create `Email` class with RFC 5322 validation
- [ ] Create `Currency` class with ISO 4217 validation
- [ ] Create `Timezone` class with IANA timezone validation
- [ ] Implement validation decorators
- [ ] Write unit tests for each value object

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 1.2 validation scenarios
- [ ] Write tests first for `Email`, `Currency`, and `Timezone` validations

---

### **DS-30: User Repository Layer**

**Priority**: Low (implemented last)  
**Estimate**: 0.5 day  
**Dependencies**: DS-29

**As a developer**, I want to implement the user repository layer so that we can
abstract database operations.

**Acceptance Criteria**:

- [ ] Create UserRepository interface and implementation
- [ ] Create UserProfileRepository interface and implementation
- [ ] Implement basic CRUD operations
- [ ] Add query methods for common operations
- [ ] Write integration tests for repositories

**Technical Tasks**:

- [ ] Define repository interfaces
- [ ] Implement TypeORM-based repositories
- [ ] Add custom query methods
- [ ] Create repository tests with test database
- [ ] Add transaction support for complex operations

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 1.1/1.2 storage expectations
- [ ] Write integration tests first for CRUD and common queries

---

### **DS-31: User Service Implementation**

**Priority**: Low (implemented last)  
**Estimate**: 1 day  
**Dependencies**: DS-30

**As a developer**, I want to implement user management so that we can handle
user operations.

**Acceptance Criteria**:

- [ ] Create UserService
- [ ] Implement user registration
- [ ] Implement user authentication
- [ ] Implement user profile management
- [ ] Add proper validation
- [ ] Write integration tests

**Technical Tasks**:

- [ ] Create UserService class
- [ ] Implement user registration logic
- [ ] Implement authentication logic
- [ ] Implement profile management
- [ ] Add validation logic
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 1.1/1.2 (profile management, settings)
- [ ] Write unit tests first for registration/auth/profile rules and integration
      tests

---

### **DS-32: User Controller and DTOs**

**Priority**: Low (implemented last)  
**Estimate**: 0.5 day  
**Dependencies**: DS-31

**As a developer**, I want to create user controller and DTOs so that we can
expose user APIs.

**Acceptance Criteria**:

- [ ] Create UserRegistrationDto
- [ ] Create UserLoginDto
- [ ] Create UserProfileDto
- [ ] Implement UserController
- [ ] Add proper HTTP status codes
- [ ] Add Swagger documentation

**Technical Tasks**:

- [ ] Create DTOs with validation decorators
- [ ] Implement UserController
- [ ] Add proper HTTP status codes
- [ ] Add Swagger documentation
- [ ] Write controller tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 1.2 profile endpoints
- [ ] Write e2e tests first for registration/login/profile endpoints and
      validation

---

### **DS-33: Authentication Middleware**

**Priority**: Low (implemented last)  
**Estimate**: 1 day  
**Dependencies**: DS-32

**As a developer**, I want to implement authentication middleware so that we can
secure our endpoints.

**Acceptance Criteria**:

- [ ] Create JWT authentication strategy
- [ ] Implement authentication guard
- [ ] Add role-based access control
- [ ] Secure all protected endpoints
- [ ] Write authentication tests

**Technical Tasks**:

- [ ] Create JWT strategy
- [ ] Implement authentication guard
- [ ] Add role-based access control
- [ ] Secure protected endpoints
- [ ] Write comprehensive tests

**TDD and BDD Deliverables**:

- [ ] Align with BDD Epic 1.2 and protected endpoints across Epics 2 and 3
- [ ] Write e2e tests first for JWT strategy, guards, and RBAC behavior

---

### **DS-34: User Integration Tests**

**Priority**: Low (implemented last)  
**Estimate**: 0.5 day  
**Dependencies**: DS-33

**As a developer**, I want to create user integration tests so that we can
ensure user functionality works correctly.

**Acceptance Criteria**:

- [ ] Write user registration tests
- [ ] Write user authentication tests
- [ ] Write user profile management tests
- [ ] Test authentication middleware
- [ ] Achieve >90% code coverage

**Technical Tasks**:

- [ ] Write user registration integration tests
- [ ] Write user authentication integration tests
- [ ] Write user profile management tests
- [ ] Test authentication middleware
- [ ] Update overall code coverage

**TDD and BDD Deliverables**:

- [ ] Ensure BDD Epic 1.1/1.2 scenarios are fully covered by tests
- [ ] Add missing tests to achieve coverage target

---

## 📋 Implementation Summary

### **Development Priority Order:**

1. **Week 1**: User Story 2.1 (Basic Transaction Creation) - Complete
   transaction module
2. **Week 2**: User Story 2.2 (Transaction Categories) + User Story 2.3
   (Transaction Frequency)
3. **Week 3**: User Story 2.4 (Transaction Composition) + User Story 2.5 (Bank
   Account Integration)
4. **Week 4**: User Story 3.1 (Transaction Overview) + User Story 3.2 (Category
   Analysis)
5. **Week 5**: User Stories 1.1 & 1.2 (User Management) - Implemented last

### **Key Benefits of This Approach:**

1. **Core Functionality First**: Transaction management works without user
   complexity
2. **Faster MVP**: Can demonstrate core features immediately
3. **Easier Testing**: No authentication complexity during core development
4. **User Stories Last**: Authentication and user management implemented when
   everything else works
5. **Mock User**: Simple hardcoded user ID until real authentication is added

### **Total Estimated Effort**: 17.5 days (4 weeks for core features + 1 week for user management)

### **Infrastructure Development**: Can be developed in parallel with user stories

### **Docker Integration Benefits**:

1. **Uniform Development Environment**: All developers use the same setup
2. **Easy Onboarding**: New developers can start with `docker-compose up`
3. **Consistent Dependencies**: Same database versions and configurations
4. **Production Parity**: Development environment matches production
5. **Isolated Services**: No conflicts with local system dependencies

This approach ensures that the core transaction functionality is fully
implemented and tested before adding user authentication complexity, with Docker
providing a consistent development experience for all team members.
