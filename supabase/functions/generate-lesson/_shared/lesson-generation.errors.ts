// Mirrors libs/supabase-services/src/services/lesson-generation.errors.ts -- kept manually in
// sync by hand (task-4 note, same rule as R1's pdf-extraction/_shared mirrors). Jest-tested for
// real at the source path above; this copy is verified only by manual smoke against the deployed
// function (risks.md R2).
import { GenerationSchemaError } from './lesson-generation.assembly.ts';
import type { GenerationErrorMapping } from './lesson-generation.types.ts';

export class GenerationTimeoutError extends Error {
  constructor(message = 'Generation timed out') {
    super(message);
    this.name = 'GenerationTimeoutError';
  }
}

const apiCallStatusCode = (cause: unknown): number | undefined =>
  typeof cause === 'object' && cause !== null && typeof (cause as { statusCode?: unknown }).statusCode === 'number'
    ? (cause as { statusCode: number }).statusCode
    : undefined;

export const mapGenerationError = (cause: unknown): GenerationErrorMapping => {
  if (cause instanceof GenerationTimeoutError) return { errorCode: 'timeout', status: 504 };
  if (cause instanceof GenerationSchemaError) {
    return { errorCode: 'generation_failed', status: 502 };
  }

  const statusCode = apiCallStatusCode(cause);
  if (statusCode === 401 || statusCode === 403) return { errorCode: 'invalid_key', status: 401 };
  if (statusCode === 429) return { errorCode: 'rate_limited', status: 429 };

  return { errorCode: 'generation_failed', status: 502 };
};
