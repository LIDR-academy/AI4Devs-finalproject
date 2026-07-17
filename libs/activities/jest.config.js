/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // @helsoft/activities doesn't own the theme registry — @helsoft/components does.
  // Public subpath keeps setup off a sibling-folder relative path.
  setupFiles: ['react-native-unistyles/mocks', require.resolve('@helsoft/components/theme')],
  setupFilesAfterEnv: ['<rootDir>/jest-setup-after.ts'],
  testMatch: ['<rootDir>/src/**/*.test.tsx', '<rootDir>/src/**/*.test.ts'],
};
