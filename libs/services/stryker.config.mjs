// @ts-check
/**
 * StrykerJS — @helsoft/services (ts-jest).
 * The mutation_tester narrows scope to the feature's changed files at runtime:
 *   pnpm --filter @helsoft/services exec stryker run --mutate "src/services/foo.service.ts,src/dao/foo.dao.ts"
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  testRunner: 'jest',
  // pnpm's isolated layout stops Stryker's default `@stryker-mutator/*` glob from
  // resolving in the checker/runner child processes, so they are named explicitly.
  plugins: ['@stryker-mutator/jest-runner', '@stryker-mutator/typescript-checker'],
  jest: { projectType: 'custom', configFile: 'jest.config.js' },
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  // Default scope (overridden per-feature via --mutate). Never mutate tests or barrels.
  mutate: ['src/**/*.ts', '!src/**/*.test.ts', '!src/**/index.ts'],
  // Feature policy: 100% of mutants on changed lines must be killed.
  thresholds: { high: 100, low: 100, break: 100 },
};
