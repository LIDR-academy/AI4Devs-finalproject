import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

import { en } from '../resources/en';

/**
 * @s14 / AC9 — static audit asserting no bare user-facing string literals remain in
 * the app screens or shared components after migration. RN renders all visible copy
 * inside `<Text>`, and Expo Router nav titles via `title:`, so we flag:
 *   - `<Text …>Literal</Text>`  (a text child that is not a `{…}` expression)
 *   - `title: 'Literal'`         (a hardcoded Stack.Screen title)
 * Stories/tests are excluded (demo copy is acceptable there).
 */

const REPO_ROOT = resolve(__dirname, '../../../..');
const APP_SCREENS = resolve(REPO_ROOT, 'apps/app-study-buddy/src/app');
const SHARED_COMPONENTS = resolve(REPO_ROOT, 'libs/components/src');
/**
 * Slice-2 Round-2 review — a t('auth.error.*') key referenced in sign-in-form.tsx didn't exist
 * in any locale bundle (i18next has no missing-key handler, so real users would see the raw key
 * string). Scoped narrowly to this component's own directory rather than the whole `study-buddy`
 * lib: it's the one place this exact regression occurred, and a lib-wide sweep would need to
 * separately account for other, out-of-scope components (e.g. `sign-out.tsx`'s own pre-existing
 * `auth.logOut*` keys) that this fix doesn't own. See migration-coverage.test.ts's "t() key
 * existence coverage" describe block below.
 */
const SIGN_IN_FORM_DIR = resolve(REPO_ROOT, 'libs/study-buddy/src/components/sign-in-form');

const isExcluded = (file: string) => file.endsWith('.stories.tsx') || file.endsWith('.test.tsx') || file.endsWith('.test.ts');

const collectTsx = (dir: string): string[] => {
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return collectTsx(full);
    if (full.endsWith('.tsx') && !isExcluded(full)) return [full];
    return [];
  });
};

const LITERAL_TEXT_CHILD = /<Text(\s[^>]*)?>\s*[^<{\s]/;
const LITERAL_TITLE = /title:\s*['"]/;

const findViolations = (roots: string[]): string[] => {
  const violations: string[] = [];
  for (const root of roots) {
    for (const file of collectTsx(root)) {
      const source = readFileSync(file, 'utf8');
      const rel = file.slice(REPO_ROOT.length + 1);
      if (LITERAL_TEXT_CHILD.test(source)) violations.push(`${rel}: hardcoded <Text> literal`);
      if (LITERAL_TITLE.test(source)) violations.push(`${rel}: hardcoded title literal`);
    }
  }
  return violations;
};

/** Any quoted, dot-delimited literal (e.g. `'auth.error.email'`) — matches both a direct
 * `t('auth.error.email')` call and an indirect literal (e.g. a lookup-map value later passed to
 * `t(variable)`), so a renamed/typo'd key is still caught even when it isn't a `t(...)` argument
 * at its own call site. */
const DOTTED_KEY_LITERAL = /['"]([A-Za-z][\w]*(?:\.[A-Za-z][\w]*)+)['"]/g;

const flattenKeys = (node: unknown, prefix = ''): Set<string> => {
  const keys = new Set<string>();
  if (!node || typeof node !== 'object') return keys;
  for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object') {
      for (const nested of flattenKeys(value, path)) keys.add(nested);
    } else {
      keys.add(path);
    }
  }
  return keys;
};

const findDottedKeyLiterals = (dir: string): string[] => {
  const keys: string[] = [];
  for (const file of collectTsx(dir)) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(DOTTED_KEY_LITERAL)) keys.push(match[1]);
  }
  return keys;
};

describe('string-migration coverage', () => {
  it('leaves no hardcoded user-facing copy in app screens or shared components', () => {
    expect(findViolations([APP_SCREENS, SHARED_COMPONENTS])).toEqual([]);
  });

  it('sanity-checks the detector against a known literal', () => {
    // Guards the audit itself: a raw <Text> literal and a literal title must be detectable.
    expect(LITERAL_TEXT_CHILD.test('<Text>Hello</Text>')).toBe(true);
    expect(LITERAL_TEXT_CHILD.test("<Text>{t('x')}</Text>")).toBe(false);
    expect(LITERAL_TITLE.test("title: 'Settings'")).toBe(true);
    expect(LITERAL_TITLE.test("title: t('nav.settings')")).toBe(false);
  });
});

describe('t() key existence coverage (sign-in-form)', () => {
  it('every dotted key literal in sign-in-form.tsx resolves in the en bundle', () => {
    const definedKeys = flattenKeys(en.translation);
    const referencedKeys = findDottedKeyLiterals(SIGN_IN_FORM_DIR);

    // Guards the guard: fails loudly (rather than vacuously passing) if the scan finds nothing.
    expect(referencedKeys.length).toBeGreaterThan(0);

    const missing = [...new Set(referencedKeys)].filter((key) => !definedKeys.has(key));
    expect(missing).toEqual([]);
  });

  it('sanity-checks the detector against a known missing key', () => {
    const definedKeys = flattenKeys(en.translation);

    expect(definedKeys.has('auth.error.email')).toBe(true);
    expect(definedKeys.has('auth.error.doesNotExist')).toBe(false);
    expect([...'auth.error.email'.matchAll(DOTTED_KEY_LITERAL)]).toEqual([]);
    expect([..."t('auth.error.email')".matchAll(DOTTED_KEY_LITERAL)].map((m) => m[1])).toEqual(['auth.error.email']);
  });
});
