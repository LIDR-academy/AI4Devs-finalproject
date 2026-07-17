import { de } from '../resources/de';
import { en } from '../resources/en';
import { es } from '../resources/es';
import { pt } from '../resources/pt';

/**
 * @s15 — generation.error.persistFailed (+ retry action) must be real translations in
 * es/pt/de, not English stubs (@s2 persist-fail copy).
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

const PERSIST_KEYS = ['generation.error.persistFailed', 'generation.error.action.retry'];

describe.each([
  ['es', es],
  ['pt', pt],
  ['de', de],
] as const)('generation.error persist locale parity (%s)', (_locale, bundle) => {
  const enValues = flattenValues(en.translation);
  const localeValues = flattenValues(bundle.translation);

  it.each(PERSIST_KEYS)('translates %s away from English', (key) => {
    expect(localeValues[key]).toBeDefined();
    expect(localeValues[key]).not.toBe(enValues[key]);
  });
});
