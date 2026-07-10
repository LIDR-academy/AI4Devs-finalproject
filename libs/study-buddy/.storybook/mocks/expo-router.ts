/**
 * Storybook-only stand-in for expo-router. sign-in-form.tsx calls useRouter() to push the
 * sign-up route; there's no real Expo Router tree mounted in Storybook, so navigation is a
 * no-op here. Actual navigation is covered by sign-in-form.test.tsx. Aliased in main.ts's
 * viteFinal — never resolved by Jest or the real app build.
 */
export const useRouter = () => ({
  push: (_path: string) => {},
});
