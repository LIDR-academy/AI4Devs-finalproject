// @ts-check
/**
 * StrykerJS — @helsoft/activities (jest-expo / babel).
 * Activity organisms are mutation-tested via their <name>.test.tsx unit tests.
 * The mutation_tester narrows scope to the feature's changed component(s) at runtime:
 *   pnpm --filter @helsoft/activities exec stryker run --mutate "src/organisms/multiple-choice/multiple-choice.tsx"
 * Stories and e2e specs are never mutated.
 *
 * `inPlace: true`: jest.config.js `setupFiles` reaches into the sibling `@helsoft/components`
 * lib for the shared unistyles theme, which is absent from Stryker's per-package sandbox.
 * Mutating in place keeps that path resolvable; Stryker restores each file after every mutant.
 * Mirrors libs/study-buddy/stryker.config.mjs (same root cause).
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
  mutate: [
    'src/**/*.tsx',
    '!src/**/*.test.tsx',
    '!src/**/*.stories.tsx',
  ],
  thresholds: { high: 100, low: 100, break: 100 },
};
