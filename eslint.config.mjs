import nx from '@nx/eslint-plugin';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier/flat';

/**
 * Three-axis tag vocabulary — the single source of truth for this workspace.
 *
 * Authoritative sources:
 *   - the axes and their allowed values: `docs/product/ARCHITECTURE.md` §5.2
 *   - the `scope:` values: the bounded context table of `ARCHITECTURE.md` §4.1
 *     (ten baseline contexts + the four generic supporting contexts of ADR-001)
 *   - `type:app` and `type:e2e`: ADR-002
 *
 * Every Nx project carries exactly three tags, one per axis. This object declares
 * *which values exist*; it deliberately does NOT declare which may depend on which.
 * The `@nx/enforce-module-boundaries` `depConstraints` matrix that consumes this
 * vocabulary is delivered by ticket T-C10-03 and is intentionally absent here.
 */
export const TAG_VOCABULARY = Object.freeze({
  platform: Object.freeze(['backend', 'frontend', 'shared']),
  scope: Object.freeze([
    // Core contexts — ARCHITECTURE.md §4.1
    'incident',
    'service-request',
    'sla',
    'problem',
    'change',
    'release',
    'asset-config',
    // Supporting contexts — ARCHITECTURE.md §4.1
    'service-catalog',
    'knowledge',
    // Generic contexts — ARCHITECTURE.md §4.1 / ADR-001
    'identity-access',
    'approval',
    'notification',
    'audit',
    'reporting',
    // Shared kernel
    'shared',
  ]),
  type: Object.freeze([
    'domain',
    'application',
    'infrastructure',
    'feature',
    'ui',
    'data-access',
    'contracts',
    'util',
    // Applications and their acceptance suites — ADR-002
    'app',
    'e2e',
  ]),
});

/**
 * The same vocabulary flattened to the literal `axis:value` strings an Nx
 * `project.json` carries and `@nx/enforce-module-boundaries` matches on.
 * Derived — never edit this list; edit `TAG_VOCABULARY` above.
 */
export const ALLOWED_TAGS = Object.freeze(
  Object.entries(TAG_VOCABULARY).flatMap(([axis, values]) =>
    values.map((value) => `${axis}:${value}`),
  ),
);

/**
 * Type constraint matrix — ARCHITECTURE.md §5.3, transcribed row by row.
 * Key = the `type:` of the importing project; value = the `type:` values it may
 * import. A type absent from a row is forbidden from it.
 *
 * Two consequences of the table worth stating explicitly, because they are
 * expressed in §5.3 as empty cells rather than as rules:
 *   - `app` appears in no row, not even its own: **no project may depend on a
 *     `type:app`**. The composition root is a sink.
 *   - `e2e` appears in no row either: nothing may depend on an acceptance suite.
 */
const TYPE_MATRIX = Object.freeze({
  domain: ['domain', 'util'],
  application: ['domain', 'application', 'contracts', 'util'],
  infrastructure: [
    'domain',
    'application',
    'infrastructure',
    'contracts',
    'util',
  ],
  feature: ['feature', 'ui', 'data-access', 'contracts', 'util'],
  ui: ['ui', 'util'],
  'data-access': ['data-access', 'contracts', 'util'],
  contracts: ['contracts', 'util'],
  util: ['util'],
  // The composition root: every library type of its own platform. §5.4.
  app: [
    'domain',
    'application',
    'infrastructure',
    'feature',
    'ui',
    'data-access',
    'contracts',
    'util',
  ],
  e2e: ['contracts', 'util'],
});

/**
 * The matrix must cover the `type:` axis exactly — no missing row, no row for a
 * type that does not exist, and no allowed value outside the vocabulary. Drift
 * between TAG_VOCABULARY and TYPE_MATRIX would silently leave a type
 * unconstrained, so it is a hard failure at config load, not a lint warning.
 */
{
  const declared = [...TAG_VOCABULARY.type].sort().join(',');
  const encoded = Object.keys(TYPE_MATRIX).sort().join(',');
  if (declared !== encoded) {
    throw new Error(
      `TYPE_MATRIX does not cover the type axis.\n  vocabulary: ${declared}\n  matrix:     ${encoded}`,
    );
  }
  for (const [from, to] of Object.entries(TYPE_MATRIX)) {
    const unknown = to.filter((t) => !TAG_VOCABULARY.type.includes(t));
    if (unknown.length) {
      throw new Error(
        `TYPE_MATRIX row "${from}" allows unknown type(s): ${unknown.join(', ')}`,
      );
    }
  }
}

/**
 * A tag matcher (the plugin treats a `/…/`-delimited tag as a regular expression)
 * that matches a project only if it carries a tag on `axis` whose value is in the
 * declared vocabulary. Used as a *source* matcher so that every constraint below
 * applies only to a project tagged on all three axes with legal values.
 *
 * This is what makes "exactly three tags, no exceptions" (§5.2) enforceable: a
 * project missing an axis — or using a value outside the vocabulary — matches no
 * constraint at all, and `@nx/enforce-module-boundaries` fails it outright with
 * `projectWithoutTagsCannotHaveDependencies` as soon as it imports anything.
 */
const declaresAxis = (axis) =>
  `/^${axis}:(${TAG_VOCABULARY[axis].join('|')})$/`;

const HAS_PLATFORM = declaresAxis('platform');
const HAS_SCOPE = declaresAxis('scope');
const HAS_TYPE = declaresAxis('type');

const tagsFor = (axis, values) => values.map((v) => `${axis}:${v}`);

