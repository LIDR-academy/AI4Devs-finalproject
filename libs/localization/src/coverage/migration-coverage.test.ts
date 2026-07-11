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
/**
 * activity-multiple-choice, task-6/@s10 — the MultipleChoice organism's chrome copy
 * (`t('activity.mcq.*')`) needs the same missing-key guard as the auth components above: i18next
 * has no missing-key handler, so a typo'd/undefined key would silently render the raw key string
 * to real users. Moved from libs/study-buddy/src/components/multiple-choice-activity when that
 * chrome copy migrated into the @helsoft/activities organism (the study-buddy component is now a
 * thin wrapper with no t() calls of its own).
 */
const MULTIPLE_CHOICE_ACTIVITY_DIR = resolve(
  REPO_ROOT,
  'libs/activities/src/organisms/multiple-choice',
);
/**
 * activity-matching, task-6/@s16 — Matching organism chrome (`t('activity.matching.*')`)
 * needs the same missing-key guard: i18next has no missing-key handler. Moved from
 * libs/study-buddy/src/components/matching-activity for the same reason as above.
 */
const MATCHING_ACTIVITY_DIR = resolve(REPO_ROOT, 'libs/activities/src/organisms/matching');
/**
 * activity-fill-in-the-blank, task-6/@s13 — FillInTheBlank organism chrome
 * (`t('activity.fillInTheBlank.*')`) needs the same missing-key guard. Moved from
 * libs/study-buddy/src/components/fill-in-the-blank-activity for the same reason as above.
 */
const FILL_IN_THE_BLANK_ACTIVITY_DIR = resolve(
  REPO_ROOT,
  'libs/activities/src/organisms/fill-in-the-blank',
);
/**
 * activity-open-ended, task-6/@s8 — OpenEndedActivity chrome (`t('activity.openEnded.*')`)
 * needs the same missing-key guard. Keys live on the study-buddy wrapper (organism takes labels).
 */
const OPEN_ENDED_ACTIVITY_DIR = resolve(
  REPO_ROOT,
  'libs/study-buddy/src/components/open-ended-activity',
);
/**
 * score-results-summary, task-7/@s1 — LessonResults calls `t('results.score'/'results.scorePercent'
 * /'results.retake'/'results.backHome')`; same missing-key guard as the components above. Moved
 * from libs/study-buddy/src/components/lesson-results for the same reason as above.
 */
const LESSON_RESULTS_DIR = resolve(REPO_ROOT, 'libs/activities/src/organisms/lesson-results');

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

// Guarded per-component (rather than a lib-wide sweep) so each new component opts in
// deliberately as it's built/reviewed — see the SIGN_IN_FORM_DIR/SIGN_OUT_DIR/
// MULTIPLE_CHOICE_ACTIVITY_DIR doc comments above.
const KEY_EXISTENCE_DIRS: Array<[name: string, dir: string]> = [
  ['sign-in-form', SIGN_IN_FORM_DIR],
  ['sign-out', SIGN_OUT_DIR],
  ['multiple-choice-activity', MULTIPLE_CHOICE_ACTIVITY_DIR],
  ['matching-activity', MATCHING_ACTIVITY_DIR],
  ['fill-in-the-blank-activity', FILL_IN_THE_BLANK_ACTIVITY_DIR],
  ['open-ended-activity', OPEN_ENDED_ACTIVITY_DIR],
  ['lesson-results', LESSON_RESULTS_DIR],
];

describe.each(KEY_EXISTENCE_DIRS)('t() key existence coverage (%s)', (name, dir) => {
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
