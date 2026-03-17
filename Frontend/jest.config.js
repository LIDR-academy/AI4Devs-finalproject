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
  // Optimizaciones para velocidad
  maxWorkers: '50%', // Usar la mitad de los cores disponibles
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Reducir verbosidad
  verbose: false,
  // Configuración para tests más rápidos
  testTimeout: 10000, // 10 segundos por test
  // Configuración de coverage más rápida
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
  ],
  coverageReporters: ['text', 'lcov'],
  // Configuración de módulos para velocidad
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // Configuración de transformación más rápida
  transformIgnorePatterns: [
    'node_modules/(?!(keycloak-js|@testing-library)/)'
  ]
};