import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '../../atoms/button/button';
import { Card } from '../../atoms/card/card';
import { ProgressIndicator } from '../../atoms/progress-indicator/progress-indicator';

export type ResultsSummaryVariant = 'score';

export type ResultsSummaryLabels = {
  score: string;
  percent: string;
  retake: string;
  backToLessons: string;
};

export type ResultsSummaryProps = {
  variant: ResultsSummaryVariant;
  /** True while the attempt is being saved — shows the loading affordance and disables actions (@s5). */
  loading?: boolean;
  labels: ResultsSummaryLabels;
  onRetake: () => void;
  onBackToLessons: () => void;
};

const LOADING_SPINNER_SIZE = 24;
const LOADING_SPINNER_THICKNESS = 3;
/** testID for the Loading-state affordance (@s5). */
export const RESULTS_LOADING_TEST_ID = 'results-summary-loading-indicator';

/**
 * ResultsSummary — presentational organism (Score + Loading states; Completion + Error land
 * in task-8). Receives pre-formatted label strings — never self-formats a score/percentage
 * (that's the wiring layer's job, per codebase precedent LoginForm/LanguageSettings).
 */
export const ResultsSummary = ({ loading = false, labels, onRetake, onBackToLessons }: ResultsSummaryProps) => (
  <Card>
    <View style={styles.content}>
      <Text style={styles.score}>{labels.score}</Text>
      <Text style={styles.percent}>{labels.percent}</Text>
      {loading ? (
        <View testID={RESULTS_LOADING_TEST_ID}>
          <ProgressIndicator variant="circular" size={LOADING_SPINNER_SIZE} thickness={LOADING_SPINNER_THICKNESS} />
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

const styles = StyleSheet.create((theme) => ({
  content: {
    gap: theme.spacing.s2,
  },
  score: {
    ...theme.typography.headlineSmall,
    color: theme.colors.onSurface,
  },
  percent: {
    ...theme.typography.titleMedium,
    color: theme.colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s3,
  },
}));
