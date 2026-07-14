// Mirrors libs/types/src/lesson-generation.ts + the SlideImageRef/Slide additions in
// libs/types/src/lesson.ts -- Deno can't import the workspace package, so this file is kept
// manually in sync with those two by hand (task-2/task-4 note, same rule as R1's
// pdf-extraction/_shared/types.ts).

export type LessonComposition = 'instructional-only' | 'activity-only' | 'both';

export type GenerateLessonRequest = {
  documentId: string;
  composition: LessonComposition;
};

export type SlideImageRef = {
  imageId: string;
  storagePath: string;
  width: number;
  height: number;
  alt?: string;
};

type SlideBase = {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  position: number;
  image?: SlideImageRef;
};

export type InstructionalSlide = SlideBase & { kind: 'instructional' };

export type MultipleChoiceOption = { id: string; label: string };

export type MultipleChoiceSlide = SlideBase & {
  kind: 'activity';
  activityType: 'multiple-choice';
  options: MultipleChoiceOption[];
  correctOptionId: string;
  explanation?: string;
};

export type MatchingItem = { id: string; label: string };
export type MatchingPair = { leftId: string; rightId: string };

export type MatchingSlide = SlideBase & {
  kind: 'activity';
  activityType: 'matching';
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  correctPairs: MatchingPair[];
  explanation?: string;
};

export type FillInTheBlankSlide = SlideBase & {
  kind: 'activity';
  activityType: 'fill-in-the-blank';
  acceptedAnswers: string[];
  explanation?: string;
};

export type OpenEndedSlide = SlideBase & {
  kind: 'activity';
  activityType: 'open-ended';
  modelAnswer: string;
  explanation?: string;
};

export type FlashcardSlide = SlideBase & {
  kind: 'activity';
  activityType: 'flashcard';
  back: string;
  explanation?: string;
};

export type ActivitySlide =
  | MultipleChoiceSlide
  | MatchingSlide
  | FillInTheBlankSlide
  | OpenEndedSlide
  | FlashcardSlide;

export type Slide = InstructionalSlide | ActivitySlide;

export type GeneratedLesson = {
  lessonId: string;
  title: string;
  composition: LessonComposition;
  slides: Slide[];
};

export type GenerationProgressStep = 'reading' | 'generating' | 'attaching';

export type GenerationErrorCode =
  | 'missing_key'
  | 'invalid_key'
  | 'rate_limited'
  | 'timeout'
  | 'generation_failed'
  | 'document_not_ready'
  | 'network_error'
  | 'unauthenticated'
  | 'persist_failed';

/** Mirrors the client-side `GenerationError` shape (`{ code }`) -- the Edge Function's own wire
 * response body uses `{ errorCode }` object literals directly (matching extract-pdf/
 * manage-api-key's convention), not this type. */
export type GenerationError = {
  code: GenerationErrorCode;
};
