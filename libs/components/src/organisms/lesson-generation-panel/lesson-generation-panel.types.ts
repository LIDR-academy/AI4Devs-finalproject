import type { GenerationProgressStep, LessonComposition } from '@helsoft/types';

export type LessonGenerationPanelState = 'empty' | 'loading' | 'content';

export type LessonGenerationPanelProps = {
  state: LessonGenerationPanelState;
  /** The selected composition — 'both' is pre-selected by the wiring layer (@s1). */
  composition: LessonComposition;
  /** RadioGroup's own contract is a plain string; the wiring layer narrows it back to
   * `LessonComposition` (spec.md's picker note). */
  onCompositionChange: (value: string) => void;
  /** Generate is disabled until an extracted document is available (@s16). */
  canGenerate: boolean;
  onGenerate: () => void;
  /** Loading-state current step (@s14) — undefined outside the Loading state. */
  currentStep?: GenerationProgressStep;
  /** Content-state summary — the generated deck's slide count (@s17). */
  slideCount?: number;
  /** Content-state primary CTA (@s17). */
  onOpenInPlayer?: () => void;
};
