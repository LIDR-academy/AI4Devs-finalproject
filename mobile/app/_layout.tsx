import '../i18n';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { useProtectedRoute } from '../hooks/useProtectedRoute';

export default function RootLayout() {
  const { init } = useAuthStore();

  useProtectedRoute();

  useEffect(() => {
    const unsubscribe = init();
    return unsubscribe;
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="practice"
        options={{ headerShown: true, title: '' }}
      />
      <Stack.Screen
        name="results"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="card/[id]"
        options={{ headerShown: true, title: '' }}
      />
    </Stack>
  );
}
