import { ScreenContainer } from '@helsoft/components';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenContainer>
      <Text>Lesson {id}: resume / restart / retake + past scores — TODO (R7, R9)</Text>
      <Link href={{ pathname: '/lesson/[id]/player', params: { id } }}>
        <Text>Start studying</Text>
      </Link>
      <Link href={{ pathname: '/lesson/[id]/results', params: { id } }}>
        <Text>View results</Text>
      </Link>
    </ScreenContainer>
  );
}
