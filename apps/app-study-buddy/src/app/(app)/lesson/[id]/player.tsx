import { ScreenContainer } from '@helsoft/components';
import { useLesson } from '@helsoft/hooks';
import { LessonPlayer, PlayerLoading } from '@helsoft/study-buddy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';

export { PLAYER_LOADING_TEST_ID } from '@helsoft/study-buddy';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lesson, isLoading, error, refetch } = useLesson(id ?? '');

  const onBackToLessons = useCallback(() => {
    router.replace('/');
  }, [router]);

  // @s17 — Loading: spinner, no slide content.
  if (isLoading) {
    return (
      <ScreenContainer>
        <PlayerLoading />
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
