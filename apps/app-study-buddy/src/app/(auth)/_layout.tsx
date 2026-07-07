import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Log in' }} />
      <Stack.Screen name="sign-up" options={{ title: 'Sign up' }} />
    </Stack>
  );
}
