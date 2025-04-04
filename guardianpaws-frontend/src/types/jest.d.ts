import '@testing-library/jest-dom'
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare global {
  namespace jest {
    interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<R, T> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      not: Matchers<R, T>
    }
  }
}

export {} 