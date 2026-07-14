import { ProgressIndicator, ScreenContainer } from '@helsoft/components';
import { useLesson } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';
import { LessonPlayer } from '@helsoft/study-buddy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export const PLAYER_LOADING_TEST_ID = 'player-loading-indicator';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useLocalization();
  const router = useRouter();
  const { lesson, isLoading, error, refetch } = useLesson(id ?? '');

  const onBackToLessons = useCallback(() => {
    router.replace('/');
  }, [router]);

  // @s17 — Loading: spinner, no slide content.
  if (isLoading) {
    return (
      <ScreenContainer>
        <View
          testID={PLAYER_LOADING_TEST_ID}
          accessibilityRole="progressbar"
          accessibilityLabel={t('player.loading')}
          style={styles.loading}
        >
          <ProgressIndicator variant="circular" />
          <Text style={styles.loadingLabel}>{t('player.loading')}</Text>
        </View>
      </ScreenContainer>
    );
  }

  // @s15/@s16 — Empty (0 slides) and Error (+ retry) live inside LessonPlayer.
  return (
    <ScreenContainer>
      <LessonPlayer
        lesson={lesson}
        error={error}
        onRetry={refetch}
        onBackToLessons={onBackToLessons}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create((theme) => ({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.s3,
  },
  loadingLabel: {
    ...theme.typography.bodyMedium,
    color: theme.colors.onSurfaceVariant,
  },
}));
