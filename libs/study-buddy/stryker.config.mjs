// @ts-check
/**
 * StrykerJS — @helsoft/study-buddy (jest-expo).
 * The mutation_tester narrows scope to the feature's changed files at runtime:
 *   pnpm --filter @helsoft/study-buddy exec stryker run --mutate "src/components/**/*.tsx"
 * @type {import('@stryker-mutator/api/core').PartialStrykerOptions}
 */
export default {
  packageManager: 'pnpm',
  testRunner: 'jest',
  jest: { projectType: 'custom', configFile: 'jest.config.js' },
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  mutate: ['src/**/*.ts', 'src/**/*.tsx', '!src/**/*.test.ts', '!src/**/*.test.tsx', '!src/**/index.ts'],
  thresholds: { high: 100, low: 100, break: 100 },
};
