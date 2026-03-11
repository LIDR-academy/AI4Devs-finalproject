import React, { createContext, ReactNode, useEffect, useState } from 'react'
import { authService } from '../services/authService'
import type { AuthContextType, LoginRequest, RegisterRequest, User } from '../types/index'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          // Verify token and get user data
          const userData = await authService.getCurrentUser()
          setUser(userData)
        }
      } catch (error) {
        // Token is invalid, remove it
        localStorage.removeItem('access_token')
        console.error('Token verification failed:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setLoading(true)
      setError(undefined)
      
      const response = await authService.login(credentials)
      
      // Store token
      localStorage.setItem('access_token', response.access_token)
      
      // Set user data
      setUser(response.user)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setLoading(true)
      setError(undefined)
      
      await authService.register(userData)
      
      // After successful registration, log the user in
      await login({ email: userData.email, password: userData.password })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = (): void => {
    // Remove token from storage
    localStorage.removeItem('access_token')
    
    // Clear user state
    setUser(null)
    setError(undefined)
    
    // Redirect to login page
    window.location.href = '/login'
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    loading,
    error
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

