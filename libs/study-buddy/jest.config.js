/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Register the shared unistyles theme (StyleSheet.configure) before components evaluate.
  setupFiles: ['react-native-unistyles/mocks', '<rootDir>/../components/src/theme/unistyles.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest-setup-after.ts'],
  testMatch: ['<rootDir>/src/**/*.test.tsx', '<rootDir>/src/**/*.test.ts'],
};
