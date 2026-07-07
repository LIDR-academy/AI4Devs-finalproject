import { ScreenContainer } from '@helsoft/components';
import { Link } from 'expo-router';
import { Text } from 'react-native';

export default function SignUpScreen() {
  return (
    <ScreenContainer>
      <Text>Sign up — TODO (R5)</Text>
      <Link href="/login">
        <Text>Already have an account? Log in</Text>
      </Link>
    </ScreenContainer>
  );
}
