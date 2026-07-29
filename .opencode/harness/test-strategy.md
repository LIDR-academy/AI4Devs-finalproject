# Test Strategy

The Realista project follows strict TDD per **Constitution Principle II (NON-NEGOTIABLE)**. This document covers the workflow, tooling, and coverage targets.

## Workflow: Red → Green → Refactor

Every new piece of functionality follows this cycle:

1. **Red** — Write a failing test that describes the desired behaviour
2. **Green** — Write the minimum code to make the test pass
3. **Refactor** — Improve the code while keeping tests green

The `tdd-cycle` skill (`.opencode/skills/tdd-cycle.md`) enforces this. No code is committed without a test.

## Coverage targets

| Layer | Target | Hard/Soft |
|---|---|---|
| `backend/src/domain/` | ≥ 80% lines, branches, functions | **Hard** (constitutional) |
| `backend/src/adapters/` | ≥ 60% | Soft |
| `backend/src/api/` | ≥ 50% | Soft |
| `frontend/src/lib/` | ≥ 60% | Soft |
| `frontend/src/routes/` | E2E coverage only | n/a |

Coverage is measured with `@vitest/coverage-v8` in backend and frontend. Reports are uploaded to CI artefacts.

## Test types

### Unit tests (Vitest)

Location: `backend/tests/unit/`, `frontend/tests/unit/`

Run: `npm test`

Covers:

- All value objects in `domain/value-objects/`
- All domain services in `domain/services/`
- All use cases (orchestrators)
- All port interfaces (with mock implementations)
- All adapters (with mocked IO)

### Integration tests (Vitest + Supertest)

Location: `backend/tests/integration/`

Run: `npm run test:integration`

Covers:

- API routes end-to-end (with mocked external services)
- Database operations (with test database)
- Session middleware, rate limiter, error handler
- CORS, JSON body parsing

### Contract tests (Vitest)

Location: `backend/tests/contract/`

Run: `npm run test:contract`

Validates that the API matches the contracts in `specs/001-realista-mvp/contracts/api.md`. Catches accidental breaking changes.

### E2E tests (Playwright)

Location: `e2e/flows/`, `frontend/tests/e2e/`

Run: `npx playwright test`

Covers full user flows:

- `full-flow.spec.ts` — Analyse listing → mortgage compass → dashboard
- `listing-lens.spec.ts` — Listing Lens happy path + error cases
- `mortgage-compass.spec.ts` — Mortgage Compass happy path + error cases

E2E tests use `MOCK_OPENROUTER=true`, `MOCK_NOMINATIM=true`, `MOCK_CATASTRO=true` to avoid external API costs and flakiness.

Real-API E2E runs in nightly CI only.

## Test naming convention

```
describe('<UnitName>', () => {
  describe('<method or scenario>', () => {
    it('does X when Y', () => {
      // arrange
      // act
      // assert
    });
  });
});
```

Example:

```typescript
describe('TransparencyScore', () => {
  describe('create', () => {
    it('rejects scores below 0', () => {});
    it('rejects scores above 100', () => {});
    it('accepts boundary values 0 and 100', () => {});
    it('preserves the label', () => {});
  });
});
```

## Mocking strategy

External services are mocked in tests via dependency injection. The ports (interfaces) are the seam.

```typescript
// In test
const mockAnalyzer: ListingAnalyzerPort = {
  analyze: vi.fn().mockResolvedValue({
    transparencyScore: 75,
    redFlags: [],
    // ...
  }),
};

const useCase = new AnalyzeListingUseCase(
  mockAnalyzer,
  mockLocationResolver,
  mockCatastro,
);

await useCase.execute({ url: '...', sessionId: '...' });

expect(mockAnalyzer.analyze).toHaveBeenCalledOnce();
```

No test reaches the real network except for the contract tests with the Catastro SEC (which is public and stable).

## Running tests

### Local

```bash
# Backend
cd backend
npm test                          # unit only
npm run test:unit                 # alias
npm run test:integration          # integration
npm run test:contract             # contract
npm run test:all                  # everything
npm run test:coverage             # with coverage report

# Frontend
cd frontend
npm test                          # unit
npm run test:e2e                  # playwright e2e

# E2E (root)
npx playwright test               # from e2e/
```

### CI

GitHub Actions runs the full suite on every push and PR. See `.github/workflows/ci.yml`.

## Coverage report

HTML report at `backend/coverage/index.html` and `frontend/coverage/index.html` after `npm run test:coverage`.

Threshold enforcement in `backend/vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/domain/**'],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});
```

If coverage drops below threshold, tests fail.

## What NOT to test

- **Generated code** (Prisma client, OpenAPI types) — trust the generator
- **Trivial getters/setters** — add a test only if there's logic
- **Third-party libraries** — trust the maintainers
- **Pure UI snapshot tests** — they catch nothing and are brittle

## Anti-patterns

- `it.only` or `it.skip` left in committed code
- Testing implementation details (e.g., asserting a private method was called)
- Asserting on the LLM's exact wording (it's non-deterministic)
- Mocking so much that the test is meaningless
- Tests that depend on each other (each test must be independent)
