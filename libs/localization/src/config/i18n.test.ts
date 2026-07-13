import { type Locale, SUPPORTED_LOCALES } from '@helsoft/types';

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

  // @s10 — interpolated values are injected into the translated string, in each locale's position.
  it('interpolates a value into a translated string', () => {
    expect(createI18n('en').t('lesson.title', { id: '7' })).toBe('Lesson 7');
    expect(createI18n('es').t('lesson.title', { id: '7' })).toBe('Lección 7');
  });

  // @s11 — pluralization selects the correct form by count, per locale.
  it.each([
    ['en', 1, '1 lesson'],
    ['en', 5, '5 lessons'],
    ['es', 1, '1 lección'],
    ['es', 5, '5 lecciones'],
  ])('selects the correct plural form for %s with count %i', (locale, count, expected) => {
    expect(createI18n(locale as 'en' | 'es').t('lessons.count', { count })).toBe(expected);
  });

  // @s15/task-13 — the upload flow's image-count summary pluralizes per locale too, mirroring
  // `lessons.count_*`'s i18next one/other suffix convention, across all four supported locales.
  it.each([
    ['en', 1, '1 image extracted'],
    ['en', 3, '3 images extracted'],
    ['es', 1, '1 imagen extraída'],
    ['es', 3, '3 imágenes extraídas'],
    ['pt', 1, '1 imagem extraída'],
    ['pt', 3, '3 imagens extraídas'],
    ['de', 1, '1 Bild extrahiert'],
    ['de', 3, '3 Bilder extrahiert'],
  ])('selects the correct plural form for upload.imageCount in %s with count %i', (locale, count, expected) => {
    expect(createI18n(locale as Locale).t('upload.imageCount', { count })).toBe(expected);
  });

  // @s10 — interpolated values are injected verbatim: HTML-escaping is disabled because
  // React Native renders text (no HTML sink), so a value with markup-special characters must
  // survive untouched rather than being turned into entities.
  it('injects interpolated values without HTML-escaping them', () => {
    expect(createI18n('en').t('lesson.title', { id: '<b>&"' })).toBe('Lesson <b>&"');
  });

  // @s9 — a key whose resource value is null must never surface as `null` (which would crash a
  // text node); it degrades to a string so the UI never renders a non-string.
  it('returns a string, never null, for a null-valued resource', () => {
    const i18n = createI18n('en');
    i18n.addResource('en', 'translation', 'nullValued', null as unknown as string);

    expect(typeof i18n.t('nullValued')).toBe('string');
  });
});
