import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

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
