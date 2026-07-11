import { useState } from 'react';
import { MultipleChoice, MultipleChoiceLabels } from '@helsoft/activities';
import { useLocalization } from '@helsoft/localization';
import type { MultipleChoiceAnswer, MultipleChoiceSlide } from '@helsoft/types';

import { gradeMultipleChoice } from '../../grading/grade-multiple-choice';

export type MultipleChoiceActivityProps = {
  slide: MultipleChoiceSlide;
  onAnswered?: (answer: MultipleChoiceAnswer) => void;
};

/**
 * MultipleChoiceActivity — feature wiring for a multiple-choice activity slide. Owns the
 * local selection state, grades the first selection, and reports it up via `onAnswered`
 * exactly once. Mirrors the LoginForm (presentational) / SignInForm (wiring) precedent.
 */
export const MultipleChoiceActivity = ({ slide, onAnswered }: MultipleChoiceActivityProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const { t } = useLocalization();

  // Only the UI chrome is localized (@s10) — question/option/explanation text is AI-generated
  // slide content, not translated (see spec.md's i18n Open decision).
  const labels: MultipleChoiceLabels = {
    correct: t('activity.mcq.correct'),
    incorrect: t('activity.mcq.incorrect'),
    // `explanationHeading` deliberately maps to the `activity.mcq.explanation` key (not
    // `.explanationHeading`) — the i18n key names the *concept* (the explanation), the prop
    // names its *role* on `MultipleChoiceLabels` (the heading above the explanation body).
    explanationHeading: t('activity.mcq.explanation'),
    unavailable: t('activity.mcq.unavailable'),
  };

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
      labels={labels}
      onSelectOption={handleSelect}
    />
  );
};
