// @ts-check
/**
 * StrykerJS — @helsoft/study-buddy (jest-expo).
 * The mutation_tester narrows scope to the feature's changed files at runtime, e.g.:
 *   pnpm --filter @helsoft/study-buddy exec stryker run \
 *     --mutate "src/components/sign-out/sign-out.tsx"
 *
 * `inPlace: true`: jest.config.js `setupFiles` reaches into the sibling
 * `@helsoft/components` lib for the shared unistyles theme, which is absent from
 * Stryker's per-package sandbox. Mutating in place keeps that path resolvable;
 * Stryker restores each file after every mutant.
 *
 * `plugins`: pnpm's isolated layout stops Stryker's default `@stryker-mutator/*`
 * glob from resolving in the checker/runner child processes, so they are named.
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  testRunner: 'jest',
  plugins: ['@stryker-mutator/jest-runner'],
  jest: { projectType: 'custom', configFile: 'jest.config.js' },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  inPlace: true,
  mutate: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx', '!src/**/index.ts'],
  thresholds: { high: 100, low: 100, break: 100 },
};
