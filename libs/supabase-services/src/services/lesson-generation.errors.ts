import { GenerationSchemaError } from './lesson-generation.assembly';
import type { GenerationErrorMapping } from './lesson-generation.types';

/** Thrown by the Edge Function's own wall-clock guard around the generation call (risks.md R4) —
 * a manual timeout, not something the AI SDK itself throws. Kept in this pure module (rather than
 * only in the un-Jest-testable `index.ts`, risks.md R2) so `mapGenerationError` is fully tested. */
export class GenerationTimeoutError extends Error {
  constructor(message = 'Generation timed out') {
    super(message);
    this.name = 'GenerationTimeoutError';
  }
}

/** Duck-types the Vercel AI SDK's `APICallError` shape (a `statusCode` property) without
 * importing the `ai` package — it's a Deno-only, `npm:` specifier import not installed on the
 * Node/Jest side (risks.md R2), and the shape check is all `mapGenerationError` needs. */
const apiCallStatusCode = (cause: unknown): number | undefined =>
  typeof cause === 'object' &&
  cause !== null &&
  typeof (cause as { statusCode?: unknown }).statusCode === 'number'
    ? (cause as { statusCode: number }).statusCode
    : undefined;

/**
 * Maps a cause thrown by the generation pipeline into the typed `{ errorCode, status }` the Edge
 * Function responds with (@s15, spec.md Error contract table) — every failure mode, never a raw
 * Groq/Supabase error (@s8 redaction: the mapped result carries only these two fields, nothing
 * from `cause` itself).
 */
export const mapGenerationError = (cause: unknown): GenerationErrorMapping => {
  if (cause instanceof GenerationTimeoutError) return { errorCode: 'timeout', status: 504 };
  if (cause instanceof GenerationSchemaError) {
    return { errorCode: 'generation_failed', status: 502 };
  }
  if (
    typeof cause === 'object' &&
    cause !== null &&
    (cause as { code?: unknown }).code === 'persist_failed'
  ) {
    return { errorCode: 'persist_failed', status: 500 };
  }

  const statusCode = apiCallStatusCode(cause);
  if (statusCode === 401 || statusCode === 403) return { errorCode: 'invalid_key', status: 401 };
  if (statusCode === 429) return { errorCode: 'rate_limited', status: 429 };

  return { errorCode: 'generation_failed', status: 502 };
};
