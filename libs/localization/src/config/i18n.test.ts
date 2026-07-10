import { SUPPORTED_LOCALES, type Locale } from '@helsoft/types';

import { createI18n } from './i18n';

// @s2 — each supported locale resolves keys from its own bundle.
describe('createI18n', () => {
  const settingsTitleByLocale: Record<Locale, string> = {
    en: 'Settings',
    es: 'Ajustes',
    pt: 'Configurações',
    de: 'Einstellungen',
  };

  it.each([...SUPPORTED_LOCALES])('resolves a key from the "%s" bundle', (locale) => {
    const i18n = createI18n(locale);

    expect(i18n.t('settings.title')).toBe(settingsTitleByLocale[locale]);
  });

  it('registers all four supported locales as resources', () => {
    const i18n = createI18n('en');

    for (const locale of SUPPORTED_LOCALES) {
      expect(i18n.hasResourceBundle(locale, 'translation')).toBe(true);
    }
  });

  it('is configured with English as the fallback language', () => {
    const i18n = createI18n('en');

    expect(i18n.options.fallbackLng).toEqual(['en']);
  });

  // @s9 — a key present in English but missing from the active locale resolves to the English
  // string (never a raw key), proving the runtime fallback safety net (AC10).
  it('falls back to the English string when a key is missing from the active locale', () => {
    const i18n = createI18n('de');
    i18n.addResource('en', 'translation', 'onlyInEnglish', 'English only');

    expect(i18n.t('onlyInEnglish')).toBe('English only');
  });
});
