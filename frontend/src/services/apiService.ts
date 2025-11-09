/**
 * Base API service for HTTP communication with the backend
 */

import axios from 'axios';

// Type definitions
interface ApiResponse<T = unknown> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
  timestamp?: string;
}

class ApiService {
  private api: any

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: any) => {
        const token = localStorage.getItem('access_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: any) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('access_token')
          window.location.href = '/login'
        }
        return Promise.reject(this.handleError(error))
      }
    )
  }

  private handleError(error: any): Error {
    // Handle network errors (no response from server)
    if (!error.response) {
      return new Error(error.message || 'Network error occurred')
    }

    // Extract error message from response
    const errorData = error.response.data
    const status = error.response.status

    // Try to get error message from various possible fields
    let errorMessage = 
      errorData?.message || 
      errorData?.detail || 
      errorData?.error ||
      error.message

    // Add status code context for auth errors
    if (status === 403) {
      errorMessage = errorMessage || 'Access forbidden. Authentication required.'
    } else if (status === 401) {
      errorMessage = errorMessage || 'Authentication required.'
    } else if (status >= 500) {
      errorMessage = errorMessage || 'Server error occurred. Please try again later.'
    } else if (!errorMessage) {
      errorMessage = 'An error occurred'
    }
    
    return new Error(errorMessage)
  }

  // Generic HTTP methods
  async get<T = any>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.api.get(url, { params })
    return response.data.data || response.data
  }

  async post<T = any>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.api.post(url, data)
    return response.data.data || response.data
  }

  async put<T = any>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.api.put(url, data)
    return response.data.data || response.data
  }

  async patch<T = any>(url: string, data?: Record<string, unknown>): Promise<T> {
    const response = await this.api.patch(url, data)
    return response.data.data || response.data
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.api.delete(url)
    return response.data.data || response.data
  }

  // File upload method with configurable timeout
  async upload<T = any>(
    url: string, 
    formData: FormData, 
    options?: { timeout?: number }
  ): Promise<T> {
    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: options?.timeout || 30000, // Default 30s, but allow override
    })
    return response.data.data || response.data
  }

  // Health check
  async healthCheck(): Promise<{ 
    status: string; 
    timestamp: string; 
    version?: string;
    environment?: string;
    database?: string;
  }> {
    return this.get('/health')
  }
}

export const apiService = new ApiService()
