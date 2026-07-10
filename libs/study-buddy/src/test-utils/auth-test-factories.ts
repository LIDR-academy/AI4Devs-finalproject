import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';

/**
 * Shared `useAuth()`/`useLocalization()` mock-return factories for the `sign-in-form` and
 * `sign-out` unit tests (Round-1 review, Minor 6 — dedupes the identical pair that used to be
 * copy-pasted in both files). Not a fix for `language-settings.test.tsx`'s pre-existing,
 * differently-shaped copy, which is out of scope.
 */
export const authValue = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  isSubmitting: false,
  ...overrides,
});

export const localizationValue = (overrides: Partial<ReturnType<typeof useLocalization>> = {}) => ({
  t: (key: string) => key,
  locale: 'en' as const,
  setLocale: jest.fn(),
  supportedLocales: ['en', 'es', 'pt', 'de'] as const,
  ...overrides,
});
