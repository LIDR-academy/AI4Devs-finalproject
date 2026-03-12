export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      useESM: true, 
      tsconfig: { 
        jsx: 'react-jsx',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true
      } 
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [
    '/node_modules/(?!keycloak-js)/'
  ],
  preset: 'ts-jest/presets/default-esm',
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};