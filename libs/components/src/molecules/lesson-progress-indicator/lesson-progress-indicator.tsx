import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { SlideProgress } from '../slide-progress/slide-progress';
import type { LessonProgressIndicatorProps } from './lesson-progress-indicator.types';

export const LESSON_PROGRESS_TEST_ID = 'lesson-progress-indicator';

/**
 * LessonProgressIndicator — segmented SlideProgress + "slide X of N" label for the lesson player.
 * Presentational: caller supplies slides, 0-based current, and already-localized `label`.
 */
export const LessonProgressIndicator = ({
  slides,
  current,
  label,
  onSeek,
}: LessonProgressIndicatorProps) => (
  <View style={styles.root} testID={LESSON_PROGRESS_TEST_ID}>
    <SlideProgress slides={slides} current={current} onSeek={onSeek} />
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
