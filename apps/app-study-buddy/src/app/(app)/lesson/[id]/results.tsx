import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Results live as the final slide inside LessonPlayer (@s13). This route redirects so
 * deep links / stale bookmarks never show the stub fixture deck.
 */
export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <Redirect href={{ pathname: '/lesson/[id]/player', params: { id: id ?? '' } }} />;
}
