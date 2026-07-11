import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { dirname, join, resolve } from 'path';

import { en } from '../resources/en';

/**
 * @s14 / AC9 — static audit asserting no bare user-facing string literals remain in
 * the app screens or shared components after migration. RN renders all visible copy
 * inside `<Text>`, and Expo Router nav titles via `title:`, so we flag:
 *   - `<Text …>Literal</Text>`  (a text child that is not a `{…}` expression)
 *   - `title: 'Literal'`         (a hardcoded Stack.Screen title)
 * Stories/tests are excluded (demo copy is acceptable there).
 */

/** The monorepo root marker file — unique to the real repo root, never copied into a per-package
 * sandbox (see below). */
const WORKSPACE_MARKER = 'pnpm-workspace.yaml';

/**
 * Walks up from `startDir` looking for `WORKSPACE_MARKER`, instead of a fixed-depth
 * `resolve(__dirname, '../../../..')` — StrykerJS's per-package sandbox (confirmed by inspecting
 * `libs/localization/.stryker-tmp`, under a `sandbox-<id>` subdirectory) mirrors only this
 * package's own directory tree one level deeper (nested under that `sandbox-<id>` directory), not
 * the whole monorepo, so a fixed hop count silently resolves to the wrong directory
 * (`libs/localization/apps/...`) there instead of throwing. Walking up to a real marker file works
 * in both places: the sandbox is a real directory on disk (not a chroot), so walking far enough up
 * from it reaches the actual monorepo root and its real (unmutated — this suite's own `mutate`
 * scope never includes them) sibling packages.
 */
const findMonorepoRoot = (startDir: string): string | undefined => {
  let dir = startDir;
  for (let hop = 0; hop < 10; hop++) {
    if (existsSync(join(dir, WORKSPACE_MARKER))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return undefined;
    dir = parent;
  }
  return undefined;
};

const REPO_ROOT = findMonorepoRoot(__dirname);
if (!REPO_ROOT) {
  throw new Error(`string-migration coverage: could not locate the monorepo root (${WORKSPACE_MARKER}) above ${__dirname}`);
}
const APP_SCREENS = resolve(REPO_ROOT, 'apps/app-study-buddy/src/app');
const SHARED_COMPONENTS = resolve(REPO_ROOT, 'libs/components/src');
/**
 * Slice-2 Round-2 review — a t('auth.error.*') key referenced in sign-in-form.tsx didn't exist
 * in any locale bundle (i18next has no missing-key handler, so real users would see the raw key
 * string). Scoped narrowly to this component's own directory rather than the whole `study-buddy`
 * lib: it's the one place this exact regression occurred at the time. `sign-out.tsx`'s own
 * `auth.logOut*` keys are covered by their own entry in AUTH_COMPONENT_DIRS below (task-8).
 */
const SIGN_IN_FORM_DIR = resolve(REPO_ROOT, 'libs/study-buddy/src/components/sign-in-form');
/**
 * Slice-3/task-8 — review.md's Slice-2 "Flagged forward" note: sign-out.tsx calls
 * `t('auth.logOut'...)`/`t('auth.logOutConfirm*')`, none of which existed in any bundle yet
 * (same class of bug the sign-in-form guard above was scoped to fix). Covered here now that
 * task-8 owns closing that gap.
 */
const SIGN_OUT_DIR = resolve(REPO_ROOT, 'libs/study-buddy/src/components/sign-out');

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

// Guarded per-component (rather than a lib-wide sweep) so each new auth component opts in
// deliberately as it's built/reviewed — see the SIGN_IN_FORM_DIR/SIGN_OUT_DIR doc comments above.
const AUTH_COMPONENT_DIRS: Array<[name: string, dir: string]> = [
  ['sign-in-form', SIGN_IN_FORM_DIR],
  ['sign-out', SIGN_OUT_DIR],
];

describe.each(AUTH_COMPONENT_DIRS)('t() key existence coverage (%s)', (name, dir) => {
  it(`every dotted key literal in ${name}.tsx resolves in the en bundle`, () => {
    const definedKeys = flattenKeys(en.translation);
    const referencedKeys = findDottedKeyLiterals(dir);

    // Guards the guard: fails loudly (rather than vacuously passing) if the scan finds nothing.
    expect(referencedKeys.length).toBeGreaterThan(0);

    const missing = [...new Set(referencedKeys)].filter((key) => !definedKeys.has(key));
    expect(missing).toEqual([]);
  });
});

describe('t() key existence coverage — detector sanity', () => {
  it('sanity-checks the detector against a known missing key', () => {
    const definedKeys = flattenKeys(en.translation);

    expect(definedKeys.has('auth.error.email')).toBe(true);
    expect(definedKeys.has('auth.error.doesNotExist')).toBe(false);
    expect([...'auth.error.email'.matchAll(DOTTED_KEY_LITERAL)]).toEqual([]);
    expect([..."t('auth.error.email')".matchAll(DOTTED_KEY_LITERAL)].map((m) => m[1])).toEqual(['auth.error.email']);
  });
});
