export type GenerationProgressStepStatus = 'upcoming' | 'current' | 'done';

export type GenerationProgressStepItem = {
  label: string;
};

export type GenerationProgressProps = {
  steps: GenerationProgressStepItem[];
  /** Index of the step currently in progress. Every earlier index renders done; every later
   * index renders upcoming (@s14). */
  currentIndex: number;
  /** The localized word appended to each step's accessibility label per status (e.g.
   * `"Reading content, done"`) — built by the wiring layer (`LessonGenerationPanel`) from
   * `t('generation.step.status.*')`, mirroring how `step.label` itself is already localized
   * upstream. This molecule stays i18n-free and never hardcodes these words itself (review.md
   * round-1 finding #1). */
  statusLabels: Record<GenerationProgressStepStatus, string>;
};
