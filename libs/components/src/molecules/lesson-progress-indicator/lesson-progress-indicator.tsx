import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { ProgressIndicator as ProgressBar } from '../../atoms/progress-indicator/progress-indicator';
import type { LessonProgressIndicatorProps } from './lesson-progress-indicator.types';

export const LESSON_PROGRESS_TEST_ID = 'lesson-progress-indicator';

/**
 * LessonProgressIndicator — linear progress bar + "slide X of N" label for the lesson player.
 * Presentational: caller supplies the already-localized `label`.
 */
export const LessonProgressIndicator = ({
  current,
  total,
  label,
}: LessonProgressIndicatorProps) => {
  const value = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <View style={styles.root} testID={LESSON_PROGRESS_TEST_ID}>
      <ProgressBar variant="linear" value={value} />
      <Text
        accessibilityRole="text"
        accessibilityLiveRegion="polite"
        accessibilityLabel={label}
        style={styles.label}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  root: {
    gap: theme.spacing.s2,
    alignSelf: 'stretch',
  },
  label: {
    ...theme.typography.labelMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
