import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Card } from '../../atoms/card/card';
import { AnswerOption, AnswerOptionState } from '../../molecules/answer-option/answer-option';

export type MultipleChoiceOptionView = { id: string; label: string };

export type MultipleChoiceLabels = {
  /** Result banner when the answer is right. */
  correct: string;
  /** Result banner when the answer is wrong. */
  incorrect: string;
  /** Heading above the explanation. */
  explanationHeading: string;
  /** Empty/Error fallback notice. */
  unavailable: string;
};

export type MultipleChoiceProps = {
  question: string;
  options: MultipleChoiceOptionView[];
  correctOptionId: string;
  /** null/undefined = unanswered; set = answered/locked. */
  selectedOptionId?: string | null;
  explanation?: string;
  labels: MultipleChoiceLabels;
  onSelectOption: (optionId: string) => void;
};

const OPTION_MARKERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Per-option tile state, derived from the answered state and this option's role in it. */
const optionState = (
  optionId: string,
  correctOptionId: string,
  selectedOptionId?: string | null,
): AnswerOptionState => {
  if (!selectedOptionId) return 'default';
  if (optionId === correctOptionId) return 'correct';
  if (optionId === selectedOptionId) return 'incorrect';
  return 'default';
};

/**
 * MultipleChoice — presentational, controlled organism for a multiple-choice activity slide.
 * Renders the display derived entirely from props and reports selections up via
 * `onSelectOption`; owns no domain state (the study-buddy wrapper owns selection + grading).
 */
export const MultipleChoice = ({
  question,
  options,
  correctOptionId,
  selectedOptionId,
  explanation,
  labels,
  onSelectOption,
}: MultipleChoiceProps) => {
  const hasCorrectOption = options.some((option) => option.id === correctOptionId);
  const isUnavailable = !hasCorrectOption;
  const answered = !!selectedOptionId;
  const isCorrect = selectedOptionId === correctOptionId;
  const resultLabel = isCorrect ? labels.correct : labels.incorrect;

  // Announces the result to assistive tech the moment the learner answers (@s11, WCAG 4.1.3).
  // The banner's own accessibilityLiveRegion="assertive" (below) covers Android/Web only — same
  // urgency as LoginForm's error banner (login-form.tsx), since a graded result is important
  // feedback the learner needs announced immediately, not queued behind other speech. iOS
  // VoiceOver needs this imperative call fired directly on the transition (mirrors LoginForm's
  // isSubmitting/errorMessage effects).
  useEffect(() => {
    if (!isUnavailable && answered) {
      AccessibilityInfo.announceForAccessibility(resultLabel);
    }
  }, [isUnavailable, answered, resultLabel]);

  if (isUnavailable) {
    return (
      <Card style={styles.root}>
        <Text style={styles.question}>{labels.unavailable}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.root}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.options}>
        {options.map((option, index) => (
          <AnswerOption
            key={option.id}
            marker={OPTION_MARKERS[index]}
            label={option.label}
            state={optionState(option.id, correctOptionId, selectedOptionId)}
            disabled={answered}
            onPress={() => onSelectOption(option.id)}
          />
        ))}
      </View>
      {answered ? (
        <View
          accessibilityRole="alert"
          style={[styles.banner, isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
        >
          <Text style={styles.bannerText(isCorrect)} accessibilityLiveRegion="assertive">
            {resultLabel}
          </Text>
        </View>
      ) : null}
      {answered && explanation ? (
        <View style={styles.explanation}>
          <Text style={styles.explanationHeading}>{labels.explanationHeading}</Text>
          <Text style={styles.explanationBody}>{explanation}</Text>
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s4,
  },
  question: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
  },
  options: {
    gap: theme.spacing.s3,
  },
  banner: {
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
  },
  bannerCorrect: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  bannerIncorrect: {
    backgroundColor: theme.colors.errorContainer,
  },
  bannerText: (isCorrect: boolean) => ({
    ...theme.typography.bodyMedium,
    color: isCorrect ? theme.colors.onTertiaryContainer : theme.colors.onErrorContainer,
  }),
  explanation: {
    gap: theme.spacing.s1,
  },
  explanationHeading: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurfaceVariant,
  },
  explanationBody: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
  },
}));
