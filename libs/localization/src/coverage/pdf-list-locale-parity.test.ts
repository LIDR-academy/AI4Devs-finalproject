import { de } from '../resources/de';
import { en } from '../resources/en';
import { es } from '../resources/es';
import { pt } from '../resources/pt';

/**
 * @s20 — pdfList.* strings must be real translations in es/pt/de, not English stubs.
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

const PDF_LIST_KEYS = [
  'pdfList.heading',
  'pdfList.loading',
  'pdfList.empty',
  'pdfList.error',
  'pdfList.retry',
  'pdfList.status.ready',
  'pdfList.status.failed',
  'pdfList.status.generated',
  'pdfList.action.generate',
  'pdfList.action.retry',
  'pdfList.action.openLesson',
  'pdfList.action.generateA11y',
  'pdfList.action.retryA11y',
  'pdfList.action.openLessonA11y',
  'pdfList.pageCount',
  'pdfList.delete.action',
  'pdfList.delete.confirmHeadline',
  'pdfList.delete.confirmBody',
  'pdfList.delete.confirmAction',
  'pdfList.delete.cancelAction',
  'pdfList.delete.failed',
];

describe.each([
  ['es', es],
  ['pt', pt],
  ['de', de],
] as const)('pdfList.* locale parity (%s)', (_locale, bundle) => {
  const enValues = flattenValues(en.translation);
  const localeValues = flattenValues(bundle.translation);

  it.each(PDF_LIST_KEYS)('translates %s away from English', (key) => {
    expect(localeValues[key]).toBeDefined();
    expect(localeValues[key]).not.toBe(enValues[key]);
  });
});
