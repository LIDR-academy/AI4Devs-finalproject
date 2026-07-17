import type { AnswerOptionState } from '@helsoft/components';
import type { MultipleChoiceSlide } from '@helsoft/types';

export const OPTION_MARKERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const hasCorrectOption = (slide: MultipleChoiceSlide): boolean =>
  slide.options.some((option) => option.id === slide.correctOptionId);

export const optionState = (
  optionId: string,
  correctOptionId: string,
  selectedOptionId?: string | null,
  answered = false,
): AnswerOptionState => {
  if (!selectedOptionId) return 'default';
  if (!answered) {
    return optionId === selectedOptionId ? 'selected' : 'default';
  }
  if (optionId === correctOptionId) return 'correct';
  if (optionId === selectedOptionId) return 'incorrect';
  return 'default';
};

export const optionAccessibilityLabel = (
  marker: string,
  optionLabel: string,
  state: AnswerOptionState,
  correctLabel: string,
  incorrectLabel: string,
): string | undefined => {
  if (state === 'correct') return `${marker} ${optionLabel}, ${correctLabel}`;
  if (state === 'incorrect') return `${marker} ${optionLabel}, ${incorrectLabel}`;
  return undefined;
};

export const optionMarkerAt = (index: number): string => OPTION_MARKERS[index] ?? '';
