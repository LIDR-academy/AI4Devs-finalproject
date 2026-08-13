/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/prisma/**/*.test.ts',
  ],
  roots: ['<rootDir>/src', '<rootDir>/prisma'],
};
