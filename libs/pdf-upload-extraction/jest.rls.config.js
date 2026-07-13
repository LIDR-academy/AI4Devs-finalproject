/** @type {import('jest').Config} */
// Dedicated config for the pdf-upload-extraction RLS integration test (task-1) — needs a live
// local Supabase stack (Docker), so it's excluded from the default `pnpm test` run (see
// jest.config.js's testPathIgnorePatterns) and only runs via `pnpm test:rls`. See
// docs/features/pdf-upload-extraction/tdd.md for how/when to run it.
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.rls.integration.test.ts'],
  // This suite talks to real Docker containers over HTTP — give it more headroom than the
  // default 5s per-test timeout.
  testTimeout: 30000,
};
