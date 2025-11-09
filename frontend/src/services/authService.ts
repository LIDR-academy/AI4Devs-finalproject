/**
 * Authentication service for user login, registration, and profile management
 */

import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../types/index';
import { apiService } from './apiService';

class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login', credentials)
  }

  /**
   * Register a new user account
   */
  async register(userData: RegisterRequest): Promise<{ message: string; user: User }> {
    return apiService.post<{ message: string; user: User }>('/auth/register', userData)
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/auth/me')
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    return apiService.put<User>('/auth/profile', userData)
  }

  /**
   * Change user password
   */
  async changePassword(data: { current_password: string; new_password: string }): Promise<{ message: string }> {
    return apiService.put<{ message: string }>('/auth/change-password', data)
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/password-reset', { email })
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: { token: string; new_password: string }): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/password-reset/confirm', data)
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/verify-email', { token })
  }

  /**
   * Resend email verification
   */
  async resendVerification(): Promise<{ message: string }> {
    return apiService.post<{ message: string }>('/auth/resend-verification')
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<{ access_token: string; expires_in: number }> {
    return apiService.post('/auth/refresh')
  }

  /**
   * Logout user (revoke token)
   */
  async logout(): Promise<{ message: string }> {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.warn('Logout request failed:', error)
    }
    
    // Always clear local storage
    localStorage.removeItem('access_token')
    
    return { message: 'Logged out successfully' }
  }
}

export const authService = new AuthService()