# Skill: tdd-cycle

## Purpose

Enforces the Test-Driven Development cycle: red → green → refactor. The 80% domain coverage target is a constitutional requirement (Principle II).

## When to invoke

- Every time the `implementer` agent writes code
- After any change to `backend/src/domain/`

## Inputs

- The unit being implemented (value object, port, adapter, service, etc.)
- Its acceptance criteria (from the FR or task description)

## Outputs

- Failing test (red) before any implementation
- Passing test (green) with minimum code
- Refactored code with all tests still green
- Coverage report (≥80% domain, ≥60% adapters)

## The cycle

### 1. Red

Write the test FIRST. The test must fail for the right reason. Example for a value object:

```typescript
// backend/tests/unit/domain/value-objects/TransparencyScore.test.ts
import { describe, it, expect } from 'vitest';
import { TransparencyScore } from '../../../../src/domain/value-objects/TransparencyScore';

describe('TransparencyScore', () => {
  it('rejects scores below 0', () => {
    expect(() => TransparencyScore.create(-1, 'low')).toThrow();
  });

  it('rejects scores above 100', () => {
    expect(() => TransparencyScore.create(101, 'high')).toThrow();
  });

  it('accepts scores between 0 and 100', () => {
    const score = TransparencyScore.create(75, 'high');
    expect(score.value).toBe(75);
  });
});
```

Run: `npm test -- TransparencyScore` — must fail with "Cannot find module" or "TransparencyScore is not a function".

### 2. Green

Write the minimum code to make the test pass:

```typescript
// backend/src/domain/value-objects/TransparencyScore.ts
export type TransparencyLabel = 'low' | 'medium' | 'high' | 'excellent';

export class TransparencyScore {
  private constructor(
    public readonly value: number,
    public readonly label: TransparencyLabel
  ) {}

  static create(value: number, label: TransparencyLabel): TransparencyScore {
    if (value < 0 || value > 100) {
      throw new Error('TransparencyScore must be between 0 and 100');
    }
    return new TransparencyScore(value, label);
  }
}
```

Run: `npm test -- TransparencyScore` — must pass.

### 3. Refactor

Improve the code without changing behaviour:

- Extract magic numbers to constants
- Improve naming
- Add JSDoc to public API
- Add edge case tests (boundary values, etc.)

Run: `npm test -- TransparencyScore` — still all passing.

## Coverage check

```bash
cd backend
npx vitest run --coverage
```

Domain files (`src/domain/`) must show ≥80% lines, branches, and functions.

## Anti-patterns to detect

- Writing implementation before test
- Test passes immediately on first run (no red phase)
- Test asserts the implementation, not the behaviour
- `it.skip` or `it.todo` left in the file at commit time
- Coverage drops below 80% in a domain file