/**
 * `depConstraints` — the three orthogonal rule families of §5.3. Every source
 * matcher demands all three axes, so the families compose: the plugin applies
 * *every* matching constraint, and a dependency must satisfy all of them.
 */
const depConstraints = [
  // ── 1. Type matrix (§5.3) ────────────────────────────────────────────────
  ...Object.entries(TYPE_MATRIX).map(([type, allowed]) => ({
    allSourceTags: [HAS_PLATFORM, HAS_SCOPE, `type:${type}`],
    onlyDependOnLibsWithTags: tagsFor('type', allowed),
  })),

  // ── 2. Scope rule (§5.3) ─────────────────────────────────────────────────
  // A context may reach only itself and the shared kernel.
  ...TAG_VOCABULARY.scope
    .filter((scope) => scope !== 'shared')
    .map((scope) => ({
      allSourceTags: [HAS_PLATFORM, HAS_TYPE, `scope:${scope}`],
      onlyDependOnLibsWithTags: tagsFor('scope', [scope, 'shared']),
    })),

  // A `scope:shared` *library* may depend only on `scope:shared`. Keyed per
  // library type rather than on the bare `scope:shared` tag, because
  // applications are `scope:shared` too and must not be caught by this rule —
  // see the `type:app` constraint below.
  ...TAG_VOCABULARY.type
    .filter((type) => type !== 'app')
    .map((type) => ({
      allSourceTags: [HAS_PLATFORM, 'scope:shared', `type:${type}`],
      onlyDependOnLibsWithTags: ['scope:shared'],
    })),

  // `type:app` is the one type allowed to reach across contexts, because it is
  // the composition root (§5.3/§5.4, ADR-003). It is still held to the
  // vocabulary: the scope it reaches into must be a declared one.
  {
    allSourceTags: [HAS_PLATFORM, HAS_SCOPE, 'type:app'],
    onlyDependOnLibsWithTags: tagsFor('scope', TAG_VOCABULARY.scope),
  },

  // ── 3. Platform rule (§5.3) ──────────────────────────────────────────────
  // Frontend and backend may never reach each other; both may use the
  // framework-free shared platform, which in turn depends only on itself (§5.4).
  ...TAG_VOCABULARY.platform.map((platform) => ({
    allSourceTags: [HAS_SCOPE, HAS_TYPE, `platform:${platform}`],
    onlyDependOnLibsWithTags:
      platform === 'shared'
        ? ['platform:shared']
        : tagsFor('platform', [platform, 'shared']),
  })),
];
/**
 * Angular lives in `apps/web`, in its acceptance suite, and in the three frontend
 * library types (`feature`, `ui`, `data-access`) of every context — ARCHITECTURE.md
 * §5.1/§7.1. Scoping angular-eslint by path keeps Angular rules away from the
 * NestJS side of the monorepo, which uses the same .ts file extension.
 */
const angularTsFiles = [
  'apps/web/**/*.ts',
  'apps/web-e2e/**/*.ts',
  'libs/**/feature/**/*.ts',
  'libs/**/ui/**/*.ts',
  'libs/**/data-access/**/*.ts',
];

const angularHtmlFiles = [
  'apps/web/**/*.html',
  'libs/**/feature/**/*.html',
  'libs/**/ui/**/*.html',
  'libs/**/data-access/**/*.html',
];

export default [
  {
    ignores: [
      '**/dist',
      '**/coverage',
      '**/out-tsc',
      '**/tmp',
      '**/node_modules',
      '**/.nx',
      // Not workspace source: the AI operating model and the documentation
      // corpus (CLAUDE.md §4, §5). Mirrors .prettierignore and .nxignore.
      '.claude/**',
      'docs/**',
    ],
  },

  // Nx workspace rules. `flat/base` registers the `@nx` plugin without enabling
  // any rule: `@nx/enforce-module-boundaries` stays off until T-C10-03 turns it
  // on together with its constraint matrix.
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  // TypeScript. Scoped to TS files: typescript-eslint's recommended set is
  // unscoped by default, and its rules crash when handed an Angular template.
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
  })),

  // Angular — classes and inline templates
  ...angular.configs.tsRecommended.map((config) => ({
    ...config,
    files: angularTsFiles,
  })),
  {
    files: angularTsFiles,
    processor: angular.processInlineTemplates,
  },

  // Angular — external templates. Accessibility rules are included because
  // WCAG 2.1 AA is a product requirement and every component is hand-built
  // (CLAUDE.md §2/§3).
  ...[
    ...angular.configs.templateRecommended,
    ...angular.configs.templateAccessibility,
  ].map((config) => ({ ...config, files: angularHtmlFiles })),

  // ── Module boundaries ────────────────────────────────────────────────────
  // ARCHITECTURE.md §5.4: "the single most important structural rule in this
  // document". An illegal import must fail the build, never a review.
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
      '**/*.mts',
      '**/*.cts',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          // No exception list. CLAUDE.md §3 forbids relaxing this rule to make
          // an illegal import compile; the fix is always the design.
          allow: [],
          depConstraints,
          enforceBuildableLibDependency: true,
          // Latent in this layout: with a single root package.json there is no
          // per-project manifest to judge direct-vs-transitive against, so the
          // check engages only if a project ever gains its own package.json.
          banTransitiveDependencies: true,
          checkDynamicDependenciesExceptions: [],
        },
      ],
    },
  },

  {
    files: ['**/*.spec.ts', '**/*.cy.ts', '**/*.steps.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },

  // MUST stay last: switches off every rule that would fight Prettier, so
  // formatting has exactly one owner (CLAUDE.md §3 — "formatting is Prettier's
  // job; never add stylistic ESLint rules that conflict with it").
  prettier,
];
