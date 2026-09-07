import baseConfig from '../../eslint.config.mjs';

/**
 * `apps/web` lint configuration.
 *
 * The root flat config is the single source of Angular rule routing: it already
 * applies `angular-eslint`'s TypeScript rules to `apps/web/**` + '/*.ts' and its
 * template + accessibility rules to `apps/web/**` + '/*.html', so the generator's
 * re-import of `flat/angular` / `flat/angular-template` here was redundant and
 * has been removed.
 *
 * What stays is the only genuinely project-scoped Angular setting: the selector
 * prefix. It cannot live in the root config, because every library declares its
 * own prefix; `apps/web` uses `app`, matching `prefix` in `project.json`.
 */
export default [
  ...baseConfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
    },
  },
];
