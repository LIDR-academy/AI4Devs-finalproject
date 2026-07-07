import { ScreenContainer } from '@helsoft/components';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function HomeScreen() {
  return (
    <ScreenContainer>
      <Text>Saved lessons list — TODO (R5, R9)</Text>
      <Link href="/upload">
        <Text>New lesson</Text>
      </Link>
      <Link href="/settings">
        <Text>Settings</Text>
      </Link>
      <Link href={{ pathname: '/lesson/[id]', params: { id: 'demo' } }}>
        <Text>Open demo lesson</Text>
      </Link>
    </ScreenContainer>
  );
}
