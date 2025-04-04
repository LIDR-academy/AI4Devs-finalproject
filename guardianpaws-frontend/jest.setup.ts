import '@testing-library/jest-dom'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

// Extend expect with jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<R, T> {}
  }
} 