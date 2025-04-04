import '@testing-library/jest-dom'

declare global {
  namespace jest {
    interface Matchers<R = void, T = {}> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      not: Matchers<R, T>
    }
  }
} 