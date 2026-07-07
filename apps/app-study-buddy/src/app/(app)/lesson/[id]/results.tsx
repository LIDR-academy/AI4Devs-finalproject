import { ScreenContainer } from '@helsoft/components';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function ResultsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenContainer>
      <Text>Score / completion summary for lesson {id} — TODO (R7)</Text>
      <Link href={{ pathname: '/lesson/[id]/player', params: { id } }} replace>
        <Text>Retake activities</Text>
      </Link>
      <Link href="/" replace>
        <Text>Back to my lessons</Text>
      </Link>
    </ScreenContainer>
  );
}
