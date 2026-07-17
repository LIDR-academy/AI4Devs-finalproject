import {
  GENERATION_PROGRESS_STEPS,
  type GenerationProgressStep,
  type LessonComposition,
} from '@helsoft/types';

/** The three composition values, in the order the picker shows them (@s1 — the gherkin scenario
 * itself lists "instructional only", "activity only", then "both"). */
export const COMPOSITION_OPTION_VALUES: LessonComposition[] = [
  'instructional-only',
  'activity-only',
  'both',
];

/** Maps the hook's `currentStep` to `GenerationProgress`'s `currentIndex` prop (@s14) — defaults
 * to the first step when none is given (e.g. before the Loading state is ever reached). Imports
 * the canonical order from `@helsoft/types` rather than hardcoding an independent copy (review.md
 * round-1 finding #4 — `@helsoft/components` can't depend on `@helsoft/hooks`, so this is the
 * shared ancestor both layers can import from). */
export const stepToIndex = (step: GenerationProgressStep | undefined): number => {
  const index = step
    ? (GENERATION_PROGRESS_STEPS as readonly GenerationProgressStep[]).indexOf(step)
    : 0;
  return index === -1 ? 0 : index;
};
