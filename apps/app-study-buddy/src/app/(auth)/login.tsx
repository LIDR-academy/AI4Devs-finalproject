import { ScreenContainer } from '@helsoft/components';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function LoginScreen() {
  return (
    <ScreenContainer>
      <Text>Log in — TODO (R5)</Text>
      <Link href="/sign-up">
        <Text>No account? Sign up</Text>
      </Link>
    </ScreenContainer>
  );
}
