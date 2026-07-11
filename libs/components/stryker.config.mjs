// @ts-check
/**
 * StrykerJS — @helsoft/components (jest-expo / babel).
 * UI components are mutation-tested via their <name>.test.tsx unit tests.
 * No typescript checker here (jest-expo is babel-based; Jest + tsc handle types elsewhere).
 * The mutation_tester narrows scope to the feature's changed component(s) at runtime:
 *   pnpm --filter @helsoft/components exec stryker run --mutate "src/atoms/foo/foo.tsx"
 * Stories and e2e specs are never mutated.
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  testRunner: 'jest',
  // pnpm's isolated layout stops Stryker's default `@stryker-mutator/*` glob from
  // resolving in the runner child process, so it is named explicitly.
  plugins: ['@stryker-mutator/jest-runner'],
  jest: { projectType: 'custom', configFile: 'jest.config.js' },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  mutate: [
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.stories.tsx',
    '!src/**/*.e2e.js',
    '!src/**/index.ts',
  ],
  thresholds: { high: 100, low: 100, break: 100 },
};
