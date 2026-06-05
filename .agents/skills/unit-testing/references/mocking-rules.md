# Mocking Standards & Test Data Fixtures

This reference document defines policies for writing mocks, stubs, and test fixtures in unit tests.

## 1. Mocking Policy

- **External Boundaries:** Always mock network requests, databases, filesystem calls, and third-party API clients.
- **Strict Typing:** Ensure mocks mirror the signature of the real classes or interfaces.
- **Behavior Mocking:** Mock only what the test target relies on. Do not mock internal implementation details of the module under test.

---

## 2. Vitest Mocking Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from './UserService';
import { UserRepository } from './UserRepository';

// Mock repository
vi.mock('./UserRepository');

describe('UserService', () => {
  let service: UserService;
  let repositoryMock: any;

  beforeEach(() => {
    repositoryMock = new UserRepository() as vi.Mocked<UserRepository>;
    service = new UserService(repositoryMock);
  });

  it('should return user details on success', async () => {
    // Setup stub return
    repositoryMock.findById.mockResolvedValue({ id: '1', name: 'John Doe' });

    const result = await service.getUserDetails('1');
    expect(result.name).toBe('John Doe');
  });
});
```

---

## 3. Test Fixtures Standards

- **Locally Co-located:** Save fixture data files (e.g. `user-fixture.json`) under a `__fixtures__` folder sibling to the test file.
- **Factory Pattern:** Prefer factory functions to build test objects to avoid test dependencies on unused fields:
  ```typescript
  export const makeUserFixture = (overrides = {}) => ({
    id: 'user-id-123',
    email: 'test@example.com',
    role: 'user',
    ...overrides
  });
  ```
