import type { GenerationProgressStep, LessonComposition } from '@helsoft/types';

/** The three composition values, in the order the picker shows them (@s1 — the gherkin scenario
 * itself lists "instructional only", "activity only", then "both"). */
export const COMPOSITION_OPTION_VALUES: LessonComposition[] = [
  'instructional-only',
  'activity-only',
  'both',
];

const STEP_ORDER: GenerationProgressStep[] = ['reading', 'generating', 'attaching'];

/** Maps the hook's `currentStep` to `GenerationProgress`'s `currentIndex` prop (@s14) — defaults
 * to the first step when none is given (e.g. before the Loading state is ever reached). */
export const stepToIndex = (step: GenerationProgressStep | undefined): number => {
  const index = step ? STEP_ORDER.indexOf(step) : 0;
  return index === -1 ? 0 : index;
};
