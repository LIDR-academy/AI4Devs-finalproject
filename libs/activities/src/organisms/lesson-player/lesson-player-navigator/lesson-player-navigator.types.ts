import type { SlideProgressSlide } from '@helsoft/components';

export type LessonPlayerNavigatorProps = {
  /** Content slides for the segmented progress indicator (no results segment). */
  slides: SlideProgressSlide[];
  /** 0-based current step. Results = `slides.length`. */
  current: number;
  /** Localized "slide X of N" label (caller resolves via t()). */
  label: string;
  canGoBack: boolean;
  canGoNext: boolean;
  onBack: () => void;
  onNext: () => void;
};
