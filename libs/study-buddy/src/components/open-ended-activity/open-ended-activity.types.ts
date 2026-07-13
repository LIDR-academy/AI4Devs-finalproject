import type { OpenEndedAnswer, OpenEndedSlide } from '@helsoft/types';

export type OpenEndedActivityProps = {
  slide: OpenEndedSlide;
  onAnswered?: (answer: OpenEndedAnswer) => void;
};
