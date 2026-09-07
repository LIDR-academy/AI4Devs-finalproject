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
