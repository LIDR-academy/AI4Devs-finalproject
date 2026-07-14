import { de } from '../resources/de';
import { en } from '../resources/en';
import { es } from '../resources/es';
import { pt } from '../resources/pt';

/**
 * player.* chrome keys (nav, progress, empty, error) must be real translations in
 * es/pt/de — not English stubs (task-12).
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

const PLAYER_KEYS = [
  'player.loading',
  'player.next',
  'player.back',
  'player.slideOf',
  'player.empty.message',
  'player.error.message',
  'player.error.retry',
];

describe.each([
  ['es', es],
  ['pt', pt],
  ['de', de],
] as const)('player.* locale parity (%s)', (_locale, bundle) => {
  const enValues = flattenValues(en.translation);
  const localeValues = flattenValues(bundle.translation);

  it.each(PLAYER_KEYS)('translates %s away from the English placeholder', (key) => {
    expect(localeValues[key]).toBeDefined();
    expect(enValues[key]).toBeDefined();
    expect(localeValues[key]).not.toBe(enValues[key]);
  });
});
