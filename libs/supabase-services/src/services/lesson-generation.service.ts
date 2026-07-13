import type {
  GeneratedLesson,
  GenerateLessonRequest,
  GenerationError,
  GenerationErrorCode,
} from '@helsoft/types';
import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js';

import { LessonGenerationDao } from '../dao/lesson-generation.dao';
import { toTypedError } from '../utils/typed-error';

/** Single source for the typed-error shape (mirrors `PdfExtractionService`'s
 * `toExtractionError`) — shared with task-11/task-12's error-contract normalization. */
export const toGenerationError = (code: GenerationErrorCode): Error & GenerationError =>
  toTypedError(code, `LessonGenerationService: ${code}`);

/** The closed set of codes this service is contractually allowed to reject with — a full (not
 * partial) `Record`, matching `PdfExtractionService`'s `PDF_EXTRACTION_ERROR_CODES` precedent, so
 * TypeScript enforces exhaustiveness against `GenerationErrorCode`. Exported so `useLessonGeneration`
 * (task-13) derives its own runtime guard from this single source instead of an independent,
 * unchecked duplicate (mirrors `usePdfExtraction`'s reuse of `PDF_EXTRACTION_ERROR_CODES`). */
export const GENERATION_ERROR_CODES: Record<GenerationErrorCode, true> = {
  missing_key: true,
  invalid_key: true,
  rate_limited: true,
  timeout: true,
  generation_failed: true,
  document_not_ready: true,
  network_error: true,
  unauthenticated: true,
};

const isKnownErrorCode = (code: unknown): code is GenerationErrorCode =>
  typeof code === 'string' && Object.hasOwn(GENERATION_ERROR_CODES, code);

/** Reads the Edge Function's typed `{ errorCode }` body off a non-2xx invoke response — the raw
 * body is only reachable via `FunctionsHttpError.context` (an unread Response), never parsed by
 * supabase-js itself for error responses (mirrors `pdf-extraction.service.ts`'s
 * `readFunctionErrorCode`). Falls back to `generation_failed` for a malformed/absent body or an
 * `errorCode` outside the known union, so a violated server contract never leaks a raw shape. */
const readFunctionErrorCode = async (error: FunctionsHttpError): Promise<GenerationErrorCode> => {
  try {
    const body = await error.context.json();
    return isKnownErrorCode(body?.errorCode) ? body.errorCode : 'generation_failed';
  } catch {
    return 'generation_failed';
  }
};

/** Normalizes every DAO-thrown cause — the Edge Function's typed result or a transport failure —
 * into the typed `GenerationErrorCode` union so the UI never branches on a raw Supabase/function
 * error (@s15, task-13; mirrors `PdfExtractionService`'s `normalizeExtractionError`). */
const normalizeGenerationError = async (cause: unknown): Promise<Error & GenerationError> => {
  if (cause instanceof FunctionsHttpError)
    return toGenerationError(await readFunctionErrorCode(cause));
  if (cause instanceof FunctionsFetchError || cause instanceof FunctionsRelayError) {
    return toGenerationError('network_error');
  }
  return toGenerationError('generation_failed');
};

/**
 * Business layer that orchestrates generation via `LessonGenerationDao`, never Supabase/`fetch`
 * directly (`hooks-service-dao.mdc`): validates the caller + inputs, calls the DAO, and
 * normalizes any DAO-thrown cause into the typed `GenerationErrorCode` contract (@s15, task-13).
 */
export abstract class LessonGenerationService {
  static async generate(request: GenerateLessonRequest, userId: string): Promise<GeneratedLesson> {
    if (!userId) throw toGenerationError('unauthenticated');
    if (!request.documentId) throw toGenerationError('document_not_ready');

    try {
      return await LessonGenerationDao.generateLesson(request);
    } catch (cause) {
      throw await normalizeGenerationError(cause);
    }
  }
}
