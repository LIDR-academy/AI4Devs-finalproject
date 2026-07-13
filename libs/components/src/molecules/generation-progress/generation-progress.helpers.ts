import type { GenerationProgressStepStatus } from './generation-progress.types';

/** Maps a step's index against the current index to its visual/announced status
 * (@s14 — upcoming / current / done, not a bare spinner or percentage). */
export const getStepStatus = (
  index: number,
  currentIndex: number,
): GenerationProgressStepStatus => {
  if (index < currentIndex) return 'done';
  if (index === currentIndex) return 'current';
  return 'upcoming';
};
