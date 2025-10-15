require('@testing-library/jest-dom');

// Polyfills for jsdom environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Ensure test env
process.env.NODE_ENV = 'test';

// Mock env.ts to avoid import.meta issues
jest.mock('./src/env', () => ({
  env: {
    appName: 'bonÀreaGo',
    oidcIssuer: 'http://localhost:8080/realms/covoituraje',
    oidcClientId: 'covoituraje-frontend',
    oidcRedirectUri: 'http://localhost:5173',
    apiBaseUrl: 'http://localhost:8081',
  }
}));

// Mock ESM-only keycloak-js to avoid transform issues in Jest
jest.mock('keycloak-js', () => {
  return function Keycloak() {
    return {
      init: jest.fn().mockResolvedValue(false),
      updateToken: jest.fn().mockResolvedValue(false),
      login: jest.fn(),
      logout: jest.fn(),
      token: undefined,
    };
  };
});

// Mock window.confirm for tests (guard when running in non-jsdom environments)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'confirm', {
    value: jest.fn(() => true),
    writable: true
  });
}
