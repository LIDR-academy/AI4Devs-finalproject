import { de } from '../resources/de';
import { en } from '../resources/en';
import { es } from '../resources/es';
import { pt } from '../resources/pt';

/**
 * @s15 — home.* saved-lessons list/empty/error/retry (+ open) strings must be real
 * translations in es/pt/de, not English stubs.
 */

const flattenValues = (node: unknown, prefix = ''): Record<string, string> => {
  if (!node || typeof node !== 'object') return {};
  return Object.entries(node as Record<string, unknown>).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === 'object') {
        Object.assign(acc, flattenValues(value, path));
      } else {
        acc[path] = String(value);
      }
      return acc;
    },
    {},
  );
};

const HOME_KEYS = [
  'home.savedLessons',
  'home.loading',
  'home.empty',
  'home.error',
  'home.retry',
  'home.openLesson',
  'home.delete.action',
  'home.delete.confirmHeadline',
  'home.delete.confirmBody',
  'home.delete.confirmAction',
  'home.delete.cancelAction',
  'home.delete.failed',
];

describe.each([
  ['es', es],
  ['pt', pt],
  ['de', de],
] as const)('home.* locale parity (%s)', (_locale, bundle) => {
  const enValues = flattenValues(en.translation);
  const localeValues = flattenValues(bundle.translation);

  it.each(HOME_KEYS)('translates %s away from English', (key) => {
    expect(localeValues[key]).toBeDefined();
    expect(localeValues[key]).not.toBe(enValues[key]);
  });
});
