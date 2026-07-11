import type { MatchingAnswer, MatchingSlide } from '@helsoft/types';

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
  slide: MatchingSlide;
  onAnswered?: (answer: MatchingAnswer) => void;
  /** Pre-graded answer (Storybook demos / resume). */
  initialAnswer?: MatchingAnswer | null;
  /** Optional seed for Storybook / demos — paints formed pairs before any taps. */
  initialPairs?: MatchingPairSelection[];
};

export type UseMatchingProps = {
  leftItems: MatchingItemView[];
  rightItems: MatchingItemView[];
  unavailable?: boolean;
  initialPairs?: MatchingPairSelection[];
  result?: MatchingResult | null;
  labels: MatchingLabels;
};
