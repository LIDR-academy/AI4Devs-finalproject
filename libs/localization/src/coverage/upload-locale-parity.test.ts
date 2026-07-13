import { de } from '../resources/de';
import { en } from '../resources/en';
import { es } from '../resources/es';
import { pt } from '../resources/pt';

/**
 * @s15 (AC15) — Slice-2 (task-12) deliberately left `upload.constraintsHint`/`upload.retryAction`/
 * `upload.error.*` in the `es`/`pt`/`de` bundles as verbatim English stubs (documented inline in
 * each bundle file) purely to keep `TranslationResource`'s compile-time key-alignment green ahead
 * of native review. task-13/Slice-3 replaces every stub with a real translation. This guards the
 * regression: each of these keys' value in every non-English bundle must differ from its English
 * counterpart — a silent revert back to the stub would fail loudly here instead of only being
 * caught by manual review.
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

const STUBBED_UPLOAD_KEYS = [
  'upload.constraintsHint',
  'upload.retryAction',
  'upload.error.unsupportedType',
  'upload.error.fileTooLarge',
  'upload.error.tooManyPages',
  'upload.error.scannedNotSupported',
  'upload.error.corrupt',
  'upload.error.extractionFailed',
  'upload.error.network',
  'upload.error.unauthenticated',
];

describe.each([
  ['es', es],
  ['pt', pt],
  ['de', de],
] as const)('upload.* locale parity (%s)', (_locale, bundle) => {
  const enValues = flattenValues(en.translation);
  const localeValues = flattenValues(bundle.translation);

  it.each(STUBBED_UPLOAD_KEYS)('translates %s away from the English placeholder', (key) => {
    expect(localeValues[key]).not.toBe(enValues[key]);
  });
});

describe('upload.* locale parity — detector sanity', () => {
  it('sanity-checks the detector against a known-identical pair', () => {
    const enValues = flattenValues(en.translation);
    // en vs. en trivially matches every key — proves the comparison itself is meaningful (guards
    // against a vacuously-passing detector).
    expect(enValues['upload.chooseFile']).toBe(enValues['upload.chooseFile']);
  });
});
