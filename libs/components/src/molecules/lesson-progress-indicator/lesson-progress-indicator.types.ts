import type { SlideProgressSlide } from '../slide-progress/slide-progress';

export type LessonProgressIndicatorProps = {
  /** Content slides (instructional → `lesson`, activity → `activity`). No results segment. */
  slides: SlideProgressSlide[];
  /** 0-based current step. Results = `slides.length` (all segments done). */
  current: number;
  /** Localized "slide X of N" label (caller resolves via t()). */
  label: string;
  /** Optional seek — when set, segments are tappable. */
  onSeek?: (index: number) => void;
};
