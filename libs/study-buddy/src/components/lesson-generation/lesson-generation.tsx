import { LessonGenerationPanel } from '@helsoft/components';
import { useLessonGeneration } from '@helsoft/hooks';
import type { LessonComposition } from '@helsoft/types';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { isLessonComposition, toPanelState } from './lesson-generation.helpers';
import type { LessonGenerationProps } from './lesson-generation.types';

/**
 * LessonGeneration — feature component that puts the composition picker on the upload screen
 * (spec.md decision #3) and drives generation. Owns composition state (default `both`), calls
 * `useLessonGeneration`, receives the extracted `documentId` as a prop (decision #9), and hands
 * the returned deck to the player entry point (placeholder nav until R4). Chrome copy (picker
 * labels, Generate, progress steps, ready summary) is owned by the presentational
 * `LessonGenerationPanel` itself (mirrors `LanguageSettings`'s precedent), so there is nothing
 * left for this wiring layer to translate.
 */
export const LessonGeneration = ({ documentId }: LessonGenerationProps) => {
  const [composition, setComposition] = useState<LessonComposition>('both');
  const { stage, currentStep, result, generate } = useLessonGeneration();
  const router = useRouter();

  const handleGenerate = () => {
    if (!documentId) return;
    void generate({ documentId, composition });
  };

  const handleOpenInPlayer = () => {
    if (!result) return;
    router.push({ pathname: '/lesson/[id]/player', params: { id: result.lessonId } });
  };

  return (
    <LessonGenerationPanel
      state={toPanelState(stage)}
      composition={composition}
      onCompositionChange={(value) => {
        if (isLessonComposition(value)) setComposition(value);
      }}
      canGenerate={!!documentId}
      onGenerate={handleGenerate}
      currentStep={currentStep}
      slideCount={result?.slides.length}
      onOpenInPlayer={handleOpenInPlayer}
    />
  );
};
