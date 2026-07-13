import { GenerationSchemaError } from './lesson-generation.assembly';
import { GenerationTimeoutError, mapGenerationError } from './lesson-generation.errors';

describe('mapGenerationError', () => {
  // @s15 — a deck-schema/invariant/composition violation (task-11's assertComposition also
  // throws GenerationSchemaError) maps to the typed generation_failed code.
  it('maps a GenerationSchemaError to generation_failed', () => {
    expect(mapGenerationError(new GenerationSchemaError('bad deck'))).toEqual({
      errorCode: 'generation_failed',
      status: 502,
    });
  });

  // @s15 — an explicit wall-clock timeout maps to the typed timeout code.
  it('maps a GenerationTimeoutError to timeout', () => {
    expect(mapGenerationError(new GenerationTimeoutError())).toEqual({
      errorCode: 'timeout',
      status: 504,
    });
  });

  // @s15 — Groq rejecting the stored key (401/403) maps to invalid_key, not a raw provider error.
  it.each([401, 403])('maps an API-call error with statusCode %d to invalid_key', (statusCode) => {
    expect(mapGenerationError({ statusCode })).toEqual({ errorCode: 'invalid_key', status: 401 });
  });

  // @s15 — Groq's rate limit (429) maps to rate_limited.
  it('maps an API-call error with statusCode 429 to rate_limited', () => {
    expect(mapGenerationError({ statusCode: 429 })).toEqual({
      errorCode: 'rate_limited',
      status: 429,
    });
  });

  // @s15 — every other failure mode (including an unrecognized statusCode) falls back to the
  // generic generation_failed code, never a raw provider/Supabase error.
  it('falls back to generation_failed for an unrecognized statusCode', () => {
    expect(mapGenerationError({ statusCode: 500 })).toEqual({
      errorCode: 'generation_failed',
      status: 502,
    });
  });

  it('falls back to generation_failed for a cause with no recognizable shape at all', () => {
    expect(mapGenerationError(new Error('unexpected'))).toEqual({
      errorCode: 'generation_failed',
      status: 502,
    });
  });

  // @s8 redaction — the mapped result never carries anything from the raw cause (no message,
  // no key material, no provider response body) — only the two typed fields.
  it('never includes any property from the raw cause in the mapped result', () => {
    const cause = { statusCode: 401, message: 'Bearer sk-super-secret-key rejected' };

    expect(Object.keys(mapGenerationError(cause))).toEqual(['errorCode', 'status']);
  });
});
