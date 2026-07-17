export type SlideKind = 'instructional' | 'activity';

/**
 * A reference to a persisted R1 image (`document_images.id` + `storage_path` + dimensions) —
 * never the image bytes (ai-lesson-generation @s11). R4 resolves a short-lived signed URL from
 * `storagePath` at render time; a missing/unresolvable ref degrades to text-only (@s12).
 */
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
  /** For an activity slide, `content` holds the question prompt. */
  content: string;
  position: number;
  /** Present only when generation attached a relevant image (@s9/@s11); omitted entirely for a
   * text-only slide — any slide kind may carry one. */
  image?: SlideImageRef;
};

export type InstructionalSlide = SlideBase & { kind: 'instructional' };

export type MultipleChoiceOption = {
  /** Stable id used to reference the chosen/correct option (persist-friendly for resume). */
  id: string;
  label: string;
};

export type MultipleChoiceSlide = SlideBase & {
  kind: 'activity';
  activityType: 'multiple-choice';
  options: MultipleChoiceOption[];
  /** id of the single correct option; must match one of `options[].id`. */
  correctOptionId: string;
  /** Optional teaching note shown with the result. */
  explanation?: string;
};

export type MatchingItem = {
  /** Stable id used to reference the item in the correct pairing and the answered state (persist-friendly for R9). */
  id: string;
  label: string;
};

/** One correct correspondence: a left item id ↔ a right item id. Left↔right only (cross-column). */
export type MatchingPair = {
  leftId: string; // references one leftItems[].id
  rightId: string; // references one rightItems[].id
};

export type MatchingSlide = SlideBase & {
  kind: 'activity';
  activityType: 'matching';
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  /**
   * The correct pairing — exactly one pair per left item (a perfect matching).
   * Invariant: leftItems.length === rightItems.length === correctPairs.length,
   * and every leftId/rightId references a distinct item in its column.
   */
  correctPairs: MatchingPair[];
  /** Optional teaching note shown with the results. */
  explanation?: string;
};

export type FillInTheBlankSlide = SlideBase & {
  kind: 'activity';
  activityType: 'fill-in-the-blank';
  /**
   * Prompt with exactly one blank marker `____` (four underscores), replaced by the
   * inline TextInput at render (e.g. "The capital is ____").
   */
  // content inherited from SlideBase
  /** Non-empty when valid; any normalized match counts as correct. */
  acceptedAnswers: string[];
  /** Optional teaching note shown with the result. */
  explanation?: string;
};

export type OpenEndedSlide = SlideBase & {
  kind: 'activity';
  activityType: 'open-ended';
  // content = prompt (SlideBase)
  /** Non-empty when valid; revealed after submit for learner comparison. */
  modelAnswer: string;
  explanation?: string;
};

export type FlashcardSlide = SlideBase & {
  kind: 'activity';
  activityType: 'flashcard';
  // Front/prompt = SlideBase.content (same convention as the other activity types).
  /** The answer revealed on the back of the card. */
  back: string;
  /** Optional teaching note shown alongside the answer once revealed. */
  explanation?: string;
};

export type ActivitySlide =
  | MultipleChoiceSlide
  | MatchingSlide
  | FillInTheBlankSlide
  | OpenEndedSlide
  | FlashcardSlide;
export type Slide = InstructionalSlide | ActivitySlide;

export type Lesson = {
  id: string;
  userId: string;
  title: string;
  slides: Slide[];
  createdAt: string;
};
