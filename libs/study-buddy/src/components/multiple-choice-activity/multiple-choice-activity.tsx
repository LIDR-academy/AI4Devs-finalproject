import { useState } from 'react';
import { MultipleChoice, MultipleChoiceLabels } from '@helsoft/components';
import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

import { gradeMultipleChoice } from '../../grading/grade-multiple-choice';

export type MultipleChoiceActivityProps = {
  slide: MultipleChoiceSlide;
  onAnswered?: (answer: MultipleChoiceAnswer) => void;
};

// Placeholder chrome copy — task-6 replaces this with @helsoft/localization's t('activity.mcq.*').
const LABELS: MultipleChoiceLabels = {
  correct: 'Correct!',
  incorrect: 'Not quite.',
  explanationHeading: 'Why',
  unavailable: 'This activity is unavailable.',
};

/**
 * MultipleChoiceActivity — feature wiring for a multiple-choice activity slide. Owns the
 * local selection state, grades the first selection, and reports it up via `onAnswered`
 * exactly once. Mirrors the LoginForm (presentational) / SignInForm (wiring) precedent.
 */
export const MultipleChoiceActivity = ({ slide, onAnswered }: MultipleChoiceActivityProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  const handleSelect = (optionId: string) => {
    if (selectedOptionId) return; // locked — no re-selection (@s6)
    setSelectedOptionId(optionId);
    onAnswered?.(gradeMultipleChoice(slide, optionId));
  };

  return (
    <MultipleChoice
      question={slide.content}
      options={slide.options}
      correctOptionId={slide.correctOptionId}
      selectedOptionId={selectedOptionId}
      explanation={slide.explanation}
      labels={LABELS}
      onSelectOption={handleSelect}
    />
  );
};
