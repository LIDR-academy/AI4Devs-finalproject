# Mutation Testing Report: AI Lesson Generation (Post-Implementator Strengthening)

**Post-review mutation pass** | **Score: 97.92% (lesson-generation scope)** | **4 survivors** | **All verified as genuine equivalents**

---

## Executive Summary

Stryker re-ran on the 6 lesson-generation source files in `@helsoft/supabase-services` after implementator test strengthening. Score improved from 77.72% (41 survivors) to **97.92% (4 survivors)**. Each of the 4 remaining survivors was independently analyzed via code tracing and test verification. **All 4 are confirmed genuine equivalent mutants** — mutations that produce byte-identical observable behavior for every real input within the function's domain.

---

## Per-Library Mutation Scores (Lesson-Generation Files Only)

| File | Total | Killed | Survived | Score |
|------|-------|--------|----------|-------|
| `src/services/lesson-generation.assembly.ts` | 32 | 32 | 0 | **100%** ✓ |
| `src/services/lesson-generation.placement.ts` | 14 | 14 | 0 | **100%** ✓ |
| `src/services/lesson-generation.prompt.ts` | 17 | 17 | 0 | **100%** ✓ |
| `src/services/lesson-generation.schema.ts` | 78 | 78 | 0 | **100%** ✓ |
| `src/services/lesson-generation.errors.ts` | 24 | 21 | 3 | 87.50% |
| `src/services/lesson-generation.service.ts` | 14 | 13 | 1 | 92.86% |
| **TOTAL** | **192** | **188** | **4** | **97.92%** |

---

## Surviving Mutants — Independent Analysis

### `src/services/lesson-generation.errors.ts`

#### Line 26:3 — ConditionalExpression (Final type guard)

**Mutation:**
```diff
- typeof (cause as { statusCode?: unknown }).statusCode === 'number'
+ true
```

**Code context:**
```typescript
const apiCallStatusCode = (cause: unknown): number | undefined =>
  typeof cause === 'object' &&
  cause !== null &&
  typeof (cause as { statusCode?: unknown }).statusCode === 'number'  // Line 26
    ? (cause as { statusCode: number }).statusCode
    : undefined;
```

**Independent analysis:**

The guard chain checks: (1) cause is an object, (2) not null, (3) statusCode is a number.

With the mutant (line 26 → `true`), the guard becomes: `typeof cause === 'object' && cause !== null && true`.

Test cases exercise:
- `{}` (object, no statusCode) — original: returns `undefined`; mutant: accesses property, also returns `undefined`
- `{ statusCode: 'not-a-number' }` — original: guard fails, returns `undefined`; mutant: guard passes, returns the string value

However, in the caller (`mapGenerationError`), the return value is only used in numeric comparisons:
```typescript
if (statusCode === 401 || statusCode === 403) return { errorCode: 'invalid_key', status: 401 };
if (statusCode === 429) return { errorCode: 'rate_limited', status: 429 };
return { errorCode: 'generation_failed', status: 502 };  // fallthrough
```

Both `undefined` (original for non-conforming input) and a non-numeric `statusCode` (mutant) fail all comparisons and fall through to `generation_failed`. **Verified equivalent.**

**Verdict:** Genuine equivalent mutant. The final guard is redundant: downstream checks fail identically for all inputs that don't satisfy the guard.

---

#### Line 38:7 — ConditionalExpression (`if(false)`)

**Mutation:**
```diff
- if (cause instanceof GenerationSchemaError) {
+ if (false) {
```

**Code context (lines 36–46):**
```typescript
export const mapGenerationError = (cause: unknown): GenerationErrorMapping => {
  if (cause instanceof GenerationTimeoutError) return { errorCode: 'timeout', status: 504 };
  if (cause instanceof GenerationSchemaError) {          // Line 38:7
    return { errorCode: 'generation_failed', status: 502 };
  }

  const statusCode = apiCallStatusCode(cause);
  if (statusCode === 401 || statusCode === 403) return { errorCode: 'invalid_key', status: 401 };
  if (statusCode === 429) return { errorCode: 'rate_limited', status: 429 };

  return { errorCode: 'generation_failed', status: 502 };
};
```

**GenerationSchemaError structure** (from `lesson-generation.assembly.ts`):
```typescript
export class GenerationSchemaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GenerationSchemaError';
  }
}
```

**Independent analysis:**

If the `instanceof` check is always false, execution falls through to:
```typescript
const statusCode = apiCallStatusCode(cause);
```

For a `GenerationSchemaError` instance:
1. `apiCallStatusCode(cause)` receives an Error object
2. Guard: `typeof cause === 'object'` ✓, `cause !== null` ✓
3. Guard: `typeof cause.statusCode === 'number'` — fails (Error has no statusCode property)
4. Returns `undefined`

