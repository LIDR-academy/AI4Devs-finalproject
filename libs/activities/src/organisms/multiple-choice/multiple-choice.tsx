import { useEffect } from 'react';
import { AccessibilityInfo, Platform, Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AnswerOption, AnswerOptionState, Card } from '@helsoft/components';

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
 * An option's accessible name, once graded, conveys correctness through wording (not the
 * feedback icon's literal ligature, e.g. "check_circle"/"cancel") — `undefined` while
 * unanswered/unaffected so `AnswerOption` falls back to its own default "{marker} {label}" name.
 */
const optionAccessibilityLabel = (
  marker: string,
  optionLabel: string,
  state: AnswerOptionState,
  labels: MultipleChoiceLabels,
): string | undefined => {
  if (state === 'correct') return `${marker} ${optionLabel}, ${labels.correct}`;
  if (state === 'incorrect') return `${marker} ${optionLabel}, ${labels.incorrect}`;
  return undefined;
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
  // RN's own accessibilityLiveRegion doc is explicit that it "Works for Android API >= 19 only"
  // (@platform android — react-native's ViewAccessibility.js) — it is a no-op on iOS, so this
  // imperative AccessibilityInfo call is the *only* mechanism that reaches iOS VoiceOver (and web).
  // On Android, the banner's own accessibilityLiveRegion (below) already announces the result, so
  // firing the imperative call there too risks a duplicate TalkBack announcement (Full-review
  // Round 2, m4) — skip it there and rely on the live region alone.
  useEffect(() => {
    if (!isUnavailable && answered && Platform.OS !== 'android') {
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
        {options.map((option, index) => {
          const marker = OPTION_MARKERS[index];
          const state = optionState(option.id, correctOptionId, selectedOptionId);
          return (
            <AnswerOption
              key={option.id}
              marker={marker}
              label={option.label}
              state={state}
              disabled={answered}
              accessibilityLabel={optionAccessibilityLabel(marker, option.label, state, labels)}
              onPress={() => onSelectOption(option.id)}
            />
          );
        })}
      </View>
      {answered ? (
        <View
          accessibilityRole={isCorrect ? undefined : 'alert'}
          style={[styles.banner, isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
        >
          <Text style={styles.bannerText(isCorrect)} accessibilityLiveRegion={isCorrect ? 'polite' : 'assertive'}>
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
