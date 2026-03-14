/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/../tests/frontend/unit", "<rootDir>/../tests/frontend/components", "<rootDir>/../tests/frontend/a11y"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  collectCoverageFrom: [
    "<rootDir>/src/**/*.{ts,tsx}",
    "!<rootDir>/src/**/*.d.ts",
    "!<rootDir>/src/**/*.test.{ts,tsx}",
    "!<rootDir>/src/app/**/loading.tsx",
    "!<rootDir>/src/app/files/page.tsx",
    "!<rootDir>/src/components/auth/dashboard-view.tsx",
    "!<rootDir>/src/components/upload/**",
  ],
  coverageDirectory: "<rootDir>/coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 70,
      lines: 82,
      statements: 70,
    },
  },
};
