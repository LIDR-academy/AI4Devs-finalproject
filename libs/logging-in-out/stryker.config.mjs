// @ts-check
/**
 * StrykerJS — @helsoft/logging-in-out (jest-expo / babel).
 * `inPlace: true`: jest setupFiles resolves @helsoft/components/theme outside Stryker's sandbox.
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
    'src/**/*.ts',
    'src/**/*.tsx',
    '!src/**/*.test.ts',
    '!src/**/*.test.tsx',
    '!src/**/*.stories.tsx',
    '!src/**/index.ts',
    // Pure test-fixture builders — not shipped production logic; their mutants are unkillable
    // and would fail the break:100 threshold (same exclusion as run-mutation.sh).
    '!src/**/test-utils/**',
  ],
  thresholds: { high: 100, low: 100, break: 100 },
};
