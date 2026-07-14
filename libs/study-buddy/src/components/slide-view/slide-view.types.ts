import type { ActivityAnswer, ActivitySlide, Slide } from '@helsoft/types';

export type SlideViewProps = {
  slide: Slide;
  onAnswered?: (answer: ActivityAnswer) => void;
};

export type ActivityBodyProps = {
  slide: ActivitySlide;
  onAnswered?: (answer: ActivityAnswer) => void;
};
