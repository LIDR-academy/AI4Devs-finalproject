

export type MatchingItemView = { id: string; label: string };
/** A learner-formed pair before submit. */
export type MatchingPairSelection = { leftId: string; rightId: string };
/** A graded pair, supplied post-submit to drive the result display. */
export type MatchingResultPair = { leftId: string; rightId: string; isCorrect: boolean };
/** Visual state for a column item. `undefined` = unpaired default (avoids a dead 'default' string). */
export type ItemVisualState = 'pending' | 'paired' | 'correct' | 'incorrect' | undefined;

export type PendingSelection = { column: 'left' | 'right'; id: string } | null;

export type MatchingResult = {
  pairs: MatchingResultPair[];
  isCorrect: boolean;
  summary: string;
};

export type MatchingLabels = {
  submit: string;
  correct: string;
  incorrect: string;
  correctPair: string;
  incorrectPair: string;
  explanationHeading: string;
  unavailable: string;
};

export type MatchingProps = {
  prompt: string;
  leftItems: MatchingItemView[];
  rightItems: MatchingItemView[];
  /** Forces the unavailable (Error) state — set by the wrapper when the slide's correctPairs are malformed. */
  unavailable?: boolean;
  /** Optional seed for Storybook / demos — paints formed pairs before any taps. */
  initialPairs?: MatchingPairSelection[];
  /** Set once graded → locks the activity and drives the per-pair result display. */
  result?: MatchingResult | null;
  explanation?: string;
  labels: MatchingLabels;
  onSubmit: (pairs: MatchingPairSelection[]) => void;
};

export type UseMatchingProps = {
  leftItems: MatchingItemView[];
  rightItems: MatchingItemView[];
  unavailable?: boolean;
  initialPairs?: MatchingPairSelection[];
  result?: MatchingResult | null;
  labels: MatchingLabels;
};