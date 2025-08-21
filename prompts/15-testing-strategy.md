# Instructions to setup our testing strategy

## Overview
This document provides comprehensive instructions for setting up a testing infrastructure that supports TDD + BDD development practices across the full-stack application.

## Tech Stack
- **Backend**: NestJS with TypeORM, PostgreSQL
- **Frontend**: Next.js with React, TypeScript, Tailwind CSS
- **Testing Framework**: Jest (primary), Playwright (E2E)
- **Database**: PostgreSQL for all tests (no SQLite)
- **Containerization**: Docker with services running in containers for test execution

## Testing Architecture

### Test Types & Responsibilities

Integration tests are priority because they indicate how health a system is, unit tests can be used to cover remaining business code.

#### Unit Tests (Submodules)
- **Location**: Close to the code they are testing (in `backend/` and `frontend/` submodules)
- **Scope**: Single function/class testing
- **Database**: Mocked
- **External Services**: Mocked
- **Coverage**: Individual component behavior and edge cases
- **Execution**: Runs for items that will be affected by a refactory and when situation needs
- **Criteria**: Function returns expected results, handles errors correctly
- **Priority**: Medium: Use it to cover the bits that are not covered by integration and E2E tests, regardless of the reason

#### Integration Tests (Root Project)
- **Location**: `/test/integration/tests/` (at project root)
- **Scope**: Full user journey testing for specific activity or variation of such activity
- **Database**: PostgreSQL running in Docker container
- **External Services**: Mock with hard-coded responses
- **Coverage**: Happy flows (when E2E is not suitable) + unhappy flows (mocking database results)
- **Execution**: Runs against Docker containers
- **Criteria**: End-to-end functionality works correctly, data flows properly
- **Priority**: **Medium**: Use when E2E tests are not suitable due to costly/unreliable integrations
- **When to use**: External services that are expensive, unreliable, or require complex mocking

#### E2E Tests (Root Project)
- **Location**: `/test/e2e/tests/` (at project root)
- **Scope**: Full user journey testing focused on happy flow, and smoke test crawling through the app pages
- **Database**: PostgreSQL running in Docker container
- **External Services**: Mocked if they are neither cheap to run or inconsistent/unreliable
- **Coverage**: Complete user workflows, UI interactions, cross-browser compatibility
- **Execution**: Runs against Docker containers, slower execution
- **Criteria**: Happy flows should be tested E2E by default, except when integration is costly/unreliable
- **Priority**: **Highest for Happy Flows**: E2E tests are the default choice for happy flow variations
- **Exception**: Use integration tests when external services are expensive, unreliable, or require complex mocking

## Setup Instructions

### 1. Root Project Testing Infrastructure

#### Install Dependencies at Root
```bash
# From project root
npm install --save-dev @nestjs/testing supertest @faker-js/faker @playwright/test
```

#### Create Root Test Directory Structure
```
test/
├── setup/
│   ├── database.setup.ts
│   └── app.setup.ts
├── builders/
│   ├── base.builder.ts
│   ├── transaction.builder.ts
│   └── category.builder.ts
├── tests/
│   ├── smoke-test.e2e.spec.ts
│   └── capability-name/
│       ├── feature-name/
│       │   └── activity-name/
│       │       ├── 1-happy-flow.e2e.spec.ts
│       │       ├── 2-invalid-user-input.int.spec.ts
│       │       ├── 3-mailing-integration.int.spec.ts # the email service is expensive so it's an integration test rather than e2e
│       │       ├── 4-empty-list.int.spec.ts
│       │       ├── 5-another-happy-flow.e2e.spec.ts # happy flows default to E2E tests
│       │       └── 6-critical-error-handling.int.spec.ts
│       └── user-journeys/
│           ├── complete-budgeting-workflow.int.spec.ts
│           └── end-to-end-financial-tracking.int.spec.ts
├── jest-integration.json

└── test-setup.ts
```

### 2. Docker Test Environment

#### Test Environment Variables
The test environment uses the following environment variables that should be set in your system or CI environment:

```bash
# Test Database
POSTGRES_DB=finance_test
POSTGRES_USER=test_user
POSTGRES_PASSWORD=test_password
POSTGRES_HOST=test-db
POSTGRES_PORT=5432

# Test Backend
BACKEND_PORT=3001
NODE_ENV=test
JWT_SECRET=test_secret

# Test Frontend
FRONTEND_PORT=3002
NEXT_PUBLIC_API_URL=http://localhost:${BACKEND_PORT:-BACKEND_PORT}$

# Test Database External Port (for host access)
POSTGRES_EXTERNAL_PORT=5433
```

#### Create Test Docker Compose
```yaml:docker-compose.test.yml
version: "3.8"

services:
  test-backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
    ports:
      - "${BACKEND_PORT}:3000"
    depends_on:
      test-db:
        condition: service_healthy
    volumes:
      - ./backend:/app
      - /app/node_modules

  test-frontend:
    build: ./frontend
    ports:
      - "${FRONTEND_PORT}:3000"
    depends_on:
      - test-backend
    volumes:
      - ./frontend:/app
      - /app/node_modules

  test-db:
    image: postgres:15-alpine
    ports:
      - "${POSTGRES_EXTERNAL_PORT}:5432"
    volumes:
      - test_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  test_postgres_data:
```

