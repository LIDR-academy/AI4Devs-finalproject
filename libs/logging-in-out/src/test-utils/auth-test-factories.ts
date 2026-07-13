import type { useLocalization } from '@helsoft/localization';
import type { AuthErrorCode } from '@helsoft/types';

/**
 * Shared mock-return factories for sign-in-form / sign-out unit tests.
 */
export const localizationValue = (overrides: Partial<ReturnType<typeof useLocalization>> = {}) => ({
  t: (key: string) => key,
  locale: 'en' as const,
  setLocale: jest.fn(),
  supportedLocales: ['en', 'es', 'pt', 'de'] as const,
  ...overrides,
});

/** Minimal email validator for SignInForm tests (mirrors AuthService.isValidEmail shape). */
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export type SignInFormTestProps = {
  onSignIn?: jest.Mock;
  isSubmitting?: boolean;
  error?: AuthErrorCode | null;
  onNavigateToSignUp?: jest.Mock;
};
