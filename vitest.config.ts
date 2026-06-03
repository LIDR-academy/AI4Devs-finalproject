import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['backend/src/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
  },
})
