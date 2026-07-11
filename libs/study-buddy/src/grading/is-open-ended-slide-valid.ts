import type { OpenEndedSlide } from '@helsoft/types';

/** True iff trimmed content (prompt) and trimmed modelAnswer are both non-empty. */
export const isOpenEndedSlideValid = (slide: OpenEndedSlide): boolean =>
  slide.content.trim().length > 0 && slide.modelAnswer.trim().length > 0;
