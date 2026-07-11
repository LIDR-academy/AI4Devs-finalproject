import { ScreenContainer } from '@helsoft/components';
import { buildStubLessonResultsFixture, LessonResults } from '@helsoft/study-buddy';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { lesson, answers } = buildStubLessonResultsFixture(id);

  return (
    <ScreenContainer>
      <LessonResults
        lesson={lesson}
        answers={answers}
        onRetake={() => router.replace({ pathname: '/lesson/[id]/player', params: { id } })}
        onBackToLessons={() => router.replace('/')}
      />
    </ScreenContainer>
  );
}
