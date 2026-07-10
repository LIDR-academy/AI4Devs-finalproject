/**
 * Supported UI locales for AI Study Buddy.
 *
 * Lives in @helsoft/types (not @helsoft/localization) so both the localization
 * lib (config/detection) and @helsoft/services (preference validation) can share
 * the set without a circular dependency — services already depends on types.
 */
export type Locale = 'en' | 'es' | 'pt' | 'de';

/** All locales the app ships with. English is first (the base/authoritative bundle). */
export const SUPPORTED_LOCALES = ['en', 'es', 'pt', 'de'] as const satisfies readonly Locale[];

/** The base and runtime-fallback locale. */
export const FALLBACK_LOCALE: Locale = 'en';

/** Type guard: is an arbitrary value one of the supported locales? */
export const isSupportedLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
