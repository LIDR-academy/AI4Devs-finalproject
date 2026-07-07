import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'My lessons' }} />
      <Stack.Screen name="upload" options={{ title: 'New lesson' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="lesson/[id]/index" options={{ title: 'Lesson' }} />
      <Stack.Screen name="lesson/[id]/player" options={{ title: 'Study' }} />
      <Stack.Screen name="lesson/[id]/results" options={{ title: 'Results' }} />
    </Stack>
  );
}
