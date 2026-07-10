export type SlideKind = 'instructional' | 'activity';

/** Only 'multiple-choice' is defined so far; sibling activity types extend this union later. */
export type ActivityType = 'multiple-choice' | 'fill-in-the-blank' | 'flashcard' | 'open-ended' | 'matching';

type SlideBase = {
  id: string;
  lessonId: string;
  title: string;
  /** For an activity slide, `content` holds the question prompt. */
  content: string;
  position: number;
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

export type ActivitySlide = MultipleChoiceSlide; // union grows as sibling stories land
export type Slide = InstructionalSlide | ActivitySlide;

export type Lesson = {
  id: string;
  userId: string;
  title: string;
  slides: Slide[];
  createdAt: string;
};
