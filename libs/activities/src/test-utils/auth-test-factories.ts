import type { useLocalization } from '@helsoft/localization';

/**
 * Shared `useLocalization()` mock-return factory for activities unit tests.
 */
export const localizationValue = (overrides: Partial<ReturnType<typeof useLocalization>> = {}) => ({
  t: (key: string) => key,
  locale: 'en' as const,
  setLocale: jest.fn(),
  supportedLocales: ['en', 'es', 'pt', 'de'] as const,
  ...overrides,
});
