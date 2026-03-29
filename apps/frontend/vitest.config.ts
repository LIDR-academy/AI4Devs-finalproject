import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    globals: true,
    include: ['**/*.spec.ts'],
    exclude: ['tests/e2e/**', 'node_modules/**'],
  }
})
