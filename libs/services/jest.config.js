/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  // The RLS integration test (pdf-upload-extraction, task-1) needs a live local Supabase stack —
  // excluded from the default run; see `test:rls` in package.json and docs/features/
  // pdf-upload-extraction/tdd.md for how/when to run it.
  testPathIgnorePatterns: ['/node_modules/', '\\.rls\\.integration\\.test\\.ts$'],
  // `mupdf` ships ESM-only (its bundle uses top-level `await`, which can't be downgraded to
  // CommonJS — task-3 spike finding, docs/features/pdf-upload-extraction/tdd.md). `module:
  // node16` keeps the codebase's own `await import('mupdf')` calls as real dynamic imports
  // (Node's own ESM loader) instead of down-leveling them to `require`, so Jest's CommonJS
  // runtime can consume the package as-is. Run with NODE_OPTIONS=--experimental-vm-modules
  // (wired into the `test` script) so Node accepts a dynamic import from a Jest VM context.
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
};
