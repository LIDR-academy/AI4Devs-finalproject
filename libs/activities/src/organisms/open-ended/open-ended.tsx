import { Button, Card, TextField } from '@helsoft/components';
import { useLocalization } from '@helsoft/localization';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { shouldShowExplanation, shouldShowLearnerAnswerBody } from './open-ended.helpers';
import type { OpenEndedProps } from './open-ended.types';
import { useOpenEnded } from './use-open-ended';

export type { OpenEndedProps } from './open-ended.types';

/**
 * OpenEnded — presentational activity organism.
 * Owns draft/lock via use-open-ended; reports via `onSubmit` once. No grader.
 */
export const OpenEnded = ({
  prompt,
  modelAnswer,
  explanation,
  unavailable = false,
  initialSubmittedAnswer = null,
  maxLength,
  onSubmit,
}: OpenEndedProps) => {
  const { t } = useLocalization();
  const { draft, setDraft, submitted, setSubmitted, locked, isUnavailable } = useOpenEnded({
    initialSubmittedAnswer,
    unavailable,
  });

  const handleChangeText = (text: string) => {
    if (locked) return;
    setDraft(text);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    onSubmit(draft);
  };

  if (isUnavailable) {
    return (
      <Card testID="open-ended-root" style={styles.root}>
        <Text style={styles.prompt}>{t('activity.openEnded.unavailable')}</Text>
      </Card>
    );
  }

  return (
    <Card testID="open-ended-root" style={styles.root}>
      <Text style={styles.prompt}>{prompt}</Text>
      <TextField
        accessibilityLabel={t('activity.openEnded.answerInput')}
        accessibilityState={{ disabled: locked }}
        value={draft}
        maxLength={maxLength}
        disabled={locked}
        multiline
        variant="outlined"
        onChangeText={handleChangeText}
      />
      <Button disabled={locked} fullWidth onPress={handleSubmit}>
        {t('activity.openEnded.submit')}
      </Button>
      {submitted ? (
        <View testID="open-ended-comparison" style={styles.comparison}>
          <View testID="open-ended-your-answer" style={styles.block}>
            <Text style={styles.heading}>{t('activity.openEnded.yourAnswer')}</Text>
            {shouldShowLearnerAnswerBody(draft) ? <Text style={styles.body}>{draft}</Text> : null}
          </View>
          <View
            testID="open-ended-model-answer"
            style={styles.block}
            accessibilityLiveRegion="polite"
          >
            <Text style={styles.heading}>{t('activity.openEnded.modelAnswer')}</Text>
            <Text style={styles.body}>{modelAnswer}</Text>
          </View>
          {shouldShowExplanation(submitted, explanation) ? (
            <View testID="open-ended-explanation" style={styles.block}>
              <Text style={styles.heading}>{t('activity.openEnded.explanationHeading')}</Text>
              <Text style={styles.body}>{explanation}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s4,
  },
  prompt: {
    ...theme.typography.titleLarge,
    color: theme.colors.onSurface,
  },
  comparison: {
    gap: theme.spacing.s3,
  },
  block: {
    gap: theme.spacing.s1,
  },
  heading: {
    ...theme.typography.titleSmall,
    color: theme.colors.onSurfaceVariant,
  },
  body: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurface,
  },
}));
