import type { Slide } from './lesson';

/**
 * The three compositions a learner may pick for a generated lesson (spec.md's Composition
 * picker, @s1/@s2). The default `both` is enforced in the UI/wiring layer, not this type.
 */
export type LessonComposition = 'instructional-only' | 'activity-only' | 'both';

/**
 * The only thing the client ever sends to the `generate-lesson` Edge Function (@s6, spec.md
 * architecture note) — the function reads the (potentially large) extracted text + image rows
 * itself by `documentId`; the client never re-sends content.
 */
export type GenerateLessonRequest = {
  documentId: string;
  composition: LessonComposition;
};

/**
 * The in-memory deck generation resolves with (spec.md Open decision #5) — no `lessons` row is
 * written; `lessonId` is the forward-compatible handle R5 will later adopt as its PK.
 */
export type GeneratedLesson = {
  lessonId: string;
  title: string;
  composition: LessonComposition;
  slides: Slide[];
};

/**
 * The fixed, ordered phase list `useLessonGeneration` advances `currentStep` through while the
 * single `functions.invoke` call is in flight (@s14, spec.md "Progress model") — mirrors the
 * real server pipeline order so a later server-driven upgrade is non-breaking.
 */
export type GenerationProgressStep = 'reading' | 'generating' | 'attaching';

/**
 * The single source of truth for `GenerationProgressStep`'s order (review.md round-1 finding
 * #4) — `useLessonGeneration` (the stepper) and `LessonGenerationPanel`'s helpers (the
 * `currentStep` -> `GenerationProgress`'s `currentIndex` mapping) both import this instead of
 * each hardcoding an independent copy, so a future 4th step can't desync between the two.
 */
export const GENERATION_PROGRESS_STEPS = [
  'reading',
  'generating',
  'attaching',
] as const satisfies readonly GenerationProgressStep[];

/**
 * The closed set of failure codes every generation failure — server result or client transport —
 * normalizes to (spec.md's Error contract table), so the UI never branches on a raw Supabase/
 * function/provider error (mirrors `PdfExtractionErrorCode`).
 */
export type GenerationErrorCode =
  | 'missing_key'
  | 'invalid_key'
  | 'rate_limited'
  | 'timeout'
  | 'generation_failed'
  | 'document_not_ready'
  | 'network_error'
  | 'unauthenticated';

/** The minimal shape a normalized generation failure carries upward from
 * `LessonGenerationService` (mirrors `PdfExtractionError`/`ApiKeyError`). */
export type GenerationError = {
  code: GenerationErrorCode;
};
