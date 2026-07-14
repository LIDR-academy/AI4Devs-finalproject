import type { OpenEndedAnswer, OpenEndedSlide } from '@helsoft/types';

export type OpenEndedActivityProps = {
  slide: OpenEndedSlide;
  onAnswered?: (answer: OpenEndedAnswer) => void;
  /** Prior in-session answer — mapped to organism `initialSubmittedAnswer`. */
  initialAnswer?: OpenEndedAnswer | null;
};
