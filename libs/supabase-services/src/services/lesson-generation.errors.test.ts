import { GenerationSchemaError } from './lesson-generation.assembly';
import { GenerationTimeoutError, mapGenerationError } from './lesson-generation.errors';

describe('GenerationTimeoutError', () => {
  // Pins the default message/name a caller that constructs one with no argument gets — the
  // manual wall-clock guard (risks.md R4) never needs to pass an explicit message.
  it('defaults to the "Generation timed out" message and the GenerationTimeoutError name', () => {
    const error = new GenerationTimeoutError();

    expect(error.message).toBe('Generation timed out');
    expect(error.name).toBe('GenerationTimeoutError');
  });
});

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

  // The API-call-error type guard (`typeof cause === 'object' && cause !== null && typeof
  // statusCode === 'number'`) must reject every shape that doesn't fully satisfy it, falling
  // through to the generic generation_failed code rather than misreading a nullish/primitive/
  // malformed cause as a statusCode.
  describe('API-error type guard rejects a non-conforming cause', () => {
    it.each([
      ['null', null],
      ['undefined', undefined],
      ['a string primitive', 'not-an-object'],
      ['a number primitive', 42],
      ['an object with no statusCode', {}],
      ['an object whose statusCode is not a number', { statusCode: 'not-a-number' }],
    ])('falls back to generation_failed for %s', (_label, cause) => {
      expect(mapGenerationError(cause)).toEqual({ errorCode: 'generation_failed', status: 502 });
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

  // @s2 — a persist_failed typed error from the Edge persist step maps to persist_failed (retry only).
  it('maps a persist_failed typed error to persist_failed', () => {
    const cause = Object.assign(new Error('persistLesson: failed'), { code: 'persist_failed' });

    expect(mapGenerationError(cause)).toEqual({ errorCode: 'persist_failed', status: 500 });
  });

  // @s8 redaction — the mapped result never carries anything from the raw cause (no message,
  // no key material, no provider response body) — only the two typed fields.
  it('never includes any property from the raw cause in the mapped result', () => {
    const cause = { statusCode: 401, message: 'Bearer sk-super-secret-key rejected' };

    expect(Object.keys(mapGenerationError(cause))).toEqual(['errorCode', 'status']);
  });
});
