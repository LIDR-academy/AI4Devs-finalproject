import { AnswerOption, Button, Card } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { gradeMultipleChoice } from '../../grading/grade-multiple-choice';
import { optionAccessibilityLabel, optionMarkerAt } from './multiple-choice.helpers';
import type { MultipleChoiceProps } from './multiple-choice.types';
import { useMultipleChoice } from './use-multiple-choice';

export type { MultipleChoiceProps } from './multiple-choice.types';

/**
 * MultipleChoice — activity organism. Owns selection + grading; reports via `onAnswered` once.
 */
export const MultipleChoice = ({
  slide,
  onAnswered,
  initialAnswer = null,
}: MultipleChoiceProps) => {
  const { t } = useLocalization();

  const labels = {
    submit: t('activity.mcq.submit'),
    correct: t('activity.mcq.correct'),
    incorrect: t('activity.mcq.incorrect'),
    explanationHeading: t('activity.mcq.explanation'),
    unavailable: t('activity.mcq.unavailable'),
  };

  const {
    setAnswer,
    selectedOptionId,
    setSelectedOptionId,
    isUnavailable,
    locked,
    canSubmit,
    isCorrect,
    resultLabel,
    stateForOption,
  } = useMultipleChoice({ slide, initialAnswer, labels });

  const handleSelect = (optionId: string) => {
    if (locked) return;
    setSelectedOptionId(optionId);
  };

  const handleSubmit = () => {
    if (locked || !selectedOptionId) return;
    const graded = gradeMultipleChoice(slide, selectedOptionId);
    setAnswer(graded);
    onAnswered?.(graded);
  };

  if (isUnavailable) {
    return (
      <Card style={styles.root}>
        <Text style={styles.question}>{labels.unavailable}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.root}>
      <Text style={styles.question}>{slide.content}</Text>
      <View style={styles.options}>
        {slide.options.map((option, index) => {
          const marker = optionMarkerAt(index);
          const state = stateForOption(option.id);
          return (
            <AnswerOption
              key={option.id}
              marker={marker}
              label={option.label}
              state={state}
              disabled={locked}
              accessibilityLabel={optionAccessibilityLabel(
                marker,
                option.label,
                state,
                labels.correct,
                labels.incorrect,
              )}
              onPress={() => handleSelect(option.id)}
            />
          );
        })}
      </View>
      {!locked ? (
        <Button disabled={!canSubmit} fullWidth onPress={handleSubmit}>
          {labels.submit}
        </Button>
      ) : null}
      {locked ? (
        <View
          accessibilityRole={isCorrect ? undefined : 'alert'}
          style={[styles.banner, isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
        >
          <Text
            style={styles.bannerText(isCorrect)}
            accessibilityLiveRegion={isCorrect ? 'polite' : 'assertive'}
          >
            {resultLabel}
          </Text>
        </View>
      ) : null}
      {locked && slide.explanation ? (
        <View style={styles.explanation}>
          <Text style={styles.explanationHeading}>{labels.explanationHeading}</Text>
          <Text style={styles.explanationBody}>{slide.explanation}</Text>
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
