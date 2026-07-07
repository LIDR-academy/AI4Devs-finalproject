import { ScreenContainer } from '@helsoft/components';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScreenContainer>
      <Text>Slide player for lesson {id} — TODO (R3, R4)</Text>
      <Link href={{ pathname: '/lesson/[id]/results', params: { id } }} replace>
        <Text>Finish lesson</Text>
      </Link>
    </ScreenContainer>
  );
}
