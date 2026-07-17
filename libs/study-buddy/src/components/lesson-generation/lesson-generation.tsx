import { LessonGenerationPanel } from '@helsoft/components';
import { useLessonGeneration } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import type { LessonComposition } from '@helsoft/types';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  GENERATION_ERROR_ACTION_LABEL_KEYS,
  GENERATION_ERROR_KEYS,
  GENERATION_ERROR_RECOVERY,
  isLessonComposition,
  toPanelState,
} from './lesson-generation.helpers';
import type { LessonGenerationProps } from './lesson-generation.types';

/**
 * LessonGeneration — feature component that puts the composition picker on the upload screen
 * (spec.md decision #3) and drives generation. Owns composition state (default `both`), calls
 * `useLessonGeneration`, receives the extracted `documentId` as a prop (decision #9), and hands
 * the returned deck to the player entry point (placeholder nav until R4). Chrome copy (picker
 * labels, Generate, progress steps, ready summary) is owned by the presentational
 * `LessonGenerationPanel` itself (mirrors `LanguageSettings`'s precedent); the Error state's
 * per-code message + recovery affordance (task-13, @s15) is the one thing this wiring layer
 * translates and dispatches, mirroring `pdf-upload.tsx`'s `UPLOAD_ERROR_KEYS` pattern.
 *
 * `onGenerated` (pending-pdfs-generate decision #5) is additive/optional: fires once when
 * generation reaches Content/ready with a persisted lessonId, so a sibling (`PdfDocuments`)
 * can refetch without owning the generation lifecycle.
 */
export const LessonGeneration = ({ documentId, onGenerated }: LessonGenerationProps) => {
  const [composition, setComposition] = useState<LessonComposition>('both');
  const { stage, currentStep, result, error, generate, retry } = useLessonGeneration();
  const { t } = useLocalization();
  const router = useRouter();
  const lastAnnouncedLessonId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const lessonId = result?.lessonId?.trim();
    if (!lessonId || lessonId === lastAnnouncedLessonId.current) return;
    lastAnnouncedLessonId.current = lessonId;
    onGenerated?.();
  }, [result?.lessonId, onGenerated]);

  // review.md round-1 finding #7 (minor) — stable callback identities across re-renders (a
  // perf-only refactor, no behavior change).
  const handleGenerate = useCallback(() => {
    if (!documentId) return;
    void generate({ documentId, composition });
  }, [documentId, composition, generate]);

  const handleOpenInPlayer = useCallback(() => {
    const lessonId = result?.lessonId?.trim();
    if (!lessonId) return;
    router.push({ pathname: '/lesson/[id]/player', params: { id: lessonId } });
  }, [result, router]);

  const recovery = error ? GENERATION_ERROR_RECOVERY[error] : 'none';

  const handleErrorAction = useCallback(() => {
    if (recovery === 'retry') void retry();
    else if (recovery === 'settings') router.push('/settings');
    else if (recovery === 'signIn') router.push('/login');
  }, [recovery, retry, router]);

  const handleCompositionChange = useCallback((value: string) => {
    if (isLessonComposition(value)) setComposition(value);
  }, []);

  return (
    <LessonGenerationPanel
      state={toPanelState(stage)}
      composition={composition}
      onCompositionChange={handleCompositionChange}
      canGenerate={!!documentId}
      onGenerate={handleGenerate}
      currentStep={currentStep}
      slideCount={result?.slides.length}
      onOpenInPlayer={handleOpenInPlayer}
      errorMessage={error ? t(GENERATION_ERROR_KEYS[error]) : undefined}
      errorActionLabel={
        recovery === 'none' ? undefined : t(GENERATION_ERROR_ACTION_LABEL_KEYS[recovery])
      }
      onErrorAction={handleErrorAction}
    />
  );
};
