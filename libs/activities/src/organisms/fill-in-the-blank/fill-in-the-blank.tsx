import { Button, Card, Icon } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Text, TextInput, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { gradeFillInTheBlank } from '../../grading/grade-fill-in-the-blank';
import type { FillInTheBlankProps } from './fill-in-the-blank.types';
import { useFillInTheBlank } from './use-fill-in-the-blank';

export type { FillInTheBlankProps } from './fill-in-the-blank.types';

/**
 * FillInTheBlank — activity organism. Owns value + grading; reports via `onAnswered` once.
 */
export const FillInTheBlank = ({
  slide,
  onAnswered,
  initialAnswer = null,
}: FillInTheBlankProps) => {
  const { t } = useLocalization();
  const { theme } = useUnistyles();

  const labels = {
    submit: t('activity.fillInTheBlank.submit'),
    correct: t('activity.fillInTheBlank.correct'),
    incorrect: t('activity.fillInTheBlank.incorrect'),
    explanationHeading: t('activity.fillInTheBlank.explanationHeading'),
    unavailable: t('activity.fillInTheBlank.unavailable'),
    blankInput: t('activity.fillInTheBlank.blankInput'),
  };

  const {
    value,
    setValue,
    answer,
    setAnswer,
    parts,
    locked,
    isUnavailable,
    maxLength,
    resultLabel,
  } = useFillInTheBlank({ slide, initialAnswer, labels });

  const handleSubmit = () => {
    if (answer || isUnavailable) return;
    const graded = gradeFillInTheBlank(slide, value);
    setAnswer(graded);
    onAnswered?.(graded);
  };

  if (isUnavailable || !parts) {
    return (
      <Card style={styles.root}>
        <Text style={styles.prompt}>{labels.unavailable}</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.root}>
      <View style={styles.promptRow}>
        {parts.before.length > 0 ? <Text style={styles.prompt}>{parts.before}</Text> : null}
        <TextInput
          accessibilityLabel={labels.blankInput}
          accessibilityState={{ disabled: locked }}
          value={value}
          maxLength={maxLength}
          editable={!locked}
          onChangeText={locked ? undefined : setValue}
          onSubmitEditing={locked ? undefined : handleSubmit}
          returnKeyType="done"
          style={styles.blank}
        />
        {parts.after.length > 0 ? <Text style={styles.prompt}>{parts.after}</Text> : null}
      </View>
      <Button disabled={locked} fullWidth onPress={locked ? undefined : handleSubmit}>
        {labels.submit}
      </Button>
      {answer ? (
        <View
          style={[styles.banner, answer.isCorrect ? styles.bannerCorrect : styles.bannerIncorrect]}
        >
          <View accessibilityRole={answer.isCorrect ? undefined : 'alert'} style={styles.bannerRow}>
            <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              <Icon
                name={answer.isCorrect ? 'check_circle' : 'cancel'}
                size={22}
                fill
                color={answer.isCorrect ? theme.colors.tertiary : theme.colors.error}
              />
            </View>
            <Text
              style={styles.bannerText(answer.isCorrect)}
              accessibilityLiveRegion={answer.isCorrect ? 'polite' : 'assertive'}
            >
              {resultLabel}
            </Text>
          </View>
          {!answer.isCorrect && answer.acceptedAnswerShown ? (
            <Text style={styles.bannerText(false)}>{answer.acceptedAnswerShown}</Text>
          ) : null}
        </View>
      ) : null}
      {answer && slide.explanation ? (
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
  promptRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: theme.spacing.s2,
  },
  prompt: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
  },
  blank: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.outline,
    minWidth: theme.spacing.s16,
    minHeight: theme.layout.touchTarget,
    paddingVertical: theme.spacing.s1,
  },
  banner: {
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
    gap: theme.spacing.s1,
  },
  bannerCorrect: {
    backgroundColor: theme.colors.tertiaryContainer,
  },
  bannerIncorrect: {
    backgroundColor: theme.colors.errorContainer,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s2,
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
