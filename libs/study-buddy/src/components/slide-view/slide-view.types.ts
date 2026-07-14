import type { ActivityAnswer, ActivitySlide, Slide } from '@helsoft/types';

export type SlideViewProps = {
  slide: Slide;
  onAnswered?: (answer: ActivityAnswer) => void;
  /** Prior in-session answer for this slide — rehydrates the activity organism. */
  initialAnswer?: ActivityAnswer;
};

export type ActivityBodyProps = {
  slide: ActivitySlide;
  onAnswered?: (answer: ActivityAnswer) => void;
  initialAnswer?: ActivityAnswer;
};