Then:
- `undefined === 401` → false
- `undefined === 403` → false
- `undefined === 429` → false
- Falls through to `return { errorCode: 'generation_failed', status: 502 }`

Both original (explicit return) and mutant (fallthrough) return **`{ errorCode: 'generation_failed', status: 502 }`**.

**Test confirms:** `mapGenerationError(new GenerationSchemaError('bad deck'))` expects `{ errorCode: 'generation_failed', status: 502 }` and passes.

**Verdict:** Genuine equivalent mutant. GenerationSchemaError carries no statusCode property, making the fallthrough path identical to the explicit return.

---

#### Line 38:47 — BlockStatement (Empty block)

**Mutation:**
```diff
- if (cause instanceof GenerationSchemaError) {
-   return { errorCode: 'generation_failed', status: 502 };
- }
+ if (cause instanceof GenerationSchemaError) {}
```

**Independent analysis:**

Identical to Line 38:7 mutant above: the instanceof check passes (block is entered), but the block is empty, so execution falls through to the statusCode checks. GenerationSchemaError has no statusCode, falling through returns `generation_failed` — same as the original explicit return.

**Verdict:** Genuine equivalent mutant. Same reasoning as Line 38:7.

---

### `src/services/lesson-generation.service.ts`

#### Line 48:29 — OptionalChaining (Null-safety operator)

**Mutation:**
```diff
- return isKnownErrorCode(body?.errorCode) ? body.errorCode : 'generation_failed';
+ return isKnownErrorCode(body.errorCode) ? body.errorCode : 'generation_failed';
```

**Code context (lines 45–52):**
```typescript
const readFunctionErrorCode = async (error: FunctionsHttpError): Promise<GenerationErrorCode> => {
  try {
    const body = await error.context.json();
    return isKnownErrorCode(body?.errorCode) ? body.errorCode : 'generation_failed';  // Line 48
  } catch {
    return 'generation_failed';
  }
};
```

**Independent analysis:**

When `body = null` or `body = undefined`:

**Original:**
1. `body?.errorCode` safely evaluates to `undefined` (optional chaining short-circuits)
2. `isKnownErrorCode(undefined)` → false (not a known error code)
3. Returns `'generation_failed'` (tertiary operator takes else branch)

**Mutant:**
1. `body.errorCode` throws `TypeError: Cannot read property 'errorCode' of null/undefined`
2. Caught by outer `catch` block
3. Returns `'generation_failed'`

Both paths return **`'generation_failed'`**.

**Tests verify this:** The test suite includes explicit cases:
```typescript
it('falls back to generation_failed when the server error body itself resolves to null', async () => {
  dao.generateLesson.mockRejectedValue(httpErrorWithBody(null));
  // ... expects rejection with code: 'generation_failed'
});

it('falls back to generation_failed when the server error body itself resolves to undefined', async () => {
  dao.generateLesson.mockRejectedValue(httpErrorWithBody(undefined));
  // ... expects rejection with code: 'generation_failed'
});
```

Both test cases pass with the original code and would pass with the mutant (due to the catch block catching the TypeError).

**Verdict:** Genuine equivalent mutant. The catch block masks the TypeError thrown by the mutant, producing identical observable behavior (returning `'generation_failed'`) in both cases.

---

## Equivalence Summary

All 4 survivors are **confirmed genuine equivalent mutants**:

| Survivor | Mechanism | Reason |
|----------|-----------|--------|
| `errors.ts:26` | Final guard redundancy | Downstream numeric comparisons fail identically for non-numeric/undefined statusCode |
| `errors.ts:38:7` | No statusCode property | GenerationSchemaError lacks statusCode; fallthrough matches explicit return |
| `errors.ts:38:47` | No statusCode property | Same as above; empty block falls through to identical code path |
| `service.ts:48` | Exception caught by outer try/catch | TypeError from null property access caught, returning same value as optional-chain short-circuit |

No test coverage gaps. The mutations are **dead code** — logical branches where the mutation produces no observable change in return value or side effects for any real input.

---

## Verdict

**PASS** — Score 97.92% on lesson-generation scope (188/192 mutants killed). All 4 surviving mutants are verified as genuine equivalents. Threshold **100% met** on changed lines across the feature scope.

---

## Files Measured

- `libs/supabase-services/src/services/lesson-generation.assembly.ts`
- `libs/supabase-services/src/services/lesson-generation.errors.ts`
- `libs/supabase-services/src/services/lesson-generation.placement.ts`
- `libs/supabase-services/src/services/lesson-generation.prompt.ts`
- `libs/supabase-services/src/services/lesson-generation.schema.ts`
- `libs/supabase-services/src/services/lesson-generation.service.ts`

No source code changes were made in this measurement pass.
