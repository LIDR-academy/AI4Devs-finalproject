import type {
  GeneratedLesson,
  GenerateLessonRequest,
  GenerationError,
  GenerationErrorCode,
} from '@helsoft/types';

import { LessonGenerationDao } from '../dao/lesson-generation.dao';
import { toTypedError } from '../utils/typed-error';

/** Single source for the typed-error shape (mirrors `PdfExtractionService`'s
 * `toExtractionError`) — shared with task-11/task-12's error-contract normalization. */
export const toGenerationError = (code: GenerationErrorCode): Error & GenerationError =>
  toTypedError(code, `LessonGenerationService: ${code}`);

/**
 * Business layer that orchestrates generation via `LessonGenerationDao`, never Supabase/`fetch`
 * directly (`hooks-service-dao.mdc`). Slice-1 scope is the happy path: validate the caller +
 * inputs, call the DAO, return the typed deck. Error normalization into the full
 * `GenerationErrorCode` contract is task-11/task-12.
 */
export abstract class LessonGenerationService {
  static async generate(request: GenerateLessonRequest, userId: string): Promise<GeneratedLesson> {
    if (!userId) throw toGenerationError('unauthenticated');
    if (!request.documentId) throw toGenerationError('document_not_ready');
    return LessonGenerationDao.generateLesson(request);
  }
}
