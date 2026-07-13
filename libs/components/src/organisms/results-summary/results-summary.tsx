import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';

import type { ResultsSummaryProps } from './results-summary.types';
import { useResultsSummary } from './use-results-summary';

const LOADING_SPINNER_SIZE = 24;
const LOADING_SPINNER_THICKNESS = 3;
/** testID for the Loading-state affordance (@s5). */
export const RESULTS_LOADING_TEST_ID = 'results-summary-loading-indicator';

/**
 * ResultsSummary — presentational organism (Score, Completion, Loading, and save-failure
 * states). Receives pre-formatted label strings — never self-formats a score/percentage
 * (that's the wiring layer's job, per codebase precedent LoginForm/LanguageSettings).
 */
export const ResultsSummary = ({
  variant,
  loading = false,
  saveFailed = false,
  labels,
  onRetake,
  onBackToLessons,
  onRetrySave,
}: ResultsSummaryProps) => {
  const { showSaveFailure } = useResultsSummary({
    variant,
    loading,
    saveFailed,
    saveFailedLabel: labels.saveFailed,
    scoreAnnouncement: labels.scoreAnnouncement,
    completeHeadline: labels.completeHeadline,
  });

  return (
    <Card>
      <View style={styles.content}>
        {variant === 'score' ? (
          <>
            <Text style={styles.headline}>{labels.score}</Text>
            <Text style={styles.body}>{labels.percent}</Text>
          </>
        ) : (
          <>
            <Text style={styles.headline}>{labels.completeHeadline}</Text>
            <Text style={styles.body}>{labels.completeBody}</Text>
          </>
        )}
        {showSaveFailure ? (
          <View style={styles.notice} accessibilityRole="alert">
            <Text style={styles.noticeText} accessibilityLiveRegion="assertive">
              {labels.saveFailed}
            </Text>
            {onRetrySave ? (
              <Button variant="text" onPress={onRetrySave}>
                {labels.retrySave}
              </Button>
            ) : null}
          </View>
        ) : null}
        {loading ? (
          <View testID={RESULTS_LOADING_TEST_ID}>
            <ProgressIndicator
              variant="circular"
              size={LOADING_SPINNER_SIZE}
              thickness={LOADING_SPINNER_THICKNESS}
            />
          </View>
        ) : null}
        <View style={styles.actions}>
          <Button disabled={loading} onPress={onRetake}>
            {labels.retake}
          </Button>
          <Button variant="text" disabled={loading} onPress={onBackToLessons}>
            {labels.backToLessons}
          </Button>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.s2,
  },
  headline: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
  },
  body: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
  notice: {
    backgroundColor: theme.colors.errorContainer,
    borderRadius: theme.shape.card,
    padding: theme.spacing.s3,
    gap: theme.spacing.s2,
  },
  noticeText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onErrorContainer,
  },
}));