### 3. Root Jest Integration Config
```json:test/jest-integration.json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".int.spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "testTimeout": 30000,
  "setupFilesAfterEnv": ["<rootDir>/test-setup.ts"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/../$1",
    "^backend/(.*)$": "<rootDir>/../backend/src/$1",
    "^frontend/(.*)$": "<rootDir>/../frontend/src/$1"
  }
}
```

### 5. Root Test Setup
```typescript:test/test-setup.ts
import { Test } from '@nestjs/testing';

beforeAll(async () => {
  // Global test setup - ensure Docker containers are running
  console.log('Ensuring Docker test environment is ready...');
});

afterAll(async () => {
  // Global test cleanup
});

beforeEach(async () => {
  // Reset database state before each test
});
```

### 6. Playwright Config at Root
```typescript:playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT ?? 3001}`,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'docker-compose -f docker-compose.test.yml up test-frontend test-backend test-db',
    url: process.env.FRONTEND_URL || `http://localhost:${process.env.FRONTEND_PORT ?? 3001}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

### 7. Test Data Builders at Root
```typescript:test/builders/base.builder.ts
export abstract class BaseBuilder<T> {
  protected abstract defaultData: Partial<T>;
  protected currentData: Partial<T> = {};
  
  constructor() {
    this.reset();
  }
  
  protected reset(): void {
    this.currentData = { ...this.defaultData };
  }
  
  create(data: Partial<T> = {}): T {
    const result = { ...this.currentData, ...data } as T;
    this.reset();
    return result;
  }
  
  createMany(count: number, data: Partial<T> = {}): T[] {
    const result = Array.from({ length: count }, () => this.create(data));
    this.reset();
    return result;
  }
}
```

```typescript:test/builders/transaction.builder.ts
import { BaseBuilder } from './base.builder';
import { Transaction } from '../../backend/src/domain/entities/transaction.entity';
import { Money } from '../../backend/src/domain/value-objects/money.value-object';
import { faker } from '@faker-js/faker';

export class TransactionBuilder extends BaseBuilder<Transaction> {
  protected defaultData: Partial<Transaction> = {
    amount: new Money(100, 'USD'),
    description: 'Test transaction',
    date: new Date(),
  };
  
  withAmount(amount: number, currency: string = 'USD'): this {
    this.currentData.amount = new Money(amount, currency);
    return this;
  }
  
  asIncome(): this {
    const randomAmount = faker.number.float({ min: 0.01, multipleOf: 0.01 });
    return this.withAmount(randomAmount, this.currentData.amount?.currency);
  }
  
  asExpense(): this {
    const randomAmount = faker.number.float({ min: 0, multipleOf: 0.01 });
    return this.withAmount(randomAmount, this.currentData.amount?.currency);
  }
  
  withDescription(description: string): this {
    this.currentData.description = description;
    return this;
  }
  
  onDate(date: Date): this {
    this.currentData.date = date;
    return this;
  }
}

// Usage examples:
// const income = new TransactionBuilder()
//   .asIncome() // Random positive amount
//   .withDescription('Salary')
//   .create();
//
// const expense = new TransactionBuilder()
//   .asExpense() // Random negative amount
//   .withDescription('Groceries')
//   .create();
//
// // Explicit amount (type derived from amount value)
// const explicitIncome = new TransactionBuilder()
//   .withAmount(200, 'GBP') // Positive = Income
//   .withDescription('Bonus')
//   .create();
//
// const explicitExpense = new TransactionBuilder()
//   .withAmount(-75, 'EUR') // Negative = Expense
//   .withDescription('Dinner')
//   .create();
```

### 8. Root Package.json Scripts
```json:package.json
{
  "scripts": {
    "test:integration": "jest --config ./test/jest-integration.json",
    "test:e2e": "playwright test --reporter=null",
    "test:e2e:playwright": "playwright test",
    "test:integration:watch": "jest --config ./test/jest-integration.json --watch",
    "test:coverage": "jest --config ./test/jest-integration.json --coverage",
    "test:docker:up": "docker-compose -f docker-compose.test.yml up -d",
    "test:docker:down": "docker-compose -f docker-compose.test.yml down",
    "test:docker:logs": "docker-compose -f docker-compose.test.yml logs -f",
    "test:full": "npm run test:docker:up && npm run test:integration && npm run test:e2e && npm run test:docker:down"
  }
}
```

## Testing Guidelines

### 1. Test Naming Convention
- **Unit Tests**: `*.spec.ts` (in submodules)
- **Integration Tests**: `*.int.spec.ts` (at root)
- **E2E Tests**: `*.e2e.spec.ts` (at root)

### 2. Test Structure
```typescript
describe('Capability', () => {
  describe('Feature', () => {
    describe('Activity', () => {
      describe('Variation 1', () => {
        it('should ...', async () => {
          // Arrange
          // Act
          // Assert
        });
      });
      
      describe('Variation 2', () => {
        it('should ...', async () => {
          // Arrange
          // Act
          // Assert
        });
      });
    });
  });
});
```

### 3. BDD Implementation with Jest
```typescript
describe('Transaction Creation', () => {
  describe('Given a valid transaction', () => {
    describe('When creating a new transaction', () => {
      it('Then it should be saved to database', async () => {
        // Test implementation
      });
    });
  });
});
```

### 4. Test Data Management
- Use builders for consistent test data creation
- Implement fluent builder methods that return 'this'
- Clean up test data between test runs
- Use database transactions for test isolation

## Running Tests

### Development Workflow
```bash
# Start Docker test environment
npm run test:docker:up

