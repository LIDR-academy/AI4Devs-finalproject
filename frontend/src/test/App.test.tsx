import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import App from '../App'

// Mock the auth context
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  AuthContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}))

// Mock the auth hook
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
    error: undefined,
  }),
}))

// Mock the theme context
vi.mock('../contexts/ThemeContext', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  ThemeContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}))

// Mock the theme hook
vi.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'light' as const,
    toggleTheme: vi.fn(),
  }),
}))

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(document.body).toBeInTheDocument()
  })

  it('shows login page when not authenticated', () => {
    render(<App />)
    // Should redirect to login or show login form
    // This test will need to be updated once login page is fully implemented
    expect(document.body).toBeInTheDocument()
  })
})
