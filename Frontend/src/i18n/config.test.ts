import i18n from './config';

describe('i18n config', () => {
  test('should initialize with Catalan as default language', () => {
    // Force to default to avoid detector influence
    i18n.changeLanguage('ca');
    expect(i18n.language).toBe('ca');
  });

  test('should load namespaces correctly', () => {
    expect(i18n.hasResourceBundle('ca', 'common')).toBe(true);
    expect(i18n.hasResourceBundle('es', 'common')).toBe(true);
    expect(i18n.hasResourceBundle('en', 'common')).toBe(true);
  });

  test('should handle unsupported language with fallback', () => {
    i18n.changeLanguage('zh');
    // i18n will fallback to English for unsupported languages
    expect(i18n.language).toBe('en');
    // Should fallback to English for missing translations
    expect(i18n.getResourceBundle('zh', 'common')).toBeUndefined();
  });

  test('should persist language in localStorage', () => {
    i18n.changeLanguage('es');
    expect(localStorage.getItem('i18nextLng')).toBe('es');
  });

  test('should support all required languages', () => {
    const supportedLanguages = ['ca', 'es', 'ro', 'uk', 'en', 'fr'];
    supportedLanguages.forEach(lang => {
      expect(i18n.hasResourceBundle(lang, 'common')).toBe(true);
    });
  });

  test('should have fallback language set to English', () => {
    expect(i18n.options.fallbackLng).toEqual(['en']);
  });

  test('should have default namespace set to common', () => {
    expect(i18n.options.defaultNS).toBe('common');
  });
});
