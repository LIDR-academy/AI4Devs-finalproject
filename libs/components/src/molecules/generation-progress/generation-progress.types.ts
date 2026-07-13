export type GenerationProgressStepStatus = 'upcoming' | 'current' | 'done';

export type GenerationProgressStepItem = {
  label: string;
};

export type GenerationProgressProps = {
  steps: GenerationProgressStepItem[];
  /** Index of the step currently in progress. Every earlier index renders done; every later
   * index renders upcoming (@s14). */
  currentIndex: number;
};
