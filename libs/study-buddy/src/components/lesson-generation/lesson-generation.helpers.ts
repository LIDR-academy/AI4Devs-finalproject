import type { LessonGenerationPanelState } from '@helsoft/components';
import type { LessonGenerationStage } from '@helsoft/hooks';
import type { LessonComposition } from '@helsoft/types';

/** Narrow runtime guard: `LessonGenerationPanel.onCompositionChange` hands back a plain string
 * (RadioGroup's own contract) — only forward it to `setComposition` when it is actually a member
 * of the closed `LessonComposition` union (mirrors `LanguageSettings`'s `isSupportedLocale` guard). */
export const isLessonComposition = (value: string): value is LessonComposition =>
  value === 'instructional-only' || value === 'activity-only' || value === 'both';

/** Maps `useLessonGeneration()`'s stage to `LessonGenerationPanel`'s state (@s14/@s16/@s17).
 * Slice-1 scope: the panel has no Error state yet (task-13 adds it) — `error` falls back to
 * `empty` rather than an unhandled state. */
export const toPanelState = (stage: LessonGenerationStage): LessonGenerationPanelState =>
  stage === 'generating' ? 'loading' : stage === 'content' ? 'content' : 'empty';
