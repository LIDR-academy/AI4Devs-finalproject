/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: 'web',
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/src/**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', 'use-entitlements.test.ts$'],
    },
    {
      displayName: 'native',
      preset: 'jest-expo',
      testMatch: ['<rootDir>/src/hooks/use-entitlements.test.ts'],
    },
  ],
};