# Run E2E tests first (happy flows)
npm run test:e2e:playwright

# Run integration tests (costly/unreliable scenarios)
npm run test:integration:watch

# Stop Docker test environment
npm run test:docker:down
```

### CI/CD Pipeline
```bash
# Run all tests with Docker
npm run test:full

# Or step by step
npm run test:docker:up
npm run test:e2e
npm run test:integration
npm run test:docker:down
```

**Note**: E2E tests should be run first as they cover happy flows by default. Integration tests are for scenarios where E2E would be costly or unreliable.

## Bug Fix Testing Requirements

### Regression Prevention
- **Test First Approach**: Every bug fix must include a test that reproduces the bug
- **Failing Test**: Write the failing test before implementing the fix
- **Coverage**: Ensure the specific scenario that caused the bug is covered
- **Documentation**: Document the bug scenario in test comments for future reference
- **BUGS.md Update**: After test passes, update BUGS.md to mark the bug as resolved [x]
- **Test Verification**: Ensure the test fails before the fix and passes after implementation

### Bug Fix Workflow
1. **Identify Bug**: Document in BUGS.md with clear reproduction steps
2. **Write Failing Test**: Create test that reproduces the bug scenario
3. **Implement Fix**: Write minimal code to make the test pass
4. **Verify Fix**: Ensure test passes and bug is resolved
5. **Update BUGS.md**: Mark bug as resolved [x]
6. **Run Test Suite**: Ensure no regressions were introduced

## Multi-Activity User Journey Testing

### Cross-Activity Flows
- **Complete Workflows**: Test user journeys spanning multiple activities
- **Integration Points**: Verify data consistency between different activities
- **State Management**: Test how system state changes across activity boundaries
- **Business Rules**: Validate complex business logic across multiple features

### Test Organization
- **Location**: Place in dedicated files under `capability-name/user-journeys/`
- **Naming**: Use descriptive names like `complete-budgeting-workflow.int.spec.ts`
- **Test Type**: Use integration tests (`.int.spec.ts`) for multi-activity flows
- **Scope**: Focus on critical user paths that involve multiple features working together

### Why Integration Tests for User Journeys
- **Complexity**: Multi-activity flows are complex and benefit from real database state
- **Performance**: Faster execution than E2E tests for complex scenarios
- **Reliability**: More stable than E2E tests for multi-step workflows
- **Database State**: Real database interactions ensure data consistency across activities

### Example User Journey Tests
```typescript
describe('User Journeys', () => {
  describe('Complete Budgeting Workflow', () => {
    it('should complete full budgeting cycle', async () => {
      // Arrange: Setup complete test scenario
      // Act: Execute multi-step workflow
      // Assert: Verify end-to-end business outcomes
    });
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent, we can run them in parallel
2. **Fast Execution**: Integration tests < 30s, E2E tests < 2min
3. **Realistic Data**: Use builders that create realistic test scenarios consistent with business rules
4. **Business Rules**: Test business logic, not implementation details
5. **Error Scenarios**: Cover both happy and unhappy paths
6. **Happy Flow Priority**: **Happy flows should be E2E tests by default**
7. **Integration Test Exception**: Use integration tests for happy flows only when E2E would be costly/unreliable
8. **Database Cleanup**: Ensure consistent and valid business data for each test, unless the test is about handling inconsistent/invalid data
9. **Docker Management**: Always clean up containers after test runs
10. **Test Organization**: Follow the test directory structure for clear test organization

## Troubleshooting

### Common Issues
- **Docker Containers**: Ensure test containers are running with correct environment file
- **Port Conflicts**: Check for port conflicts in test environment (3001, 3002, 5433)
- **Test Data**: Verify builder data matches entity requirements, and that they are business consistent
- **Async Operations**: Use proper async/await patterns
- **Container Health**: Wait for database health check before running tests
- **Environment Variables**: Ensure all required test environment variables are set in your system or CI environment

### Debug Mode
```bash
# View container logs
npm run test:docker:logs

# Run tests with Docker containers
npm run test:docker:up
npm run test:integration
npm run test:docker:down
```

This setup provides a robust foundation for TDD + BDD development while maintaining fast test execution and comprehensive coverage across your full-stack application, with all integration and E2E tests running at the root level against Docker containers, organized by capability/feature/activity/variation structure.
