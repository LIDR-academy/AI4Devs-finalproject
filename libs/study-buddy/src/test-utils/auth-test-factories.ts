import { useAuth } from '@helsoft/hooks';
import { useLocalization } from '@helsoft/localization';

/**
 * Shared `useAuth()`/`useLocalization()` mock-return factories for study-buddy unit tests.
 */
export const authValue = (overrides: Partial<ReturnType<typeof useAuth>> = {}) => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  isSubmitting: false,
  error: null,
  ...overrides,
});

export const localizationValue = (overrides: Partial<ReturnType<typeof useLocalization>> = {}) => ({
  t: (key: string) => key,
  locale: 'en' as const,
  setLocale: jest.fn(),
  supportedLocales: ['en', 'es', 'pt', 'de'] as const,
  ...overrides,
});
